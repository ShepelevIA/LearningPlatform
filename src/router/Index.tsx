import { Routes, Route } from "react-router-dom"
import Home from "../page/Home/Home"
import Login from "../page/Auth/Login"
import Register from "../page/Auth/Register"

export default function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}