import { memo, useEffect, useMemo, useState } from "react"

function MesaCard({ mesa, formatCOP, onActualizar, onVerDetalle }){
    const [ocupando, setOcupando] = useState(false)
    const [ahora, setAhora] = useState(Date.now())
    const estaOcupada = mesa.estado === "OCUPADA"

    useEffect(() => {
        if (!estaOcupada || !mesa.horaInicio) return

        const intervalo = setInterval(() => setAhora(Date.now()), 1000)
        return () => clearInterval(intervalo)
    }, [estaOcupada, mesa.horaInicio])

    const datosTiempo = useMemo(() => {
        if (!estaOcupada || !mesa.horaInicio) {
            return {
                tiempo: "Disponible",
                costo: 0
            }
        }

        const diff = Math.max(0, ahora - new Date(mesa.horaInicio).getTime())
        const horas = Math.floor(diff / 3600000)
        const minutos = Math.floor((diff % 3600000) / 60000)
        const segundos = Math.floor((diff % 60000) / 1000)
        const costo = (diff / 3600000) * Number(mesa.precioPorHora || 0)

        return {
            tiempo: `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`,
            costo
        }
    }, [ahora, estaOcupada, mesa.horaInicio, mesa.precioPorHora])

    const handleOcupar = async () => {
        setOcupando(true)

        try {
            const respuesta = await fetch(`http://localhost:8080/api/mesas/${mesa.id}/ocupar`, {
                method: "PUT",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })

            if (!respuesta.ok) {
                throw new Error("No se pudo ocupar la mesa.")
            }

            onActualizar?.()
        } catch (error) {
            alert(error.message)
        } finally {
            setOcupando(false)
        }
    }

    return (
        <article className={`bp-table-card ${estaOcupada ? "bp-table-card-occupied" : "bp-table-card-free"}`}>
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <p className="bp-overline">Mesa</p>
                    <h2 className="text-4xl font-black">{mesa.numero}</h2>
                </div>

                <span className={`bp-status-pill ${estaOcupada ? "bp-status-occupied" : "bp-status-free"}`}>
                    {estaOcupada ? "Ocupada" : "Libre"}
                </span>
            </div>

            <div className="bp-table-timer mb-5 p-5 text-center">
                <p className={`font-mono text-4xl font-black ${estaOcupada ? "bp-time-occupied" : "bp-time-free"}`}>
                    {datosTiempo.tiempo}
                </p>
                <p className="mt-2 text-sm opacity-70">
                    {estaOcupada ? `${formatCOP(datosTiempo.costo)} en tiempo` : `${formatCOP(mesa.precioPorHora)} / hora`}
                </p>
            </div>

            {estaOcupada ? (
                <button
                    onClick={() => onVerDetalle?.(mesa)}
                    className="bp-primary-button w-full">
                    Ver y cerrar mesa
                </button>
            ) : (
                <button
                    onClick={handleOcupar}
                    disabled={ocupando}
                    className="bp-success-button w-full">
                    {ocupando ? "Ocupando..." : "Ocupar mesa"}
                </button>
            )}
        </article>
    )
}

export default memo(MesaCard)
