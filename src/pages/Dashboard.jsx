import { useCallback, useEffect, useMemo, useState } from "react"
import MesaCard from "../components/MesaCard"
import ModalMesa from "../components/ModalMesa"
import Sidebar from "../components/Sidebar"

const API_BASE_URL = "http://localhost:8080/api"
const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
})

function Dashboard(){
    const [mesas, setMesas] = useState([])
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
    const [filtroEstado, setFiltroEstado] = useState("TODAS")
    const [busqueda, setBusqueda] = useState("")
    const [cargando, setCargando] = useState(true)
    const [refrescando, setRefrescando] = useState(false)
    const [error, setError] = useState("")
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null)

    const token = localStorage.getItem("token")

    const cargarMesas = useCallback(async ({ silencioso = false } = {}) => {
        if (silencioso) {
            setRefrescando(true)
        } else {
            setCargando(true)
        }

        setError("")

        try {
            const respuesta = await fetch(`${API_BASE_URL}/mesas`, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            })

            if (!respuesta.ok) {
                throw new Error("No se pudieron cargar las mesas. Revisa el backend o vuelve a iniciar sesión.")
            }

            const data = await respuesta.json()
            setMesas([...data].sort((a, b) => Number(a.numero) - Number(b.numero)))
            setUltimaActualizacion(new Date())
        } catch (error) {
            setError(error.message)
        } finally {
            setCargando(false)
            setRefrescando(false)
        }
    }, [token])

    useEffect(() => {
        cargarMesas()
    }, [cargarMesas])

    const metricas = useMemo(() => {
        const ocupadas = mesas.filter((mesa) => mesa.estado === "OCUPADA").length
        const libres = mesas.filter((mesa) => mesa.estado === "LIBRE").length

        return {
            total: mesas.length,
            ocupadas,
            libres
        }
    }, [mesas])

    const mesasFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        return mesas.filter((mesa) => {
            const coincideEstado = filtroEstado === "TODAS" || mesa.estado === filtroEstado
            const coincideBusqueda = !texto || String(mesa.numero).includes(texto)
            return coincideEstado && coincideBusqueda
        })
    }, [mesas, filtroEstado, busqueda])

    const ultimaActualizacionTexto = ultimaActualizacion
        ? ultimaActualizacion.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
        : "—"

    return(
        <div className="flex min-h-screen bg-gray-950 text-white">
            <Sidebar/>

            <main className="flex-1 p-5 lg:p-8">
                <section className="mb-6 rounded-3xl border border-gray-800 bg-gray-900 p-5 lg:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-black uppercase tracking-widest text-yellow-400">Salón en vivo</p>
                            <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">Control de mesas</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                                Pantalla simple para ocupar mesas, ver cronómetros y cerrar partidas sin distracciones.
                            </p>
                        </div>

                        
                    </div>
                </section>

                <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ResumenCard titulo="Ocupadas" valor={metricas.ocupadas} ayuda="mesas en juego" tono="amarillo" />
                    <ResumenCard titulo="Libres" valor={metricas.libres} ayuda="listas para ocupar" tono="verde" />
                    <ResumenCard titulo="Total" valor={metricas.total} ayuda={`actualizado ${ultimaActualizacionTexto}`} tono="gris" />
                </section>

                <section className="mb-5 rounded-3xl border border-gray-800 bg-gray-900 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex rounded-2xl border border-gray-800 bg-gray-950 p-1">
                            <FiltroButton activo={filtroEstado === "TODAS"} onClick={() => setFiltroEstado("TODAS")}>Todas</FiltroButton>
                            <FiltroButton activo={filtroEstado === "LIBRE"} onClick={() => setFiltroEstado("LIBRE")}>Libres</FiltroButton>
                            <FiltroButton activo={filtroEstado === "OCUPADA"} onClick={() => setFiltroEstado("OCUPADA")}>Ocupadas</FiltroButton>
                        </div>

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar mesa..."
                            className="w-full rounded-2xl border border-gray-800 bg-gray-950 px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-yellow-400 lg:w-72"
                        />
                    </div>
                </section>

                {error && (
                    <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">
                        {error}
                    </div>
                )}

                {cargando ? (
                    <SkeletonMesas />
                ) : mesasFiltradas.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
                        <h3 className="text-2xl font-black text-white">No hay mesas para mostrar</h3>
                        <p className="mt-2 text-gray-400">Cambia el filtro o crea mesas desde “Tu negocio”.</p>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {mesasFiltradas.map((mesa) => (
                            <MesaCard
                                key={mesa.id}
                                mesa={mesa}
                                formatCOP={(valor) => formatoCOP.format(Math.round(Number(valor || 0) / 50) * 50)}
                                onActualizar={() => cargarMesas({ silencioso: true })}
                                onVerDetalle={setMesaSeleccionada}
                            />
                        ))}
                    </section>
                )}
            </main>

            {mesaSeleccionada && mesaSeleccionada.estado === "OCUPADA" && (
                <ModalMesa
                    id={mesaSeleccionada.id}
                    numero={mesaSeleccionada.numero}
                    horaInicio={mesaSeleccionada.horaInicio}
                    precio={mesaSeleccionada.precioPorHora}
                    onCerrar={() => setMesaSeleccionada(null)}
                    onActualizar={() => cargarMesas({ silencioso: true })}
                />
            )}
        </div>
    )
}

function ResumenCard({ titulo, valor, ayuda, tono }) {
    const tonos = {
        amarillo: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
        verde: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        gris: "border-gray-800 bg-gray-900 text-white"
    }

    return (
        <article className={`rounded-3xl border p-5 ${tonos[tono] || tonos.gris}`}>
            <p className="text-xs font-black uppercase tracking-widest opacity-70">{titulo}</p>
            <p className="mt-2 text-4xl font-black">{valor}</p>
            <p className="mt-1 text-sm text-gray-400">{ayuda}</p>
        </article>
    )
}

function FiltroButton({ activo, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-black transition-colors sm:flex-none ${
                activo ? "bg-yellow-400 text-gray-950" : "text-gray-400 hover:text-white"
            }`}>
            {children}
        </button>
    )
}

function SkeletonMesas() {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-3xl border border-gray-800 bg-gray-900" />
            ))}
        </div>
    )
}

export default Dashboard
