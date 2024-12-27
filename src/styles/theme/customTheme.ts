import { extendTheme } from "@mui/joy/styles"

const customTheme = extendTheme({
  cssVarPrefix: "joy",
  colorSchemes: {
    light: {
      palette: {
        primary: {},
        neutral: {},
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
        primary: {},
        neutral: {},
        background: {
          body: "#0f1214",
        },
        text: {
          primary: "#fff",
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === "solid" && ownerState.color === "primary" && {
            background: `linear-gradient(
              90deg, 
              rgba(124,68,247,1) 0%, 
              rgba(64,147,246,1) 50%, 
              rgba(61,167,248,1) 100%
            )`,
            color: "#ffffff",
            "&:hover": {
              background: `linear-gradient(
                90deg, 
                rgba(61,167,248,1) 0%, 
                rgba(64,147,246,1) 50%, 
                rgba(124,68,247,1) 100%
              )`,
            },
          }),
        }),
      },
    },
  },
})

export default customTheme