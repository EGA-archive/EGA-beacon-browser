import axios from "axios";
import React, { useState } from "react";
import "./App.css";
import { Container, Row } from "react-bootstrap";
import ResultList from "../src/components/resultTable/ResultList.js";
import Search from "./components/Search";
import { useAuth } from "oidc-react";
import Footer from "./components/layout/Footer.js";
import NetworkMembers from "./components/layout/NetworkMembers.js";
import CustomNavbar from "./components/layout/CustomNavbar.js";
import config from "./config";

// Main application container and orchestration layer

function App() {
  // Holds Beacon query results.
  // original: results from the queried assembly
  // lifted: results from liftover queries (if enabled)
  const [results, setResults] = useState({
    original: [],
    lifted: [],
  });
  const [metaresults, setMetaResults] = useState([]);
  const [finalstart, setFinalStart] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [queriedVariant, setQueriedVariant] = useState("");

  // Stores the assembly used for the original query
  const [assemblyIdQueried, setAssemblyIdQueried] = useState("");

  // Stores the lifted-over variant string
  const [liftedVariant, setLiftedVariant] = useState(null);

  // Stores the assembly used for the lifted-over query
  const [liftedAssemblyId, setLiftedAssemblyId] = useState(null);
  const auth = useAuth();

  // This function handles the variant search logic
  // const search = async (variant, genome) => {
  const search = async (variant, genome, type = "original") => {
    // When the search is fired, we start by setting the loader to start as well
    setLoading(true);
    let jsonData = {};

    // Split the variant string into parts:
    // Example input: "1-123456-A-T"
    // Result: ["1", "123456", "A", "T"]
    // Meaning: [chromosome, start, referenceBase, alternateBase]
    const arr = variant.split("-");

    // Calculate the end position of the variant on the genome.
    // If the reference base is just one character, the variant goes only one position → end = start + 1
    // If the reference base is longer, the variant spans multiple bases → end = start + length of the reference base
    const end =
      arr[2].length === 1
        ? parseInt(arr[1]) + 1
        : parseInt(arr[1]) + arr[2].length;

    // Convert end to string and store start as a number
    const finalend = end.toString();
    const finalstart = parseInt(arr[1]);

    // Save the start position in state
    setFinalStart(finalstart);

    // First, fetch metadata from the given API endpoint
    try {
      let metaresponse;
      metaresponse = await axios({
        method: "get",
        url: `${config.API_URL}`,
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Store metadata results in the data
      setMetaResults(metaresponse.data.response);
      // If metadata request fails, show error and stops
    } catch (error) {
      console.error(error);
      setError(error);
    }
    try {
      // Main search query
      jsonData = {
        meta: {
          apiVersion: "2.0",
        },
        query: {
          requestParameters: {
            alternateBases: arr[3], // "A" bases being observed in place of the reference
            referenceBases: arr[2], // "AT" bases in the reference genome
            start: arr[1], // "19653341" variant start position
            end: finalend, // "19653343" start + length of referenceBases
            referenceName: arr[0], // "21" the chromosome
          },
          filters: [],
          // Only return datasets that contain this variant (aka positive results)
          includeResultsetResponses: "HIT",
          // Control how many results to return and from where to start
          pagination: {
            skip: 0, // Start from the first dataset
            limit: 10, // Return up to 10 datasets
          },
          testMode: false,
          requestedGranularity: "record", // Ask for full records
        },
      };
      let response;

      // If user is authenticated, send a POST request with token
      if (auth && auth.userData) {
        response = await axios({
          method: "post",
          url: `${config.API_URL}/g_variants`,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.userData.access_token}`, // token for secure access
          },
          data: jsonData, // send full query as body
        });
      } else {
        // If not authenticated, send a public GET request with query parameters in the URL
        response = await axios.get(`${config.API_URL}/g_variants`, {
          headers: { "Content-Type": "application/json" },
          params: {
            start: arr[1], // Start position from the variant
            alternateBases: arr[3], // "A"
            referenceBases: arr[2], // "AT"
            referenceName: arr[0], // "21"
            assemblyId: genome, // passed from the Search component (GRCh37)
          },
        });
      }

      // Save the query results in state
      // setResults(response.data.response.resultSets);
      setResults((prev) => ({
        ...prev,
        [type]: response.data.response.resultSets,
      }));
      // Stops the loader
      setLoading(false);
    } catch (error) {
      // Catch possible errors
      console.error(error);
    }
  };

  // Page display backbone
  return (
    <div className="bigparent">
      <div>
        {/* Navbar */}
        <CustomNavbar />
        <Container>
          <Row>
            {/* Search component: calls the `search()` function and sets the variant string */}
            <Search
              search={search}
              setVariant={setQueriedVariant}
              setAssemblyIdQueried={setAssemblyIdQueried}
              liftedVariant={liftedVariant}
              setLiftedVariant={setLiftedVariant}
              setLiftedAssemblyId={setLiftedAssemblyId}
            />
          </Row>
          {/* Show loader while waiting for results */}
          {isLoading && !error && <div className="loader"></div>}
          {/* Show results if no error and not loading */}
          {!isLoading && !error && (
            <ResultList
              results={results}
              metaresults={metaresults}
              finalstart={finalstart}
              error={error}
              queriedVariant={queriedVariant}
              assemblyIdQueried={assemblyIdQueried}
              liftedAssemblyId={liftedAssemblyId}
              liftedVariant={liftedVariant}
            />
          )}
          {/* If no variant has been searched, show the Network Members, otherwise show result */}
          {!queriedVariant && <NetworkMembers />}
          {/* If there's an error, also show the ResultList with error handling */}
          {error !== false && (
            <ResultList
              results={results}
              metaresults={metaresults}
              finalstart={finalstart}
              error={error}
            />
          )}
        </Container>
      </div>
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default App;
