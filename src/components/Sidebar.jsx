import { useNavigate, useLocation } from "react-router-dom"
import Logo from "./Logo"
import { useTheme } from "../context/ThemeContext"

function Sidebar(){
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    const esRutaNegocio = ["/negocio", "/mesas", "/productos"].includes(location.pathname)

    const itemClass = (activo) => `bp-sidebar-item ${activo ? "bp-sidebar-item-active" : ""}`

    return (
        <aside className="bp-sidebar w-64 shrink-0 border-r border-gray-800 p-5">
            <div className="min-h-0 flex flex-1 flex-col">
                <div className="shrink-0">
                    <Logo/>
                </div>

                <nav className="mt-8 flex flex-col gap-2">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className={itemClass(location.pathname === "/dashboard")}>
                        <span>🎱</span>
                        <span>Salón en vivo</span>
                    </button>

                    <button
                        onClick={() => navigate("/negocio")}
                        className={itemClass(esRutaNegocio)}>
                        <span>⚙️</span>
                        <span>Tu negocio</span>
                    </button>

                    <button
                        onClick={() => navigate("/reportes")}
                        className={itemClass(location.pathname === "/reportes")}>
                        <span>📊</span>
                        <span>Reportes</span>
                    </button>
                </nav>

                <div className="mt-auto space-y-3 pt-6">
                    <button
                        onClick={toggleTheme}
                        className="bp-theme-toggle"
                        aria-label="Cambiar apariencia">
                        <span>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-60">Apariencia</span>
                            <span className="mt-1 block text-sm font-black">
                                {theme === "dark" ? "Modo oscuro" : "Modo claro"}
                            </span>
                        </span>
                        <span className="bp-theme-icon">
                            {theme === "dark" ? "🌙" : "☀️"}
                        </span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="bp-logout-button">
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
