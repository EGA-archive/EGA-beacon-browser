// import axios from "axios";
// import React, { useState } from "react";
// import "./App.css";
// import { Container, Row } from "react-bootstrap";
// import ResultList from "../src/components/resultTable/ResultList.js";
// import Search from "./components/Search";
// import Footer from "./components/layout/Footer.js";
// import NetworkMembers from "./components/layout/NetworkMembers.js";
// import CustomNavbar from "./components/layout/CustomNavbar.js";
// import config from "./config";
// import { mockData } from "./mock.js";

// // Main application container and orchestration layer
// function App() {
//   // Holds Beacon query results.
//   // original: results from the queried assembly
//   // lifted: results from liftover queries (if enabled)
//   const [results, setResults] = useState({
//     original: [],
//     lifted: [],
//   });
//   const [metaresults, setMetaResults] = useState([]);
//   const [finalstart, setFinalStart] = useState([]);
//   const [error, setError] = useState(false);
//   const [isLoading, setLoading] = useState(false);
//   const [queriedVariant, setQueriedVariant] = useState("");

//   // Stores the assembly used for the original query
//   const [assemblyIdQueried, setAssemblyIdQueried] = useState("");

//   // Stores the lifted-over variant string
//   const [liftedVariant, setLiftedVariant] = useState(null);

//   // Stores the assembly used for the lifted-over query
//   const [liftedAssemblyId, setLiftedAssemblyId] = useState(null);

//   // This function handles the variant search logic
//   // const search = async (variant, genome) => {
//   const search = async (variant, genome, type = "original") => {
//     // When the search is fired, we start by setting the loader to start as well
//     setLoading(true);
//     setError(false);

//     const USE_MOCK = false;

//     if (USE_MOCK) {
//       setResults(mockData);
//       setQueriedVariant(variant);
//       setAssemblyIdQueried(genome);
//       setLoading(false);
//       return;
//     }

//     let jsonData = {};

//     // Split the variant string into parts:
//     // Example input: "1-123456-A-T"
//     // Result: ["1", "123456", "A", "T"]
//     // Meaning: [chromosome, start, referenceBase, alternateBase]
//     const arr = variant.split("-");

//     // Original user input is now considered 1-based
//     const userStart = parseInt(arr[1]);

//     // Convert to 0-based for Beacon
//     const beaconStart = userStart - 1;

//     // Save the start position in state
//     // Keep user-facing start as 1-based
//     setFinalStart(userStart);

//     // First, fetch metadata from the given API endpoint
//     try {
//       let metaresponse;
//       metaresponse = await axios({
//         method: "get",
//         url: `${config.API_URL}`,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       // Store metadata results in the data
//       setMetaResults(metaresponse.data.response);
//       // If metadata request fails, show error and stops
//     } catch (error) {
//       console.error(error);
//       setError(error);
//     }

//     try {
//       // Main search query
//       jsonData = {
//         meta: {
//           apiVersion: "2.0",
//         },
//         query: {
//           requestParameters: {
//             alternateBases: arr[3], // "A" bases being observed in place of the reference
//             referenceBases: arr[2], // "AT" bases in the reference genome
//             start: [beaconStart], // 0-based start position
//             referenceName: arr[0], // "21" the chromosome
//             assemblyId: genome,
//           },
//           filters: [],
//           // Only return datasets that contain this variant (aka positive results)
//           includeResultsetResponses: "HIT",
//           // Control how many results to return and from where to start
//           pagination: {
//             skip: 0, // Start from the first dataset
//             limit: 10, // Return up to 10 datasets
//           },
//           testMode: false,
//           requestedGranularity: "record", // Ask for full records
//         },
//       };

//       let response;

