import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import { Row } from "react-bootstrap";
import TooltipHeader from "./TooltipHeader.js";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import { boolean } from "yup";

function ResultList({
  results,
  metaresults,
  finalstart,
  queriedVariant,
  error,
}) {
  const [toggle, setToggle] = useState(["ancestry", "sex"]);
  const [dataExists, setDataExists] = useState(false);

  useEffect(() => {
    const condition =
      Boolean(results?.length) &&
      Boolean(results?.[0]?.results?.[0]?.frequencyInPopulations?.length);

    setDataExists(condition);
  }, [results]);

  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  const tooltipTexts = [
    "Number of copies of a specific allele in a population.",
    "Total number of analysed individuals.",
    "Number of individuals homozygous for the allele.",
    "Number of individuals heterozygous for the allele.",
    "Incidence of the allele in a population.",
    "Miao.",
  ];

  const subHeader = (
    dataset,
    totalAlleleCount,
    totalAlleleNumber,
    totalAlleleCountHomozygous,
    totalAlleleCountHeterozygous,
    totalAlleleFrequency
  ) => (
    <tr>
      <td className="beaconized" colSpan="1">
        <b>{dataset}</b>
      </td>
      <td className="beaconized" colSpan="1">
        <b>Total</b>
      </td>
      <td className="beaconized centered" colSpan="1">
        <b>{totalAlleleCount}</b>
      </td>
      <td className="beaconized centered" colSpan="1">
        <b>{totalAlleleNumber}</b>
      </td>
      <td className="beaconized centered" colSpan="1">
        <b>
          {totalAlleleCountHomozygous ||
            totalAlleleCount - totalAlleleCountHeterozygous}
        </b>
      </td>
      <td className="beaconized centered" colSpan="1">
        <b>
          {totalAlleleCountHeterozygous ||
            totalAlleleCount - totalAlleleCountHomozygous}
        </b>
      </td>
      <td className="beaconized centered" colSpan="1">
        <b>{parseFloat(totalAlleleFrequency.toString().substring(0, 6))}</b>
      </td>
    </tr>
  );

  const tableRow = (
    type,
    alleleCount,
    alleleNumber,
    alleleCountHomozygous,
    alleleCountHeterozygous,
    alleleFrequency,
    nonBackgroundColor
  ) => {
    const backgroundColor = nonBackgroundColor ? "" : "sex-background";
    return (
      <tr>
        {/* <td>Sex</td> */}
        <td></td>
        <td className={`type-wrap ${backgroundColor}`}>{type}</td>
        <td className={`centered-header ${backgroundColor}`}>
          {alleleCount || 0}
        </td>
        <td className={`centered-header ${backgroundColor}`}>
          {alleleNumber || 0}
        </td>
        {/* TODO: to change - with the calculation  */}
        <td className={`centered-header ${backgroundColor}`}>
          {alleleCountHomozygous || alleleCount - alleleCountHeterozygous}
        </td>
        <td className={`centered-header ${backgroundColor}`}>
          {alleleCountHeterozygous || alleleCount - alleleCountHomozygous}
        </td>
        <td className={`centered-header ${backgroundColor}`}>
          {parseFloat(alleleFrequency.toString().substring(0, 6)) || "-"}
        </td>
      </tr>
    );
  };

  //    Finding the logic
  const gcatData = results.find((result) => result.id === "EGAD00001007774");
  // const gcatData = results.find((result) => result.resultsCount > 1);
  const genomAdData = results.find(
    (result) => result.id === "gnomad_exome_v2.1.1"
    // const gcatData = results.find((result) => result.resultsCount === 1);
  );

  //   General GCAT Logic
  const gcatTable = () => {
    if (gcatData) {
      const getData = (population) => {
        return gcatData.results.find(
          (result) =>
            result?.frequencyInPopulations?.[0]?.frequencies?.[0]
              ?.population === population
        )?.frequencyInPopulations?.[0]?.frequencies?.[0];
      };

      const female = getData("Female");
      const male = getData("Male");

      const ancestries = gcatData.results.filter(
        (result) =>
          !["Female", "Male"].includes(
            result?.frequencyInPopulations?.[0]?.frequencies?.[0]?.population
          )
      );

      const ancestriesSumAlleleCount = 0;
      const ancestriesSumAlleleNumber = 0;
      const ancestriesSumAlleleCountHomozygous = 0;
      const ancestriesSumAlleleCountHeterozygous = 0;

      return (
        <>
          {/* TODO: Change numbers with actual logic */}
          {subHeader(
            gcatData.id,
            female && male
              ? female?.alleleCount + male?.alleleCount
              : ancestriesSumAlleleCount,
            female && male
              ? female?.alleleNumber + male?.alleleNumber
              : ancestriesSumAlleleNumber,
            female && male
              ? female?.alleleCountHomozygous + male?.alleleCountHomozygous
              : ancestriesSumAlleleCountHomozygous,
            female && male
              ? female?.alleleCountHeterozygous + male?.alleleCountHeterozygous
              : ancestriesSumAlleleCountHeterozygous,
            female && male
              ? (female?.alleleCount + male?.alleleCount) /
                  (female?.alleleNumber + male?.alleleNumber)
              : ancestriesSumAlleleCount / ancestriesSumAlleleNumber
          )}

          {toggle.includes("ancestry") &&
            ancestries.map((ancestry) => {
              const ancestryObj =
                ancestry?.frequencyInPopulations?.[0]?.frequencies?.[0];
              // TODO
              ancestriesSumAlleleCount += ancestryObj?.alleleCount;
              return tableRow(
                ancestryObj?.population,
                ancestryObj?.alleleCount,
                ancestryObj?.alleleNumber,
                ancestryObj?.alleleCountHomozygous,
                ancestryObj?.alleleCountHeterozygous,
                ancestryObj?.alleleFrequency,
                true
              );
            })}
          {/* Female */}
          {female &&
            toggle.includes("sex") &&
            tableRow(
              "XX",
              female?.alleleCount,
              female?.alleleNumber,
              female?.alleleCountHomozygous,
              female?.alleleCountHeterozygous,
              female?.alleleFrequency
            )}
          {/* Male */}
          {male &&
            toggle.includes("sex") &&
            tableRow(
              "XY",
              male?.alleleCount,
              male?.alleleNumber,
              male?.alleleCountHomozygous,
              male?.alleleCountHeterozygous,
              male?.alleleFrequency
            )}
        </>
      );
    }
    return null;
  };

  // General GenomAd Logic
  const genomAdTable = () => {
    if (genomAdData) {
      const getData = (population) => {
        return genomAdData.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.find(
          (frequency) => frequency?.population === population
        );
      };

      const females = getData("Females");
      const males = getData("Males");
      const total = getData("Total");
      const ancestries =
        genomAdData.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.filter(
          (frequency) =>
            !["Females", "Males", "Total"].includes(frequency?.population)
        );

      return (
        <>
          {subHeader(
            genomAdData.id,
            total?.alleleCount,
            total?.alleleNumber,
            total?.alleleCountHomozygous,
            total?.alleleCountHeterozygous,
            total?.alleleFrequency
          )}
          {toggle.includes("ancestry") &&
            ancestries.map((ancestry) =>
              tableRow(
                ancestry?.population,
                ancestry?.alleleCount,
                ancestry?.alleleNumber,
                ancestry?.alleleCountHomozygous,
                ancestry?.alleleCountHeterozygous,
                ancestry?.alleleFrequency,
                true
              )
            )}
          {females &&
            toggle.includes("sex") &&
            tableRow(
              "XX",
              females?.alleleCount,
              females?.alleleNumber,
              females?.alleleCountHomozygous,
              females?.alleleCountHeterozygous,
              females?.alleleFrequency
            )}
          {males &&
            toggle.includes("sex") &&
            tableRow(
              "XY",
              males?.alleleCount,
              males?.alleleNumber,
              males?.alleleCountHomozygous,
              males?.alleleCountHeterozygous,
              males?.alleleFrequency
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
            "& .super-app-theme--header": {
              backgroundColor: "#7B1B58",
              width: "2000px",
              color: "white",
            },
          }}
        >
          <Row>
            <p className="lead mt-2">
              <b>Results </b>
            </p>
            <div className="features-row">
              <p className="queried-variant">
                {
                  <span>
                    Queried Variant:{" "}
                    <span className="queried-variant-input">
                      {queriedVariant}
                    </span>
                  </span>
                }
              </p>
              <p className="sortby">Sort By:</p>
              <ToggleButtonGroup
                value={toggle}
                exclusive={false}
                onChange={handleToggle}
                aria-label="Sort options"
                sx={{
                  display: "flex",
                  marginBottom: "25px",
                  gap: "16px",
                  "& .MuiToggleButtonGroup-firstButton": {
                    borderRadius: "100px",
                    border: "1px solid #3176B1",
                  },
                  "& .MuiToggleButtonGroup-lastButton": {
                    borderRadius: "100px",
                    border: "1px solid #3176B1",
                  },
                }}
              >
                <ToggleButton
                  value="ancestry"
                  aria-label="ancestry"
                  size="small"
                  sx={{
                    width: "95px",
                    height: "32px",
                    fontFamily: "sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0.1px",
                    textTransform: "none",
                    color: "#3176B1",
                    background: "#F4F9FE",
                    "&.Mui-selected": {
                      backgroundColor: "#3176B1",
                      color: "white",
                      border: "1px solid #3176B1",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#3176B1",
                      color: "white",
                      border: "1px solid #3176B1",
                    },
                  }}
                >
                  Ancestry
                </ToggleButton>
                <ToggleButton
                  value="sex"
                  exclusive
                  aria-label="sex"
                  size="small"
                  sx={{
                    width: "57px",
                    height: "32px",
                    border: "1px solid #3176B1",
                    fontFamily: "sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    letterSpacing: "0.1px",
                    textTransform: "none",
                    color: "#3176B1",
                    background: "#F4F9FE",
                    "&.Mui-selected": {
                      backgroundColor: "#3176B1",
                      color: "white",
                      border: "1px solid #3176B1",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#3176B1",
                      color: "white",
                      border: "1px solid #3176B1",
                    },
                  }}
                >
                  Sex
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Row>
          <div className="table-container">
            <table className="data-table">
              <tr>
                <th>Dataset</th>
                <TooltipHeader title={tooltipTexts[5]}>
                  {/* <th className="dataset-column"></th> */}
                  <th className="underlined population-column">Population</th>
                </TooltipHeader>
                <TooltipHeader title={tooltipTexts[0]}>
                  <th className="centered-header underlined allele-count-column">
                    Allele Count
                  </th>
                </TooltipHeader>
                <TooltipHeader title={tooltipTexts[1]}>
                  <th className="centered-header underlined allele-number-column">
                    Allele Number
                  </th>
                </TooltipHeader>
                <TooltipHeader title={tooltipTexts[2]}>
                  <th className="centered-header underlined homozygous-count-column">
                    Homozygous/ Hemizygous Count
                  </th>
                </TooltipHeader>
                <TooltipHeader title={tooltipTexts[3]}>
                  <th className="centered-header underlined heterozygous-count-column">
                    Heterozygous Count
                  </th>
                </TooltipHeader>
                <TooltipHeader title={tooltipTexts[4]}>
                  <th className="centered-header underlined allele-frequency-column">
                    Allele Frequency
                  </th>
                </TooltipHeader>
              </tr>
              {gcatTable()}
              {genomAdTable()}
            </table>
          </div>
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
