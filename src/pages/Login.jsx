import InputField from "../components/InputField"

function Login(){
    return(
        <div>
            <h1>Bienvenidos</h1>
            <InputField type="text" placeholder="Ingrese su usuario " />
            <InputField type="password" placeholder="Ingrese la contraseña"/>
        </div>
    )
}

export default Login