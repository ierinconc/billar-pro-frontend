import Logo from "../components/Logo"
import MesaCard from "../components/MesaCard"

function Dashboard(){
    return(
        <div className="flex h-screen bg-gray-900">
            <div className="w-64 bg-gray-800 p-6">
                <Logo/>
                <nav className="mt-8 flex flex-col gap-2">
                    <button className="text-left px-4 py-3 text-yellow-400 bg-gray-700 rounded-lg">
                        Dashboard
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
                    <h1 className="text-white text-3x1 font-bold mb-8">Tus mesas</h1>
                    <div className="grid grid-cols-4 gap-6">
                        <MesaCard numero={1} precio={8000}/>
                        <MesaCard numero={2} precio={10000}/>
                        <MesaCard numero={3} precio={8000}/>
                        <MesaCard numero={4} precio={12000}/>
                    </div>
                </div>

            </div>
        </div>

    )
}

export default Dashboard    