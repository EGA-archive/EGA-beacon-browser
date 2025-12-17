import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Formik } from "formik";
import { Col, Container, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ThemeProvider } from "@mui/material/styles";
import CustomTheme from "./styling/CustomTheme";
import { liftoverVariant } from "../useLiftover";

// Yup validation rules for the form
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
  // Local React state (drives liftover side effects)
  const [currentVariant, setCurrentVariant] = React.useState("");
  const [currentGenome, setCurrentGenome] = React.useState("GRCh37");
  const [liftoverEnabled, setLiftoverEnabled] = React.useState(false);
  const [liftedVariant, setLiftedVariant] = React.useState(null);
  const [liftoverError, setLiftoverError] = React.useState(null);

  // React.useEffect(() => {
  //   const runLiftover = async () => {
  //     if (!liftoverEnabled || !currentVariant || !currentGenome) {
  //       setLiftedVariant(null);
  //       return;
  //     }

  //     try {
  //       setLiftoverError(null);
  //       const lifted = await liftoverVariant(currentVariant, currentGenome);
  //       setLiftedVariant(lifted);
  //     } catch (err) {
  //       setLiftedVariant(null);
  //       setLiftoverError("Liftover failed");
  //     }
  //   };

  //   runLiftover();
  // }, [liftoverEnabled, currentVariant, currentGenome]);

  React.useEffect(() => {
    console.log("[LIFTOVER EFFECT] triggered", {
      liftoverEnabled,
      currentVariant,
      currentGenome,
    });

    const runLiftover = async () => {
      if (!liftoverEnabled || !currentVariant || !currentGenome) {
        console.log("[LIFTOVER EFFECT] skipped");
        setLiftedVariant(null);
        return;
      }

      try {
        console.log("[LIFTOVER EFFECT] calling liftoverVariant", {
          currentVariant,
          currentGenome,
        });

        setLiftoverError(null);
        const lifted = await liftoverVariant(currentVariant, currentGenome);

        console.log("[LIFTOVER EFFECT] result:", lifted);
        setLiftedVariant(lifted);
      } catch (err) {
        console.error("[LIFTOVER EFFECT] error", err);
        setLiftedVariant(null);
        setLiftoverError("Liftover failed");
      }
    };

    runLiftover();
  }, [liftoverEnabled, currentVariant, currentGenome]);

  // Submit handler
  const onSubmit = async (values) => {
    const variantToQuery =
      values.liftover && liftedVariant ? liftedVariant : values.variant;

    setVariant(variantToQuery);
    await search(variantToQuery, values.genome);
  };

  console.log(currentVariant);
  console.log(liftedVariant);

  return (
    <ThemeProvider theme={CustomTheme}>
      <Container className="responsive-background">
        <Formik
          initialValues={{
            variant: "",
            genome: "GRCh37",
            liftover: false,
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

              const cleanedData = pastedData
                .trim()
                .replace(/\./g, "")
                .replace(/\s+/g, " ")
                .replace(/\t/g, "-")
                .replace(/\s/g, "-")
                .replace(/-+/g, "-");

              const inputElement = event.target;
              const start = inputElement.selectionStart;
              const end = inputElement.selectionEnd;

              if (start !== null && end !== null) {
                const newValue =
                  values.variant.substring(0, start) +
                  cleanedData +
                  values.variant.substring(end);

                setFieldValue("variant", newValue);
                setCurrentVariant(newValue);

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
                    {/* Variant */}
                    <Col className="col-variant">
                      <Form.Label className="form-section-label">
                        <b className="variant-query">Variant query</b>
                        <Tooltip
                          title={
                            <ul className="tooltip-bullets">
                              <li>Format: chromosome-position-ref-alt</li>
                              <li>Queries are 0-based</li>
                            </ul>
                          }
                          arrow
                        >
                          <b className="infovariant">i</b>
                        </Tooltip>
                      </Form.Label>

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

                    {/* Genome */}
                    <Col className="col-refgenome">
                      <Form.Label className="form-section-label">
                        <b>Ref Genome</b>
                      </Form.Label>
                      <Autocomplete
                        options={refGenome}
                        value={refGenome.find((o) => o.label === values.genome)}
                        onChange={(e, newValue) => {
                          const genome = newValue ? newValue.label : "";
                          setFieldValue("genome", genome);
                          setCurrentGenome(genome);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} size="small" />
                        )}
                      />
                    </Col>

                    {/* Search */}
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
                {/* Liftover checkbox */}
                <Row className="mt-2">
                  <Col className="col-variant">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {/* Left side: checkbox + info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          id="liftover-checkbox"
                          label={
                            <span>
                              Convert this variant to the other reference genome
                            </span>
                          }
                          checked={values.liftover}
                          disabled={!values.variant}
                          onChange={(e) => {
                            setFieldValue("liftover", e.target.checked);
                            setLiftoverEnabled(e.target.checked);
                          }}
                          style={{
                            opacity: values.variant ? 1 : 0.5,
                            cursor: values.variant ? "pointer" : "not-allowed",
                          }}
                        />

                        <Tooltip
                          title={
                            <ul className="tooltip-bullets">
                              <li>
                                When enabled, results may include datasets
                                aligned to GRCh37 and/or GRCh38.
                              </li>
                              <li>
                                Liftover is performed using bcftools (version
                                1000090).
                              </li>
                            </ul>
                          }
                          placement="top-start"
                          arrow
                        >
                          <b
                            className="infovariant"
                            style={{ cursor: "default" }}
                          >
                            i
                          </b>
                        </Tooltip>
                      </div>

                      {/* Right side: lifted-over info */}
                      {liftedVariant && values.liftover && (
                        <span
                          style={{
                            marginLeft: "24px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Lifted-over to{" "}
                          <b>
                            {values.genome === "GRCh37" ? "GRCh38" : "GRCh37"}
                          </b>{" "}
                          | <b>{liftedVariant}</b>
                        </span>
                      )}
                    </div>
                  </Col>
                </Row>

                {liftoverError && (
                  <Row className="mt-1">
                    <Col className="col-variant text-danger">
                      {liftoverError}
                    </Col>
                  </Row>
                )}
                {/* Examples */}
                <div className="mt-3">
                  <u
                    className="example"
                    onClick={async () => {
                      await setFieldValue("variant", "21-19653341-AT-A");
                      await setFieldValue("genome", "GRCh37");
                      validateField("variant");
                      setCurrentVariant("21-19653341-AT-A");
                      setCurrentGenome("GRCh37");
                    }}
                  >
                    GRCh37 | 21-19653341-AT-A
                  </u>
                  <br />
                  <u
                    className="example"
                    onClick={async () => {
                      await setFieldValue("variant", "21-18281024-AT-A");
                      await setFieldValue("genome", "GRCh38");
                      validateField("variant");
                      setCurrentVariant("21-18281024-AT-A");
                      setCurrentGenome("GRCh38");
                    }}
                  >
                    GRCh38 | 21-18281024-AT-A
                  </u>
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
