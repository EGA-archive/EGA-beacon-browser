import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Formik } from "formik";
import { Col, Container, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ThemeProvider } from "@mui/material/styles";
import CustomTheme from "../components/CustomTheme";

const SignupSchema = Yup.object().shape({
  variant: Yup.string()
    .matches(
      /[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,X]-([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?-[A,C,G,T]+-[A,C,G,T]+$/,
      "Incorrect variant information, please check the example below"
    )
    .required("Required"),
  genome: Yup.string().required("Required"),
});

//Dropdown Menu for refGenome
const refGenome = [{ label: "GRCh37" }, { label: "GRCh38" }];

// values.variant saves the variant written in the inputfield.
// search comes from App.js - it is the big api call
function Search({ search, setVariant }) {
  const onSubmit = async (values, actions) => {
    setVariant(values.variant);
    await search(values.variant, values.genome);
  };

  return (
    <ThemeProvider theme={CustomTheme}>
      <Container className="preventover">
        <Formik
          initialValues={{
            variant: "",
            genome: "GRCh37", // Preselect GRCh37
          }}
          validationSchema={SignupSchema}
          onSubmit={onSubmit}
        >
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => {
            const handlePaste = (event) => {
              event.preventDefault();
              const pastedData = event.clipboardData.getData("text");
              const cleanedData = pastedData
                .trim() // Remove leading/trailing whitespace
                .replace(/\./g, "") // Remove all periods
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/\t/g, "-") // Replace tabs with a single hyphen
                .replace(/\s/g, "-") // Replace remaining spaces with a single hyphen
                .replace(/-+/g, "-"); // Replace multiple consecutive hyphens with a single hyphen
              // .replace(/\s+/g, "-");
              setFieldValue("variant", cleanedData);
            };

            return (
              <Form noValidate onSubmit={handleSubmit}>
                {/* <Form.Group controlId="country"> */}
                <Form.Group>
                  <Row className="search-row">
                    <Col className="col-variant">
                      <Form.Label>
                        <b className="variant-query">Variant query</b>
                        <Tooltip
                          title={
                            <ul className="tooltip-bullets">
                              <li>
                                Type your variant or copy from Excel with this
                                specific structure: chr / position / ref. base /
                                alt. base.
                              </li>
                              <li>Queries need to be in 0-based format.</li>
                            </ul>
                          }
                          placement="top-start"
                          arrow
                        >
                          <b className="infovariant">i</b>
                        </Tooltip>
                      </Form.Label>

                      {/* Varaint Field */}

                      <Autocomplete
                        className="variant-autocomplete"
                        freeSolo
                        options={[]}
                        value={values.variant}
                        onInputChange={(event, newValue) => {
                          setFieldValue("variant", newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Insert your variant"
                            size="small"
                            onPaste={handlePaste}
                            error={Boolean(touched.variant && errors.variant)}
                            helperText={
                              touched.variant && errors.variant
                                ? errors.variant
                                : ""
                            }
                            sx={{
                              marginBottom: "20px",
                              "& .MuiOutlinedInput-root": {
                                borderColor:
                                  touched.variant && errors.variant
                                    ? "red"
                                    : "",
                              },
                            }}
                          />
                        )}
                      />
                    </Col>

                    <Col className="col-refgenome">
                      <Form.Label
                        htmlFor="ref-genome"
                        className="ref-genome-label"
                      >
                        <b>Ref Genome</b>
                      </Form.Label>
                      <Autocomplete
                        className="genome-autocomplete"
                        disablePortal
                        options={refGenome}
                        name="genome"
                        // className="input-field genome-field shadow-none"
                        // onChange={handleChange}
                        // value={values.genome}
                        value={refGenome.find(
                          (option) => option.label === values.genome
                        )}
                        onChange={(event, newValue) => {
                          setFieldValue(
                            "genome",
                            newValue ? newValue.label : ""
                          );
                        }}
                        // className="input-field genome-field shadow-none"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            // label="Ref Genome"
                            error={Boolean(errors.genome && touched.genome)}
                            helperText={
                              errors.genome && touched.genome
                                ? errors.genome
                                : ""
                            } // Show error message
                          />
                        )}
                      />
                    </Col>

                    {/* Search button */}
                    <Col className="col-searchbutton">
                      <button
                        className="searchbutton"
                        type="submit"
                        variant="primary"
                        disabled={errors.variant || errors.genome}
                      >
                        <div className="button-text-icon">
                          <div className="lupared"></div>Search
                        </div>
                      </button>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group as={Row}></Form.Group>
                {/* Example */}
                {/* {touched.variant && errors.variant && (
                <div className="errors">{errors.variant}</div>
              )} */}
                <div className="example-span">
                  <span>Example: </span>
                  <a
                    type="reset"
                    onClick={() => setFieldValue("variant", "22-19978252-C-T")}
                  >
                    <u className="example">22-19978252-C-T</u>
                  </a>
                </div>
              </Form>
            );
          }}
        </Formik>
      </Container>
    </ThemeProvider>
  );
}

export default Search;
