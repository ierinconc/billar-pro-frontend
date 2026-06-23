import { useEffect, useMemo, useState } from "react"
import useEscapeClose from "../hooks/useEscapeClose"

const API_BASE_URL = "http://localhost:8080/api"

function ModalMesaCRUD({ mesa, onCerrar, onGuardar }) {
    const esEdicion = Boolean(mesa?.id)
    const [numero, setNumero] = useState(mesa?.numero ?? "")
    const [precioPorHora, setPrecioPorHora] = useState(mesa?.precioPorHora ?? "")
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)

    useEscapeClose(onCerrar, !guardando)

    useEffect(() => {
        setNumero(mesa?.numero ?? "")
        setPrecioPorHora(mesa?.precioPorHora ?? "")
        setError("")
    }, [mesa])

    const titulo = esEdicion ? `Editar mesa ${mesa.numero}` : "Nueva mesa"

    const descripcion = useMemo(() => {
        if (esEdicion) return "Ajusta el número visible o la tarifa por hora de esta mesa."
        return "Crea una mesa para que aparezca disponible en el salón."
    }, [esEdicion])

    const obtenerMensajeError = async (respuesta) => {
        try {
            const data = await respuesta.json()
            return data.mensaje || data.error || "No se pudo guardar la mesa."
        } catch {
            return "No se pudo guardar la mesa."
        }
    }

    const validarFormulario = () => {
        const numeroConvertido = Number(numero)
        const precioConvertido = Number(precioPorHora)

        if (!numero || Number.isNaN(numeroConvertido)) return "Ingresa el número de la mesa."
        if (!Number.isInteger(numeroConvertido) || numeroConvertido <= 0) return "El número de la mesa debe ser un entero mayor a cero."
        if (!precioPorHora || Number.isNaN(precioConvertido)) return "Ingresa la tarifa por hora."
        if (precioConvertido <= 0) return "La tarifa por hora debe ser mayor a cero."

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
            ? `${API_BASE_URL}/mesas/${mesa.id}`
            : `${API_BASE_URL}/mesas`
        const metodo = esEdicion ? "PUT" : "POST"

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({
                    numero: Number(numero),
                    precioPorHora: Number(precioPorHora)
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
                            <p className="bp-overline text-yellow-400">Configuración de mesas</p>
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
                        <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="bp-overline mb-2 block text-yellow-400">Número de mesa</label>
                            <input
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                type="number"
                                min="1"
                                placeholder="Ej: 4"
                                className="bp-input h-12 w-full"
                            />
                        </div>

                        <div>
                            <label className="bp-overline mb-2 block text-yellow-400">Tarifa por hora</label>
                            <input
                                value={precioPorHora}
                                onChange={(e) => setPrecioPorHora(e.target.value)}
                                type="number"
                                min="1"
                                placeholder="Ej: 10000"
                                className="bp-input h-12 w-full"
                            />
                        </div>
                    </div>

                    <div className="bp-modal-section mt-5 p-4">
                        <div className="flex gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-yellow-400/15 text-lg">💡</span>
                            <div>
                                <p className="font-black text-white">Regla operativa</p>
                                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                                    Las mesas nuevas quedan activas y libres. Si una mesa está ocupada, edítala cuando termine la partida para evitar errores de cobro.
                                </p>
                            </div>
                        </div>
                    </div>
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
                        {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear mesa"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalMesaCRUD
