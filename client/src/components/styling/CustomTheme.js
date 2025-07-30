import { createTheme } from "@mui/material/styles";

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
            width: "270px",
          },
          "@media (max-width: 1199px) and (min-width: 1181px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "520px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "270px",
            },
          },
          "@media (max-width: 1180px) and (min-width: 992px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "502px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "300px",
            },
          },
          "@media (max-width: 767px) and (min-width: 576px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "510px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "510px",
            },
          },
          // TODO fix the width
          "@media (max-width: 575px) and (min-width: 500px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "400px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "400px",
            },
          },
          "@media (max-width: 499px) and (min-width: 431px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "370px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "370px",
            },
          },
          "@media (max-width: 430px) and (min-width: 400px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "340px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "340px",
            },
          },
          "@media (max-width: 399px) and (min-width: 321px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "300px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "300px",
            },
          },
          "@media (max-width: 320px) and (min-width: 300px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "270px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "270px",
            },
          },
          "@media (max-width: 299px) and (min-width: 100px)": {
            "&.variant-autocomplete .MuiOutlinedInput-root": {
              width: "250px",
            },
            "&.genome-autocomplete .MuiOutlinedInput-root": {
              width: "250px",
            },
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
    // Variant query tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#FFFFFF",
          color: "#000000",
          border: "1px solid #023452",
          fontSize: "14px",
          padding: "5px 10.83px",
          borderRadius: "5px",
          maxWidth: "430px",
        },
        arrow: {
          color: "#023452",
          transform: "translate(1px, 0px) !important",
        },
      },
    },
  },
});

export default customTheme;
