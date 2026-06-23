import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas-pro"
import Sidebar from "../components/Sidebar"

const API_BASE_URL = "http://localhost:8080/api"
const COLORES_GRAFICAS = ["#facc15", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#f97316", "#06b6d4", "#ec4899"]

function Reportes () {
    const hoy = new Date().toISOString().split("T")[0]
    const [periodoActivo, setPeriodoActivo] = useState("diario")
    const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy)
    const [fechaFin, setFechaFin] = useState(hoy)
    const [kpis, setKpis] = useState(null)
    const [ingresosPorDia, setIngresosPorDia] = useState([])
    const [productosTop, setProductosTop] = useState([])
    const [ingresosPorMesa, setIngresosPorMesa] = useState([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")

    const formatCOP = (valor) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        }).format(Number(valor || 0))

    const formatFechaCorta = (fecha) => {
        if (!fecha) return "—"
        const [anio, mes, dia] = fecha.split("-")
        const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia))
        return fechaLocal.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
    }

    const obtenerUltimoDiaMes = (fecha) => {
        const [anio, mes] = fecha.split("-")
        const ultimoDia = new Date(Number(anio), Number(mes), 0).getDate()
        return `${anio}-${mes}-${String(ultimoDia).padStart(2, "0")}`
    }

    const rellenarDiasVacios = (datos, inicio, fin) => {
        const resultado = []
        const fechaActual = new Date(`${inicio}T00:00:00`)
        const fechaLimite = new Date(`${fin}T00:00:00`)

        while (fechaActual <= fechaLimite) {
            const fechaStr = fechaActual.toISOString().split("T")[0]
            const existente = datos.find((dia) => dia.fecha === fechaStr)

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

    const obtenerRangoActual = () => {
        if (periodoActivo === "diario") return { inicio: fechaSeleccionada, fin: fechaSeleccionada }

        if (periodoActivo === "mensual") {
            const inicioMes = `${fechaSeleccionada.substring(0, 7)}-01`
            return { inicio: inicioMes, fin: obtenerUltimoDiaMes(fechaSeleccionada) }
        }

        return { inicio: fechaSeleccionada, fin: fechaFin }
    }

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
            const inicioMes = `${anio}-${mes}-01`
            const finMes = obtenerUltimoDiaMes(fechaSeleccionada)

            paramsReporte = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
            paramsIngresosPorDia = `?inicio=${inicioMes}&fin=${finMes}`
            paramsProductosTop = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
            paramsIngresosPorMesa = `/mensual?mes=${parseInt(mes)}&anio=${anio}`
        }

        const headers = { "Authorization": "Bearer " + localStorage.getItem("token") }

        const obtenerJSON = async (url) => {
            const respuesta = await fetch(url, { headers })
            if (!respuesta.ok) throw new Error("No se pudieron cargar los reportes. Revisa el backend o el token.")
            return respuesta.json()
        }

        setCargando(true)
        setError("")

        try {
            const [resKpis, resDia, resProductos, resMesas] = await Promise.all([
                obtenerJSON(`${API_BASE_URL}/reportes${paramsReporte}`),
                obtenerJSON(`${API_BASE_URL}/reportes/ingresos-por-dia${paramsIngresosPorDia}`),
                obtenerJSON(`${API_BASE_URL}/reportes/productos-top${paramsProductosTop}`),
                obtenerJSON(`${API_BASE_URL}/reportes/ingresos-por-mesa${paramsIngresosPorMesa}`)
            ])

            setKpis(resKpis || null)
            setIngresosPorDia(Array.isArray(resDia) ? resDia : [])
            setProductosTop(Array.isArray(resProductos) ? resProductos : [])
            setIngresosPorMesa(Array.isArray(resMesas) ? resMesas : [])
        } catch (error) {
            setError(error.message)
            setKpis(null)
            setIngresosPorDia([])
            setProductosTop([])
            setIngresosPorMesa([])
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarReportes()
    }, [periodoActivo, fechaSeleccionada, fechaFin])

    const { inicio, fin } = obtenerRangoActual()

    const datosTendencia = useMemo(() => {
        const datos = rellenarDiasVacios(ingresosPorDia, inicio, fin)
        if (datos.length > 0) return datos

        return [{
            fecha: fechaSeleccionada,
            totalMesas: Number(kpis?.totalMesas || 0),
            totalConsumos: Number(kpis?.totalConsumos || 0),
            totalGeneral: Number(kpis?.totalGeneral || 0)
        }]
    }, [ingresosPorDia, inicio, fin, fechaSeleccionada, kpis])

    const totalGeneral = Number(kpis?.totalGeneral || 0)
    const totalMesas = Number(kpis?.totalMesas || 0)
    const totalConsumos = Number(kpis?.totalConsumos || 0)

    const datosDistribucion = useMemo(() => {
        return [
            { name: "Tiempo de mesa", value: totalMesas },
            { name: "Consumos", value: totalConsumos }
        ].filter((item) => item.value > 0)
    }, [totalMesas, totalConsumos])

    const datosMesasPie = useMemo(() => {
        return ingresosPorMesa
            .map((mesa) => ({ name: `Mesa ${mesa.numero}`, value: Number(mesa.totalRecaudado || 0) }))
            .filter((mesa) => mesa.value > 0)
    }, [ingresosPorMesa])

    const descargarPDF = async () => {
        const elemento = document.getElementById("reporte-contenido")
        if (!elemento) return

        const canvas = await html2canvas(elemento, {
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bp-bg") || "#030712",
            scale: 2
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const anchoPDF = pdf.internal.pageSize.getWidth()
        const altoPDF = (canvas.height * anchoPDF) / canvas.width

        pdf.addImage(imgData, "PNG", 0, 0, anchoPDF, altoPDF)
        pdf.save(`BillarPro-Reporte-${periodoActivo}-${hoy}.pdf`)
    }

    return (
        <div className="flex min-h-screen bg-gray-950">
            <Sidebar />

            <main id="reporte-contenido" className="flex-1 p-5 sm:p-8">
                <section className="bp-report-panel mb-6 rounded-[1.75rem] p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <p className="bp-overline text-yellow-400">Reportes</p>
                            <h1 className="mt-2 text-3xl font-black tracking-tight text-white lg:text-4xl">Resumen del negocio</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                                Revisa ventas, mesas y consumos con gráficas claras para tomar decisiones rápidas.
                            </p>
                        </div>

                        <button
                            onClick={descargarPDF}
                            data-html2canvas-ignore="true"
                            className="bp-primary-button px-5">
                            Descargar PDF
                        </button>
                    </div>
                </section>

                <section data-html2canvas-ignore="true" className="bp-report-panel mb-6 rounded-[1.75rem] p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div className="bp-report-tabs flex w-full flex-col gap-2 rounded-2xl p-2 sm:w-fit sm:flex-row">
                            {[
                                { id: "diario", label: "Diario" },
                                { id: "semanal", label: "Semanal" },
                                { id: "mensual", label: "Mensual" }
                            ].map((periodo) => (
                                <button
                                    key={periodo.id}
                                    onClick={() => setPeriodoActivo(periodo.id)}
                                    className={`rounded-xl px-5 py-3 font-black transition-colors ${
                                        periodoActivo === periodo.id
                                            ? "bg-yellow-400 text-gray-950"
                                            : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                    }`}
                                >
                                    {periodo.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            {periodoActivo === "diario" && (
                                <CampoFecha label="Fecha" type="date" value={fechaSeleccionada} onChange={setFechaSeleccionada} />
                            )}

                            {periodoActivo === "semanal" && (
                                <>
                                    <CampoFecha label="Inicio" type="date" value={fechaSeleccionada} onChange={setFechaSeleccionada} />
                                    <CampoFecha label="Fin" type="date" value={fechaFin} onChange={setFechaFin} />
                                </>
                            )}

                            {periodoActivo === "mensual" && (
                                <CampoFecha
                                    label="Mes"
                                    type="month"
                                    value={fechaSeleccionada.substring(0, 7)}
                                    onChange={(valor) => setFechaSeleccionada(valor + "-01")}
                                />
                            )}
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200">
                        {error}
                    </div>
                )}

                {cargando && (
                    <div className="mb-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-200">
                        Cargando reportes...
                    </div>
                )}

                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard titulo="Total general" valor={formatCOP(totalGeneral)} ayuda={`${formatFechaCorta(inicio)} a ${formatFechaCorta(fin)}`} />
                    <KpiCard titulo="Mesas" valor={formatCOP(totalMesas)} ayuda="Tiempo de juego" />
                    <KpiCard titulo="Consumos" valor={formatCOP(totalConsumos)} ayuda="Productos vendidos" />
                    <KpiCard titulo="Sesiones" valor={kpis?.numeroSesiones ?? "—"} ayuda="Partidas cerradas" />
                </section>

                <section className="mb-6 grid gap-4 xl:grid-cols-2">
                    <GraficaTorta
                        titulo="Distribución de ingresos"
                        descripcion="Cuánto viene del tiempo de mesa y cuánto de productos."
                        datos={datosDistribucion}
                        formatCOP={formatCOP}
                    />

                    <GraficaTorta
                        titulo="Ingresos por mesa"
                        descripcion="Participación de cada mesa en el periodo seleccionado."
                        datos={datosMesasPie}
                        formatCOP={formatCOP}
                    />
                </section>

                <section className="bp-report-panel mb-6 rounded-[1.75rem] p-5">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-black text-white">Ingresos por día</h2>
                            <p className="text-sm text-gray-500">Tendencia del periodo seleccionado.</p>
                        </div>
                        <p className="text-sm font-black text-yellow-300">{datosTendencia.length} día{datosTendencia.length === 1 ? "" : "s"}</p>
                    </div>

                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosTendencia} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bp-border)" />
                                <XAxis
                                    dataKey="fecha"
                                    stroke="var(--bp-muted)"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatFechaCorta}
                                />
                                <YAxis
                                    stroke="var(--bp-muted)"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(250, 204, 21, 0.08)" }}
                                    contentStyle={{ backgroundColor: "var(--bp-card)", color: "var(--bp-text)", border: "1px solid var(--bp-border)", borderRadius: "16px" }}
                                    labelStyle={{ color: "var(--bp-text)", fontWeight: 900 }}
                                    itemStyle={{ color: "var(--bp-text)" }}
                                    labelFormatter={formatFechaCorta}
                                    formatter={(value) => [formatCOP(value), "Total"]}
                                />
                                <Bar dataKey="totalGeneral" fill="#facc15" radius={[10, 10, 0, 0]} maxBarSize={42} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <ListaMesas ingresosPorMesa={ingresosPorMesa} formatCOP={formatCOP} />
                    <ListaProductos productosTop={productosTop} formatCOP={formatCOP} />
                </section>
            </main>
        </div>
    )
}

