import { createTheme } from "@mui/material/styles";
import { width } from "@mui/system";

const customTheme = createTheme({
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #0234524d !important",
            borderRadius: "10px",
            boxShadow: "none",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #3176B1 !important",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "1px solid #3176B1 !important",
          },
          "@media (max-width: 1180px)": {
            // Reduce size for smaller screens
            maxWidth: "270px",
            width: "100%", // Ensure it fits within its parent
          },
        },
        paper: {
          // Styles for the dropdown popover
          borderRadius: "10px",
          border: "1px solid #0234524d",
          boxShadow: "none",
        },
        listbox: {
          // Styles for the listbox
          padding: "0px",
          "& .MuiAutocomplete-option": {
            borderRadius: "5px",
            "&[aria-selected='true']": {
              backgroundColor: "#F4F9FE !important",
            },
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "0px",
          marginRight: "0px",
          color: "#FF0000",
        },
      },
    },
  },
});

export default customTheme;
