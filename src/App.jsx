import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"



function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>  
      </BrowserRouter>
  )
}

export default App
