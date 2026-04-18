import { Navigate } from "react-router-dom"

function PrivateRoute(props){

    const token = localStorage.getItem("token")
    
    return token ? props.children : <Navigate to="/login" />
    
}
export default PrivateRoute