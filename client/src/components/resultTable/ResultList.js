import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import ResultsHeader from "./ResultsHeader.js";
import { Row } from "react-bootstrap";
import TableLayout from "./TableLayout.js";
import SharedTableRow from "./SharedTableRow.js";
import GnomadPopulationGroupRows from "./GnomadPopulationGroupRow.js";
import { getPopulationFrequency, formatAF } from "../constants.js";

// This component displays a table of results for a queried variant.
// and adapts the content based on toggle selections and dataset structure.
function ResultList({ assemblyIdQueried, results, queriedVariant, error }) {
  const [toggle, setToggle] = useState(["ancestry", "sex"]); // selected sorting filters
  const [dataExists, setDataExists] = useState(false);

  // Check if there is at least one dataset with population frequency data
  useEffect(() => {
    const condition =
      Boolean(results?.length) &&
      Boolean(results?.[0]?.results?.[0]?.frequencyInPopulations?.length);

    setDataExists(condition);
  }, [results]);

  // Update selected toggles when user clicks sort options
  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  // Render total row at the bottom of the table
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
          <b>Total {isGenomAd ? "*" : ""}</b>
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
          <b>{totalAlleleCountHemizygous || 0}</b>
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

  // Renders dataset label row, optionally with link only for GCAT
  const dataset = (dataset) => {
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

    // GCAT (specific EGAD dataset)
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
    }

    // All other EGAD datasets
    else if (dataset.startsWith("EGAD")) {
      displayDatasetName = (
        <>
          <a
            href={`https://ega-archive.org/datasets/${dataset}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ega-link"
          >
            {dataset}
          </a>
        </>
      );
    }

    // gnomAD datasets
    else if (dataset.startsWith("gnomad")) {
      const gnomadVariant = getGnomadVariant(queriedVariant);

      if (assemblyIdQueried === "GRCh37") {
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
      } else if (assemblyIdQueried === "GRCh38") {
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
      } else {
        displayDatasetName = "gnomAD";
      }
    }

    return (
      <tr>
        <td className="dataset dataset-col" colSpan="7">
          <div>
            Dataset: <b>{displayDatasetName}</b>
          </div>
        </td>
      </tr>
    );
  };

  // Get GCAT dataset and identify it by structure
  // const gcatData = results.find((result) => result.id === "EGAD00001007774"); // New logic do or if resultsCount ===1 and array length equal to 1
  const gcatData = results.find(
    (result) =>
      result.resultsCount > 1 || // gCat datasets typically have multiple populations
      (result.resultsCount === 1 &&
        result.results?.some((res) =>
          res.frequencyInPopulations?.some(
            (pop) => pop.frequencies?.length === 1 // Check for one frequency
          )
        ))
  );

  // Get gnomAD dataset by structure
  // const gcatData = results.find((result) => result.resultsCount >= 1);
  // const genomAdData = results.find(
  //   (result) => result.id === "gnomad_exome_v2.1.1"
  // );
  const genomAdData = results.find(
    (result) =>
      result.resultsCount === 1 &&
      result.results?.some((res) =>
        res.frequencyInPopulations?.some((pop) => pop.frequencies?.length > 1)
      )
  );

  const isGnomadJointV41 = genomAdData?.id === "gnomad_joint_v4.1";

  // Filter and identify populations for adjustments
  const allFrequencies =
    genomAdData?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies || [];

  //   General GCAT rendering logic
  const gcatTable = () => {
    if (gcatData) {
      const getData = (population) => {
        return gcatData.results.find(
          (result) =>
            result?.frequencyInPopulations?.[0]?.frequencies?.[0]
              ?.population === population
        )?.frequencyInPopulations?.[0]?.frequencies;
      };

      const female = getData("Female");
      const male = getData("Male");
      // const ancestries = gcatData.results.filter(
      //   (result) =>
      //     !["Female", "Male"].includes(
      //       result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population
      //     )
      // );

      const ancestries = gcatData.results
        .filter(
          (result) =>
            !["Female", "Male"].includes(
              result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population
            )
        )
        .sort((a, b) => {
          const popA =
            a?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population || "";
          const popB =
            b?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population || "";
          return popA.localeCompare(popB);
        });

      let ancestriesSumAlleleCount = 0;
      let ancestriesSumAlleleNumber = 0;
      let ancestriesSumAlleleCountHomozygous = 0;
      let ancestriesSumAlleleCountHeterozygous = 0;
      let ancestriesSumAlleleCountHemizygous = 0;

      return (
        <>
          <>
            {dataset(gcatData.id)}
            {/* Show ancestries or fallback to “European” */}
            {toggle.includes("ancestry") &&
              (ancestries && ancestries.length > 0 ? (
                ancestries.map((ancestry) => {
                  const ancestryObj =
                    ancestry?.frequencyInPopulations?.[0]?.frequencies?.[0];
                  ancestriesSumAlleleCount += ancestryObj?.alleleCount;
                  ancestriesSumAlleleCountHemizygous +=
                    ancestryObj?.alleleCountHemizygous;

                  return (
                    <SharedTableRow
                      type={ancestryObj?.population}
                      alleleCount={ancestryObj?.alleleCount}
                      alleleNumber={ancestryObj?.alleleNumber}
                      alleleCountHomozygous={ancestryObj?.alleleCountHomozygous}
                      alleleCountHeterozygous={
                        ancestryObj?.alleleCountHeterozygous
                      }
                      alleleCountHemizygous={
                        ancestryObj?.alleleCountHemizygous || "0"
                      }
                      alleleFrequency={ancestryObj?.alleleFrequency}
                      nonBackgroundColor={true}
                    />
                  );
                })
              ) : (
                <SharedTableRow
                  type="European"
                  alleleCount={
                    female?.[0]?.alleleCount + male?.[0]?.alleleCount ||
                    female?.[0]?.alleleCount ||
                    male?.[0]?.alleleCount
                  }
                  alleleNumber={
                    female?.[0]?.alleleNumber + male?.[0]?.alleleNumber ||
                    female?.[0]?.alleleNumber ||
                    male?.[0]?.alleleNumber
                  }
                  alleleCountHomozygous={
                    female?.[0]?.alleleCountHomozygous +
                      male?.[0]?.alleleCountHomozygous ||
                    female?.[0]?.alleleCountHomozygous ||
                    male?.[0]?.alleleCountHomozygous
                  }
                  alleleCountHeterozygous={
                    female?.[0]?.alleleCountHeterozygous +
                      male?.[0]?.alleleCountHeterozygous ||
                    female?.[0]?.alleleCountHeterozygous ||
                    male?.[0]?.alleleCountHeterozygous
                  }
                  alleleCountHemizygous={
                    female?.[0]?.alleleCountHemizygous +
                      male?.[0]?.alleleCountHemizygous ||
                    female?.[0]?.alleleCountHemizygous ||
                    male?.[0]?.alleleCountHemizygous ||
                    "0"
                  }
                  alleleFrequency={
                    (female?.[0]?.alleleCount + male?.[0]?.alleleCount) /
                      (female?.[0]?.alleleNumber + male?.[0]?.alleleNumber) ||
                    female?.[0]?.alleleFrequency ||
                    male?.[0]?.alleleFrequency
                  }
                  nonBackgroundColor={true}
                />
              ))}

            {/* Show Female (XX) and Male (XY) rows if toggled */}
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

            {/* Render total row at the end */}
            {totalResults(
              female && male
                ? female?.[0]?.alleleCount + male?.[0]?.alleleCount
                : ancestriesSumAlleleCount ||
                    female?.[0]?.alleleCount ||
                    male?.[0]?.alleleCount,
              female && male
                ? female?.[0]?.alleleNumber + male?.[0]?.alleleNumber
                : ancestriesSumAlleleNumber ||
                    female?.[0]?.alleleNumber ||
                    male?.[0]?.alleleNumber,
              female && male
                ? female?.[0]?.alleleCountHomozygous +
                    male?.[0]?.alleleCountHomozygous
                : ancestriesSumAlleleCountHomozygous ||
                    female?.[0]?.alleleCountHomozygous ||
                    male?.[0]?.alleleCountHomozygous,
              female && male
                ? female?.[0]?.alleleCountHeterozygous +
                    male?.[0]?.alleleCountHeterozygous
                : ancestriesSumAlleleCountHeterozygous ||
                    female?.[0]?.alleleCountHeterozygous ||
                    male?.[0]?.alleleCountHeterozygous,
              female && male
                ? female?.[0]?.alleleCountHemizygous +
                    male?.[0]?.alleleCountHemizygous
                : ancestriesSumAlleleCountHemizygous ||
                    female?.[0]?.alleleCountHemizygous ||
                    male?.[0]?.alleleCountHemizygous,
              female && male
                ? (female?.[0]?.alleleCount + male?.[0]?.alleleCount) /
                    (female?.[0]?.alleleNumber + male?.[0]?.alleleNumber)
                : ancestriesSumAlleleCount / ancestriesSumAlleleNumber ||
                    female?.[0]?.alleleCount / female?.[0]?.alleleNumber ||
                    male?.[0]?.alleleCount / male?.[0]?.alleleNumber,
              false
            )}
          </>
        </>
      );
    }
    return null;
  };

  // General GenomAd rendering logic
  const genomAdTable = () => {
    if (genomAdData) {
      const females = getPopulationFrequency(genomAdData?.results, "Females");
      const males = getPopulationFrequency(genomAdData?.results, "Males");
      const total = getPopulationFrequency(genomAdData?.results, "Total");
      const allFrequencies =
        genomAdData?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies ||
        [];

      const populationFrequencies = allFrequencies.filter(
        (f) => !["Females", "Males", "Total"].includes(f?.population)
      );

      // Adjust African/African-American if gnomad_joint_v4.1
      // Comment and uncomment the code to apply workaround in the population
      // const africanPop = populationFrequencies.find(
      //   (f) => f.population === "African/African-American"
      // );

      // const otherPops = populationFrequencies.filter(
      //   (f) =>
      //     f.population !== "African/African-American" &&
      //     !["Females", "Males", "Total"].includes(f.population)
      // );

      // if (isGnomadJointV41 && africanPop && total) {
      //   const sumOtherHomo = otherPops.reduce(
      //     (acc, f) => acc + (f.alleleCountHomozygous || 0),
      //     0
      //   );
      //   const sumOtherHetero = otherPops.reduce(
      //     (acc, f) => acc + (f.alleleCountHeterozygous || 0),
      //     0
      //   );

      //   africanPop.alleleCountHomozygous =
      //     (total.alleleCountHomozygous || 0) - sumOtherHomo;

      //   africanPop.alleleCountHeterozygous =
      //     (total.alleleCountHeterozygous || 0) - sumOtherHetero;
      // }

      return (
        <>
          {dataset(genomAdData.id)}

          {/* {toggle.includes("ancestry") &&
            populationFrequencies.map((ancestry) => (
              <SharedTableRow
                type={ancestry?.population}
                alleleCount={ancestry?.alleleCount}
                alleleNumber={ancestry?.alleleNumber}
                alleleCountHomozygous={ancestry?.alleleCountHomozygous}
                alleleCountHeterozygous={ancestry?.alleleCountHeterozygous}
                alleleCountHemizygous={ancestry?.alleleCountHemizygous || "0"}
                alleleFrequency={ancestry?.alleleFrequency}
                nonBackgroundColor={true}
              />
            ))} */}

          {toggle.includes("ancestry") && (
            <GnomadPopulationGroupRows frequencies={populationFrequencies} />
          )}

          {/* Show Female (XX) and Male (XY) rows if toggled */}
          {females && toggle.includes("sex") && (
            <SharedTableRow
              type="XX"
              alleleCount={females?.alleleCount}
              alleleNumber={females?.alleleNumber}
              alleleCountHomozygous={females?.alleleCountHomozygous}
              alleleCountHeterozygous={females?.alleleCountHeterozygous}
              alleleCountHemizygous={females?.alleleCountHemizygous || "0"}
              alleleFrequency={females?.alleleFrequency}
              nonBackgroundColor={false}
            />
          )}

          {males && toggle.includes("sex") && (
            <SharedTableRow
              type="XY"
              alleleCount={males?.alleleCount}
              alleleNumber={males?.alleleNumber}
              alleleCountHomozygous={males?.alleleCountHomozygous}
              alleleCountHeterozygous={males?.alleleCountHeterozygous}
              alleleCountHemizygous={males?.alleleCountHemizygous || "0"}
              alleleFrequency={males?.alleleFrequency}
              nonBackgroundColor={false}
            />
          )}
          {/* Render total row at the end */}
          {totalResults(
            total?.alleleCount || females?.alleleCount + males?.alleleCount,
            total?.alleleNumber || females?.alleleNumber + males?.alleleNumber,
            total?.alleleCountHomozygous ||
              females?.alleleCountHomozygous + males?.alleleCountHomozygous,
            total?.alleleCountHeterozygous ||
              females?.alleleCountHeterozygous + males?.alleleCountHeterozygous,
            total?.alleleCountHemizygous ||
              females?.alleleCountHemizygous + males?.alleleCountHemizygous,
            total?.alleleFrequency ||
              parseFloat(
                (
                  (females?.alleleCount + males?.alleleCount) /
                  (females?.alleleNumber + males?.alleleNumber)
                ).toFixed(5)
              ),
            true
          )}
        </>
      );
    }
    return null;
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
          />
          <TableLayout
          // disclaimer={
          //   genomAdData && (
          //     <div className="disclaimer">
          //       * In the gnomAD dataset, ancestry totals may not match the
          //       "Total" because hierarchical subpopulations (e.g., Southern
          //       European under non-Finnish European) are included.
          //     </div>
          //   )
          // }
          >
            {gcatTable()}
            {genomAdTable()}
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
