import { useState } from "react"

function ModalProducto(props){

    const [nombre, setNombre] = useState(props.producto?.nombre || "")
    const [categoria, setCategoria] = useState(props.producto?.categoria || "Bebidas")
    const [precio, setPrecio] = useState(props.producto?.precio || "")
    const [disponible, setDisponible] = useState(props.producto?.disponible ?? true)


    const handleGuardar = async () => {
    const esEdicion = !!props.producto?.id
    const url = esEdicion 
        ? `http://localhost:8080/api/productos/${props.producto.id}`
        : "http://localhost:8080/api/productos"
    const metodo = esEdicion ? "PUT" : "POST"

    await fetch(url, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
            nombre: nombre.trim(),
            categoria: categoria,
            precio: parseFloat(precio),
            disponible: disponible
        })
    })
    props.onGuardar()
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-2xl p-8 w-2/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-2xl font-bold">
                        {props.producto?.id ? "Editar Producto" : "Nuevo Producto"}
                    </h2>
                    <button onClick={props.onCerrar}className="text-gray-400 hover:text-white text-2xl font-bold">
                        X
                    </button>
                </div>
                <div className="mb-4">
                    <label className="text-yellow-400 text-sm mb-1 block">
                        NOMBRE DEL PRODUCTO
                    </label>
                    <input value={nombre} onChange={(e)=> setNombre(e.target.value)} type="text" placeholder="Ej: Cerveza Águila" 
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"/>
                </div>
                <div className="mb-4">
                    <label className="text-yellow-400 text-sm mb-1 block">CATEGORÍA</label>
                    <select value={categoria} onChange={(e)=> setCategoria(e.target.value)} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400">
                        <option value="Bebidas">Bebidas</option>
                        <option value="Cigarrillos">Cigarrillos</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="text-yellow-400 text-sm mb-1 block">PRECIO</label>
                    <input value={precio} onChange={(e)=> setPrecio(e.target.value)} className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400" type="number" placeholder="3500" />
                </div>
                <div className="mb-6 flex items-center gap-3">  
                    <input checked={disponible} onChange={(e)=> setDisponible(e.target.checked)} type="checkbox"
                    className="w-5 h-5 accent-yellow-400"/>
                    <label className="text-white text-sm">Disponible para la venta</label>
                </div>
                <div className="flex gap-3">
                    <button onClick={props.onCerrar} className="flex-1 border border-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleGuardar} className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-300">Guardar Producto</button>
                </div>
            </div>
        </div>

    )
}

export default ModalProducto    