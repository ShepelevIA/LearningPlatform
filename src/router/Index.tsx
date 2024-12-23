import { Routes, Route } from "react-router-dom"
import Home from "../page/Home/Home"

export default function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}