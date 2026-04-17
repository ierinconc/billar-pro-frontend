import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Productos from "./pages/Productos"



function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/productos" element={<Productos/>} />
        </Routes>  
      </BrowserRouter>
  )
}

export default App
