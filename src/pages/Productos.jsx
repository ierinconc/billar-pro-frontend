import Sidebar from "../components/Sidebar"
import { useState, useEffect } from "react"
import ModalProducto from "../components/ModalProducto"
import ModalConfirmacion from "../components/ModalConfirmacion"

function Productos () {
    const [productos, setProductos] = useState([])
    const [productoAEditar, setProductoAEditar] = useState(null)
    const [productoAEliminar, setProductoAEliminar] = useState(null)
    const [busqueda, setBusqueda] = useState("")

    const formatCOP = (valor) => 
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)

    const cargarProductos = () => {
        fetch("http://localhost:8080/api/productos", {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res => res.json())
        .then(data => setProductos(data))
    }

    useEffect(() => {
        cargarProductos()
    }, [])

    const handleEliminar = (id) => {
        setProductoAEliminar(id)
    }

    const confirmarEliminar = async () => {
        await fetch(`http://localhost:8080/api/productos/${productoAEliminar}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
        setProductoAEliminar(null)
        cargarProductos()
    }

    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar/>
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-white text-3xl font-bold">Tus Productos</h1>
                    <div className="flex gap-3 items-center">
                        <input 
                            type="text"
                            placeholder="🔍 Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-72 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                        />
                        <button onClick={() => setProductoAEditar({})} className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300">+ Nuevo Producto</button>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl overflow-y-auto max-h-[70vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-yellow-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Nombre</th>
                                <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Categoría</th>
                                <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Precio</th>
                                <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Disponible</th>
                                <th className="text-left text-yellow-400 text-xs uppercase px-6 py-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productos
                                .filter(producto => producto.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                                .map(producto => (
                                <tr key={producto.id} className="border-t border-gray-700">
                                    <td className="text-white px-6 py-4">{producto.nombre}</td>
                                    <td className="text-gray-400 px-6 py-4">{producto.categoria}</td>
                                    <td className="text-yellow-400 px-6 py-4">{formatCOP(producto.precio)}</td>
                                    <td className="text-gray-400 px-6 py-4">{producto.disponible ? "Sí" : "No"}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setProductoAEditar(producto)} className="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                        <button onClick={()=> handleEliminar(producto.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {productoAEditar && (
                <ModalProducto 
                    producto={productoAEditar}
                    onCerrar={() => setProductoAEditar(null)}
                    onGuardar={() => {
                        setProductoAEditar(null)
                        cargarProductos()
                    }}
                />
            )}
            {productoAEliminar && (
                <ModalConfirmacion
                    mensaje="Esta acción no se puede deshacer. El producto será eliminado permanentemente."
                    onConfirmar={confirmarEliminar}
                    onCancelar={() => setProductoAEliminar(null)}
                />
            )}
        </div>
    )
}

export default Productos