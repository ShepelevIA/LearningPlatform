import React, { useState, useEffect } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import Routers from "./router/Index"
import CssBaseline from "@mui/joy/CssBaseline"
import { CssVarsProvider } from "@mui/joy/styles"
import ButtonDarkMode from "./components/ButtonDarkMode"

import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/700.css"

type Mode = "light" | "dark"

export default function App() {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("theme") as Mode) || "light")

  useEffect(() => {
    localStorage.setItem("theme", mode)
  }, [mode])

  return (
    <CssVarsProvider defaultMode={mode}>
      <CssBaseline />
        <ButtonDarkMode />
        <Router>
          <Routers />
        </Router>
    </CssVarsProvider>
  )
}