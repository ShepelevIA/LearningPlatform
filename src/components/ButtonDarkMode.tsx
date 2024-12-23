import { Button } from "@mui/joy"
import { useColorScheme } from "@mui/joy/styles"

export default function ButtonDarkMode() {
  const { mode, setMode } = useColorScheme()

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light"
    setMode(newMode)
  }

  return (
    <Button onClick={toggleTheme}>
      {mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    </Button>
  )
}
