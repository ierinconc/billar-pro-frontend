

function ModalConfirmacion (props){
    return(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-[28rem] border-2 border-red-500">
                <h3 className="text-white text-xl font-bold mb-2">¿Estás seguro?</h3>
                <p className="text-gray-400 text-sm mb-6">{props.mensaje}</p>

                <div className="flex gap-3">
                <button onClick={props.onCancelar} className="flex-1 border border-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700">CANCELAR</button>
                <button onClick={props.onConfirmar}className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-500">ELIMINAR</button>
            </div>

            </div>
            
        </div>
    )
}

export default ModalConfirmacion