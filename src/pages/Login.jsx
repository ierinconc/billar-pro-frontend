import InputField from "../components/InputField"
import Logo from "../components/Logo"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


function Login(){

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleLogin = async () => {
    console.log("Click en iniciar sesión");
    console.log("Username:", username);
    console.log("Password:", password);

    try {
        const respuesta = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        console.log("Status HTTP:", respuesta.status);
        console.log("¿Respuesta OK?:", respuesta.ok);

        const token = await respuesta.text();
        console.log("Respuesta del backend:", token);

        if (respuesta.ok) {
            localStorage.setItem("token", token);
            console.log("Token guardado en localStorage");
            navigate("/dashboard")
        } else {
            console.error("Login falló. Mensaje del backend:", token);
        }

    } catch (error) {
        console.error("Error al conectar con el backend:", error);
    }
};


    return(
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            {/* Tarjeta centrada */}
            <div className="flex w-4/5 h-[600px] rounded-2xl overflow-hidden shadow-2xl">

                {/* Columna izquierda */}
                <div 
                className="w-2/3 relative"
                style={{
                    backgroundImage: "url('/fondoLogin.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
                >
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"></div>
                    
                    {/* Texto encima de la imagen */}
                    <div className="absolute inset-0 flex flex-col justify-between p-12">
                        {/* Logo arriba */}
                        <div>
                            <h3 className="text-white font-bold text-xl"><Logo/></h3>
                        </div>
                        
                        {/* Texto abajo */}
                        <div>
                            <h2 className="text-white text-5xl font-bold mb-4">
                                La Excelencia en el <br/>
                                <span className="text-yellow-400">Salón de Billar.</span>
                            </h2>
                            <p className="text-gray-300 text-4x1">
                                Accede a la plataforma de gestión más exclusiva. 
                                Precisión, control y elegancia en cada partida.
                            </p> 
                        </div>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="w-1/3 bg-gray-800 flex flex-col justify-center px-12">
                    <h1 className="text-white text-3xl font-bold mb-2">Bienvenido</h1>
                    <p className="text-gray-400 mb-8">Identifícate para continuar al salón.</p>
                    
                    <label className="text-yellow-400 text-sm mb-1">USUARIO</label>
                    <InputField type="text" placeholder="Tu nombre de usuario" value={username} onChange={(e)=> setUsername(e.target.value)}  />
                    
                    <label className="text-yellow-400 text-sm mt-4 mb-1">CONTRASEÑA</label>
                    <InputField type="password" placeholder="••••••••" value={password} onChange={(e)=> setPassword(e.target.value)} />
                    
                    <button onClick={handleLogin} className="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-lg mt-6 hover:bg-yellow-300">
                        INICIAR SESIÓN
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Login