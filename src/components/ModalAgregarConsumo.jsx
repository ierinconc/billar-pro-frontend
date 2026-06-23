import { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react"
import useEscapeClose from "../hooks/useEscapeClose"

const formatoCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
})

function ModalAgregarConsumo(props){
    const [productos, setProductos] = useState([])
    const [carrito, setCarrito] = useState([])
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [categoriaActiva, setCategoriaActiva] = useState("TODAS")
    const [cargandoProductos, setCargandoProductos] = useState(true)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState("")

    const busquedaDiferida = useDeferredValue(busquedaProducto)

    useEscapeClose(props.onCerrar, !enviando)

    const formatCOP = useCallback((valor) => formatoCOP.format(Number(valor || 0)), [])

    useEffect(() => {
        let activo = true

        setCargandoProductos(true)
        setError("")

        fetch("http://localhost:8080/api/productos", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then((res) => {
            if (!res.ok) throw new Error("No se pudieron cargar los productos.")
            return res.json()
        })
        .then((data) => {
            if (!activo) return

            const productosDisponibles = Array.isArray(data)
                ? data
                    .filter((producto) => producto.disponible !== false)
                    .sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")))
                : []

            setProductos(productosDisponibles)
        })
        .catch((error) => {
            if (!activo) return
            setProductos([])
            setError(error.message)
        })
        .finally(() => {
            if (activo) setCargandoProductos(false)
        })

        return () => {
            activo = false
        }
    }, [])

    const categorias = useMemo(() => {
        return [
            "TODAS",
            ...new Set(productos.map((producto) => producto.categoria || "General"))
        ]
    }, [productos])

    const cantidadPorProducto = useMemo(() => {
        return carrito.reduce((mapa, item) => {
            mapa[item.productoId] = item.cantidad
            return mapa
        }, {})
    }, [carrito])

    const productosFiltrados = useMemo(() => {
        const texto = busquedaDiferida.trim().toLowerCase()

        return productos.filter((producto) => {
            const categoriaProducto = producto.categoria || "General"
            const coincideCategoria = categoriaActiva === "TODAS" || categoriaProducto === categoriaActiva
            const coincideBusqueda = !texto || String(producto.nombre || "").toLowerCase().includes(texto)
            return coincideCategoria && coincideBusqueda
        })
    }, [productos, busquedaDiferida, categoriaActiva])

    const totalCarrito = useMemo(() => {
        return carrito.reduce((suma, item) => suma + Number(item.precio || 0) * Number(item.cantidad || 0), 0)
    }, [carrito])

    const unidadesCarrito = useMemo(() => {
        return carrito.reduce((suma, item) => suma + Number(item.cantidad || 0), 0)
    }, [carrito])

    const agregarProducto = useCallback((producto) => {
        setCarrito((itemsActuales) => {
            const existe = itemsActuales.find((item) => item.productoId === producto.id)

            if (existe) {
                return itemsActuales.map((item) =>
                    item.productoId === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            }

            return [
                ...itemsActuales,
                {
                    productoId: producto.id,
                    nombre: producto.nombre,
                    cantidad: 1,
                    precio: producto.precio,
                    categoria: producto.categoria || "General"
                }
            ]
        })
    }, [])

    const cambiarCantidad = useCallback((productoId, cambio) => {
        setCarrito((itemsActuales) =>
            itemsActuales
                .map((item) =>
                    item.productoId === productoId
                        ? { ...item, cantidad: Math.max(0, item.cantidad + cambio) }
                        : item
                )
                .filter((item) => item.cantidad > 0)
        )
    }, [])

    const eliminarDelCarrito = useCallback((productoId) => {
        setCarrito((itemsActuales) => itemsActuales.filter((item) => item.productoId !== productoId))
    }, [])

    const limpiarFiltros = () => {
        setBusquedaProducto("")
        setCategoriaActiva("TODAS")
    }

    const handleEnviar = async () => {
        if(carrito.length === 0) return

        setEnviando(true)
        setError("")

        try {
            for (const item of carrito) {
                const respuesta = await fetch("http://localhost:8080/api/consumos", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify({
                        mesaId: props.mesaId,
                        productoId: item.productoId,
                        cantidad: item.cantidad
                    })
                })

                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar el pedido. Intenta de nuevo.")
                }
            }

            props.onAgregar()
        } catch (error) {
            setError(error.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="bp-overlay fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
            <div className="bp-modal-shell flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] shadow-2xl">
                <header className="bp-modal-header flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
                    <div>
                        <p className="bp-overline text-yellow-400">Consumos</p>
                        <h2 className="mt-1 text-2xl font-black sm:text-3xl">Agregar productos</h2>
                        <p className="mt-1 text-sm opacity-70">Busca el producto, toca Agregar y confirma el pedido.</p>
                    </div>

                    <button
                        onClick={props.onCerrar}
                        className="bp-icon-button"
                        aria-label="Cerrar modal">
                        ✕
                    </button>
                </header>

                <main className="grid min-h-0 flex-1 lg:grid-cols-[1fr_21rem]">
                    <section className="bp-modal-scroll min-h-0 overflow-y-auto p-4 sm:p-5">
                        {error && (
                            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-bold text-red-200">
                                {error}
                            </div>
                        )}

                        <div className="mb-4 flex flex-col gap-3 xl:flex-row">
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={busquedaProducto}
                                onChange={(e) => setBusquedaProducto(e.target.value)}
                                className="bp-input min-h-12 flex-1"
                                autoFocus
                            />

                            <button
                                onClick={limpiarFiltros}
                                className="bp-secondary-button min-h-12 px-4">
                                Limpiar
                            </button>
                        </div>

                        <div className="bp-chip-row mb-4 flex gap-2 overflow-x-auto pb-1">
                            {categorias.map((categoria) => (
                                <button
                                    key={categoria}
                                    onClick={() => setCategoriaActiva(categoria)}
                                    className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-black ${
                                        categoriaActiva === categoria
                                            ? "bg-yellow-400 text-gray-950"
                                            : "border border-gray-800 bg-gray-900 text-gray-300 hover:text-white"
                                    }`}
                                >
                                    {categoria === "TODAS" ? "Todos" : categoria}
                                </button>
                            ))}
                        </div>

                        <div className="mb-3 flex items-center justify-between text-sm opacity-60">
                            <span>{productosFiltrados.length} producto{productosFiltrados.length === 1 ? "" : "s"}</span>
                            <span className="hidden sm:inline">Carrito: {unidadesCarrito} unidad{unidadesCarrito === 1 ? "" : "es"}</span>
                        </div>

                        {cargandoProductos ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div key={item} className="h-16 animate-pulse rounded-2xl bg-gray-900/70" />
                                ))}
                            </div>
                        ) : productosFiltrados.length === 0 ? (
                            <div className="bp-empty-box p-8 text-center">
                                <p className="text-3xl">🧃</p>
                                <h3 className="mt-2 text-lg font-black">No encontré ese producto</h3>
                                <p className="mt-1 text-sm opacity-60">Prueba con otro nombre o cambia la categoría.</p>
                            </div>
                        ) : (
                            <div className="bp-list-shell overflow-hidden rounded-3xl">
                                {productosFiltrados.map((producto) => (
                                    <ProductoFila
                                        key={producto.id}
                                        producto={producto}
                                        cantidad={cantidadPorProducto[producto.id] || 0}
                                        formatCOP={formatCOP}
                                        onAgregar={agregarProducto}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    <aside className="bp-order-panel flex min-h-0 flex-col border-t p-4 sm:p-5 lg:border-l lg:border-t-0">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="bp-overline text-yellow-400">Pedido</p>
                                <h3 className="mt-1 text-xl font-black">Para esta mesa</h3>
                            </div>
                            {carrito.length > 0 && (
                                <button
                                    onClick={() => setCarrito([])}
                                    className="rounded-xl border border-gray-700 px-3 py-2 text-sm font-black opacity-80 hover:border-red-400 hover:text-red-400">
                                    Vaciar
                                </button>
                            )}
                        </div>

                        <div className="bp-modal-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                            {carrito.length === 0 ? (
                                <div className="bp-empty-box flex h-full min-h-[15rem] flex-col items-center justify-center p-6 text-center">
                                    <p className="text-4xl">🛒</p>
                                    <p className="mt-3 font-black">Pedido vacío</p>
                                    <p className="mt-1 text-sm opacity-60">Toca “Agregar” en un producto.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {carrito.map((item) => (
                                        <div key={item.productoId} className="bp-cart-item p-3">
                                            <div className="mb-3 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-black">{item.nombre}</p>
                                                    <p className="text-sm opacity-60">{formatCOP(item.precio)} c/u</p>
                                                </div>
                                                <button
                                                    onClick={() => eliminarDelCarrito(item.productoId)}
                                                    className="grid h-8 w-8 place-items-center rounded-xl opacity-60 hover:bg-gray-900 hover:text-red-400"
                                                    aria-label={`Quitar ${item.nombre}`}>
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <CantidadStepper
                                                    cantidad={item.cantidad}
                                                    onRestar={() => cambiarCantidad(item.productoId, -1)}
                                                    onSumar={() => cambiarCantidad(item.productoId, 1)}
                                                />
                                                <p className="font-black text-yellow-400">{formatCOP(item.precio * item.cantidad)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <footer className="mt-4 border-t border-gray-800 pt-4">
                            <div className="bp-total-review mb-3 p-4">
                                <div className="flex justify-between text-sm opacity-70">
                                    <span>Unidades</span>
                                    <span>{unidadesCarrito}</span>
                                </div>
                                <div className="mt-2 flex items-end justify-between">
                                    <span className="text-lg font-black">Total</span>
                                    <span className="text-2xl font-black text-yellow-400">{formatCOP(totalCarrito)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={props.onCerrar}
                                    className="bp-secondary-button min-h-12">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleEnviar}
                                    disabled={carrito.length === 0 || enviando}
                                    className="bp-primary-button min-h-12 disabled:cursor-not-allowed disabled:opacity-60">
                                    {enviando ? "Cargando..." : "Cargar pedido"}
                                </button>
                            </div>
                        </footer>
                    </aside>
                </main>
            </div>
        </div>
    )
}

const ProductoFila = memo(function ProductoFila({ producto, cantidad, formatCOP, onAgregar }) {
    return (
        <div className="bp-product-row flex items-center justify-between gap-3 px-4 py-3 last:border-b-0">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate font-black">{producto.nombre}</p>
                    {cantidad > 0 && (
                        <span className="shrink-0 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-black text-gray-950">x{cantidad}</span>
                    )}
                </div>
                <p className="mt-1 text-sm opacity-60">{producto.categoria || "General"} · {formatCOP(producto.precio)}</p>
            </div>

            <button
                onClick={() => onAgregar(producto)}
                className="bp-primary-button min-h-11 shrink-0 px-4 py-0">
                Agregar
            </button>
        </div>
    )
})

function CantidadStepper({ cantidad, onRestar, onSumar }) {
    return (
        <div className="bp-stepper flex items-center gap-2 p-1">
            <button
                onClick={onRestar}
                className="bp-stepper-button grid h-9 w-9 place-items-center rounded-xl text-xl font-black"
                aria-label="Restar unidad">
                −
            </button>
            <span className="w-8 text-center font-black text-yellow-400">{cantidad}</span>
            <button
                onClick={onSumar}
                className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-400 text-xl font-black text-gray-950 hover:bg-yellow-300"
                aria-label="Sumar unidad">
                +
            </button>
        </div>
    )
}

export default ModalAgregarConsumo