function CampoFecha({ label, type, value, onChange }) {
    return (
        <div>
            <label className="bp-overline mb-1 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bp-input h-12 w-full sm:w-auto"
            />
        </div>
    )
}

function KpiCard({ titulo, valor, ayuda }) {
    return (
        <div className="bp-report-panel rounded-[1.5rem] p-5">
            <p className="bp-overline">{titulo}</p>
            <p className="mt-3 text-2xl font-black text-white lg:text-3xl">{valor}</p>
            <p className="mt-1 text-sm text-gray-500">{ayuda}</p>
        </div>
    )
}

function GraficaTorta({ titulo, descripcion, datos, formatCOP }) {
    return (
        <div className="bp-report-panel rounded-[1.75rem] p-5">
            <div className="mb-4">
                <h2 className="text-xl font-black text-white">{titulo}</h2>
                <p className="text-sm text-gray-500">{descripcion}</p>
            </div>

            {datos.length === 0 ? (
                <div className="bp-report-empty flex h-72 items-center justify-center rounded-3xl p-8 text-center text-gray-500">
                    No hay datos para esta gráfica.
                </div>
            ) : (
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={datos}
                                cx="50%"
                                cy="45%"
                                innerRadius={55}
                                outerRadius={105}
                                paddingAngle={3}
                                dataKey="value"
                                nameKey="name"
                                labelLine={false}
                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                                {datos.map((_, index) => (
                                    <Cell key={index} fill={COLORES_GRAFICAS[index % COLORES_GRAFICAS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: "var(--bp-card)", color: "var(--bp-text)", border: "1px solid var(--bp-border)", borderRadius: "16px" }}
                                labelStyle={{ color: "var(--bp-text)", fontWeight: 900 }}
                                itemStyle={{ color: "var(--bp-text)" }}
                                formatter={(value, name) => [formatCOP(value), name]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                wrapperStyle={{ color: "var(--bp-muted)", fontSize: "13px", paddingTop: "12px" }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

function ListaMesas({ ingresosPorMesa, formatCOP }) {
    const maxIngresoMesa = Math.max(...ingresosPorMesa.map((mesa) => Number(mesa.totalRecaudado || 0)), 0)

    return (
        <div className="bp-report-panel rounded-[1.75rem] p-5">
            <div className="mb-4">
                <h2 className="text-xl font-black text-white">Mesas que más facturan</h2>
                <p className="text-sm text-gray-500">Ranking rápido para entender la rotación del salón.</p>
            </div>

            {ingresosPorMesa.length === 0 ? (
                <div className="bp-report-empty rounded-3xl p-8 text-center text-gray-500">
                    No hay datos de mesas en este periodo.
                </div>
            ) : (
                <div className="space-y-4">
                    {ingresosPorMesa.map((mesa, index) => {
                        const valor = Number(mesa.totalRecaudado || 0)
                        const porcentaje = maxIngresoMesa > 0 ? Math.max(5, Math.round((valor / maxIngresoMesa) * 100)) : 0

                        return (
                            <div key={`${mesa.numero}-${index}`} className="bp-report-mini-row rounded-2xl p-3">
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <p className="font-black text-white">Mesa {mesa.numero}</p>
                                    <p className="font-black text-yellow-300">{formatCOP(valor)}</p>
                                </div>
                                <div className="bp-report-progress-track h-3 rounded-full">
                                    <div
                                        className="h-3 rounded-full"
                                        style={{ width: `${porcentaje}%`, backgroundColor: COLORES_GRAFICAS[index % COLORES_GRAFICAS.length] }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function ListaProductos({ productosTop, formatCOP }) {
    const maxProducto = Math.max(...productosTop.map((producto) => Number(producto.totalRecaudado || 0)), 0)

    return (
        <div className="bp-report-panel rounded-[1.75rem] p-5">
            <div className="mb-4">
                <h2 className="text-xl font-black text-white">Productos más vendidos</h2>
                <p className="text-sm text-gray-500">Útil para reponer inventario y detectar favoritos.</p>
            </div>

            {productosTop.length === 0 ? (
                <div className="bp-report-empty rounded-3xl p-8 text-center text-gray-500">
                    No hay productos vendidos en este periodo.
                </div>
            ) : (
                <div className="space-y-3">
                    {productosTop.map((producto, index) => {
                        const valor = Number(producto.totalRecaudado || 0)
                        const porcentaje = maxProducto > 0 ? Math.max(5, Math.round((valor / maxProducto) * 100)) : 0
                        const color = COLORES_GRAFICAS[index % COLORES_GRAFICAS.length]

                        return (
                            <div key={`${producto.nombre}-${index}`} className="bp-report-ranking-item rounded-3xl p-4">
                                <div className="mb-3 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="grid h-9 w-9 place-items-center rounded-2xl font-black text-gray-950"
                                            style={{ backgroundColor: color }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{producto.nombre}</p>
                                            <p className="text-sm text-gray-500">{producto.cantidadVendida} unidad{Number(producto.cantidadVendida) === 1 ? "" : "es"}</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-yellow-300">{formatCOP(valor)}</p>
                                </div>
                                <div className="bp-report-progress-track h-2 rounded-full">
                                    <div className="h-2 rounded-full" style={{ width: `${porcentaje}%`, backgroundColor: color }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Reportes
