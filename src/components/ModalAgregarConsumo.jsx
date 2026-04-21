import { useState, useEffect } from "react"

function ModalAgregarConsumo(props){

    const [productos, setProductos] = useState([])
    const [productoSeleccionado, setProductoSeleccionado] = useState("")
    const [cantidad, setCantidad] = useState(1)
    const [carrito, setCarrito] = useState([])
    
    useEffect(() => {
        fetch("http://localhost:8080/api/productos", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res => res.json())
        .then(data => setProductos(data.filter(p => p.disponible)))
    }, [])

    const handleAgregarAlCarrito = () => {
        if(!productoSeleccionado) return

        const producto = productos.find(p => p.id === parseInt(productoSeleccionado))

        const nuevoItem = {
            productoId: producto.id,
            nombre: producto.nombre,
            cantidad: cantidad,
            precio: producto.precio
        }

        setCarrito([...carrito, nuevoItem])
        setProductoSeleccionado("")
        setCantidad(1)
    }

    const handleEliminarDelCarrito = (index) => {
        setCarrito(carrito.filter((_, i) => i !== index))
    }

    const handleEnviar = async () => {
        if(carrito.length === 0) return

        await Promise.all(
            carrito.map(item => 
                fetch("http://localhost:8080/api/consumos", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify({
                        mesaId: props.mesaId,
                        productoId: item.productoId,
                        cantidad: item.cantidad
                    })
                })
            )
        )
        props.onAgregar()
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 rounded-2xl p-8 w-[28rem]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-2xl font-bold">Agregar Consumo</h2>
                    <button
                        onClick={props.onCerrar}
                        className="text-gray-400 hover:text-white text-2xl font-bold">
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-yellow-400 text-sm mb-1 block">PRODUCTO</label>
                    <select 
                        value={productoSeleccionado} 
                        onChange={(e) => setProductoSeleccionado(e.target.value)} 
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400">
                        <option value="">Selecciona un producto...</option>
                        {productos.map(producto => (
                            <option key={producto.id} value={producto.id}>
                                {producto.nombre} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(producto.precio)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="text-yellow-400 text-sm mb-1 block">CANTIDAD</label>
                    <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="1" 
                            value={cantidad} 
                            onChange={(e) => setCantidad(parseInt(e.target.value))} 
                            onKeyDown={(e) => {
                                if(e.key === "Enter") handleAgregarAlCarrito()
                            }}
                            className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                        />
                        <button 
                            onClick={handleAgregarAlCarrito}
                            className="bg-yellow-400 text-gray-900 font-bold w-10 h-10 rounded-full hover:bg-yellow-300 flex items-center justify-center leading-none pb-0.5 text-xl self-center">
                            +
                        </button>
                    </div>
                </div>

                {carrito.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {carrito.map((item, index) => (
                            <div 
                                key={index}
                                className="flex items-center gap-2 bg-yellow-400/20 border border-yellow-400 text-yellow-400 text-sm px-3 py-1 rounded-full">
                                <span>{item.nombre} x{item.cantidad}</span>
                                <button 
                                    onClick={() => handleEliminarDelCarrito(index)}
                                    className="hover:text-white font-bold">
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <button 
                        onClick={props.onCerrar} 
                        className="flex-1 border border-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleEnviar} 
                        disabled={carrito.length === 0}
                        className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed">
                        Enviar ({carrito.length})
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ModalAgregarConsumo