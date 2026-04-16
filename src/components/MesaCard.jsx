function MesaCard(props){
    return (
        <div className="bg-gray-800 rounded-x1 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-white text-x1 font-bold">Mesa {props.numero}</h2>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">LIBRE</span>
            </div>

            <p className="text-gray-400 text-sm">${props.precio} / hora</p>

            <div className="bg-gray-700 rounded-1g p-4 text-center">
                <p className="text-gray-400 text-xs mb.1">TIEMPO TRANSCURRIDO</p>
                <p className="text-yellow-400 text-3x1 font-bold">00:00:00</p>
            </div>

            <button className="w-full bg-yellow-400 text-gray-900  font-bold py-2 rounded-lg hober:bg-hellow-300">
                INICIAR PARTIDA
            </button>



        </div>

    )
}

export default MesaCard