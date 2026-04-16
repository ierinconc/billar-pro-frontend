
import { useState, useEffect } from "react"


function MesaCard(props){

    const [tiempoTranscurrido, setTiempoTranscurrido] = useState ("00:00:00")

    useEffect(() => {
    if(props.estado !== "OCUPADA") return

    const intervalo = setInterval(() => {
        const ahora = new Date()
        const inicio = new Date(props.horaInicio)
        const diff = ahora - inicio

        const horas = Math.floor(diff / 3600000)
        const minutos = Math.floor((diff % 3600000) / 60000)
        const segundos = Math.floor((diff % 60000) / 1000)

        const formato = 
            String(horas).padStart(2, "0") + ":" +
            String(minutos).padStart(2, "0") + ":" +
            String(segundos).padStart(2, "0")

        setTiempoTranscurrido(formato)
    }, 1000)

    return () => clearInterval(intervalo)
}, [props.estado, props.horaInicio])

    return (
        <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-white text-x1 font-bold">Mesa {props.numero}</h2>
                <span className={props.estado === "LIBRE" ? "bg-green-500 text-white text-xs px-2 py-1 rounded-full" : "bg-yellow-400 text-white text-xs px-2 py-1 rounded-full"}>{props.estado}</span>
            </div>

            <p className="text-gray-400 text-sm">${props.precio} / hora</p>

            <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-xs mb-l">TIEMPO TRANSCURRIDO</p>
                <p className="text-yellow-400 text-3xl font-bold">{tiempoTranscurrido}</p>
            </div>

            <button className={props.estado === "LIBRE" ? "w-full bg-yellow-500 text-gray-900  font-bold py-2 rounded-lg hover:bg-yellow-300" : "w-full bg-red-600 text-gray-900  font-bold py-2 rounded-lg hover:bg-red-500"}>
                {props.estado === "LIBRE" ? "INICIAR PARTIDA" : "VER DETALLE"}
            </button>

        </div>

    )
}

export default MesaCard