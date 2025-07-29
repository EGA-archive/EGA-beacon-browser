import React from "react";
import {
  Box,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Row } from "react-bootstrap";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";

// Displays the queried variant and sorting toggles
const ResultsHeader = ({ queriedVariant, toggle, handleToggle }) => {
  return (
    <Row className="queried-row">
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
        {/* Left column: Queried Variant */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" sx={{ fontSize: "16px" }}>
            Queried Variant:{" "}
            <Box
              component="span"
              fontWeight="bold"
              sx={{ whiteSpace: "nowrap" }}
            >
              {queriedVariant}
            </Box>
          </Typography>
        </Grid>

        {/* Combined Sort by + ToggleButtons */}
        <Grid
          item
          xs={12}
          sm="auto"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", sm: "flex-end" },

            "@media (max-width: 599px) and (min-width: 576px)": {
              flexDirection: "row",
              flexBasis: "100%",
              justifyContent: "flex-start",
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
            Sort by:
          </Typography>

          <ToggleButtonGroup
            value={toggle}
            exclusive={false}
            onChange={handleToggle}
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
            {["ancestry", "sex"].map((option) => {
              const isSelected = toggle.includes(option);
              const isOpenClose = toggle.length > 0;

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
                    background: "#F4F9FE",
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
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Row>
  );
};

export default ResultsHeader;
