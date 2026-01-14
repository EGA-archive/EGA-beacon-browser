import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Formik } from "formik";
import { Col, Container, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ThemeProvider } from "@mui/material/styles";
import CustomTheme from "./styling/CustomTheme";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { liftoverVariant } from "../../src/components/liftovers/useLiftover";

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

function Search({
  search,
  setVariant,
  setAssemblyIdQueried,
  liftedVariant,
  setLiftedVariant,
  setLiftedAssemblyId,
}) {
  // Local React state (drives liftover side effects)
  const [currentVariant, setCurrentVariant] = React.useState("");
  const [currentGenome, setCurrentGenome] = React.useState("GRCh37");
  const [liftoverEnabled, setLiftoverEnabled] = React.useState(false);
  const [liftoverError, setLiftoverError] = React.useState(null);
  const setFieldValueRef = React.useRef(null);

  // Automatically clear liftover error after 5 seconds
  // and fully reset liftover UI + state
  React.useEffect(() => {
    if (!liftoverError) return;

    const timer = setTimeout(() => {
      // 1. Clear the error message
      setLiftoverError(null);

      // 2. Disable liftover logic
      setLiftoverEnabled(false);

      // 3. Clear lifted results
      setLiftedVariant(null);
      setLiftedAssemblyId(null);

      // 4. Reset Formik checkbox (this resets the UI visuals)
      if (setFieldValueRef.current) {
        setFieldValueRef.current("liftover", false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [liftoverError]);

  React.useEffect(() => {
    const runLiftover = async () => {
      if (!liftoverEnabled || !currentVariant || !currentGenome) {
        setLiftedVariant(null);
        setLiftedAssemblyId(null);
        return;
      }

      try {
        setLiftoverError(null);
        const lifted = await liftoverVariant(currentVariant, currentGenome);

        setLiftedVariant(lifted);
        setLiftedAssemblyId(currentGenome === "GRCh37" ? "GRCh38" : "GRCh37");
      } catch (err) {
        setLiftedVariant(null);
        setLiftedAssemblyId(null);
        setLiftoverError(
          "Liftover could not be completed for this variant. The coordinates may not exist in the target assembly."
        );
      }
    };

    runLiftover();
  }, [liftoverEnabled, currentVariant, currentGenome]);

  const onSubmit = async (values) => {
    setVariant(values.variant);
    setAssemblyIdQueried(values.genome);

    await search(values.variant, values.genome, "original");

    if (values.liftover && liftedVariant) {
      const liftedAssembly = values.genome === "GRCh37" ? "GRCh38" : "GRCh37";

      await search(liftedVariant, liftedAssembly, "lifted");
    }
  };

  return (
    <ThemeProvider theme={CustomTheme}>
      <Container>
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
            setFieldValueRef.current = setFieldValue;
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
                <Form.Group className="search-row">
                  <Box sx={{ width: "100%", mx: "auto" }}>
                    <Grid container spacing={2}>
                      {/* Variant */}
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Form.Label className="form-section-label">
                          <b className="variant-query">Variant query</b>
                          <Tooltip
                            placement="top-start"
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
                          fullWidth
                          freeSolo
                          options={[]}
                          value={values.variant}
                          onInputChange={(event, newValue) => {
                            if (event && event.type !== "paste") {
                              setFieldValue("variant", newValue);
                              setCurrentVariant(newValue);
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
                            />
                          )}
                        />
                      </Grid>

                      {/* Ref Genome */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Form.Group controlId="ref-genome">
                          <Form.Label className="form-section-label">
                            <b>Ref Genome</b>
                          </Form.Label>

                          <Autocomplete
                            options={refGenome}
                            value={refGenome.find(
                              (o) => o.label === values.genome
                            )}
                            onChange={(e, newValue) => {
                              const genome = newValue ? newValue.label : "";
                              setFieldValue("genome", genome);
                              setCurrentGenome(genome);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                id="ref-genome"
                                inputProps={{
                                  ...params.inputProps,
                                  id: "ref-genome",
                                }}
                                size="small"
                                fullWidth
                              />
                            )}
                          />
                        </Form.Group>
                      </Grid>

                      {/* Search */}
                      <Grid size={{ xs: 12, md: 2 }}>
                        <button
                          className="searchbutton"
                          type="submit"
                          disabled={errors.variant || errors.genome}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div className="button-text-icon">
                            <div className="lupared"></div>
                            Search
                          </div>
                        </button>
                      </Grid>
                    </Grid>
                  </Box>
                </Form.Group>
                {/* Liftover checkbox */}
                <Box sx={{ mt: 2 }}>
                  <Grid container>
                    <Grid size={12}>
                      <div className="liftover-row">
                        <div className="liftover-convert">
                          <Form.Check
                            type="checkbox"
                            id="liftover-checkbox"
                            checked={values.liftover}
                            disabled={!values.variant}
                            onChange={(e) => {
                              setFieldValue("liftover", e.target.checked);
                              setLiftoverEnabled(e.target.checked);
                            }}
                            style={{
                              opacity: values.variant ? 1 : 0.5,
                              cursor: values.variant
                                ? "pointer"
                                : "not-allowed",
                              opacity: values.liftover ? 1 : 0.5,
                              cursor: values.liftover ? "pointer" : "default",
                            }}
                            label={
                              <span className="liftover-label">
                                Convert this variant to the other reference
                                genome
                                <Tooltip
                                  title={
                                    <ul className="tooltip-bullets">
                                      <li>
                                        When enabled, results may include
                                        datasets aligned to GRCh37 and/or
                                        GRCh38.
                                      </li>
                                      <li>
                                        Liftover is performed using bcftools
                                        (version 1000090).
                                      </li>
                                    </ul>
                                  }
                                  placement="top-start"
                                  arrow
                                >
                                  <b className="infovariant info-convert"> i</b>
                                </Tooltip>
                              </span>
                            }
                          />
                        </div>

                        {liftedVariant && values.liftover && (
                          <span className="liftover-info">
                            Lifted-over to{" "}
                            <b>
                              {values.genome === "GRCh37" ? "GRCh38" : "GRCh37"}
                            </b>{" "}
                            | <b>{liftedVariant}</b>
                          </span>
                        )}
                      </div>
                      {/* </div> */}
                    </Grid>
                  </Grid>
                </Box>

                {liftoverError && (
                  <Row className="mt-1">
                    <Col className="text-danger">{liftoverError}</Col>
                  </Row>
                )}
                {/* Examples */}
                <div className="mt-3 example-row">
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
