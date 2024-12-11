import React, { useState } from "react";
import { Box } from "@mui/system";
import { Row } from "react-bootstrap";
import TooltipHeader from "./TooltipHeader.js";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";

function ResultList({
  results,
  metaresults,
  finalstart,
  queriedVariant,
  error,
}) {
  // console.log("Results from RL", results);
  // console.log("Raw Results from RL", results);
  // results.forEach((result, index) => {
  //   console.log(`Result ${index}:`, result);
  // });
  // console.log("Metaresults from RL", metaresults);

  const [toggle, setToggle] = useState(["ancestry", "sex"]);

  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  // const handleToggle = (event, newToggle) => {
  //   if (newToggle) {
  //     setToggle(newToggle); // Update the state with selected values
  //   }
  // };

  var i = 0;
  var dataset = "";
  var rows = [];
  const addedBeacons = [];
  var isresponse = "";
  var exists = "";
  var total_count = 0;
  var populationrow = "";
  var beaconized = "";
  var beaconName = "";
  var alleleC = "";
  var alleleCHet = "";
  var alleleCHom = "";
  var popu = "";
  if (results !== undefined) {
    const resultItems = results.map((result, index) => {
      // console.log(`Processing result at index ${index}:`, result);
      if (result.results) {
        isresponse = "True";
        rows = [];
        dataset = result.id;

        result.results.map((variant) => {
          if (variant.variation.location.interval.start.value === finalstart) {
            if (variant.frequencyInPopulations) {
              exists = "True";
              isresponse = "True";

              variant.frequencyInPopulations.map((frequencyInPopulation) => {
                frequencyInPopulation.frequencies.map((frequency) => {
                  alleleC = Array.isArray(frequency.alleleCount)
                    ? frequency.alleleCount[0]
                    : frequency.alleleCount;

                  alleleCHet = Array.isArray(frequency.alleleCountHeterozygous)
                    ? frequency.alleleCountHeterozygous[0]
                    : frequency.alleleCountHeterozygous;

                  alleleCHom = Array.isArray(frequency.alleleCountHomozygous)
                    ? frequency.alleleCountHomozygous[0]
                    : frequency.alleleCountHomozygous;

                  if (
                    frequency.population === "COVID_pop11_fin_2" ||
                    frequency.population === "COVID_pop11_fin_1"
                  ) {
                    popu = "Finnish";
                  } else if (
                    frequency.population === "COVID_pop12_ita_1" ||
                    frequency.population === "COVID_pop12_ita_2"
                  ) {
                    popu = "Italian";
                  } else if (
                    frequency.population === "COVID_pop13_ger_1" ||
                    frequency.population === "COVID_pop13_ger_2"
                  ) {
                    popu = "German";
                  } else {
                    popu =
                      frequency.population.length > 10
                        ? frequency.population.substring(0, 10) + ".." // Add ellipsis for truncation
                        : frequency.population; // Use the full population if <= 10 characters
                  }

                  rows.push({
                    id: (i += 1),
                    population: popu,
                    alleleCount: alleleC,
                    alleleNumber: frequency.alleleNumber,
                    alleleCountHomozygous: alleleCHom,
                    alleleCountHeterozygous: alleleCHet,
                    alleleFrequency: parseFloat(
                      frequency.alleleFrequency.toString().substring(0, 6)
                    ),
                  });
                });
              });
            }
          }
        });
      }
      if (isresponse === "True") {
        // Render table rows based on toggle state
        populationrow = rows.map((pr) => {
          if (toggle.includes("ancestry") && toggle.includes("sex")) {
            // Render full table when both "ancestry" and "sex" are toggled
            return (
              <>
                <tr key={`ancestry-${pr.id}`}>
                  <td></td>
                  <td className="">{pr.population}</td>
                  <td className="centered-header">{pr.alleleCount}</td>
                  <td className="centered-header">{pr.alleleNumber}</td>
                  <td className="centered-header">
                    {pr.alleleCountHomozygous}
                  </td>
                  <td className="centered-header">
                    {pr.alleleCountHeterozygous}
                  </td>
                  <td className="centered-header">{pr.alleleFrequency}</td>
                </tr>
                <tr key={`sex-XX-${pr.id}`}>
                  <td></td>
                  <td className="sex-background">XX</td>
                  <td className="centered-header sex-background">
                    {pr.alleleCount}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleNumber}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHomozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHeterozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleFrequency}
                  </td>
                </tr>
                <tr key={`sex-XY-${pr.id}`}>
                  <td></td>
                  <td className="sex-background">XY</td>
                  <td className="centered-header sex-background">
                    {pr.alleleCount}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleNumber}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHomozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHeterozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleFrequency}
                  </td>
                </tr>
              </>
            );
          } else if (toggle.includes("sex")) {
            // Render only the "sex" table when "sex" is toggled
            return (
              <>
                <tr key={`sex-XX-${pr.id}`}>
                  <td></td>
                  <td className="sex-background">XX</td>
                  <td className="centered-header sex-background">
                    {pr.alleleCount}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleNumber}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHomozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHeterozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleFrequency}
                  </td>
                </tr>
                <tr key={`sex-XY-${pr.id}`}>
                  <td></td>
                  <td className="sex-background">XY</td>
                  <td className="centered-header sex-background">
                    {pr.alleleCount}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleNumber}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHomozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleCountHeterozygous}
                  </td>
                  <td className="centered-header sex-background">
                    {pr.alleleFrequency}
                  </td>
                </tr>
              </>
            );
          } else if (toggle.includes("ancestry")) {
            // Render only the "ancestry" table when "ancestry" is toggled
            return (
              <tr key={`ancestry-${pr.id}`}>
                <td></td>
                <td className="">{pr.population}</td>
                <td className="centered-header">{pr.alleleCount}</td>
                <td className="centered-header">{pr.alleleNumber}</td>
                <td className="centered-header">{pr.alleleCountHomozygous}</td>
                <td className="centered-header">
                  {pr.alleleCountHeterozygous}
                </td>
                <td className="centered-header">{pr.alleleFrequency}</td>
              </tr>
            );
          }
        });

        metaresults.map((meta) => {
          if (
            meta.response &&
            dataset !== "" &&
            meta.response.id === result.beaconId
          ) {
            beaconName = meta.response.name;
            const isTruncated = dataset.length > 20;
            const truncatedName = isTruncated
              ? dataset.substring(0, 26) + ".."
              : dataset;
            beaconized = (
              <tr>
                <td className="beaconized" colSpan="1">
                  {isTruncated ? (
                    // Render tooltip only if the name is truncated
                    <Tooltip title={dataset} arrow>
                      <b>{truncatedName}</b>
                    </Tooltip>
                  ) : (
                    <b>{dataset}</b>
                  )}
                </td>
                <td className="beaconized" colSpan="1">
                  <b>Total</b>
                </td>
                <td className="beaconized centered" colSpan="1">
                  <b>Total</b>
                </td>
                <td className="beaconized centered" colSpan="1">
                  <b>Total</b>
                </td>
                <td className="beaconized centered" colSpan="1">
                  <b>Total</b>
                </td>
                <td className="beaconized centered" colSpan="1">
                  <b>Total</b>
                </td>
                <td className="beaconized centered" colSpan="1">
                  <b>Total</b>
                </td>
              </tr>
            );
            addedBeacons.push(beaconized);
            addedBeacons.push(populationrow);
            isresponse = "True";
          }
        });
      }
      rows = [];
      dataset = "";
      beaconized = "";
      total_count += 1;
    });
  } else {
    exists = "False";
    isresponse = "False";
  }

  const tooltipTexts = [
    "Number of copies of a specific allele in a population.",
    "Total number of analysed individuals.",
    "Number of individuals homozygous for the allele.",
    "Number of individuals heterozygous for the allele.",
    "Incidence of the allele in a population.",
  ];

  return (
    <Row>
      {results && exists === "True" && (
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
                {/* <th className="dataset-column"></th> */}
                <th className="population-column pp">Population</th>
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
              {addedBeacons}
            </table>
          </div>
        </Box>
      )}
      {rows.length === 0 && dataset !== "" && (
        <p className="exclamation">No results found.</p>
      )}
      {addedBeacons.length === 0 && total_count !== 0 && (
        <p className="exclamation">No results found.</p>
      )}
      {!results && <p className="exclamation">No results found.</p>}
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
