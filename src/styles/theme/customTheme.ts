import { extendTheme } from "@mui/joy/styles"

const customTheme = extendTheme({
  cssVarPrefix: "joy",
  colorSchemes: {
    light: {
      palette: {
        primary: {
          
        },
        neutral: {
          
        },
        background: {
          body: "#ffffff",
        },
        text: {
          primary: "#000",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          
        },
        neutral: {

        },
        background: {
          body: "#0f1214",
        },
        text: {
          primary: "#fff",
        },
      },
    },
  },
})

export default customTheme