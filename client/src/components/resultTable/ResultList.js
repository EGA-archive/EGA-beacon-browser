import React, { useState, useEffect, useRef } from "react";
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
import { normalizeGenotypeCounts } from "./normalizeGenotypeCounts";
import { downloadCSV } from "./downloadCSV.js";

// This component renders the full results table for a queried variant.
//  It:
// - merges original + lifted results
// - sorts datasets alphabetically
// - renders GCAT and gnomAD datasets differently
// - supports collapsing datasets
// - supports ancestry / sex toggles

function ResultList({
  assemblyIdQueried,
  results,
  queriedVariant,
  error,
  liftedAssemblyId,
  liftedVariant,
}) {
  //
  //
  // States that controls which sections (or filters) are visible. In this case only ancestry and sex.
  const [toggle, setToggle] = useState(["ancestry", "sex"]);

  // Used to decide whether we should render the table at all
  const [dataExists, setDataExists] = useState(false);

  // Keeps track of which datasets are collapsed/expanded
  const [collapsedDatasets, setCollapsedDatasets] = useState({});

  // Toggles a single dataset between expanded and collapsed state.
  // The key is a unique identifier (dataset id + source).
  // If the dataset is already collapsed, it will be expanded, and vice versa.
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

  // Merge original and lifted results into a single list
  // The tag __source is used to track where it comes from
  const mergedResults = [
    ...(results?.original || []).map((r) => ({ ...r, __source: "original" })),
    ...(results?.lifted || []).map((r) => ({ ...r, __source: "lifted" })),
  ];

  // Returns a simple string version of the dataset name
  // Used only for sorting the order of the datasets
  const getDatasetDisplayNameString = (datasetId) => {
    if (datasetId === "EGAD00001007774") return "GCAT";

    if (datasetId.startsWith("EGAD")) return datasetId;

    if (datasetId.includes("v2") || datasetId.includes("r2")) {
      return "gnomAD v2.1.1";
    }

    if (datasetId.includes("v4") || datasetId.includes("r4")) {
      return "gnomAD v4.1.0";
    }

    return datasetId;
  };

  // finalResults:
  // 1. Groups all results by dataset id
  // 2. Flattens them into a single array
  // 3. Sorts all datasets alphabetically using their display name
  //    (no priority between original vs lifted)
  const finalResults = Object.values(
    mergedResults.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = [];
      acc[item.id].push(item);
      return acc;
    }, {})
  )
    .flat()
    .sort((a, b) => {
      const nameA = getDatasetDisplayNameString(a.id);
      const nameB = getDatasetDisplayNameString(b.id);
      return nameA.localeCompare(nameB);
    });

  // Check whether we have at least one dataset that contains population frequency data
  // This flag is used to decide whether the results table should be rendered at all
  useEffect(() => {
    const condition =
      Boolean(mergedResults.length) &&
      mergedResults.some((r) => r.results?.[0]?.frequencyInPopulations?.length);
    setDataExists(condition);
  }, [mergedResults]);

  // Handle ancestry/sex toggle changes
  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  // Renders the "Total" row at the bottom of each dataset
  // Genotype counts and allele counts are normalized
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

    // Normalize genotype counts into a stable shape
    const { homozygous, heterozygous, hemizygous } = normalizeGenotypeCounts({
      alleleCountHomozygous: totalAlleleCountHomozygous,
      alleleCountHeterozygous: totalAlleleCountHeterozygous,
      alleleCountHemizygous: totalAlleleCountHemizygous,
    });

    return (
      <tr>
        {/* Column 1: Label for the total row (GCAT / gnomAD) */}
        <td className={`${borderClass} dataset-col`} colSpan="1">
          <b>Total {isGenomAd}</b>
        </td>

        {/* Column 2: Total Allele Count */}
        {/* Fallback to 0 if the value is null or undefined */}
        <td className={`${borderClass} centered`} colSpan="1">
          <b>{totalAlleleCount ?? 0}</b>
        </td>

        {/* Column 3: Total Allele Number */}
        {/* Fallback to 0 if the value is null or undefined */}
        <td className={`${borderClass} centered`} colSpan="1">
          <b>{totalAlleleNumber ?? 0}</b>
        </td>

        {/* Column 4: Total Homozygous count */}
        {/* Value already normalized before rendering */}
        <td className={`${borderClass} centered`} colSpan="1">
          <b>{homozygous}</b>
        </td>

        {/* Column 5: Total Heterozygous count */}
        {/* Value already normalized before rendering */}
        <td className={`${borderClass} centered`} colSpan="1">
          <b>{heterozygous}</b>
        </td>

        {/* Column 6: Total Hemizygous count */}
        {/* Defaults to 0 when not provided by the dataset */}
        <td className={`${borderClass} centered`} colSpan="1">
          <b>{hemizygous}</b>
        </td>

        {/* Column 7: Total Allele Frequency (AF) */}
        {/* 
      Priority:
      1. Use totalAlleleFrequency if provided by the dataset
      2. Otherwise compute AF as AC / AN (only if AN > 0)
      3. Format the value for readability (decimal or scientific notation)
    */}

        <td className={`${borderClass} centered`} colSpan="1">
          <b>
            {(() => {
              // Check that Allele Count and Allele Number are valid and Allele Number is not zero
              const hasTotals =
                totalAlleleCount != null &&
                totalAlleleNumber != null &&
                Number(totalAlleleNumber) !== 0;

              // Determine the raw allele frequency value
              const totalAFRaw =
                totalAlleleFrequency != null
                  ? Number(totalAlleleFrequency)
                  : hasTotals
                  ? Number(totalAlleleCount) / Number(totalAlleleNumber)
                  : null;

              // Format AF
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

  // Renders the table rows for GCAT dataset
  const gcatTable = (gcat) => {
    // If there is no GCAT dataset, render nothing
    if (!gcat) return null;

    // Unique key used to track collapsed / expanded state
    const datasetKey = gcat.id + gcat.__source;

    // Check if this dataset is currently collapsed
    const isCollapsed = collapsedDatasets[datasetKey] === true;

    // Helper function to extract frequency data for a given population
    const getData = (population) =>
      gcat.results.find(
        (result) =>
          result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population ===
          population
      )?.frequencyInPopulations?.[0]?.frequencies;

    // Extract sex-based frequencies
    const female = getData("Female");
    const male = getData("Male");

    //  Extract ancestry populations (everything except Female / Male) and sort them alphabetically by population name
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

    // Accumulators used to compute totals when ancestries are present
    let ancestriesSumAlleleCount = 0;
    let ancestriesSumAlleleNumber = 0;
    let ancestriesSumAlleleCountHomozygous = 0;
    let ancestriesSumAlleleCountHeterozygous = 0;
    let ancestriesSumAlleleCountHemizygous = 0;

    return (
      <>
        {/* Render rows only if the dataset is expanded */}
        {!isCollapsed && (
          <>
            {/* Ancestry row */}
            {toggle.includes("ancestry") &&
              (ancestries && ancestries.length > 0 ? (
                ancestries.map((ancestry) => {
                  // Extract the actual frequency object
                  const a =
                    ancestry?.frequencyInPopulations?.[0]?.frequencies?.[0];
                  if (!a) return null;

                  // Normalize genotype counts (homo / hetero / hemi)
                  const counts = normalizeGenotypeCounts(a);

                  // Accumulate totals for later "Total" row
                  ancestriesSumAlleleCount += a?.alleleCount || 0;
                  ancestriesSumAlleleNumber += a?.alleleNumber || 0;
                  ancestriesSumAlleleCountHomozygous += counts.homozygous;
                  ancestriesSumAlleleCountHeterozygous += counts.heterozygous;
                  ancestriesSumAlleleCountHemizygous += counts.hemizygous;

                  // Fallback case: If no ancestry breakdown exists, show a single "European" row, computed from Female + Male values
                  return (
                    <SharedTableRow
                      key={a?.population}
                      type={a?.population}
                      alleleCount={a?.alleleCount}
                      alleleNumber={a?.alleleNumber}
                      alleleCountHomozygous={counts.homozygous}
                      alleleCountHeterozygous={counts.heterozygous}
                      alleleCountHemizygous={counts.hemizygous}
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
                    normalizeGenotypeCounts(female?.[0]).homozygous +
                      normalizeGenotypeCounts(male?.[0]).homozygous ||
                    normalizeGenotypeCounts(female?.[0]).homozygous ||
                    normalizeGenotypeCounts(male?.[0]).homozygous
                  }
                  alleleCountHeterozygous={
                    normalizeGenotypeCounts(female?.[0]).heterozygous +
                      normalizeGenotypeCounts(male?.[0]).heterozygous ||
                    normalizeGenotypeCounts(female?.[0]).heterozygous ||
                    normalizeGenotypeCounts(male?.[0]).heterozygous
                  }
                  alleleCountHemizygous={
                    normalizeGenotypeCounts(female?.[0]).hemizygous +
                      normalizeGenotypeCounts(male?.[0]).hemizygous ||
                    normalizeGenotypeCounts(female?.[0]).hemizygous ||
                    normalizeGenotypeCounts(male?.[0]).hemizygous ||
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

            {/* Sex row */}
            {female && toggle.includes("sex") && (
              <SharedTableRow
                type="XX"
                alleleCount={female?.[0]?.alleleCount}
                alleleNumber={female?.[0]?.alleleNumber}
                alleleCountHomozygous={
                  normalizeGenotypeCounts(female?.[0]).homozygous
                }
                alleleCountHeterozygous={
                  normalizeGenotypeCounts(female?.[0]).heterozygous
                }
                alleleCountHemizygous={
                  normalizeGenotypeCounts(female?.[0]).hemizygous
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
                alleleCountHomozygous={
                  normalizeGenotypeCounts(male?.[0]).homozygous
                }
                alleleCountHeterozygous={
                  normalizeGenotypeCounts(male?.[0]).heterozygous
                }
                alleleCountHemizygous={
                  normalizeGenotypeCounts(male?.[0]).hemizygous
                }
                alleleFrequency={male?.[0]?.alleleFrequency}
                nonBackgroundColor={false}
              />
            )}
          </>
        )}

        {/* Total row */}
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
            ? normalizeGenotypeCounts(female?.[0]).homozygous +
                normalizeGenotypeCounts(male?.[0]).homozygous
            : ancestriesSumAlleleCountHomozygous ||
                normalizeGenotypeCounts(female?.[0]).homozygous ||
                normalizeGenotypeCounts(male?.[0]).homozygous,
          female && male
            ? normalizeGenotypeCounts(female?.[0]).heterozygous +
                normalizeGenotypeCounts(male?.[0]).heterozygous
            : ancestriesSumAlleleCountHeterozygous ||
                normalizeGenotypeCounts(female?.[0]).heterozygous ||
                normalizeGenotypeCounts(male?.[0]).heterozygous,
          female && male
            ? normalizeGenotypeCounts(female?.[0]).hemizygous +
                normalizeGenotypeCounts(male?.[0]).hemizygous
            : ancestriesSumAlleleCountHemizygous ||
                normalizeGenotypeCounts(female?.[0]).hemizygous ||
                normalizeGenotypeCounts(male?.[0]).hemizygous,
          null,
          false
        )}
      </>
    );
  };

  // Renders the table rows for a gnomAD dataset.
  // gnomAD has a different structure compared to GCAT:
  // populations are already grouped (ancestry, sex, total)
  const genomAdTable = (gnomad) => {
    // If there is no gnomAD dataset, render nothing
    if (!gnomad) return null;

    // Unique key used to track collapsed / expanded state for this dataset
    const datasetKey = gnomad.id + gnomad.__source;

    // Check whether this dataset is currently collapsed
    const isCollapsed = collapsedDatasets[datasetKey] === true;

    // Extract frequency objects for Females, Males and Total using a shared helper function
    const females = getPopulationFrequency(gnomad.results, "Females");
    const males = getPopulationFrequency(gnomad.results, "Males");
    const total = getPopulationFrequency(gnomad.results, "Total");

    // Extract all population frequencies from the response
    const allFrequencies =
      gnomad.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

    // Keep only ancestry populations, excluding females, males and total
    const populationFrequencies = allFrequencies.filter(
      (f) => !["Females", "Males", "Total"].includes(f?.population)
    );

    // Normalize genotype counts for females, if missing, default to zero values
    const femaleCounts = females
      ? normalizeGenotypeCounts(females)
      : { homozygous: 0, heterozygous: 0, hemizygous: 0 };

    // Normalize genotype counts for males, if missing, default to zero values
    const maleCounts = males
      ? normalizeGenotypeCounts(males)
      : { homozygous: 0, heterozygous: 0, hemizygous: 0 };

    // Normalize genotype counts for totla, if missing: compute totals by summing females and males
    const totalCounts = total
      ? normalizeGenotypeCounts(total)
      : {
          homozygous: femaleCounts.homozygous + maleCounts.homozygous,
          heterozygous: femaleCounts.heterozygous + maleCounts.heterozygous,
          hemizygous: femaleCounts.hemizygous + maleCounts.hemizygous,
        };

    return (
      <>
        {/* Render rows only if the dataset is expanded */}
        {!isCollapsed && (
          <>
            {/* Ancestry row */}
            {toggle.includes("ancestry") && (
              <GnomadPopulationGroupRows frequencies={populationFrequencies} />
            )}
            {/* Female row */}
            {females && toggle.includes("sex") && (
              <SharedTableRow
                type="XX"
                alleleCount={females.alleleCount}
                alleleNumber={females.alleleNumber}
                alleleCountHomozygous={femaleCounts.homozygous}
                alleleCountHeterozygous={femaleCounts.heterozygous}
                alleleCountHemizygous={femaleCounts.hemizygous}
                alleleFrequency={females.alleleFrequency}
                nonBackgroundColor={false}
              />
            )}

            {/* Male row */}
            {males && toggle.includes("sex") && (
              <SharedTableRow
                type="XY"
                alleleCount={males.alleleCount}
                alleleNumber={males.alleleNumber}
                alleleCountHomozygous={maleCounts.homozygous}
                alleleCountHeterozygous={maleCounts.heterozygous}
                alleleCountHemizygous={maleCounts.hemizygous}
                alleleFrequency={males.alleleFrequency}
                nonBackgroundColor={false}
              />
            )}
          </>
        )}

        {/* Total row */}
        {totalResults(
          total?.alleleCount ||
            (females?.alleleCount || 0) + (males?.alleleCount || 0),
          total?.alleleNumber ||
            (females?.alleleNumber || 0) + (males?.alleleNumber || 0),
          totalCounts.homozygous,
          totalCounts.heterozygous,
          totalCounts.hemizygous,
          total?.alleleFrequency ||
            ((females?.alleleCount || 0) + (males?.alleleCount || 0)) /
              ((females?.alleleNumber || 0) + (males?.alleleNumber || 0)),
          true
        )}
      </>
    );
  };

  // Renders the dataset header row (expand/collapse + dataset name)
  const dataset = (dataset, isLifted, datasetKey) => {
    // Check whether this dataset is currently collapsed
    const isCollapsed = collapsedDatasets[datasetKey] === true;

    // gnomAD uses 0-based coordinates, convert to 1-based for links
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

    // Default dataset label
    let displayDatasetName = dataset;

    // Use lifted or original assembly depending on dataset source
    const effectiveAssembly = isLifted ? liftedAssemblyId : assemblyIdQueried;

    // Build the dataset display label (with links)
    // Special case: GCAT dataset
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
      // Generic EGA dataset link
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
      // gnomAD dataset link depends on genome assembly
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
          {/* Expand / collapse icon */}
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
          {/* Dataset label */}
          Dataset: <b>{displayDatasetName}</b>
          {/* Liftover indicator */}
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
            onDownloadTable={handleDownloadTable}
          />

          <TableLayout tableRef={tableRef}>
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
