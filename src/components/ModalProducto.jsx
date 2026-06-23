import { useEffect, useMemo, useState } from "react"
import useEscapeClose from "../hooks/useEscapeClose"

const API_BASE_URL = "http://localhost:8080/api"

function ModalProducto({ producto, onCerrar, onGuardar }){
    const esEdicion = Boolean(producto?.id)
    const [nombre, setNombre] = useState(producto?.nombre || "")
    const [categoria, setCategoria] = useState(producto?.categoria || "Bebidas")
    const [precio, setPrecio] = useState(producto?.precio || "")
    const [disponible, setDisponible] = useState(producto?.disponible ?? true)
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)

    useEscapeClose(onCerrar, !guardando)

    useEffect(() => {
        setNombre(producto?.nombre || "")
        setCategoria(producto?.categoria || "Bebidas")
        setPrecio(producto?.precio || "")
        setDisponible(producto?.disponible ?? true)
        setError("")
    }, [producto])

    const titulo = esEdicion ? `Editar ${producto.nombre}` : "Nuevo producto"

    const descripcion = useMemo(() => {
        if (esEdicion) return "Actualiza el producto para que el catálogo de consumos quede al día."
        return "Agrega un producto para venderlo durante las partidas."
    }, [esEdicion])

    const obtenerMensajeError = async (respuesta) => {
        try {
            const data = await respuesta.json()
            return data.mensaje || data.error || "No se pudo guardar el producto."
        } catch {
            return "No se pudo guardar el producto."
        }
    }

    const validarFormulario = () => {
        const precioConvertido = Number(precio)

        if (!nombre.trim()) return "Ingresa el nombre del producto."
        if (!categoria) return "Selecciona una categoría."
        if (!precio || Number.isNaN(precioConvertido)) return "Ingresa el precio del producto."
        if (precioConvertido <= 0) return "El precio debe ser mayor a cero."

        return ""
    }

    const handleGuardar = async () => {
        const errorFormulario = validarFormulario()
        if (errorFormulario) {
            setError(errorFormulario)
            return
        }

        setGuardando(true)
        setError("")

        const url = esEdicion
            ? `${API_BASE_URL}/productos/${producto.id}`
            : `${API_BASE_URL}/productos`
        const metodo = esEdicion ? "PUT" : "POST"

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    categoria,
                    precio: Number(precio),
                    disponible
                })
            })

            if (!respuesta.ok) {
                throw new Error(await obtenerMensajeError(respuesta))
            }

            onGuardar()
        } catch (error) {
            setError(error.message)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="bp-overlay fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <div className="bp-modal-shell w-full max-w-2xl overflow-hidden rounded-[1.75rem] shadow-2xl">
                <div className="bp-modal-header px-6 py-5 sm:px-8">
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <p className="bp-overline text-yellow-400">Catálogo de venta</p>
                            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">{titulo}</h2>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">{descripcion}</p>
                        </div>
                        <button
                            onClick={onCerrar}
                            className="bp-icon-button"
                            aria-label="Cerrar modal">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    {error && (
                        <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="bp-overline mb-2 block text-yellow-400">Nombre del producto</label>
                            <input
                                value={nombre}
                                onChange={(e)=> setNombre(e.target.value)}
                                type="text"
                                placeholder="Ej: Coca-Cola 400 ml"
                                className="bp-input h-12 w-full"
                            />
                        </div>

                        <div>
                            <label className="bp-overline mb-2 block text-yellow-400">Categoría</label>
                            <select
                                value={categoria}
                                onChange={(e)=> setCategoria(e.target.value)}
                                className="bp-input h-12 w-full">
                                <option value="Bebidas">Bebidas</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Cigarrillos">Cigarrillos</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <div>
                            <label className="bp-overline mb-2 block text-yellow-400">Precio</label>
                            <input
                                value={precio}
                                onChange={(e)=> setPrecio(e.target.value)}
                                className="bp-input h-12 w-full"
                                type="number"
                                min="1"
                                placeholder="Ej: 3500"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setDisponible(!disponible)}
                        className={`mt-5 w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                            disponible
                                ? "bp-product-availability-on"
                                : "bp-product-availability-off"
                        }`}>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-black text-white">Disponible para la venta</p>
                                <p className="mt-1 text-sm text-gray-400">
                                    {disponible ? "Aparecerá en el modal de consumos." : "Quedará oculto del flujo de venta."}
                                </p>
                            </div>
                            <span className={`h-7 w-12 rounded-full p-1 transition-all ${disponible ? "bg-emerald-400" : "bg-gray-700"}`}>
                                <span className={`block h-5 w-5 rounded-full bg-white transition-all ${disponible ? "translate-x-5" : "translate-x-0"}`} />
                            </span>
                        </div>
                    </button>
                </div>

                <div className="bp-modal-footer flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:px-8">
                    <button
                        onClick={onCerrar}
                        disabled={guardando}
                        className="bp-secondary-button flex-1 disabled:opacity-60">
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="bp-primary-button flex-1 disabled:cursor-not-allowed disabled:opacity-60">
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear producto"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalProducto
