import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Routers from "./router/Index"
import CssBaseline from "@mui/joy/CssBaseline"
import { CssVarsProvider } from "@mui/joy/styles"
import customTheme from "./styles/theme/customTheme"
import './App.css'

import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/700.css"

type ThemeMode = "light" | "dark"

export default function App() {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem("theme") as ThemeMode) || "light")

  useEffect(() => {
    localStorage.setItem("theme", mode)
  }, [mode])

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/login")
    }
  }, [navigate])

  return (
    <CssVarsProvider theme={customTheme} defaultMode={mode}>
      <CssBaseline />
      <Routers />
    </CssVarsProvider>
  )
}