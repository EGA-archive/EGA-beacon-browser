// client/src/App.js
import axios from "axios";
import React, { useState } from "react"; // changed
import "./App.css";
import { Col, Container, Row } from "react-bootstrap";
import ResultList from "./components/ResultList";
import Search from "./components/Search";
import SignInForm from "./components/SignIn/SignInForm";
import { useAuth } from "oidc-react";
import Footer from "./components/Footer.js";
import LoggedIn from "./components/SignIn/LoggedIn.js";
import NetworkMembers from "./components/NetworkMembers.js";
import CustomNavbar from "./components/Navbar.js";

function App() {
  // new
  const [results, setResults] = useState([]);
  const [metaresults, setMetaResults] = useState([]);
  const [finalstart, setFinalStart] = useState([]);
  const [error, setError] = useState(false);
  const [isQuizePageVisible, setIsQuizePageVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [queriedVariant, setQueriedVariant] = useState("");
  const auth = useAuth();

  const onClickHandler = () => {
    // Set the visibility flag to true when the button is clicked
    setIsQuizePageVisible(true);
  };

  // new
  const search = async (variant, genome) => {
    setLoading(true);
    let jsonData1 = {};
    var arr = variant.split("-");
    if (arr[2].length === 1) {
      var end = parseInt(arr[1]) + 1;
    } else {
      var end = parseInt(arr[1]) + arr[2].length;
    }
    var finalend = end.toString();
    var finalstart = parseInt(arr[1]);
    setFinalStart(finalstart);
    //console.log(auth.userData.access_token);
    // console.log(auth)

    try {
      let metaresponse;
      metaresponse = await axios({
        method: "get",
        url: `https://beacon-network-backend-test.ega-archive.org/beacon-network/v2.0.0/`,
        // url: `https://af-gdi-bn-api-demo.ega-archive.org/beacon-network/v2.0.0/`,
        headers: {
          "Content-Type": "application/json",
        },
        data: jsonData1,
      });
      console.log(metaresponse.data.responses);
      setMetaResults(metaresponse.data.responses);
    } catch (error) {
      console.error(error);
      setError(error);
    }
    try {
      jsonData1 = {
        meta: {
          apiVersion: "2.0",
        },
        query: {
          requestParameters: {
            alternateBases: arr[3],
            referenceBases: arr[2],
            start: arr[1],
            end: finalend,
            referenceName: arr[0],
          },
          filters: [],
          includeResultsetResponses: "HIT",
          pagination: {
            skip: 0,
            limit: 10,
          },
          testMode: false,
          requestedGranularity: "record",
        },
      };
      let response;

      if (auth && auth.userData) {
        // console.log(auth)
        response = await axios({
          method: "post",
          url: `https://beacon-network-backend-test.ega-archive.org/beacon-network/v2.0.0/g_variants`,
          // url: `https://af-gdi-bn-api-demo.ega-archive.org/beacon-network/v2.0.0/g_variants`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.userData.access_token}`,
          },
          data: jsonData1,
        });
      } else {
        response = await axios({
          method: "get",
          url: `https://beacon-network-backend-test.ega-archive.org/beacon-network/v2.0.0/g_variants?start=${arr[1]}&alternateBases=${arr[3]}&referenceBases=${arr[2]}&referenceName=${arr[0]}&limit=1&assemblyId=${genome}`,
          // url: `https://af-gdi-bn-api-demo.ega-archive.org/beacon-network/v2.0.0/g_variants?start=${arr[1]}&alternateBases=${arr[3]}&referenceBases=${arr[2]}&referenceName=${arr[0]}&limit=1&assemblyId=GRCh37`,
          headers: {
            "Content-Type": "application/json",
          },
          data: jsonData1,
        });
      }
      console.log(response);
      setResults(response.data.response.resultSets);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div class="bigparent">
      <div class="parentwrapper">
        {/* <Navbar
          style={{
            background: "#3176B1",
            height: "77px",
            width: "100vw",
            borderWidth: "0",
            position: "sticky",
            top: "0",
            zIndex: "2",
          }}
        >
          <Container className="navbarContainer">
            <a
              className="egalogo"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <img
                src="/../egalogo.png"
                className="egalogo"
                alt="egalogo"
              ></img>
            </a>
            <h1 className="beacon">EGA Allele Frequency Browser</h1>
            <LoggedIn onClickHandler={onClickHandler} />
          </Container>
        </Navbar> */}
        <CustomNavbar onClickHandler={onClickHandler} />
        <Container>
          <Row>
            <Col lg={3}></Col>
            <Col lg={7}></Col>
            <Col>
              {/*<button onClick={onClickHandler} style={{backgroundImage:"url('/../ls-login.png')",backgroundSize:"cover",backgroundColor:"transparent",height:"35px",width:"160px",borderWidth:"0"}}></button>*/}
              {/*<button></button>*/}

              {/* When the flag is true, the page will be shown */}

              {auth && auth.userData && <SignInForm />}
              {!auth.userData && isQuizePageVisible && <SignInForm />}
            </Col>
            {/* <div className="mt-5"></div> */}
            <Search search={search} setVariant={setQueriedVariant} />{" "}
            {/* changed */}
          </Row>
          {isLoading === true && error === false && <div class="loader"></div>}
          {isLoading === false && error === false && (
            <ResultList
              results={results}
              metaresults={metaresults}
              finalstart={finalstart}
              error={error}
              queriedVariant={queriedVariant}
            />
          )}{" "}
          {/* Show NetworkMembers only if no search results */}
          {isLoading === false && error === false && results?.length === 0 && (
            <NetworkMembers />
          )}
          {/* changed */}
          {error !== false && (
            <ResultList
              results={results}
              metaresults={metaresults}
              finalstart={finalstart}
              error={error}
              // queriedVariant={queriedVariant}
            />
          )}{" "}
          {/* changed */}
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default App;
