import React from "react";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import liftoverIcon from "../../liftover-icon.svg";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import AlleleFrequencyChart from "../../charts/AlleleFrequencyChart";

// This component displays the queried variant and toggle buttons for sorting results
// It allows users to sort by ancestry and/or sex
const ResultsHeader = ({
  assemblyIdQueried,
  queriedVariant,
  liftedAssemblyId,
  liftedVariant,
  toggle,
  handleToggle,
  onDownloadTable,
  data,
  onOpenAll,
  onCloseAll,
  allOpen,
  allClosed,
}) => {
  const getButtonStyle = () => ({
    borderRadius: "27px",
    height: "32px",
    fontSize: "14px",
    fontWeight: 700,
    textTransform: "none",
    background: "white",
    border: "1px solid #023452",
    color: "#023452",

    "&.Mui-disabled": {
      color: "#A0A0A0",
      border: "1px solid #A0A0A0",
      background: "white",
    },
  });

  return (
    <Box className="queried-row">
      {/* Title */}
      <Typography variant="body1" fontWeight="bold" mb={1}>
        Results
      </Typography>

      <Grid
        container
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
        wrap="wrap"
      >
        {/* Left side: Display the variant that was queried */}
        <Grid item xs={10} sm={10} md={10}>
          <Typography
            variant="body2"
            sx={{
              fontSize: "16px",
              marginBottom: { xs: 1, sm: 3 },
            }}
          >
            Queried Variant:{" "}
            <Box
              component="span"
              fontWeight="bold"
              sx={{ whiteSpace: "nowrap" }}
            >
              {assemblyIdQueried} | {queriedVariant}
            </Box>
          </Typography>

          {liftedVariant && liftedAssemblyId && (
            <Typography
              variant="body2"
              sx={{
                fontSize: "16px",
                marginTop: "4px",
              }}
            >
              Queried lifted-over variant:{" "}
              <Box component="span" fontWeight="bold">
                {liftedAssemblyId} | {liftedVariant}{" "}
                <img
                  src={liftoverIcon}
                  alt="Lifted-over variant"
                  width={45}
                  height={45}
                />
              </Box>
            </Typography>
          )}
        </Grid>
        {/* Chart should be here, after the results queried variant and liftedover queried variant */}
        {data?.length > 0 && (
          <Grid item xs={12}>
            <AlleleFrequencyChart data={data} />
          </Grid>
        )}
        {/* Sort controls, Open All/Close All for sex distribution*/}
        <Grid
          item
          xs={10}
          sm={12}
          md={12}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            "@media (min-width:575px) and (max-width:599px)": {
              flexBasis: "100%",
              maxWidth: "100%",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: "16px",
              whiteSpace: "nowrap",
            }}
          >
            Sex distribution (per ancestry):
          </Typography>

          <Button
            variant="outlined"
            onClick={onOpenAll}
            disabled={allOpen}
            sx={getButtonStyle(allOpen)}
          >
            Open all
          </Button>

          <Button
            variant="outlined"
            onClick={onCloseAll}
            disabled={allClosed}
            sx={getButtonStyle(allClosed)}
          >
            Close all
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              ml: "auto",
              "@media (max-width: 991px)": {
                ml: 0,
                mt: 1,
              },
              "@media (max-width: 550px)": {
                ml: 0,
                mt: 0,
                gap: "8px",
                width: "100%",
                flexWrap: "wrap",
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "16px",
                whiteSpace: "nowrap",
                ml: "auto",
                "@media (max-width: 550px)": {
                  ml: 0,
                },
              }}
            >
              Sort by:
            </Typography>

            {/* Toggle buttons for sorting options (ancestry / sex) */}
            <ToggleButtonGroup
              value={toggle}
              exclusive={false}
              onChange={(e, newToggle) => {
                handleToggle(e, newToggle);
              }}
              aria-label="Sort options"
              sx={{
                display: "flex",
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
              {/* Map over the sort options: ancestry and sex */}
              {["ancestry", "sex"].map((option) => {
                const isSelected = toggle.includes(option);
                return (
                  <ToggleButton
                    key={option}
                    value={option}
                    aria-label={option}
                    size="small"
                    sx={{
                      minWidth: option === "ancestry" ? "95px" : "57px",
                      height: "32px",
                      fontFamily: "sans-serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: "20px",
                      letterSpacing: "0.1px",
                      textTransform: "none",
                      color: "#3176B1",
                      background: "white",
                      border: "1px solid #3176B1 !important",
                      "&.Mui-selected": {
                        backgroundColor: "white",
                        color: "#3176B1",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "#EBEBEB",
                        color: "#3176B1",
                      },
                    }}
                  >
                    {/* Show filled or empty icon depending on selection */}
                    {isSelected ? (
                      <CheckCircleIcon
                        sx={{
                          color: "#3176B1",
                          fontSize: "16px",
                          marginRight: "6px",
                        }}
                      />
                    ) : (
                      <PanoramaFishEyeIcon
                        sx={{
                          color: "#ADADAD",
                          fontSize: "16px",
                          marginRight: "6px",
                        }}
                      />
                    )}
                    {/* Capitalize the first letter of the label */}
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
            {/* Download table block */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                textDecoration: "underline",
                ml: "24px",
                "@media (max-width: 550px)": {
                  width: "100%",
                  ml: 0,
                  mt: 0.5,
                },
              }}
              onClick={() => onDownloadTable(toggle, data)}
            >
              <span>Download table</span>
              <DownloadRoundedIcon
                fontSize="medium"
                sx={{ color: "#023452" }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResultsHeader;
