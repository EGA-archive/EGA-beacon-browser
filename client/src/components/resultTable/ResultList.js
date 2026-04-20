import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import ResultsHeader from "./ResultsHeader.js";
import { Row } from "react-bootstrap";
import TableLayout from "./TableLayout.js";
import liftoverIcon from "../../liftover-icon.svg";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { downloadCSV } from "./downloadCSV.js";
import GnomadPopulationGroupRows from "./GnomadPopulationGroupRow.js";
import {
  getPopulationFrequency,
  GNOMAD_GROUPS,
  POPULATION_NORMALIZATION,
} from "../constants.js";

const buildDatasetDisplayName = ({
  datasetId,
  queriedVariant,
  assemblyIdQueried,
  liftedAssemblyId,
  isLifted,
  liftedVariant,
}) => {
  const effectiveAssembly = isLifted ? liftedAssemblyId : assemblyIdQueried;

  const egadMatch = datasetId.match(/EGAD\d+/);
  const egadId = egadMatch ? egadMatch[0] : null;

  const getGnomadVariant = (variant) => {
    if (!variant) return "";

    const parts = variant.split("-");
    if (parts.length < 4) return variant;

    const chr = parts[0];
    const pos = Number(parts[1]);
    const ref = parts[2];
    const alt = parts[3];

    if (Number.isNaN(pos)) return variant;

    return `${chr}-${pos}-${ref}-${alt}`;
  };

  if (egadId) {
    const label = datasetId
      .replace(egadId, "")
      .replace(/\(\s*\)/g, "") // remove empty ()
      .replace(/\(\s*$/, "") // remove "(" at end
      .replace(/\s*\)$/, "") // remove ")" at end
      .trim();

    return (
      <>
        {label} {"("}
        <a
          href={`https://ega-archive.org/datasets/${egadId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ega-link"
        >
          {egadId}
        </a>
        {")"}
      </>
    );
  }

  if (datasetId.toLowerCase().includes("gnomad")) {
    const rawVariant =
      isLifted && liftedVariant ? liftedVariant : queriedVariant;

    const variant = getGnomadVariant(rawVariant);

    if (effectiveAssembly === "GRCh37") {
      return (
        <>
          <a
            href={`https://gnomad.broadinstitute.org/variant/${variant}?dataset=gnomad_r2_1`}
            target="_blank"
            rel="noopener noreferrer"
            className="ega-link"
          >
            gnomAD v2.1.1
          </a>{" "}
          (exomes only)
        </>
      );
    }

    if (effectiveAssembly === "GRCh38") {
      return (
        <>
          <a
            href={`https://gnomad.broadinstitute.org/variant/${variant}?dataset=gnomad_r4`}
            target="_blank"
            rel="noopener noreferrer"
            className="ega-link"
          >
            gnomAD v4.1.0
          </a>{" "}
          (exomes and genomes)
        </>
      );
    }
  }

  return datasetId;
};

