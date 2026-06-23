import Sidebar from "../components/Sidebar"
import ModalMesaCRUD from "../components/ModalMesaCRUD"
import ModalConfirmacion from "../components/ModalConfirmacion"
import { useEffect, useMemo, useState } from "react"

const API_BASE_URL = "http://localhost:8080/api"

function Mesas() {
    const [mesas, setMesas] = useState([])
    const [mesaAEditar, setMesaAEditar] = useState(null)
    const [mesaAEliminar, setMesaAEliminar] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("TODAS")
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")
    const [eliminando, setEliminando] = useState(false)

    const formatCOP = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(valor || 0)

    const obtenerMensajeError = async (respuesta) => {
        try {
            const data = await respuesta.json()
            return data.mensaje || data.error || "No se pudo completar la operación."
        } catch {
            return "No se pudo completar la operación."
        }
    }

    const cargarMesas = async () => {
        setCargando(true)
        setError("")

        try {
            const respuesta = await fetch(`${API_BASE_URL}/mesas`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })

            if (!respuesta.ok) {
                const mensaje = await obtenerMensajeError(respuesta)
                throw new Error(mensaje)
            }

            const data = await respuesta.json()
            setMesas([...data].sort((a, b) => a.numero - b.numero))
        } catch (error) {
            setError(error.message)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarMesas()
    }, [])

    const mesasFiltradas = useMemo(() => {
        return mesas.filter((mesa) => {
            const coincideBusqueda = String(mesa.numero).includes(busqueda.trim())
            const coincideEstado = filtroEstado === "TODAS" || mesa.estado === filtroEstado
            return coincideBusqueda && coincideEstado
        })
    }, [mesas, busqueda, filtroEstado])

    const metricas = useMemo(() => {
        const total = mesas.length
        const libres = mesas.filter((mesa) => mesa.estado === "LIBRE").length
        const ocupadas = mesas.filter((mesa) => mesa.estado === "OCUPADA").length
        const promedio = total === 0
            ? 0
            : mesas.reduce((suma, mesa) => suma + Number(mesa.precioPorHora || 0), 0) / total

        return { total, libres, ocupadas, promedio }
    }, [mesas])

    const handleGuardar = () => {
        setMesaAEditar(null)
        cargarMesas()
    }

    const confirmarEliminar = async () => {
        if (!mesaAEliminar) return

        setEliminando(true)
        setError("")

        try {
            const respuesta = await fetch(`${API_BASE_URL}/mesas/${mesaAEliminar.id}/delete`, {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })

            if (!respuesta.ok) {
                const mensaje = await obtenerMensajeError(respuesta)
                throw new Error(mensaje)
            }

            setMesaAEliminar(null)
            cargarMesas()
        } catch (error) {
            setError(error.message)
        } finally {
            setEliminando(false)
        }
    }

    const estadoBadge = (estado) => {
        if (estado === "OCUPADA") {
            return "bg-red-500/15 text-red-300 border-red-500/30"
        }
        return "bg-green-500/15 text-green-300 border-green-500/30"
    }

    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar />

            <main className="flex-1 p-8 overflow-hidden">
                <section className="mb-8">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div>
                            <p className="text-yellow-400 text-xs font-bold uppercase tracking-[0.28em] mb-3">
                                Configuración operativa
                            </p>
                            <h1 className="text-white text-4xl font-bold mb-2">Mesas del salón</h1>
                            <p className="text-gray-400 max-w-2xl">
                                Administra el número de mesas, la tarifa por hora y la disponibilidad visible del salón sin tocar la base de datos.
                            </p>
                        </div>

                        <button
                            onClick={() => setMesaAEditar({})}
                            className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg shadow-yellow-400/10">
                            + Nueva mesa
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Mesas activas</p>
                        <p className="text-yellow-400 text-3xl font-bold">{metricas.total}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Libres</p>
                        <p className="text-green-300 text-3xl font-bold">{metricas.libres}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Ocupadas</p>
                        <p className="text-red-300 text-3xl font-bold">{metricas.ocupadas}</p>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-2">Tarifa promedio</p>
                        <p className="text-white text-2xl font-bold">{formatCOP(metricas.promedio)}</p>
                    </div>
                </section>

                <section className="bg-gray-800 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                    <div className="p-5 border-b border-gray-700 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div>
                            <h2 className="text-white text-xl font-bold">Inventario de mesas</h2>
                            <p className="text-gray-400 text-sm">Solo se muestran mesas activas en el sistema.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                type="text"
                                placeholder="🔍 Buscar por número..."
                                className="w-full sm:w-72 bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
                            />
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400">
                                <option value="TODAS">Todas</option>
                                <option value="LIBRE">Libres</option>
                                <option value="OCUPADA">Ocupadas</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="mx-5 mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {cargando ? (
                        <div className="p-10 text-center">
                            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-gray-700 border-t-yellow-400 animate-spin" />
                            <p className="text-gray-400">Cargando mesas...</p>
                        </div>
                    ) : mesasFiltradas.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-3xl">
                                🎱
                            </div>
                            <h3 className="text-white text-xl font-bold mb-2">No hay mesas para mostrar</h3>
                            <p className="text-gray-400 mb-6">
                                Ajusta la búsqueda o crea una nueva mesa para configurar tu salón.
                            </p>
                            <button
                                onClick={() => setMesaAEditar({})}
                                className="bg-yellow-400 text-gray-900 font-bold px-5 py-3 rounded-xl hover:bg-yellow-300 transition-colors">
                                Crear primera mesa
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[58vh] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-yellow-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <table className="w-full min-w-[760px]">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-gray-700/90 backdrop-blur">
                                        <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Mesa</th>
                                        <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Estado</th>
                                        <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Tarifa</th>
                                        <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Uso recomendado</th>
                                        <th className="text-right text-yellow-400 text-xs uppercase px-6 py-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mesasFiltradas.map((mesa) => {
                                        const estaOcupada = mesa.estado === "OCUPADA"

                                        return (
                                            <tr key={mesa.id} className="border-t border-gray-700 hover:bg-gray-700/35 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-yellow-400/15 border border-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold">
                                                            {mesa.numero}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold">Mesa {mesa.numero}</p>
                                                            <p className="text-gray-500 text-xs">ID interno #{mesa.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${estadoBadge(mesa.estado)}`}>
                                                        {mesa.estado}
                                                    </span>
                                                </td>
                                                <td className="text-yellow-400 font-bold px-6 py-5">
                                                    {formatCOP(mesa.precioPorHora)} / hora
                                                </td>
                                                <td className="text-gray-400 px-6 py-5">
                                                    {estaOcupada ? "Bloqueada hasta cerrar la partida" : "Disponible para configurar"}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setMesaAEditar(mesa)}
                                                            disabled={estaOcupada}
                                                            className="text-blue-300 hover:text-blue-200 disabled:text-gray-600 disabled:cursor-not-allowed font-bold text-sm">
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => setMesaAEliminar(mesa)}
                                                            disabled={estaOcupada}
                                                            className="text-red-300 hover:text-red-200 disabled:text-gray-600 disabled:cursor-not-allowed font-bold text-sm">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {mesaAEditar && (
                <ModalMesaCRUD
                    mesa={mesaAEditar}
                    onCerrar={() => setMesaAEditar(null)}
                    onGuardar={handleGuardar}
                />
            )}

            {mesaAEliminar && (
                <ModalConfirmacion
                    mensaje={`La mesa ${mesaAEliminar.numero} dejará de aparecer en el salón. Si tiene historial, se ocultará sin borrar sus sesiones; si no tiene historial, se eliminará definitivamente.`}
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => !eliminando && setMesaAEliminar(null)}
                />
            )}
        </div>
    )
}

export default Mesas
