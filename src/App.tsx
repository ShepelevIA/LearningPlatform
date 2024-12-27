import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Routers from "./router/Index"
import CssBaseline from "@mui/joy/CssBaseline"
import { CssVarsProvider } from "@mui/joy/styles"
import customTheme from "./styles/theme/customTheme"
import './App.css'

import { Provider } from 'react-redux'
import { store } from './store'

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
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token && location.pathname !== "/register") {
      navigate("/login")
    }
  }, [navigate, location.pathname])

  return (
    <Provider store={store}>
      <CssVarsProvider theme={customTheme} defaultMode={mode}>
        <CssBaseline />
        <Routers />
      </CssVarsProvider>
    </Provider>
  )
}