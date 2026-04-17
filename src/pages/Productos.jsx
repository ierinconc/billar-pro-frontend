import Sidebar from "../components/Sidebar"
import { useState, useEffect } from "react"


function Productos () {
    const [productos, setProductos] = useState([])

    useEffect(()=>{
    fetch("http://localhost:8080/api/productos", {
        headers : {
            "Authorization" : "Bearer " + localStorage.getItem("token")
        }
    })
    .then(res=> res.json())
    .then(data => setProductos(data))
    },[])



    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar/>
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-white text-3xl font-bold">Productos</h1>
                    <button className="bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300">+ Nuevo Producto</button>
                </div>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
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
                            {productos.map(producto => (
                                <tr key={producto.id} className="border-t border-gray-700">
                                    <td className="text-white px-6 py-4">{producto.nombre}</td>
                                    <td className="text-gray-400 px-6 py-4">{producto.categoria}</td>
                                    <td className="text-yellow-400 px-6 py-4">${producto.precio}</td>
                                    <td className="text-gray-400 px-6 py-4">{producto.disponible ? "Sí" : "No"}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-400 hover:text-blue-300 mr-4">Editar</button>
                                        <button className="text-red-400 hover:text-red-300">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> 
        </div>
    )
}

export default Productos