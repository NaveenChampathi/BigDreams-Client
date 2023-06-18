import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@material-ui/core";

const theme = createTheme({
  overrides: {
    // Name of the component
    MuiButton: {
      // Name of the slot
      root: {
        borderRadius: 0,
      },
    },
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
