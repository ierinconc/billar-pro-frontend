import useEscapeClose from "../hooks/useEscapeClose"

function ModalConfirmacion ({ titulo = "¿Estás seguro?", mensaje, textoConfirmar = "Eliminar", onConfirmar, onCancelar }){
    useEscapeClose(onCancelar)

    return(
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-gray-900 border border-red-500/40 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl shadow-black/40">
                <div className="flex items-start gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/15 text-red-300 flex items-center justify-center text-2xl border border-red-500/30">
                        ⚠️
                    </div>
                    <div>
                        <h3 className="text-white text-2xl font-black mb-2">{titulo}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{mensaje}</p>
                        <p className="mt-3 text-xs text-gray-500">También puedes presionar ESC para cancelar.</p>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                        onClick={onCancelar}
                        className="flex-1 border border-gray-700 text-white font-black py-3 rounded-2xl hover:bg-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirmar}
                        className="flex-1 bg-red-600 text-white font-black py-3 rounded-2xl hover:bg-red-500 transition-colors">
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalConfirmacion
