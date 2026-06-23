import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import Reportes from "./pages/Reportes"
import GestionNegocio from "./pages/GestionNegocio"
import { ThemeProvider } from "./context/ThemeContext"


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={
            <PrivateRoute>
                <Dashboard/>
            </PrivateRoute>
          } />
          <Route path="/negocio" element={
            <PrivateRoute>
                <GestionNegocio/>
            </PrivateRoute>
          } />
          <Route path="/mesas" element={
            <PrivateRoute>
                <GestionNegocio initialTab="mesas"/>
            </PrivateRoute>
          } />
          <Route path="/productos" element={
            <PrivateRoute>
                <GestionNegocio initialTab="productos"/>
            </PrivateRoute>
          } />
          <Route path="/reportes" element={
              <PrivateRoute>
                  <Reportes/>
              </PrivateRoute>
          } />
        </Routes>  
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
