import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Productos from "./pages/Productos"
import PrivateRoute from "./components/PrivateRoute"



function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={
            <PrivateRoute>
                <Dashboard/>
            </PrivateRoute>
          } />
          <Route path="/productos" element={
            <PrivateRoute>
                <Productos/>
            </PrivateRoute>
          } />
        </Routes>  
      </BrowserRouter>
  )
}

export default App
