import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import ResultsHeader from "./ResultsHeader.js";
import { Row } from "react-bootstrap";
import TableLayout from "./TableLayout.js";
import SharedTableRow from "./SharedTableRow.js";
import liftoverIcon from "../../liftover-icon.svg";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";
import { downloadCSV } from "./downloadCSV.js";
import GnomadPopulationGroupRows from "./GnomadPopulationGroupRow.js";
import { getPopulationFrequency, formatAF } from "../constants.js";
import AlleleFrequencyChart from "../../charts/AlleleFrequencyChart.js";

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

  const toggleDataset = (key) => {
    setCollapsedDatasets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const tableRef = React.useRef(null);

  const handleDownloadTable = () => {
    if (!tableRef.current) return;
    downloadCSV(tableRef.current, "beacon-results.csv");
  };

  const chartData = Object.values(results || {})
    .flat()
    .map((dataset) => {
      const frequencies =
        dataset?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

      const get = (labels) =>
        frequencies.find((f) => labels.includes(f.population));

      const female = get(["Female", "Females", "XX"]);
      const male = get(["Male", "Males", "XY"]);
      const total = get(["Total"]);

      return {
        dataset: dataset.id,
        female: female?.alleleFrequency || 0,
        male: male?.alleleFrequency || 0,
        total: total?.alleleFrequency || 0,
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

  const handleToggle = (event, newToggle) => setToggle(newToggle);

  const totalResults = (ac, an, hom, het, hemi, af) => {
    const baseClass = toggle.length === 0 ? "no-border" : "beaconized";
    const totalClass = `${baseClass} global-row-background`;

    const counts = normalizeGenotypeCounts({
      alleleCountHomozygous: hom,
      alleleCountHeterozygous: het,
      alleleCountHemizygous: hemi,
    });

    // Total Row
    return (
      <tr data-id="total" data-category="total">
        <td className={`${totalClass} dataset-col`}>
          <b>Total</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>{ac ?? 0}</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>{an ?? 0}</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>{counts.homozygous}</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>{counts.heterozygous}</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>{counts.hemizygous}</b>
        </td>
        <td className={`${totalClass} centered`}>
          <b>
            {formatAF(af ?? (an ? ac / an : null), {
              threshold: 1e-5,
              exponentDigits: 2,
            })}
          </b>
        </td>
      </tr>
    );
  };

  const renderDatasetTable = (dataset) => {
    const datasetKey = dataset.id + dataset.__source;
    const isCollapsed = collapsedDatasets[datasetKey];
    const females = getPopulationFrequency(dataset.results, "Females");
    const males = getPopulationFrequency(dataset.results, "Males");
    const total = getPopulationFrequency(dataset.results, "Total");

    const populationFrequencies =
      dataset?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.filter(
        (f) => f?.population !== "Total"
      ) || [];

    const femaleCounts = females
      ? normalizeGenotypeCounts(females)
      : { homozygous: 0, heterozygous: 0, hemizygous: 0 };

    const maleCounts = males
      ? normalizeGenotypeCounts(males)
      : { homozygous: 0, heterozygous: 0, hemizygous: 0 };

    const totalCounts = normalizeGenotypeCounts(total || {});

    return (
      <>
        {!isCollapsed && (
          <>
            {toggle.includes("ancestry") && (
              <GnomadPopulationGroupRows frequencies={populationFrequencies} />
            )}
            {females && toggle.includes("sex") && (
              <SharedTableRow
                id="global-xx"
                category="global_sex"
                type="XX"
                alleleCount={females.alleleCount}
                alleleNumber={females.alleleNumber}
                alleleCountHomozygous={femaleCounts.homozygous}
                alleleCountHeterozygous={femaleCounts.heterozygous}
                alleleCountHemizygous={femaleCounts.hemizygous}
                alleleFrequency={females.alleleFrequency}
              />
            )}

            {males && toggle.includes("sex") && (
              <SharedTableRow
                id="global-xy"
                category="global_sex"
                type="XY"
                alleleCount={males.alleleCount}
                alleleNumber={males.alleleNumber}
                alleleCountHomozygous={maleCounts.homozygous}
                alleleCountHeterozygous={maleCounts.heterozygous}
                alleleCountHemizygous={maleCounts.hemizygous}
                alleleFrequency={males.alleleFrequency}
              />
            )}
          </>
        )}

        {totalResults(
          total?.alleleCount ||
            (females?.alleleCount || 0) + (males?.alleleCount || 0),
          total?.alleleNumber ||
            (females?.alleleNumber || 0) + (males?.alleleNumber || 0),
          totalCounts.homozygous,
          totalCounts.heterozygous,
          totalCounts.hemizygous,
          total?.alleleFrequency,
          true
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
