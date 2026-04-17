import Logo from "../components/Logo"
import MesaCard from "../components/MesaCard"
import { useEffect, useState } from "react"
import ModalMesa from "../components/ModalMesa"

function Dashboard(){

    
    const [mesas, setMesas] = useState([])

    const cargarMesas = () => {
        fetch("http://localhost:8080/api/mesas", {
            headers : {
                "Authorization" : "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res => res.json())
        .then(data => setMesas(data.sort((a,b)=> a.numero - b.numero)))
    }

    const [mesaSeleccionada, setMesaSeleccionada] = useState(null)


    useEffect(()=>{
        cargarMesas()

        const intervalo = setInterval(()=>{
            
            cargarMesas()
        }, 5000)
        
        return () => clearInterval(intervalo)
    },[])
    
    useEffect(()=>{
        fetch("http://localhost:8080/api/mesas", {
            headers : {
                "Authorization" : "Bearer " + localStorage.getItem("token")
            }
        })
        .then(res=> res.json())
        .then(data => setMesas(data.sort((a, b) => a.numero - b.numero)))
    },[])

    





    return(
        <div className="flex h-screen bg-gray-900">
            <div className="w-64 bg-gray-800 p-6">
                <Logo/>
                <nav className="mt-8 flex flex-col gap-2">
                    <button className="text-left px-4 py-3 text-yellow-400 bg-gray-700 rounded-lg">
                        Control del salón
                    </button>
                    <button className="text-left px-4 py-3 text-gray-400 hover:text-white rounded-lg">
                        Productos
                    </button>
                    <button className="text-left px-4 py-3 text-gray-400 hover:text-white rounded-lg">
                        Reportes
                    </button>
                </nav>
            </div>
            <div className="flex-1">
                <div className="p-8">
                    <h1 className="text-white text-3xl font-bold mb-8">Tu salón hoy</h1>
                    <div className="grid grid-cols-4 gap-6">
                        {mesas.map(mesa => (
                            <MesaCard
                                key={mesa.id}
                                id={mesa.id}
                                numero={mesa.numero}
                                precio={mesa.precioPorHora}
                                estado={mesa.estado}
                                horaInicio={mesa.horaInicio}
                                onActualizar={cargarMesas}
                                onVerDetalle={()=> setMesaSeleccionada(mesa)}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {mesaSeleccionada && (
            <ModalMesa
                id={mesaSeleccionada.id}
                numero={mesaSeleccionada.numero}
                horaInicio={mesaSeleccionada.horaInicio}
                onCerrar={() => setMesaSeleccionada(null)}
            />    
        )}
        </div>

    )
}

export default Dashboard    