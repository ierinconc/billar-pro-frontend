import { useState, useEffect, use } from "react"



function ModalMesa(props){
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState("00:00:00")

    useEffect(()=>{
        const intervalo = setInterval(()=>{

            const ahora = new Date()
            const inicio = new Date(props.horaInicio)
            const diff =ahora - inicio
            

            const horas = Math.floor(diff / 3600000)
            const minutos = Math.floor((diff % 3600000) / 60000)
            const segundos = Math.floor((diff % 60000) / 1000)

            const formato = 
                String(horas).padStart(2, "0") + ":" + 
                String(minutos).padStart(2, "0") + ":" + 
                String(segundos).padStart(2, "0")

                setTiempoTranscurrido(formato)
        }, 1000)
        return()=> clearInterval (intervalo)
    }, [props.horaInicio])

    return(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-3/5 max-h-[85vh] overflow-y-auto">
                
                
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
                        <button className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-300">
                            + Agregar
                        </button>
                    </div>
                    <p className="text-gray-400 text-sm">No hay consumos registrados.</p>
                </div>

                
                <div className="bg-gray-700 rounded-xl p-6 mb-6">
                    <div className="flex justify-between text-gray-400 text-sm mb-2">
                        <span>Tiempo de juego</span>
                        <span>$0</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm mb-4">
                        <span>Consumos</span>
                        <span>$0</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-lg">
                        <span>TOTAL</span>
                        <span>$0</span>
                    </div>
                </div>

                <button className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-500">
                    CERRAR MESA
                </button>

            </div>
        </div>
    )
}

export default ModalMesa