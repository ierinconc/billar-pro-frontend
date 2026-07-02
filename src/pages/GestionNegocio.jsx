import { useEffect, useMemo, useState } from "react"
import Sidebar from "../components/Sidebar"
import ModalMesaCRUD from "../components/ModalMesaCRUD"
import ModalProducto from "../components/ModalProducto"
import ModalConfirmacion from "../components/ModalConfirmacion"

const API_BASE_URL = "http://localhost:8080/api"
const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
})

function GestionNegocio({ initialTab = "mesas" }) {
    const [tabActiva, setTabActiva] = useState(initialTab)
    const [vista, setVista] = useState("tarjetas")
    const [mesas, setMesas] = useState([])
    const [productos, setProductos] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [filtroMesa, setFiltroMesa] = useState("TODAS")
    const [filtroProducto, setFiltroProducto] = useState("TODOS")
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    const [mesaAEditar, setMesaAEditar] = useState(null)
    const [productoAEditar, setProductoAEditar] = useState(null)
    const [mesaAEliminar, setMesaAEliminar] = useState(null)
    const [productoAEliminar, setProductoAEliminar] = useState(null)
    const [eliminando, setEliminando] = useState(false)

    const token = localStorage.getItem("token")

    useEffect(() => {
        setTabActiva(initialTab)
    }, [initialTab])

    const formatCOP = (valor) => formatoCOP.format(Number(valor || 0))

    const obtenerMensajeError = async (respuesta) => {
        try {
            const data = await respuesta.json()
            return data.mensaje || data.error || "No se pudo completar la operación."
        } catch {
            return "No se pudo completar la operación."
        }
    }

    const cargarDatos = async () => {
        setCargando(true)
        setError("")

        try {
            const headers = { "Authorization": "Bearer " + token }
            const [respuestaMesas, respuestaProductos] = await Promise.all([
                fetch(`${API_BASE_URL}/mesas`, { headers }),
                fetch(`${API_BASE_URL}/productos`, { headers })
            ])

            if (!respuestaMesas.ok) throw new Error(await obtenerMensajeError(respuestaMesas))
            if (!respuestaProductos.ok) throw new Error(await obtenerMensajeError(respuestaProductos))

            const [dataMesas, dataProductos] = await Promise.all([
                respuestaMesas.json(),
                respuestaProductos.json()
            ])

            setMesas([...dataMesas].sort((a, b) => Number(a.numero) - Number(b.numero)))
            setProductos([...dataProductos].sort((a, b) => a.nombre.localeCompare(b.nombre)))
        } catch (error) {
            setError(error.message)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatos()
    }, [])

    const resumen = useMemo(() => {
        const mesasLibres = mesas.filter((mesa) => mesa.estado !== "OCUPADA").length
        const mesasOcupadas = mesas.filter((mesa) => mesa.estado === "OCUPADA").length
        const productosDisponibles = productos.filter((producto) => producto.disponible).length
        const tarifaPromedio = mesas.length
            ? mesas.reduce((suma, mesa) => suma + Number(mesa.precioPorHora || 0), 0) / mesas.length
            : 0
        const productosOcultos = productos.length - productosDisponibles

        return {
            mesas: mesas.length,
            mesasLibres,
            mesasOcupadas,
            productos: productos.length,
            productosDisponibles,
            productosOcultos,
            tarifaPromedio
        }
    }, [mesas, productos])

    const categoriasProductos = useMemo(() => {
        return [...new Set(productos.map((producto) => producto.categoria).filter(Boolean))].sort()
    }, [productos])

    const mesasFiltradas = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        return mesas.filter((mesa) => {
            const coincideBusqueda = !texto || String(mesa.numero).includes(texto)
            const coincideEstado = filtroMesa === "TODAS" || mesa.estado === filtroMesa
            return coincideBusqueda && coincideEstado
        })
    }, [mesas, busqueda, filtroMesa])

    const productosFiltrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase()

        return productos.filter((producto) => {
            const coincideBusqueda = !texto
                || producto.nombre?.toLowerCase().includes(texto)
                || producto.categoria?.toLowerCase().includes(texto)
            const coincideCategoria = filtroProducto === "TODOS" || producto.categoria === filtroProducto
            return coincideBusqueda && coincideCategoria
        })
    }, [productos, busqueda, filtroProducto])

    const guardarCambios = () => {
        setMesaAEditar(null)
        setProductoAEditar(null)
        cargarDatos()
    }

    const cambiarModulo = (modulo) => {
        setTabActiva(modulo)
        setBusqueda("")
        setVista("tarjetas")
    }

    const confirmarEliminarMesa = async () => {
        if (!mesaAEliminar) return
        setEliminando(true)
        setError("")

        try {
            const respuesta = await fetch(`${API_BASE_URL}/mesas/${mesaAEliminar.id}/delete`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            })

            if (!respuesta.ok) throw new Error(await obtenerMensajeError(respuesta))

            setMesaAEliminar(null)
            cargarDatos()
        } catch (error) {
            setError(error.message)
        } finally {
            setEliminando(false)
        }
    }

    const confirmarEliminarProducto = async () => {
        if (!productoAEliminar) return
        setEliminando(true)
        setError("")

        try {
            const respuesta = await fetch(`${API_BASE_URL}/productos/${productoAEliminar.id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            })

            if (!respuesta.ok) throw new Error(await obtenerMensajeError(respuesta))

            setProductoAEliminar(null)
            cargarDatos()
        } catch (error) {
            setError(error.message)
        } finally {
            setEliminando(false)
        }
    }

    const mostrarMesas = tabActiva === "mesas"
    const tituloSeccion = mostrarMesas ? "Mesas del salón" : "Productos de venta"
    const subtituloSeccion = mostrarMesas
        ? "Cambia tarifas, números y disponibilidad desde tarjetas claras."
        : "Edita precios, categorías y disponibilidad del catálogo de consumo."
    const totalActual = mostrarMesas ? mesasFiltradas.length : productosFiltrados.length

    return (
        <div className="flex min-h-screen bg-gray-950 text-white">
            <Sidebar />

            <main className="flex-1 p-5 lg:p-8">
                <section className="bp-business-header mb-5">
                    <div>
                        <p className="bp-overline text-yellow-400">Tu negocio</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-white lg:text-4xl">Administra mesas y productos</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                            Primero elige qué quieres ajustar. Las tablas quedan como vista compacta solo cuando necesites revisar muchos registros.
                        </p>
                    </div>

            

                </section>

                <section className="mb-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4 md:grid-cols-2">
                        <ModuloNegocio
                            activo={mostrarMesas}
                            icono="🎱"
                            titulo="Mesas"
                            texto="Números, tarifas y estado operativo."
                            dato={`${resumen.mesas} configuradas`}
                            detalle={`${resumen.mesasLibres} libres · ${resumen.mesasOcupadas} ocupadas`}
                            onClick={() => cambiarModulo("mesas")}
                        />
                        <ModuloNegocio
                            activo={!mostrarMesas}
                            icono="🛒"
                            titulo="Productos"
                            texto="Bebidas, snacks y consumos."
                            dato={`${resumen.productosDisponibles} visibles`}
                            detalle={`${resumen.productosOcultos} ocultos · ${resumen.productos} total`}
                            onClick={() => cambiarModulo("productos")}
                        />
                    </div>

                    <div className="bp-business-card p-5">
                        <p className="bp-overline text-gray-500">Estado rápido</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                            <DatoSimple titulo="Mesas" valor={resumen.mesas} detalle={`${resumen.mesasOcupadas} en juego`} />
                            <DatoSimple titulo="Tarifa promedio" valor={formatCOP(resumen.tarifaPromedio)} detalle="por hora" />
                            <DatoSimple titulo="Productos visibles" valor={`${resumen.productosDisponibles}/${resumen.productos}`} detalle="para consumo" />
                        </div>
                    </div>
                </section>

                <section className="bp-business-card overflow-hidden">
                    <div className="border-b border-gray-800 p-5 lg:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <p className="bp-overline text-yellow-400">Administración visual</p>
                                <h2 className="mt-2 text-2xl font-black text-white lg:text-3xl">{tituloSeccion}</h2>
                                <p className="mt-1 text-sm text-gray-400">{subtituloSeccion}</p>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <div className="bp-view-toggle flex rounded-2xl border border-gray-800 bg-gray-950 p-1">
                                    <button
                                        onClick={() => setVista("tarjetas")}
                                        className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${vista === "tarjetas" ? "bg-yellow-400 text-gray-950" : "text-gray-400 hover:text-white"}`}>
                                        Tarjetas
                                    </button>
                                    <button
                                        onClick={() => setVista("lista")}
                                        className={`rounded-xl px-4 py-3 text-sm font-black transition-colors ${vista === "lista" ? "bg-yellow-400 text-gray-950" : "text-gray-400 hover:text-white"}`}>
                                        Compacta
                                    </button>
                                </div>

                                <button
                                    onClick={() => mostrarMesas ? setMesaAEditar({}) : setProductoAEditar({})}
                                    className="bp-primary-button whitespace-nowrap">
                                    {mostrarMesas ? "+ Nueva mesa" : "+ Nuevo producto"}
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 xl:flex-row">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder={mostrarMesas ? "Buscar mesa..." : "Buscar producto o categoría..."}
                                className="bp-input h-12 w-full"
                            />

                            {mostrarMesas ? (
                                <select
                                    value={filtroMesa}
                                    onChange={(e) => setFiltroMesa(e.target.value)}
                                    className="bp-input h-12 xl:w-56">
                                    <option value="TODAS">Todas las mesas</option>
                                    <option value="LIBRE">Solo libres</option>
                                    <option value="OCUPADA">Solo ocupadas</option>
                                </select>
                            ) : (
                                <select
                                    value={filtroProducto}
                                    onChange={(e) => setFiltroProducto(e.target.value)}
                                    className="bp-input h-12 xl:w-64">
                                    <option value="TODOS">Todas las categorías</option>
                                    {categoriasProductos.map((categoria) => (
                                        <option key={categoria} value={categoria}>{categoria}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <p className="mt-3 text-sm font-bold text-gray-500">
                            Mostrando {totalActual} {mostrarMesas ? "mesas" : "productos"}.
                        </p>
                    </div>

                    {error && (
                        <div className="mx-5 mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="p-5 lg:p-6">
                        {cargando ? (
                            <TarjetasSkeleton />
                        ) : mostrarMesas ? (
                            vista === "tarjetas" ? (
                                <MesasTarjetas
                                    mesas={mesasFiltradas}
                                    formatCOP={formatCOP}
                                    onEditar={setMesaAEditar}
                                    onEliminar={setMesaAEliminar}
                                />
                            ) : (
                                <MesasCompactas
                                    mesas={mesasFiltradas}
                                    formatCOP={formatCOP}
                                    onEditar={setMesaAEditar}
                                    onEliminar={setMesaAEliminar}
                                />
                            )
                        ) : (
                            vista === "tarjetas" ? (
                                <ProductosTarjetas
                                    productos={productosFiltrados}
                                    formatCOP={formatCOP}
                                    onEditar={setProductoAEditar}
                                    onEliminar={setProductoAEliminar}
                                />
                            ) : (
                                <ProductosCompactos
                                    productos={productosFiltrados}
                                    formatCOP={formatCOP}
                                    onEditar={setProductoAEditar}
                                    onEliminar={setProductoAEliminar}
                                />
                            )
                        )}
                    </div>
                </section>
            </main>

            {mesaAEditar && (
                <ModalMesaCRUD
                    mesa={mesaAEditar}
                    onCerrar={() => setMesaAEditar(null)}
                    onGuardar={guardarCambios}
                />
            )}

            {productoAEditar && (
                <ModalProducto
                    producto={productoAEditar}
                    onCerrar={() => setProductoAEditar(null)}
                    onGuardar={guardarCambios}
                />
            )}

            {mesaAEliminar && (
                <ModalConfirmacion
                    titulo={`Eliminar mesa ${mesaAEliminar.numero}`}
                    mensaje={`La mesa ${mesaAEliminar.numero} dejará de aparecer en el salón. Si tiene historial, se ocultará sin borrar sus sesiones.`}
                    textoConfirmar={eliminando ? "Eliminando..." : "Eliminar mesa"}
                    onConfirmar={confirmarEliminarMesa}
                    onCancelar={() => !eliminando && setMesaAEliminar(null)}
                />
            )}

            {productoAEliminar && (
                <ModalConfirmacion
                    titulo={`Eliminar ${productoAEliminar.nombre}`}
                    mensaje="El producto será eliminado del catálogo de venta."
                    textoConfirmar={eliminando ? "Eliminando..." : "Eliminar producto"}
                    onConfirmar={confirmarEliminarProducto}
                    onCancelar={() => !eliminando && setProductoAEliminar(null)}
                />
            )}
        </div>
    )
}

function ModuloNegocio({ activo, icono, titulo, texto, dato, detalle, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`bp-module-card ${activo ? "bp-module-card-active" : ""}`}>
            <span className="bp-module-icon">{icono}</span>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-white">{titulo}</h3>
                    <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-black text-gray-400">{dato}</span>
                </div>
                <p className="mt-1 text-sm text-gray-400">{texto}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-widest text-gray-500">{detalle}</p>
            </div>
        </button>
    )
}

function DatoSimple({ titulo, valor, detalle }) {
    return (
        <article className="bp-mini-stat">
            <p className="bp-overline text-gray-500">{titulo}</p>
            <p className="mt-1 text-2xl font-black text-white">{valor}</p>
            <p className="mt-1 text-sm text-gray-400">{detalle}</p>
        </article>
    )
}

function MesasTarjetas({ mesas, formatCOP, onEditar, onEliminar }) {
    if (mesas.length === 0) {
        return <EstadoVacio titulo="No hay mesas para mostrar" texto="Crea una mesa nueva o ajusta los filtros." />
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mesas.map((mesa) => {
                const ocupada = mesa.estado === "OCUPADA"

                return (
                    <article key={mesa.id} className={`bp-admin-card ${ocupada ? "bp-admin-card-occupied" : "bp-admin-card-free"}`}>
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="bp-admin-number">{mesa.numero}</div>
                            <span className={`bp-status-pill ${ocupada ? "bp-status-occupied" : "bp-status-free"}`}>
                                {ocupada ? "Ocupada" : "Libre"}
                            </span>
                        </div>

                        <h3 className="text-2xl font-black text-white">Mesa {mesa.numero}</h3>
                        <p className="mt-1 text-sm text-gray-400">Tarifa por hora</p>
                        <p className="mt-3 text-3xl font-black text-yellow-300">{formatCOP(mesa.precioPorHora)}</p>

                        {ocupada && (
                            <p className="mt-4 rounded-2xl bg-yellow-400/10 px-4 py-3 text-sm font-bold text-yellow-200">
                                En uso. La edición se bloquea hasta cerrar la partida.
                            </p>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => onEditar(mesa)}
                                disabled={ocupada}
                                className="bp-secondary-button disabled:cursor-not-allowed disabled:opacity-40">
                                Editar
                            </button>
                            <button
                                onClick={() => onEliminar(mesa)}
                                disabled={ocupada}
                                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                                Eliminar
                            </button>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

function ProductosTarjetas({ productos, formatCOP, onEditar, onEliminar }) {
    if (productos.length === 0) {
        return <EstadoVacio titulo="No hay productos para mostrar" texto="Crea productos para venderlos durante las partidas." />
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productos.map((producto) => (
                <article key={producto.id} className="bp-admin-card">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <span className="bp-admin-icon">{iconoCategoria(producto.categoria)}</span>
                        <span className={`bp-status-pill ${producto.disponible ? "bp-status-free" : "bp-status-muted"}`}>
                            {producto.disponible ? "Disponible" : "Oculto"}
                        </span>
                    </div>

                    <p className="mb-2 inline-flex rounded-full bg-gray-900 px-3 py-1 text-xs font-black text-gray-400">
                        {producto.categoria || "Sin categoría"}
                    </p>
                    <h3 className="min-h-[3.5rem] text-2xl font-black text-white">{producto.nombre}</h3>
                    <p className="mt-3 text-3xl font-black text-yellow-300">{formatCOP(producto.precio)}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onEditar(producto)}
                            className="bp-secondary-button">
                            Editar
                        </button>
                        <button
                            onClick={() => onEliminar(producto)}
                            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-black text-red-200 transition-colors hover:bg-red-500/20">
                            Eliminar
                        </button>
                    </div>
                </article>
            ))}
        </div>
    )
}

function MesasCompactas({ mesas, formatCOP, onEditar, onEliminar }) {
    if (mesas.length === 0) {
        return <EstadoVacio titulo="No hay mesas para mostrar" texto="Crea una mesa nueva o ajusta los filtros." />
    }

    return (
        <div className="space-y-3">
            {mesas.map((mesa) => {
                const ocupada = mesa.estado === "OCUPADA"

                return (
                    <div key={mesa.id} className="bp-compact-row">
                        <div className="flex items-center gap-4">
                            <div className="bp-admin-number bp-admin-number-small">{mesa.numero}</div>
                            <div>
                                <h3 className="text-lg font-black text-white">Mesa {mesa.numero}</h3>
                                <p className="text-sm text-gray-400">{formatCOP(mesa.precioPorHora)} / hora</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <span className={`bp-status-pill text-center ${ocupada ? "bp-status-occupied" : "bp-status-free"}`}>
                                {ocupada ? "Ocupada" : "Libre"}
                            </span>
                            <button
                                onClick={() => onEditar(mesa)}
                                disabled={ocupada}
                                className="bp-secondary-button min-h-0 rounded-xl px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40">
                                Editar
                            </button>
                            <button
                                onClick={() => onEliminar(mesa)}
                                disabled={ocupada}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-black text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40">
                                Eliminar
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ProductosCompactos({ productos, formatCOP, onEditar, onEliminar }) {
    if (productos.length === 0) {
        return <EstadoVacio titulo="No hay productos para mostrar" texto="Crea productos para venderlos durante las partidas." />
    }

    return (
        <div className="space-y-3">
            {productos.map((producto) => (
                <div key={producto.id} className="bp-compact-row">
                    <div className="flex items-center gap-4">
                        <span className="bp-admin-icon bp-admin-icon-small">{iconoCategoria(producto.categoria)}</span>
                        <div>
                            <h3 className="text-lg font-black text-white">{producto.nombre}</h3>
                            <p className="text-sm text-gray-400">{producto.categoria || "Sin categoría"} · {formatCOP(producto.precio)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <span className={`bp-status-pill text-center ${producto.disponible ? "bp-status-free" : "bp-status-muted"}`}>
                            {producto.disponible ? "Disponible" : "Oculto"}
                        </span>
                        <button
                            onClick={() => onEditar(producto)}
                            className="bp-secondary-button min-h-0 rounded-xl px-4 py-2">
                            Editar
                        </button>
                        <button
                            onClick={() => onEliminar(producto)}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-black text-red-200 transition-colors hover:bg-red-500/20">
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function EstadoVacio({ titulo, texto }) {
    return (
        <div className="bp-empty-box p-10 text-center">
            <h3 className="text-2xl font-black text-white">{titulo}</h3>
            <p className="mt-2 text-gray-400">{texto}</p>
        </div>
    )
}

function TarjetasSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-[1.75rem] border border-gray-800 bg-gray-950" />
            ))}
        </div>
    )
}

function iconoCategoria(categoria = "") {
    const valor = categoria.toLowerCase()
    if (valor.includes("bebida")) return "🥤"
    if (valor.includes("snack")) return "🍟"
    if (valor.includes("cigarr")) return "🚬"
    return "🛍️"
}

export default GestionNegocio
