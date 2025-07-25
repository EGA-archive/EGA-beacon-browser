import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Formik } from "formik";
import { Col, Container, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ThemeProvider } from "@mui/material/styles";
import CustomTheme from "../components/CustomTheme";

const SignupSchema = Yup.object().shape({
  variant: Yup.string()
    .matches(
      /^(?:[1-9]|1[0-9]|2[0-4]|X|Y)-([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?-[ACGT]+-[ACGT]+$/,
      "Incorrect variant information, please check the example below"
    )
    .required("Required"),
  genome: Yup.string().required("Required"),
});

// Dropdown Menu for Reference Genome
const refGenome = [{ label: "GRCh37" }, { label: "GRCh38" }];

function Search({ search, setVariant }) {
  const onSubmit = async (values, actions) => {
    setVariant(values.variant);
    await search(values.variant, values.genome);
  };

  return (
    <ThemeProvider theme={CustomTheme}>
      <Container className="responsive-background">
        <Formik
          initialValues={{
            variant: "",
            genome: "GRCh37", // Preselect GRCh37
          }}
          validationSchema={SignupSchema}
          onSubmit={onSubmit}
        >
          {({
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            validateField,
          }) => {
            const handlePaste = (event) => {
              event.preventDefault();
              const pastedData = event.clipboardData.getData("text");

              // Apply text cleanup rules
              const cleanedData = pastedData
                .trim()
                .replace(/\./g, "") // Remove all periods
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .replace(/\t/g, "-") // Replace tabs with a single hyphen
                .replace(/\s/g, "-") // Replace remaining spaces with a single hyphen
                .replace(/-+/g, "-"); // Replace multiple consecutive hyphens with a single hyphen

              // Get input field selection range
              const inputElement = event.target;
              const start = inputElement.selectionStart;
              const end = inputElement.selectionEnd;

              if (start !== null && end !== null) {
                // Preserve surrounding text and insert the cleaned pasted data
                const newValue =
                  values.variant.substring(0, start) +
                  cleanedData +
                  values.variant.substring(end);

                setFieldValue("variant", newValue);

                // Move cursor to the end of the pasted text
                setTimeout(() => {
                  inputElement.setSelectionRange(
                    start + cleanedData.length,
                    start + cleanedData.length
                  );
                }, 0);
              }
            };

            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group>
                  <Row className="search-row">
                    <Col className="col-variant">
                      <Form.Label className="ref-genome-label">
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

                      {/* Variant Field */}
                      <Autocomplete
                        className="variant-autocomplete"
                        fullWidth
                        freeSolo
                        options={[]}
                        value={values.variant}
                        onInputChange={(event, newValue) => {
                          if (event && event.type !== "paste") {
                            setFieldValue("variant", newValue);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            fullWidth
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
                        value={refGenome.find(
                          (option) => option.label === values.genome
                        )}
                        onChange={(event, newValue) => {
                          setFieldValue(
                            "genome",
                            newValue ? newValue.label : ""
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            error={Boolean(errors.genome && touched.genome)}
                            helperText={
                              errors.genome && touched.genome
                                ? errors.genome
                                : ""
                            }
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

                {/* Example Section */}
                <div className="mt-3 responsive-background-example">
                  <span className="mb-4">Examples:</span>
                  <br />
                  <span className="d-block mb-3 mt-2">
                    <a
                      type="reset"
                      onClick={async () => {
                        await setFieldValue("variant", "21-19653341-AT-A");
                        await setFieldValue("genome", "GRCh37");
                        await Promise.all([
                          validateField("variant"),
                          validateField("genome"),
                        ]);
                      }}
                    >
                      <u className="example">
                        GRCh37 <b>|</b> 21-19653341-AT-A
                      </u>
                    </a>
                  </span>

                  <span className="d-block">
                    <a
                      type="reset"
                      onClick={async () => {
                        await setFieldValue("variant", "21-18281024-AT-A");
                        await setFieldValue("genome", "GRCh38");
                        await Promise.all([
                          validateField("variant"),
                          validateField("genome"),
                        ]);
                      }}
                    >
                      <u className="example">
                        GRCh38 <b>|</b> 21-18281024-AT-A
                      </u>
                    </a>
                  </span>
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
