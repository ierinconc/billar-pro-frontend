import { useNavigate, useLocation } from "react-router-dom"
import Logo from "./Logo"

function Sidebar(){
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }
    return (
        <div className="w-64 bg-gray-800 p-6 flex flex-col min-h-screen">
            <Logo/>
            <nav className="mt-8 flex flex-col gap-2">
                <button 
                    onClick={() => navigate("/dashboard")} 
                    className={`text-left px-4 py-3 rounded-lg ${
                        location.pathname === "/dashboard" 
                            ? "text-yellow-400 bg-gray-700" 
                            : "text-gray-400 hover:text-white"
                    }`}>
                    Control del salón
                </button>

                <button 
                    onClick={() => navigate("/productos")} 
                    className={`text-left px-4 py-3 rounded-lg ${
                        location.pathname === "/productos" 
                            ? "text-yellow-400 bg-gray-700" 
                            : "text-gray-400 hover:text-white"
                    }`}>
                    Productos
                </button>

                <button 
                    onClick={() => navigate("/reportes")} 
                    className={`text-left px-4 py-3 rounded-lg ${
                        location.pathname === "/reportes" 
                            ? "text-yellow-400 bg-gray-700" 
                            : "text-gray-400 hover:text-white"
                    }`}>
                    Reportes
                </button>
            </nav>
            <button 
                onClick={handleLogout}
                className="mt-auto w-full bg-red-600/20 border border-red-500 text-red-400 font-bold px-4 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                Cerrar sesión
            </button>
        </div>
    )
}

export default Sidebar  