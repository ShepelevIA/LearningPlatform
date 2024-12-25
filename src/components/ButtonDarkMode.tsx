import { Switch, Button } from "@mui/joy"
import { useColorScheme } from "@mui/joy/styles"
import { DarkMode, LightMode } from "@mui/icons-material"

interface ButtonDarkMode {
  isOpenSidebar?: boolean,
  isHovered?: boolean
}

export default function ButtonDarkMode({isOpenSidebar, isHovered}: ButtonDarkMode) {
  const { mode, setMode } = useColorScheme()

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light"
    setMode(newMode)
  }

  return (
    <>
    {isOpenSidebar || isHovered ?
            <Switch
            variant="plain"
            checked={mode === "dark"}
            onChange={toggleTheme}
            slotProps={{
              thumb: {
                children: mode === "dark" ? (
                  <DarkMode style={{ fontSize: "18px", color: "#9FA8DA" }} />
                ) : (
                  <LightMode style={{ fontSize: "18px", color: "#FDD835" }} />
                ),
                style: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: mode === "dark" ? "#212121" : "#FAFAFA",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.3s ease",
                },
              },
              track: {
                children: (
                  <>
                    <LightMode
                      style={{
                        position: "absolute",
                        left: "10px",
                        fontSize: "25px",
                        color: mode === "dark" ? "#fff" : "#FDD835",
                        opacity: mode === "dark" ? 0.5 : 1,
                      }}
                    />
                    <DarkMode
                      style={{
                        position: "absolute",
                        right: "10px",
                        fontSize: "25px",
                        color: mode === "dark" ? "#9FA8DA" : "#757575",
                        opacity: mode === "dark" ? 1 : 0.5,
                      }}
                    />
                  </>
                ),
              },
            }}
            sx={{
              width: '70%',
              "--Switch-trackWidth": "100%",
              "--Switch-trackHeight": "40px",
              "--Switch-thumbSize": "30px",
              "--Switch-thumbWidth": "70px",
              "--Switch-trackBackground": mode === "dark" ? "#24292f" : "#e8eaee",
              "--Switch-trackBorderRadius": "30px",
              border: "1px solid transparent",
              transition: "all 0.3s ease",
              "& .Joy-Switch-thumb": {
                borderRadius: "50%",
              },
            }}
          />
  :
    <Button    
      variant="plain"       
      onClick={toggleTheme}
    >
      {mode === "dark" ? <DarkMode sx={{color: '#9fa8da'}} /> : <LightMode sx={{color: '#fdd836'}} />}
    </Button>
  }
    </>
  )
}