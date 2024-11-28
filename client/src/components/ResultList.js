// client/src/components/ResultList.js

import React from "react";
import { Box } from "@mui/system";
import { Row } from "react-bootstrap";

// changed
function ResultList({
  results,
  metaresults,
  finalstart,
  queriedVariant,
  error,
}) {
  console.log("Results from RL", results);
  console.log("Raw Results from RL", results);
  results.forEach((result, index) => {
    console.log(`Result ${index}:`, result);
  });
  console.log("Metaresults from RL", metaresults);

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
      console.log(`Processing result at index ${index}:`, result);
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
                  console.log("All pushed rows so far:", rows);
                });
              });
            }
          }
        });
      }
      if (isresponse === "True") {
        populationrow = rows.map((pr) => (
          <tr key={pr.id}>
            <td></td>
            <td>{dataset}</td>
            <td className="centered-header">{pr.population}</td>
            <td className="centered-header">{pr.alleleCount}</td>
            <td className="centered-header">{pr.alleleNumber}</td>
            <td className="centered-header">{pr.alleleCountHomozygous}</td>
            <td className="centered-header">{pr.alleleCountHeterozygous}</td>
            <td className="centered-header">{pr.alleleFrequency}</td>
          </tr>
        ));

        metaresults.map((meta) => {
          if (
            meta.response &&
            dataset !== "" &&
            meta.response.id === result.beaconId
          ) {
            beaconName = meta.response.name;
            beaconized = (
              <tr>
                <td className="beaconized" colSpan="8">
                  <b>{beaconName}</b>
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
          <p className="lead mt-2 mb-2">
            <b>Results </b>
          </p>
          <p>
            {queriedVariant && <span> Queried Variant: {queriedVariant}</span>}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", marginBottom: "32px" }}>
              <tr>
                <th>Beacon</th>
                <th style={{ width: "20%" }}>Dataset</th>
                <th className="centered-header" style={{ width: "11%" }}>
                  Population
                </th>
                <th className="centered-header" style={{ width: "11%" }}>
                  Allele Count
                </th>
                <th className="centered-header" style={{ width: "11%" }}>
                  Allele Number
                </th>
                <th className="centered-header" style={{ width: "16%" }}>
                  Homozygous/ Hemizygous Count
                </th>
                <th className="centered-header" style={{ width: "16%" }}>
                  Heterozygous Count
                </th>
                <th className="centered-header" style={{ width: "11%" }}>
                  Allele Frequency
                </th>
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
