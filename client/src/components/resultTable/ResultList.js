import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import ResultsHeader from "./ResultsHeader.js";
import { Row } from "react-bootstrap";
import TableLayout from "./TableLayout.js";
import SharedTableRow from "./SharedTableRow.js";
import GnomadPopulationGroupRows from "./GnomadPopulationGroupRow.js";
import { getPopulationFrequency, formatAF } from "../constants.js";
import liftoverIcon from "../../liftover-icon.svg";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

// // This component displays a table of results for a queried variant.
// // and adapts the content based on toggle selections and dataset structure.

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

  const mergedResults = [
    ...(results?.original || []).map((r) => ({ ...r, __source: "original" })),
    ...(results?.lifted || []).map((r) => ({ ...r, __source: "lifted" })),
  ];

  const finalResults = Object.values(
    mergedResults.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = [];
      acc[item.id].push(item);
      return acc;
    }, {})
  )
    .map((items) =>
      items.sort((a, b) =>
        a.__source === b.__source ? 0 : a.__source === "original" ? -1 : 1
      )
    )
    .flat();

  useEffect(() => {
    const condition =
      Boolean(mergedResults.length) &&
      mergedResults.some((r) => r.results?.[0]?.frequencyInPopulations?.length);
    setDataExists(condition);
  }, [mergedResults]);

  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  const totalResults = (
    totalAlleleCount,
    totalAlleleNumber,
    totalAlleleCountHomozygous,
    totalAlleleCountHeterozygous,
    totalAlleleCountHemizygous,
    totalAlleleFrequency,
    isGenomAd
  ) => {
    const borderClass = toggle.length === 0 ? "no-border" : "beaconized";

    return (
      <tr>
        <td className={`${borderClass} dataset-col`} colSpan="1">
          <b>Total {isGenomAd}</b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>{totalAlleleCount || 0}</b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>{totalAlleleNumber || 0}</b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>
            {totalAlleleCountHomozygous ||
              totalAlleleCount - totalAlleleCountHeterozygous ||
              0}
          </b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>
            {totalAlleleCountHeterozygous ||
              totalAlleleCount - totalAlleleCountHomozygous ||
              0}
          </b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>{totalAlleleCountHemizygous || "0"}</b>
        </td>

        <td className={`${borderClass} centered`} colSpan="1">
          <b>
            {(() => {
              const hasTotals =
                totalAlleleCount != null &&
                totalAlleleNumber != null &&
                Number(totalAlleleNumber) !== 0;

              const totalAFRaw =
                totalAlleleFrequency != null
                  ? Number(totalAlleleFrequency)
                  : hasTotals
                  ? Number(totalAlleleCount) / Number(totalAlleleNumber)
                  : null;

              return formatAF(totalAFRaw, {
                threshold: 1e-5,
                exponentDigits: 2,
              });
            })()}
          </b>
        </td>
      </tr>
    );
  };

  const gcatTable = (gcat) => {
    if (!gcat) return null;

    const datasetKey = gcat.id + gcat.__source;
    const isCollapsed = collapsedDatasets[datasetKey] === true;

    const getData = (population) =>
      gcat.results.find(
        (result) =>
          result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population ===
          population
      )?.frequencyInPopulations?.[0]?.frequencies;

    const female = getData("Female");
    const male = getData("Male");

    const ancestries = gcat.results
      .filter(
        (result) =>
          !["Female", "Male"].includes(
            result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population
          )
      )
      .sort((a, b) =>
        (
          a?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population || ""
        ).localeCompare(
          b?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population || ""
        )
      );

    let ancestriesSumAlleleCount = 0;
    let ancestriesSumAlleleNumber = 0;
    let ancestriesSumAlleleCountHomozygous = 0;
    let ancestriesSumAlleleCountHeterozygous = 0;
    let ancestriesSumAlleleCountHemizygous = 0;

    return (
      <>
        {!isCollapsed && (
          <>
            {toggle.includes("ancestry") &&
              (ancestries && ancestries.length > 0 ? (
                ancestries.map((ancestry) => {
                  const a =
                    ancestry?.frequencyInPopulations?.[0]?.frequencies?.[0];

                  ancestriesSumAlleleCount += a?.alleleCount || 0;
                  ancestriesSumAlleleNumber += a?.alleleNumber || 0;
                  ancestriesSumAlleleCountHomozygous +=
                    a?.alleleCountHomozygous || 0;
                  ancestriesSumAlleleCountHeterozygous +=
                    a?.alleleCountHeterozygous || 0;
                  ancestriesSumAlleleCountHemizygous +=
                    a?.alleleCountHemizygous || 0;

                  return (
                    <SharedTableRow
                      key={a?.population}
                      type={a?.population}
                      alleleCount={a?.alleleCount}
                      alleleNumber={a?.alleleNumber}
                      alleleCountHomozygous={a?.alleleCountHomozygous}
                      alleleCountHeterozygous={a?.alleleCountHeterozygous}
                      alleleCountHemizygous={a?.alleleCountHemizygous || "0"}
                      alleleFrequency={a?.alleleFrequency}
                      nonBackgroundColor
                    />
                  );
                })
              ) : (
                <SharedTableRow
                  type="European"
                  alleleCount={
                    (female?.[0]?.alleleCount || 0) +
                      (male?.[0]?.alleleCount || 0) ||
                    female?.[0]?.alleleCount ||
                    male?.[0]?.alleleCount
                  }
                  alleleNumber={
                    (female?.[0]?.alleleNumber || 0) +
                      (male?.[0]?.alleleNumber || 0) ||
                    female?.[0]?.alleleNumber ||
                    male?.[0]?.alleleNumber
                  }
                  alleleCountHomozygous={
                    (female?.[0]?.alleleCountHomozygous || 0) +
                      (male?.[0]?.alleleCountHomozygous || 0) ||
                    female?.[0]?.alleleCountHomozygous ||
                    male?.[0]?.alleleCountHomozygous
                  }
                  alleleCountHeterozygous={
                    (female?.[0]?.alleleCountHeterozygous || 0) +
                      (male?.[0]?.alleleCountHeterozygous || 0) ||
                    female?.[0]?.alleleCountHeterozygous ||
                    male?.[0]?.alleleCountHeterozygous
                  }
                  alleleCountHemizygous={
                    (female?.[0]?.alleleCountHemizygous || 0) +
                      (male?.[0]?.alleleCountHemizygous || 0) ||
                    female?.[0]?.alleleCountHemizygous ||
                    male?.[0]?.alleleCountHemizygous ||
                    "0"
                  }
                  alleleFrequency={
                    ((female?.[0]?.alleleCount || 0) +
                      (male?.[0]?.alleleCount || 0)) /
                      ((female?.[0]?.alleleNumber || 0) +
                        (male?.[0]?.alleleNumber || 0)) ||
                    female?.[0]?.alleleFrequency ||
                    male?.[0]?.alleleFrequency
                  }
                  nonBackgroundColor
                />
              ))}

            {female && toggle.includes("sex") && (
              <SharedTableRow
                type="XX"
                alleleCount={female?.[0]?.alleleCount}
                alleleNumber={female?.[0]?.alleleNumber}
                alleleCountHomozygous={female?.[0]?.alleleCountHomozygous}
                alleleCountHeterozygous={female?.[0]?.alleleCountHeterozygous}
                alleleCountHemizygous={
                  female?.[0]?.alleleCountHemizygous || "0"
                }
                alleleFrequency={female?.[0]?.alleleFrequency}
                nonBackgroundColor={false}
              />
            )}

            {male && toggle.includes("sex") && (
              <SharedTableRow
                type="XY"
                alleleCount={male?.[0]?.alleleCount}
                alleleNumber={male?.[0]?.alleleNumber}
                alleleCountHomozygous={male?.[0]?.alleleCountHomozygous}
                alleleCountHeterozygous={male?.[0]?.alleleCountHeterozygous}
                alleleCountHemizygous={male?.[0]?.alleleCountHemizygous || "0"}
                alleleFrequency={male?.[0]?.alleleFrequency}
                nonBackgroundColor={false}
              />
            )}
          </>
        )}

        {totalResults(
          female && male
            ? (female?.[0]?.alleleCount || 0) + (male?.[0]?.alleleCount || 0)
            : ancestriesSumAlleleCount ||
                female?.[0]?.alleleCount ||
                male?.[0]?.alleleCount,
          female && male
            ? (female?.[0]?.alleleNumber || 0) + (male?.[0]?.alleleNumber || 0)
            : ancestriesSumAlleleNumber ||
                female?.[0]?.alleleNumber ||
                male?.[0]?.alleleNumber,
          female && male
            ? (female?.[0]?.alleleCountHomozygous || 0) +
                (male?.[0]?.alleleCountHomozygous || 0)
            : ancestriesSumAlleleCountHomozygous ||
                female?.[0]?.alleleCountHomozygous ||
                male?.[0]?.alleleCountHomozygous,
          female && male
            ? (female?.[0]?.alleleCountHeterozygous || 0) +
                (male?.[0]?.alleleCountHeterozygous || 0)
            : ancestriesSumAlleleCountHeterozygous ||
                female?.[0]?.alleleCountHeterozygous ||
                male?.[0]?.alleleCountHeterozygous,
          female && male
            ? (female?.[0]?.alleleCountHemizygous || "0") +
                (male?.[0]?.alleleCountHemizygous || "0")
            : ancestriesSumAlleleCountHemizygous ||
                female?.[0]?.alleleCountHemizygous ||
                male?.[0]?.alleleCountHemizygous,
          female && male
            ? ((female?.[0]?.alleleCount || 0) +
                (male?.[0]?.alleleCount || 0)) /
                ((female?.[0]?.alleleNumber || 0) +
                  (male?.[0]?.alleleNumber || 0))
            : ancestriesSumAlleleNumber
            ? ancestriesSumAlleleCount / ancestriesSumAlleleNumber
            : female?.[0]?.alleleNumber
            ? (female?.[0]?.alleleCount || 0) / (female?.[0]?.alleleNumber || 1)
            : male?.[0]?.alleleNumber
            ? (male?.[0]?.alleleCount || 0) / (male?.[0]?.alleleNumber || 1)
            : null,
          false
        )}
      </>
    );
  };

  const genomAdTable = (gnomad) => {
    if (!gnomad) return null;

    const datasetKey = gnomad.id + gnomad.__source;
    const isCollapsed = collapsedDatasets[datasetKey] === true;

    const females = getPopulationFrequency(gnomad.results, "Females");
    const males = getPopulationFrequency(gnomad.results, "Males");
    const total = getPopulationFrequency(gnomad.results, "Total");

    const allFrequencies =
      gnomad.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

    const populationFrequencies = allFrequencies.filter(
      (f) => !["Females", "Males", "Total"].includes(f?.population)
    );

    return (
      <>
        {!isCollapsed && (
          <>
            {toggle.includes("ancestry") && (
              <GnomadPopulationGroupRows frequencies={populationFrequencies} />
            )}

            {females && toggle.includes("sex") && (
              <SharedTableRow
                type="XX"
                {...females}
                nonBackgroundColor={false}
              />
            )}

            {males && toggle.includes("sex") && (
              <SharedTableRow type="XY" {...males} nonBackgroundColor={false} />
            )}
          </>
        )}

        {totalResults(
          total?.alleleCount ||
            (females?.alleleCount || 0) + (males?.alleleCount || 0),
          total?.alleleNumber ||
            (females?.alleleNumber || 0) + (males?.alleleNumber || 0),
          total?.alleleCountHomozygous ||
            (females?.alleleCountHomozygous || 0) +
              (males?.alleleCountHomozygous || 0),
          total?.alleleCountHeterozygous ||
            (females?.alleleCountHeterozygous || 0) +
              (males?.alleleCountHeterozygous || 0),
          total?.alleleCountHemizygous ||
            (females?.alleleCountHemizygous || 0) +
              (males?.alleleCountHemizygous || 0),
          total?.alleleFrequency ||
            ((females?.alleleCount || 0) + (males?.alleleCount || 0)) /
              ((females?.alleleNumber || 0) + (males?.alleleNumber || 0)),
          true
        )}
      </>
    );
  };

  const dataset = (dataset, isLifted, datasetKey) => {
    const isCollapsed = collapsedDatasets[datasetKey] === true;
    const getGnomadVariant = (variant) => {
      if (!variant) return "";

      const parts = variant.split("-");
      if (parts.length < 4) return variant;

      const chr = parts[0];
      const pos0Based = Number(parts[1]);
      const ref = parts[2];
      const alt = parts[3];

      if (Number.isNaN(pos0Based)) return variant;

      const pos1Based = pos0Based + 1;
      return `${chr}-${pos1Based}-${ref}-${alt}`;
    };

    let displayDatasetName = dataset;

    const effectiveAssembly = isLifted ? liftedAssemblyId : assemblyIdQueried;

    if (dataset === "EGAD00001007774") {
      displayDatasetName = (
        <>
          GCAT (
          <a
            href={`https://ega-archive.org/datasets/${dataset}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ega-link"
          >
            {dataset}
          </a>
          )
        </>
      );
    } else if (dataset.startsWith("EGAD")) {
      displayDatasetName = (
        <a
          href={`https://ega-archive.org/datasets/${dataset}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ega-link"
        >
          {dataset}
        </a>
      );
    } else if (dataset.startsWith("gnomad")) {
      const gnomadVariant = getGnomadVariant(queriedVariant);

      if (effectiveAssembly === "GRCh37") {
        displayDatasetName = (
          <>
            <a
              href={`https://gnomad.broadinstitute.org/variant/${gnomadVariant}?dataset=gnomad_r2_1`}
              target="_blank"
              rel="noopener noreferrer"
              className="ega-link"
            >
              gnomAD v2.1.1
            </a>{" "}
            (exomes only)
          </>
        );
      } else if (effectiveAssembly === "GRCh38") {
        displayDatasetName = (
          <>
            <a
              href={`https://gnomad.broadinstitute.org/variant/${gnomadVariant}?dataset=gnomad_r4`}
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
          {/* Dataset: <b>{dataset}</b> */}
          Dataset: <b>{displayDatasetName}</b>
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
        <Box
          sx={{
            marginTop: "50px",
            backgroundColor: "white",
            "@media (max-width: 575px)": {
              marginLeft: "8%",
            },
          }}
        >
          <ResultsHeader
            queriedVariant={queriedVariant}
            toggle={toggle}
            handleToggle={handleToggle}
            assemblyIdQueried={assemblyIdQueried}
            liftedAssemblyId={liftedAssemblyId}
            liftedVariant={liftedVariant}
          />

          <TableLayout>
            {finalResults.map((item) => {
              const isGnomad =
                item.resultsCount === 1 &&
                item.results?.some((res) =>
                  res.frequencyInPopulations?.some(
                    (pop) => pop.frequencies?.length > 1
                  )
                );

              return (
                <React.Fragment key={item.id + item.__source}>
                  {dataset(
                    item.id,
                    item.__source === "lifted",
                    item.id + item.__source
                  )}

                  {isGnomad ? genomAdTable(item) : gcatTable(item)}
                </React.Fragment>
              );
            })}
          </TableLayout>
        </Box>
      )}

      {!dataExists && queriedVariant && (
        <p className="exclamation">No results found.</p>
      )}

      {error !== false && (
        <p className="bi bi-exclamation-triangle exclamation">
          There is a problem connecting to the Beacon Network, please try again
          later.
        </p>
      )}
    </Row>
  );
}

export default ResultList;
