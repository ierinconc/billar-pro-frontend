import { useState, useEffect } from "react"
import ModalAgregarConsumo from "./ModalAgregarConsumo"
import useEscapeClose from "../hooks/useEscapeClose"

function ModalMesa(props){
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00:00")
    const [consumos, setConsumos] = useState([])
    const [resumen, setResumen] = useState(null)
    const [modalConsumoAbierto, setModalConsumoAbierto] = useState(false)
    const [confirmandoCierre, setConfirmandoCierre] = useState(false)
    const [costoTiempo, setCostoTiempo] = useState(0)
    const [cerrandoMesa, setCerrandoMesa] = useState(false)
    const [error, setError] = useState("")

    const formatCOP = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(Math.round(Number(valor || 0) / 50) * 50)

    const redondearCOP = (valor) => Math.round(Number(valor || 0) / 50) * 50

    const formatearHora = (fecha) => {
        if (!fecha) return "—"

        return new Date(fecha).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const cerrarDespuesDeCobro = () => {
        props.onActualizar?.()
        props.onCerrar()
    }

    useEscapeClose(() => {
        if (confirmandoCierre) {
            setConfirmandoCierre(false)
            return
        }

        if (resumen) {
            cerrarDespuesDeCobro()
            return
        }

        props.onCerrar()
    }, !modalConsumoAbierto && !cerrandoMesa)

    useEffect(() => {
        const intervalo = setInterval(() => {
            const ahora = new Date()
            const inicio = new Date(props.horaInicio)
            const diff = Math.max(0, ahora - inicio)

            const horas = Math.floor(diff / 3600000)
            const minutos = Math.floor((diff % 3600000) / 60000)
            const segundos = Math.floor((diff % 60000) / 1000)

            const horasDecimales = diff / 3600000
            setCostoTiempo(horasDecimales * Number(props.precio || 0))

            setTiempoTranscurrido(
                String(horas).padStart(2, "0") + ":" +
                String(minutos).padStart(2, "0") + ":" +
                String(segundos).padStart(2, "0")
            )
        }, 1000)
        return () => clearInterval(intervalo)
    }, [props.horaInicio, props.precio])

    const cargarConsumos = () => {
        fetch(`http://localhost:8080/api/consumos/mesa/${props.id}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res => res.json())
        .then(data => setConsumos(Array.isArray(data) ? data : []))
        .catch(() => setConsumos([]))
    }

    useEffect(() => {
        cargarConsumos()
    }, [])

    const handleCerrarMesa = async () => {
        setCerrandoMesa(true)
        setError("")

        try {
            const respuesta = await fetch(`http://localhost:8080/api/mesas/${props.id}/cerrar`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })

            if (!respuesta.ok) {
                throw new Error("No se pudo cerrar la mesa. Revisa si sigue ocupada o intenta de nuevo.")
            }

            const data = await respuesta.json()
            setConfirmandoCierre(false)
            setResumen(data)
            props.onActualizar?.()
        } catch (error) {
            setError(error.message)
        } finally {
            setCerrandoMesa(false)
        }
    }

    const totalConsumos = consumos.reduce((suma, consumo) => suma + Number(consumo.subtotal || 0), 0)
    const totalGeneral = costoTiempo + totalConsumos
    const productosConsumidos = consumos.reduce((suma, consumo) => suma + Number(consumo.cantidad || 0), 0)

    return (
        <div className="bp-overlay fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bp-modal-shell relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] shadow-2xl">
                <header className="bp-modal-header flex items-start justify-between gap-4 px-5 py-5 sm:px-7">
                    <div>
                        <div className="bp-soft-pill mb-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                            En juego
                        </div>
                        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Mesa {props.numero}</h2>
                        <p className="mt-1 text-sm opacity-70 sm:text-base">
                            Inicio {formatearHora(props.horaInicio)} · {formatCOP(props.precio)} / hora
                        </p>
                    </div>

                    <button
                        onClick={props.onCerrar}
                        className="bp-icon-button"
                        aria-label="Cerrar modal">
                        ✕
                    </button>
                </header>

                <main className="bp-modal-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                    {error && (
                        <div className="mb-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                            {error}
                        </div>
                    )}

                    <section className="bp-modal-section mb-5 p-5 sm:p-6">
                        <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr] xl:items-center">
                            <div>
                                <p className="bp-overline mb-2">Cronómetro</p>
                                <p className="bp-live-clock font-mono text-5xl font-black sm:text-6xl">{tiempoTranscurrido}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <MetricBox label="Tiempo" value={formatCOP(redondearCOP(costoTiempo))} />
                                <MetricBox label="Consumos" value={formatCOP(redondearCOP(totalConsumos))} />
                                <MetricBox label="Total" value={formatCOP(redondearCOP(totalGeneral))} accent />
                            </div>
                        </div>
                    </section>

                    <section className="bp-modal-section p-5 sm:p-6">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-black">Consumos de la mesa</h3>
                                <p className="text-sm opacity-70">
                                    {productosConsumidos} producto{productosConsumidos === 1 ? "" : "s"} cargado{productosConsumidos === 1 ? "" : "s"} · {consumos.length} registro{consumos.length === 1 ? "" : "s"}
                                </p>
                            </div>
                            <p className="text-sm font-black text-yellow-400">{formatCOP(totalConsumos)}</p>
                        </div>

                        {consumos.length === 0 ? (
                            <div className="bp-empty-box p-8 text-center">
                                <p className="text-3xl">🧾</p>
                                <p className="mt-2 font-black">Sin consumos todavía</p>
                                <p className="mt-1 text-sm opacity-60">Usa “Agregar consumo” cuando vendan bebidas o snacks.</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-3xl border border-gray-800">
                                {consumos.map((consumo) => (
                                    <div key={consumo.id} className="bp-list-row flex items-center justify-between gap-4 px-4 py-4 last:border-b-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bp-row-icon">🍻</div>
                                            <div>
                                                <p className="font-black">{consumo.producto?.nombre || "Producto"}</p>
                                                <p className="text-sm opacity-60">Cantidad: {consumo.cantidad}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-yellow-400">{formatCOP(consumo.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <footer className="bp-modal-footer sticky bottom-0 z-10 px-5 py-4 sm:px-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="bp-total-chip lg:min-w-[22rem]">
                            <p className="bp-overline">Total parcial</p>
                            <p className="text-3xl font-black text-yellow-400">{formatCOP(redondearCOP(totalGeneral))}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
                            <button
                                onClick={() => setModalConsumoAbierto(true)}
                                className="bp-primary-button">
                                + Agregar consumo
                            </button>
                            <button
                                onClick={() => setConfirmandoCierre(true)}
                                disabled={cerrandoMesa}
                                className="bp-danger-button">
                                {cerrandoMesa ? "Cerrando..." : "Cobrar y cerrar"}
                            </button>
                        </div>
                    </div>
                </footer>
            </div>

            {confirmandoCierre && !resumen && (
                <div className="bp-overlay fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="bp-modal-shell w-full max-w-lg overflow-hidden rounded-[2rem] shadow-2xl">
                        <div className="bp-modal-header px-6 py-5">
                            <p className="bp-overline text-yellow-400">Revisar antes de cerrar</p>
                            <h2 className="mt-2 text-3xl font-black">Cobro de mesa {props.numero}</h2>
                            <p className="mt-2 text-sm leading-relaxed opacity-70">
                                Confirma el valor con el cliente. Si falta algo, cancela y vuelve a la mesa.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3">
                                <FilaCobro etiqueta="Tiempo jugado" valor={tiempoTranscurrido} />
                                <FilaCobro etiqueta="Valor por tiempo" valor={formatCOP(redondearCOP(costoTiempo))} />
                                <FilaCobro etiqueta="Consumos" valor={formatCOP(redondearCOP(totalConsumos))} />
                                <div className="bp-total-review mt-4 p-5">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="bp-overline text-yellow-400">Total a cobrar</p>
                                            <p className="mt-1 text-sm opacity-65">Redondeado a múltiplos de $50</p>
                                        </div>
                                        <p className="text-3xl font-black text-yellow-400">{formatCOP(redondearCOP(totalGeneral))}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <button
                                    onClick={() => setConfirmandoCierre(false)}
                                    disabled={cerrandoMesa}
                                    className="bp-secondary-button">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCerrarMesa}
                                    disabled={cerrandoMesa}
                                    className="bp-primary-button">
                                    {cerrandoMesa ? "Cerrando..." : "Confirmar cierre"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {resumen && (
                <div className="bp-overlay fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="bp-modal-shell w-full max-w-lg overflow-hidden rounded-[2rem] shadow-2xl">
                        <div className="bp-modal-header px-6 py-5">
                            <div className="mb-3 inline-flex rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                                Mesa cerrada
                            </div>
                            <h2 className="text-3xl font-black">Cobro registrado</h2>
                            <p className="mt-2 text-sm opacity-70">Mesa {props.numero} vuelve al estado libre.</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-3">
                                <FilaCobro etiqueta="Horas jugadas" valor={`${Number(resumen.horasJugadas || 0).toFixed(2)}h`} />
                                <FilaCobro etiqueta="Tiempo de juego" valor={formatCOP(redondearCOP(resumen.totalAPagar))} />
                                <FilaCobro etiqueta="Consumos" valor={formatCOP(redondearCOP(resumen.totalConsumos))} />
                                <div className="bp-total-review mt-4 p-5">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="bp-overline text-yellow-400">Total final</p>
                                            <p className="mt-1 text-sm opacity-60">Valor cobrado al cliente</p>
                                        </div>
                                        <p className="text-3xl font-black text-yellow-400">{formatCOP(redondearCOP(resumen.totalGeneral))}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={cerrarDespuesDeCobro}
                                className="bp-primary-button mt-6 w-full">
                                Volver al salón
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalConsumoAbierto && (
                <ModalAgregarConsumo
                    mesaId={props.id}
                    onCerrar={() => setModalConsumoAbierto(false)}
                    onAgregar={() => {
                        setModalConsumoAbierto(false)
                        cargarConsumos()
                        props.onActualizar?.()
                    }}
                />
            )}
        </div>
    )
}

function MetricBox({ label, value, accent = false }) {
    return (
        <div className={`bp-metric-box ${accent ? "bp-metric-accent" : ""}`}>
            <p className="bp-overline">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
        </div>
    )
}

function FilaCobro({ etiqueta, valor }) {
    return (
        <div className="bp-charge-row flex items-center justify-between gap-4 px-4 py-4">
            <span>{etiqueta}</span>
            <span className="font-black">{valor}</span>
        </div>
    )
}

export default ModalMesa
