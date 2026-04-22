import Sidebar from "../components/Sidebar"
import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"


function Reportes () {

    const [periodoActivo, setPeriodoActivo] = useState("diario")
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0])
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
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

    const rellenarDiasVacios = (datos, inicio, fin) => {
        const resultado = []
        const fechaActual = new Date(inicio)
        const fechaFin = new Date(fin)
        
        while (fechaActual <= fechaFin) {
            const fechaStr = fechaActual.toISOString().split('T')[0]
            const existente = datos.find(d => d.fecha === fechaStr)
            
            resultado.push(existente || {
                fecha: fechaStr,
                totalMesas: 0,
                totalConsumos: 0,
                totalGeneral: 0
            })
            
            fechaActual.setDate(fechaActual.getDate() + 1)
        }
        
        return resultado
    }


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

                <div className="grid grid-cols-2 gap-4 mb-8">
                    
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-white text-lg font-bold mb-4">Distribución de Ingresos</h3>
                        {kpis && (kpis.totalMesas > 0 || kpis.totalConsumos > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: "Tiempo de Mesa", value: kpis.totalMesas },
                                            { name: "Consumos", value: kpis.totalConsumos }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill="#facc15" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #facc15", borderRadius: "8px" }}
                                        formatter={(value) => formatCOP(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm">No hay datos para este período.</p>
                        )}
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-white text-lg font-bold mb-4">Ingresos por Mesa</h3>
                        {ingresosPorMesa.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={ingresosPorMesa}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="totalRecaudado"
                                        nameKey="numero"
                                        label={({ cx, cy, midAngle, outerRadius, numero, percent, fill }) => {
                                            const RADIAN = Math.PI / 180
                                            const radius = outerRadius + 20
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN)
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN)
                                            return (
                                                <text x={x} y={y} fill={fill} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="13">
                                                    <tspan fontWeight="bold">Mesa {numero}</tspan>
                                                    <tspan> · {(percent * 100).toFixed(0)}%</tspan>
                                                </text>
                                            )
                                        }}
                                    >
                                        {ingresosPorMesa.map((_, index) => (
                                            <Cell key={index} fill={["#facc15", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#f97316", "#06b6d4", "#ec4899"][index % 8]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #facc15", borderRadius: "8px" }}
                                        formatter={(value) => formatCOP(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm">No hay datos para este período.</p>
                        )}
                    </div>

                </div>

                {periodoActivo !== "diario" && ingresosPorDia.length > 0 && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8">
                        <h3 className="text-white text-lg font-bold mb-4">Tendencia de Ingresos</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={
                                periodoActivo === "mensual"
                                    ? rellenarDiasVacios(
                                        ingresosPorDia, 
                                        fechaSeleccionada.substring(0, 7) + "-01",
                                        `${fechaSeleccionada.substring(0, 7)}-${new Date(parseInt(fechaSeleccionada.split("-")[0]), parseInt(fechaSeleccionada.split("-")[1]), 0).getDate()}`
                                    )
                                    : rellenarDiasVacios(ingresosPorDia, fechaSeleccionada, fechaFin)
                            }>
                                <XAxis 
                                    dataKey="fecha" 
                                    stroke="#9ca3af"
                                    tickFormatter={(fecha) => {
                                        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
                                        const [_, mes, dia] = fecha.split("-")
                                        return `${meses[parseInt(mes) - 1]} ${parseInt(dia)}`
                                    }}
                                />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #facc15", borderRadius: "8px" }}
                                    labelStyle={{ color: "#facc15" }}
                                    formatter={(value) => formatCOP(value)}
                                />
                                <Bar dataKey="totalGeneral" fill="#facc15" radius={[8, 8, 0, 0]} maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}       

                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <h3 className="text-white text-lg font-bold mb-4">Top Productos Vendidos</h3>
                    {productosTop.length === 0 ? (
                        <p className="text-gray-400 text-sm">No hay productos vendidos en este período.</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left text-yellow-400 text-xs uppercase px-4 py-3">#</th>
                                    <th className="text-left text-yellow-400 text-xs uppercase px-4 py-3">Producto</th>
                                    <th className="text-right text-yellow-400 text-xs uppercase px-4 py-3">Cantidad</th>
                                    <th className="text-right text-yellow-400 text-xs uppercase px-4 py-3">Total Recaudado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosTop.map((producto, index) => (
                                    <tr key={index} className="border-b border-gray-700 last:border-b-0">
                                        <td className="px-4 py-3 text-gray-400">
                                            {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                        </td>
                                        <td className="px-4 py-3 text-white">{producto.nombre}</td>
                                        <td className="px-4 py-3 text-gray-400 text-right">{producto.cantidadVendida} vendidas</td>
                                        <td className="px-4 py-3 text-yellow-400 text-right font-bold">{formatCOP(producto.totalRecaudado)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    )
}

export default Reportes