//       // If user is authenticated, send a POST request with token
//       if (auth && auth.userData) {
//         response = await axios({
//           method: "post",
//           url: `${config.API_URL}/g_variants`,
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${auth.userData.access_token}`, // token for secure access
//           },
//           data: jsonData, // send full query as body
//         });
//       } else {
//         // If not authenticated, send a public GET request with query parameters in the URL
//         response = await axios.get(`${config.API_URL}/g_variants`, {
//           headers: { "Content-Type": "application/json" },
//           params: {
//             start: beaconStart, // 0-based start position
//             alternateBases: arr[3], // "A"
//             referenceBases: arr[2], // "AT"
//             referenceName: arr[0], // "21"
//             assemblyId: genome, // passed from the Search component (GRCh37)
//           },
//         });
//       }

//       // Save the query results in state
//       setResults((prev) => ({
//         ...prev,
//         [type]: response.data.response.resultSets,
//       }));

//       // Stops the loader
//       setLoading(false);
//     } catch (error) {
//       // Catch possible errors
//       console.error(error);
//       setError(error);
//       setLoading(false);
//     }
//   };
//   // Page display backbone
//   return (
//     <div className="bigparent">
//       <div>
//         {/* Navbar */}
//         <CustomNavbar />
//         <Container>
//           <Row>
//             {/* Search component: calls the `search()` function and sets the variant string */}
//             <Search
//               search={search}
//               setVariant={setQueriedVariant}
//               setAssemblyIdQueried={setAssemblyIdQueried}
//               liftedVariant={liftedVariant}
//               setLiftedVariant={setLiftedVariant}
//               setLiftedAssemblyId={setLiftedAssemblyId}
//             />
//           </Row>
//           {/* Show loader while waiting for results */}
//           {isLoading && !error && <div className="loader"></div>}
//           {/* Show results if no error and not loading */}
//           {!isLoading && !error && (
//             <ResultList
//               results={results}
//               metaresults={metaresults}
//               finalstart={finalstart}
//               error={error}
//               queriedVariant={queriedVariant}
//               assemblyIdQueried={assemblyIdQueried}
//               liftedAssemblyId={liftedAssemblyId}
//               liftedVariant={liftedVariant}
//             />
//           )}
//           {/* If no variant has been searched, show the Network Members, otherwise show result */}
//           {!queriedVariant && <NetworkMembers />}
//           {/* If there's an error, also show the ResultList with error handling */}
//           {error !== false && (
//             <ResultList
//               results={results}
//               metaresults={metaresults}
//               finalstart={finalstart}
//               error={error}
//             />
//           )}
//         </Container>
//       </div>
//       {/* Footer at the bottom */}
//       <Footer />
//     </div>
//   );
// }

// export default App;

import axios from "axios";
import React, { useState } from "react";
import "./App.css";
import { Container, Row } from "react-bootstrap";
import ResultList from "../src/components/resultTable/ResultList.js";
import Search from "./components/Search";
import Footer from "./components/layout/Footer.js";
import NetworkMembers from "./components/layout/NetworkMembers.js";
import CustomNavbar from "./components/layout/CustomNavbar.js";
import config from "./config";
import { mockData } from "./mock.js";

/**
 * Main application container and orchestration layer
 * - Handles search
 * - Stores global state
 * - Controls UI rendering
 */
function App() {
  const [results, setResults] = useState({
    original: [],
    lifted: [],
  });

  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [queriedVariant, setQueriedVariant] = useState("");
  const [assemblyIdQueried, setAssemblyIdQueried] = useState("");

  const [liftedVariant, setLiftedVariant] = useState(null);
  const [liftedAssemblyId, setLiftedAssemblyId] = useState(null);

  /**
   * STEP 1 — Parse variant string
   * Input: "1-123456-A-T"
   * Output: structured object
   */
  const parseVariant = (variant) => {
    const [chrom, pos, ref, alt] = variant.split("-");
    const userStart = parseInt(pos);

    return {
      chrom,
      ref,
      alt,
      userStart, // 1-based (user)
      beaconStart: userStart - 1, // 0-based (Beacon)
    };
  };

  const buildQuery = ({ chrom, ref, alt, beaconStart, genome }) => ({
    meta: { apiVersion: "2.0" },
    query: {
      requestParameters: {
        alternateBases: alt,
        referenceBases: ref,
        start: [beaconStart],
        referenceName: chrom,
        assemblyId: genome,
      },
      filters: [],
      includeResultsetResponses: "HIT",
      pagination: { skip: 0, limit: 10 },
      testMode: false,
      requestedGranularity: "record",
    },
  });

  const fetchResults = async (query) => {
    return axios.post(`${config.API_URL}/g_variants`, query, {
      headers: { "Content-Type": "application/json" },
    });
  };
  const search = async (variant, genome, type = "original") => {
    setLoading(true);
    setError(null);

    const USE_MOCK = true;

    if (USE_MOCK) {
      setResults(mockData);
      setQueriedVariant(variant);
      setAssemblyIdQueried(genome);
      setLoading(false);
      return;
    }

    try {
      const parsed = parseVariant(variant);
      const query = buildQuery({
        ...parsed,
        genome,
      });
      const response = await fetchResults(query);
      setResults((prev) => ({
        ...prev,
        [type]: response.data.response.resultSets,
      }));
      setQueriedVariant(variant);
      setAssemblyIdQueried(genome);
    } catch (err) {
      console.error("❌ Search error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bigparent">
      <div>
        <CustomNavbar />

        <Container>
          <Row>
            <Search
              search={search}
              setVariant={setQueriedVariant}
              setAssemblyIdQueried={setAssemblyIdQueried}
              liftedVariant={liftedVariant}
              setLiftedVariant={setLiftedVariant}
              setLiftedAssemblyId={setLiftedAssemblyId}
            />
          </Row>
          {isLoading && !error && <div className="loader"></div>}

          {!isLoading && (
            <ResultList
              results={results}
              error={error}
              queriedVariant={queriedVariant}
              assemblyIdQueried={assemblyIdQueried}
              liftedAssemblyId={liftedAssemblyId}
              liftedVariant={liftedVariant}
            />
          )}
          {!queriedVariant && <NetworkMembers />}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default App;