function ResultList({
  assemblyIdQueried,
  results,
  queriedVariant,
  error,
  liftedAssemblyId,
  liftedVariant,
}) {
  const [toggle, setToggle] = useState(["ancestry", "sex"]);
  const [dataExists, setDataExists] = useState(false);
  const [collapsedDatasets, setCollapsedDatasets] = useState({});
  const [globalAction, setGlobalAction] = useState(null);
  const [groupState, setGroupState] = useState({
    allOpen: false,
    allClosed: true,
  });

  const toggleDataset = (key) => {
    setCollapsedDatasets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tableRef = React.useRef(null);
  const handleDownloadTable = () => {
    if (!tableRef.current) return;

    downloadCSV(tableRef.current, "beacon-results.csv", toggle, finalResults, {
      queriedVariant,
      assemblyIdQueried,
      liftedAssemblyId,
      liftedVariant,
    });
  };

  const chartData = Object.values(results || {})
    .flat()
    .map((dataset) => {
      const rawFrequencies =
        dataset?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

      const normalizePopulation = (name) => {
        if (!name) return name;

        const trimmed = name.trim();
        const match = trimmed.match(/(.+)\s+(XX|XY)$/);

        if (match) {
          const base = match[1];
          const sex = match[2];
          const normalizedBase = POPULATION_NORMALIZATION[base] || base;
          return `${normalizedBase} ${sex}`;
        }

        return POPULATION_NORMALIZATION[trimmed] || trimmed;
      };

      const frequencies = rawFrequencies.map((f) => ({
        ...f,
        population: normalizePopulation(f.population),
      }));

      const get = (labels) =>
        frequencies.find((f) => labels.includes(f.population));

      const female = get(["Female", "Females", "XX"]);
      const male = get(["Male", "Males", "XY"]);
      const total = get(["Total"]);

      const ancestryDots = Object.keys(GNOMAD_GROUPS)
        .filter((groupName) =>
          frequencies.some((f) => f.population === groupName)
        )
        .map((groupName) => {
          const totalPop = frequencies.find((f) => f.population === groupName);

          const femalePop = frequencies.find(
            (f) => f.population === `${groupName} XX`
          );

          const malePop = frequencies.find(
            (f) => f.population === `${groupName} XY`
          );

          return {
            population: groupName,
            total: totalPop?.alleleFrequency ?? null,
            female: femalePop?.alleleFrequency ?? null,
            male: malePop?.alleleFrequency ?? null,
          };
        });

      return {
        dataset: dataset.id,
        female: female?.alleleFrequency ?? null,
        male: male?.alleleFrequency ?? null,
        total: total?.alleleFrequency ?? null,
        ancestryDots,
      };
    });

  const mergedResults = [
    ...(results?.original || []).map((r) => ({ ...r, __source: "original" })),
    ...(results?.lifted || []).map((r) => ({ ...r, __source: "lifted" })),
  ];

  const getDatasetDisplayNameString = (datasetId) => {
    if (datasetId === "EGAD00001007774") return "GCAT | Genomes for Life";
    if (datasetId.startsWith("EGAD")) return datasetId;
    if (datasetId.includes("v2") || datasetId.includes("r2"))
      return "gnomAD v2.1.1";
    if (datasetId.includes("v4") || datasetId.includes("r4"))
      return "gnomAD v4.1.0";
    return datasetId;
  };

  const finalResults = Object.values(
    mergedResults.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = [];
      acc[item.id].push(item);
      return acc;
    }, {})
  )
    .flat()
    .sort((a, b) =>
      getDatasetDisplayNameString(a.id).localeCompare(
        getDatasetDisplayNameString(b.id)
      )
    );

  useEffect(() => {
    const condition =
      Boolean(mergedResults.length) &&
      mergedResults.some((r) => r.results?.[0]?.frequencyInPopulations?.length);
    setDataExists(condition);
  }, [mergedResults]);

  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  const renderDatasetTable = (dataset) => {
    const datasetKey = dataset.id + dataset.__source;
    const isCollapsed = collapsedDatasets[datasetKey];
    const total = getPopulationFrequency(dataset.results, "Total");

    const populationFrequencies =
      dataset?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.filter(
        (f) => f?.population !== "Total"
      ) || [];

    return (
      <>
        {!isCollapsed && (
          <>
            <GnomadPopulationGroupRows
              frequencies={populationFrequencies}
              globalAction={globalAction}
              setGlobalAction={setGlobalAction}
              clearGlobalAction={() => setGlobalAction(null)}
              onStateChange={setGroupState}
              toggle={toggle}
              total={total}
            />
          </>
        )}
      </>
    );
  };

  const datasetHeader = (datasetId, isLifted, datasetKey) => {
    const isCollapsed = collapsedDatasets[datasetKey];

    const displayName = buildDatasetDisplayName({
      datasetId,
      queriedVariant,
      assemblyIdQueried,
      liftedAssemblyId,
      isLifted,
      liftedVariant,
    });

    return (
      <tr>
        <td className="dataset dataset-col" colSpan="7">
          <span
            style={{ cursor: "pointer", marginRight: "6px" }}
            onClick={() => toggleDataset(datasetKey)}
          >
            {isCollapsed ? (
              <KeyboardArrowRightIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </span>
          Dataset: <b>{displayName}</b>
          {isLifted && (
            <img
              src={liftoverIcon}
              alt="lifted-over"
              style={{ marginLeft: "8px", verticalAlign: "middle" }}
              width={35}
            />
          )}
        </td>
      </tr>
    );
  };

  return (
    <Row>
      {dataExists && (
        <Box sx={{ marginTop: "50px", backgroundColor: "white" }}>
          <ResultsHeader
            queriedVariant={queriedVariant}
            toggle={toggle}
            handleToggle={handleToggle}
            assemblyIdQueried={assemblyIdQueried}
            liftedAssemblyId={liftedAssemblyId}
            liftedVariant={liftedVariant}
            onDownloadTable={handleDownloadTable}
            data={chartData}
            onOpenAll={() => setGlobalAction("openAll")}
            onCloseAll={() => setGlobalAction("closeAll")}
            allOpen={groupState.allOpen}
            allClosed={groupState.allClosed}
          />

          <TableLayout tableRef={tableRef}>
            {finalResults.map((item) => (
              <React.Fragment key={item.id + item.__source}>
                {datasetHeader(
                  item.id,
                  item.__source === "lifted",
                  item.id + item.__source
                )}

                {(() => {
                  return renderDatasetTable(item);
                })()}
              </React.Fragment>
            ))}
          </TableLayout>
        </Box>
      )}

      {!dataExists && queriedVariant && (
        <p className="exclamation">No results found.</p>
      )}

      {Boolean(error) && (
        <p className="bi bi-exclamation-triangle exclamation">
          There is a problem connecting to the Beacon Network
        </p>
      )}
    </Row>
  );
}

export default ResultList;
