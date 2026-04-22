import { useState, useEffect } from "react"
import ModalAgregarConsumo from "./ModalAgregarConsumo"

function ModalMesa(props){
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00:00")
    const [consumos, setConsumos] = useState([])
    const [resumen, setResumen] = useState(null)
    const [modalConsumoAbierto, setModalConsumoAbierto] = useState(false)
    const [costoTiempo, setCostoTiempo] = useState(0)

    useEffect(() => {
        const intervalo = setInterval(() => {
            const ahora = new Date()
            const inicio = new Date(props.horaInicio)
            const diff = ahora - inicio

            const horas = Math.floor(diff / 3600000)
            const minutos = Math.floor((diff % 3600000) / 60000)
            const segundos = Math.floor((diff % 60000) / 1000)

            const horasDecimales = diff / 3600000
            setCostoTiempo(horasDecimales * props.precio)

            const formato = 
                String(horas).padStart(2, "0") + ":" + 
                String(minutos).padStart(2, "0") + ":" + 
                String(segundos).padStart(2, "0")

            setTiempoTranscurrido(formato)
        }, 1000)
        return () => clearInterval(intervalo)
    }, [props.horaInicio])

    const cargarConsumos = () => {
        fetch(`http://localhost:8080/api/consumos/mesa/${props.id}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res => res.json())
        .then(data => setConsumos(data))
    }

    useEffect(() => {
        cargarConsumos()
    }, [])

    const handleCerrarMesa = async () => {
        const respuesta = await fetch(`http://localhost:8080/api/mesas/${props.id}/cerrar`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        const data = await respuesta.json()
        setResumen(data)
    }

    const formatCOP = (valor) => 
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)

    const redondearCOP = (valor) => Math.round(valor / 50) * 50
    
    const totalConsumos = consumos.reduce((suma, consumo) => suma + consumo.subtotal, 0)
    const totalGeneral = costoTiempo + totalConsumos

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-3/5 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-yellow-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-white text-3xl font-bold">Mesa {props.numero}</h2>
                        <p className="text-yellow-400 text-sm mt-1">OCUPADA</p>
                    </div>
                    <button 
                        onClick={props.onCerrar}
                        className="text-gray-400 hover:text-white text-2xl font-bold">
                        ✕
                    </button>
                </div>

                <div className="bg-gray-700 rounded-xl p-6 text-center mb-6">
                    <p className="text-gray-400 text-xs mb-2">TIEMPO TRANSCURRIDO</p>
                    <p className="text-yellow-400 text-5xl font-bold">{tiempoTranscurrido}</p>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white text-lg font-bold">Consumos</h3>
                        <button 
                            onClick={() => setModalConsumoAbierto(true)} 
                            className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-300">
                            + Agregar
                        </button>
                    </div>

                    {consumos.length === 0 
                        ? <p className="text-gray-400 text-sm">No hay consumos registrados.</p>
                        : consumos.map(consumo => (
                            <div key={consumo.id} className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-white">{consumo.producto.nombre} x{consumo.cantidad}</span>
                                <span className="text-yellow-400">{formatCOP(consumo.subtotal)}</span>
                            </div>
                        ))
                    } 
                </div>

                <div className="bg-gray-700 rounded-xl p-6 mb-6">
                    <div className="flex justify-between text-gray-400 text-sm mb-2">
                        <span>Tiempo de juego</span>
                        <span>{formatCOP(redondearCOP(costoTiempo))}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm mb-4">
                        <span>Consumos</span>
                        <span>{formatCOP(redondearCOP(totalConsumos))}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                        <span>TOTAL</span>
                        <span>{formatCOP(redondearCOP(totalGeneral))}</span>
                    </div>
                </div>

                <button 
                    onClick={handleCerrarMesa}
                    className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500">
                    CERRAR MESA
                </button>

            </div>

            {resumen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 w-2/5">
                        <h2 className="text-white text-2xl font-bold mb-6">Resumen de Cobro</h2>
                        
                        <div className="flex justify-between text-gray-400 text-sm mb-2">
                            <span>Horas jugadas</span>
                            <span>{resumen.horasJugadas.toFixed(2)}h</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm mb-2">
                            <span>Tiempo de juego</span>
                            <span>{formatCOP(redondearCOP(resumen.totalAPagar))}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm mb-4">
                            <span>Consumos</span>
                            <span>{formatCOP(redondearCOP(resumen.totalConsumos))}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-xl mb-8">
                            <span>TOTAL</span>
                            <span>{formatCOP(redondearCOP(resumen.totalGeneral))}</span>
                        </div>

                        <button 
                            onClick={props.onCerrar}
                            className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300">
                            CONFIRMAR Y CERRAR
                        </button>
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
                    }}
                />
            )} 
        </div>
    )
}

export default ModalMesa