import Sidebar from "../components/Sidebar"
import { useState, useEffect } from "react"


function Reportes () {

    const [periodoActivo, setPeriodoActivo] = useState("diario")

    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])

    const [fechaFin, setFechaFin] = useState(new Date(). toISOString().split('T')[0])
    const [kpis, setKpis] = useState(null)

    const [ingresosPorDia, setIngresosPorDia] = useState([])

    const [productosTop, setProductosTop] = useState([])

    const [ingresosPorMesa, setIngresosPorMesa] = useState([])


    const cargarReportes = async () => {
        let paramsReporte = ""
        let paramsIngresosPorDia = ""
        let paramsProductosTop = ""
        let paramsIngresosPorMesa = ""

        if (periodoActivo === "diario") {
            paramsReporte = `/diario?fecha=${fechaSeleccionada}`
            paramsIngresosPorDia = `?inicio=${fechaSeleccionada}&fin=${fechaSeleccionada}`
            paramsProductosTop = `/diario?fecha=${fechaSeleccionada}`
            paramsIngresosPorMesa = `/diario?fecha=${fechaSeleccionada}`
        } else if (periodoActivo === "semanal") {
            paramsReporte = `/semanal?inicio=${fechaSeleccionada}&fin=${fechaFin}`
            paramsIngresosPorDia = `?inicio=${fechaSeleccionada}&fin=${fechaFin}`
            paramsProductosTop = `/semanal?inicio=${fechaSeleccionada}&fin=${fechaFin}`
            paramsIngresosPorMesa = `/semanal?inicio=${fechaSeleccionada}&fin=${fechaFin}`
        } else if (periodoActivo === "mensual") {
            const [anio, mes] = fechaSeleccionada.split("-")
            paramsReporte = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
            
            const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate()
            const inicioMes = `${anio}-${mes}-01`
            const finMes = `${anio}-${mes}-${String(ultimoDia).padStart(2, "0")}`
            paramsIngresosPorDia = `?inicio=${inicioMes}&fin=${finMes}`
            
            paramsProductosTop = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
            paramsIngresosPorMesa = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
        }

        const headers = {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }

        const [resKpis, resDia, resProductos, resMesas] = await Promise.all([
            fetch(`http://localhost:8080/api/reportes${paramsReporte}`, { headers }),
            fetch(`http://localhost:8080/api/reportes/ingresos-por-dia${paramsIngresosPorDia}`, { headers }),
            fetch(`http://localhost:8080/api/reportes/productos-top${paramsProductosTop}`, { headers }),
            fetch(`http://localhost:8080/api/reportes/ingresos-por-mesa${paramsIngresosPorMesa}`, { headers })
        ])

        setKpis(await resKpis.json())
        setIngresosPorDia(await resDia.json())
        setProductosTop(await resProductos.json())
        setIngresosPorMesa(await resMesas.json())
    }

    useEffect(() => {
        cargarReportes()
    }, [periodoActivo, fechaSeleccionada, fechaFin])

    const formatCOP = (valor) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)


    return (
        <div className="flex min-h-screen bg-gray-900"> 
            <Sidebar/>
            <div className="flex-1 p-8">
                <h1 className="text-white text-3xl font-bold mb-2">Reportes de Gestión</h1>
                <p className="text-gray-400 mb-8">Análisis detallado de rendimiento y flujo de caja del salón</p>

                <div className="flex gap-2 mb-8 bg-gray-800 p-2 rounded-xl w-fit">
                    <button className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                        periodoActivo === "diario"
                            ? "bg-yellow-400 text-gray-900"
                            : "text-gray-400 hover:text-white"
                    }`} onClick={()=> setPeriodoActivo("diario")}>Diario
                    </button>
                    <button className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                        periodoActivo === "semanal"
                            ? "bg-yellow-400 text-gray-900"
                            : "text-gray-400 hover:text-white"
                    }`} onClick={()=> setPeriodoActivo("semanal")}>Semanal
                    </button>
                    <button className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                        periodoActivo === "mensual"
                            ? "bg-yellow-400 text-gray-900"
                            : "text-gray-400 hover:text-white"
                    }`} onClick={()=> setPeriodoActivo("mensual")}>Mensual
                    </button>
                </div>

                <div className="mb-8 flex gap-4 items-center">
                    {periodoActivo === "diario" && (
                        <div>
                            <label className="text-yellow-400 text-sm mb-1 block">FECHA</label>
                            <input 
                                type="date"
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                            />
                        </div>
                    )}
                    
                    {periodoActivo === "semanal" && (
                        <>
                            <div>
                                <label className="text-yellow-400 text-sm mb-1 block">INICIO</label>
                                <input 
                                    type="date"
                                    value={fechaSeleccionada}
                                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                                    className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="text-yellow-400 text-sm mb-1 block">FIN</label>
                                <input 
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                                />
                            </div>
                        </>
                    )}
                    
                    {periodoActivo === "mensual" && (
                        <div>
                            <label className="text-yellow-400 text-sm mb-1 block">MES</label>
                            <input 
                                type="month"
                                value={fechaSeleccionada.substring(0, 7)}
                                onChange={(e) => setFechaSeleccionada(e.target.value + "-01")}
                                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-xl p-6">
                        <p className="text-gray-400 text-xs uppercase mb-2">Total Mesas</p>
                        <p className="text-yellow-400 text-3xl font-bold">
                            {kpis ? formatCOP(kpis.totalMesas) : "—"}
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6">
                        <p className="text-gray-400 text-xs uppercase mb-2">Total Consumos</p>
                        <p className="text-yellow-400 text-3xl font-bold">
                            {kpis ? formatCOP(kpis.totalConsumos) : "—"}
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6">
                        <p className="text-gray-400 text-xs uppercase mb-2">Total General</p>
                        <p className="text-yellow-400 text-3xl font-bold">
                            {kpis ? formatCOP(kpis.totalGeneral) : "—"}
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6">
                        <p className="text-gray-400 text-xs uppercase mb-2">Sesiones</p>
                        <p className="text-yellow-400 text-3xl font-bold">
                            {kpis ? kpis.numeroSesiones : "—"}
                        </p>
                    </div>
                </div>        






            </div>
        </div>
    )
}

export default Reportes
    