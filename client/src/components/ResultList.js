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
  const [toggle, setToggle] = useState(["ancestry", "sex"]);

  const handleToggle = (event, newToggle) => {
    setToggle(newToggle);
  };

  // console.log("All my results", results);
  // console.log(
  //   "MY RESULTS - female",
  //   results[0]?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.[0]
  // );
  // console.log(
  //   "MY RESULTS - male",
  //   results[0]?.results?.[1]?.frequencyInPopulations?.[0]?.frequencies?.[0]
  // );
  // console.log(
  //   "MY RESULTS - ancestry",
  //   results[0]?.results?.[2]?.frequencyInPopulations?.[0]?.frequencies?.[0]
  // );

  // https://beacon-apis-test.ega-archive.org/api/g_variants?start=60636&alternateBases=G&referenceBases=A&referenceName=10&assemblyId=GRCh37
  // https://beacon-apis-test.ega-archive.org/api/g_variants?start=60636&alternateBases=G&referenceBases=A&referenceName=10&limit=1&assemblyId=GRCh37
  // const handleToggle = (event, newToggle) => {
  //   if (newToggle.length > 0) {
  //     setToggle(newToggle); // Ensure the toggle state doesn't become empty
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

  if (results !== undefined) {
    // Find the first beacon with valid results
    const firstResult = results.find((result) => result.results);

    if (firstResult) {
      isresponse = "True";
      rows = [];
      dataset = firstResult.id;

      firstResult.results.forEach((variant) => {
        if (variant.variation.location.interval.start.value === finalstart) {
          if (variant.frequencyInPopulations) {
            exists = "True";

            variant.frequencyInPopulations.forEach((frequencyInPopulation) => {
              frequencyInPopulation.frequencies.forEach((frequency) => {
                alleleC = Array.isArray(frequency.alleleCount)
                  ? frequency.alleleCount[0]
                  : frequency.alleleCount;

                alleleCHet = Array.isArray(frequency.alleleCountHeterozygous)
                  ? frequency.alleleCountHeterozygous[0]
                  : frequency.alleleCountHeterozygous;

                alleleCHom = Array.isArray(frequency.alleleCountHomozygous)
                  ? frequency.alleleCountHomozygous[0]
                  : frequency.alleleCountHomozygous;

                rows.push({
                  id: (i += 1),
                  population: "popu",
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

      const female =
        results[0]?.results?.[0]?.frequencyInPopulations?.[0]?.frequencies?.[0];
      const male =
        results[0]?.results?.[1]?.frequencyInPopulations?.[0]?.frequencies?.[0];
      const ancestry =
        results[0]?.results?.[2]?.frequencyInPopulations?.[0]?.frequencies?.[0];

      let popu = "";
      if (ancestry?.population?.toLowerCase().includes("fin")) {
        popu = "Finnish";
      } else if (ancestry?.population?.toLowerCase().includes("ita")) {
        popu = "Italian";
      } else if (ancestry?.population?.toLowerCase().includes("ger")) {
        popu = "German";
      } else {
        popu =
          ancestry?.population.length > 10
            ? ancestry?.population.substring(0, 10) + ".."
            : ancestry?.population;
      }

      const femaleAlleleCount = female?.alleleCount || 0;
      const maleAlleleCount = male?.alleleCount || 0;
      const totalAlleleCount = femaleAlleleCount + maleAlleleCount;

      const femaleAlleleNumber = female?.alleleNumber || 0;
      const maleAlleleNumber = male?.alleleNumber || 0;
      const totalAlleleNumber = femaleAlleleNumber + maleAlleleNumber;

      const femaleAlleleCountHomozygous = female?.alleleCountHomozygous || 0;
      const maleAlleleCountHomozygous = male?.alleleCountHomozygous || 0;
      const totalAlleleCountHomozygous =
        femaleAlleleCountHomozygous + maleAlleleCountHomozygous;

      const femaleAlleleCountHeterozygous =
        female?.alleleCountHeterozygous || 0;
      const maleAlleleCountHeterozygous = male?.alleleCountHeterozygous || 0;
      const totalAlleleCountHeterozygous =
        femaleAlleleCountHeterozygous + maleAlleleCountHeterozygous;

      const totalAlleleFrequency = totalAlleleNumber
        ? parseFloat((totalAlleleCount / totalAlleleNumber).toFixed(4))
        : "-";

      const femaleTable = (
        <tr key={`sex-XX-${female?.id || "-"}`}>
          {/* <td>Sex</td> */}
          <td></td>
          <td className="sex-background">XX</td>
          <td className="centered-header sex-background">
            {female?.alleleCount || "-"}
          </td>
          <td className="centered-header sex-background">
            {female?.alleleNumber || "-"}
          </td>
          <td className="centered-header sex-background">
            {female?.alleleCountHomozygous || "-"}
          </td>
          <td className="centered-header sex-background">
            {female?.alleleCountHeterozygous || "-"}
          </td>
          <td className="centered-header sex-background">
            {parseFloat(female?.alleleFrequency.toString().substring(0, 6)) ||
              "-"}
          </td>
        </tr>
      );
      const maleTable = (
        <tr key={`sex-XY-${male?.id || "-"}`}>
          <td></td>
          <td className="sex-background">XY</td>
          <td className="centered-header sex-background">
            {male?.alleleCount || "-"}
          </td>
          <td className="centered-header sex-background">
            {male?.alleleNumber || "-"}
          </td>
          <td className="centered-header sex-background">
            {male?.alleleCountHomozygous || "-"}
          </td>
          <td className="centered-header sex-background">
            {male?.alleleCountHeterozygous || "-"}
          </td>
          <td className="centered-header sex-background">
            {parseFloat(male?.alleleFrequency.toString().substring(0, 6)) ||
              "-"}
          </td>
        </tr>
      );
      const ancestryTable = (
        <tr key={`ancestry-${ancestry?.id || "-"}`}>
          {/* <td>Ancestry</td> */}
          <td></td>
          <td className="">{popu || "-"}</td>
          <td className="centered-header">{ancestry?.alleleCount || "-"}</td>
          <td className="centered-header">{ancestry?.alleleNumber || "-"}</td>
          <td className="centered-header">
            {ancestry?.alleleCountHomozygous || "-"}
          </td>
          <td className="centered-header">
            {ancestry?.alleleCountHeterozygous || "-"}
          </td>
          <td className="centered-header">
            {parseFloat(ancestry?.alleleFrequency.toString().substring(0, 6)) ||
              "-"}
          </td>
        </tr>
      );

      // Render table rows based on toggle state
      let populationrow;
      if (toggle.includes("ancestry") && toggle.includes("sex")) {
        // Render full table when both "ancestry" and "sex" are toggled
        populationrow = (
          <React.Fragment>
            {ancestryTable}
            {femaleTable}
            {maleTable}
          </React.Fragment>
        );
      } else if (toggle.includes("sex")) {
        // Render only the "sex" table when "sex" is toggled
        populationrow = (
          <React.Fragment>
            {femaleTable}
            {maleTable}
          </React.Fragment>
        );
      } else if (toggle.includes("ancestry")) {
        // Render only the "ancestry" table when "ancestry" is toggled
        populationrow = ancestryTable;
      }

      // Generate totals row for beaconized
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
            <b>{totalAlleleCount || "-"}</b>
          </td>
          <td className="beaconized centered" colSpan="1">
            <b>{totalAlleleNumber || "-"}</b>
          </td>
          <td className="beaconized centered" colSpan="1">
            <b>{totalAlleleCountHomozygous || "-"}</b>
          </td>
          <td className="beaconized centered" colSpan="1">
            <b>{totalAlleleCountHeterozygous || "-"}</b>
          </td>
          <td className="beaconized centered" colSpan="1">
            <b>{totalAlleleFrequency || "-"}</b>
          </td>
        </tr>
      );

      addedBeacons.push(beaconized);
      addedBeacons.push(populationrow);
    }
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
                <TooltipHeader title={tooltipTexts[0]}>
                  {/* <th className="dataset-column"></th> */}
                  <th className="population-column underlined">Population</th>
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
