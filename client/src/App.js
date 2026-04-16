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

    const USE_MOCK = false;

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

      if (type === "original") {
        setQueriedVariant(variant);
        setAssemblyIdQueried(genome);
      }
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
