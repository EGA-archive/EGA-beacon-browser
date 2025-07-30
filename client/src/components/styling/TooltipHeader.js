import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

// Custom styling for the MUI Tooltip using styled
// We wrap the Tooltip with our own class and override default styles
const CustomTooltip = styled(({ className, ...props }) => (
  // Pass the custom class name to MUI's internal popper element
  <Tooltip {...props} classes={{ popper: className }} />
))({
  // Style the tooltip box itself
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "1px solid #023452",
    fontSize: "14px",
    padding: "5px 10.83px",
    borderRadius: "5px",
    maxWidth: "430px",
  },
  // Style the arrow that points to the element
  [`& .MuiTooltip-arrow`]: {
    color: "#023452",
  },
  // Style the tooltip positioning
  "&.custom-margin-right": {
    [`& .MuiTooltip-tooltip`]: {
      transform: "translateY(100%)",
      transformOrigin: "center bottom",
    },
  },
});

// TooltipHeader component:
// Wraps any children with a custom tooltip on hover
// - title: the tooltip text
// - children: the element that triggers the tooltip
// - customClass: optional custom class to add styles
const TooltipHeader = ({ title, children, customClass }) => {
  return (
    <CustomTooltip title={title} placement="top" arrow className={customClass}>
      {children}
    </CustomTooltip>
  );
};

export default TooltipHeader;
