import { useNavigate } from "react-router-dom"
import Logo from "./Logo"

function Sidebar(){
    const navigate = useNavigate()
    return (
        <div className="w-64 bg-gray-800 p-6">
            <Logo/>
            <nav className="mt-8 flex flex-col gap-2">
                <button onClick={() => navigate("/Dashboard")} className="text-left px-4 py-3 text-yellow-400 bg-gray-700 rounded-lg">
                    Control del salón
                </button>
                <button onClick={() => navigate("/Productos")} className="text-left px-4 py-3 text-gray-400 hover:text-white rounded-lg">
                    Productos
                </button>
                <button  onClick={() => navigate("/Reportes")} className="text-left px-4 py-3 text-gray-400 hover:text-white rounded-lg">
                    Reportes
                </button>
            </nav>
        </div>
    )
}

export default Sidebar  