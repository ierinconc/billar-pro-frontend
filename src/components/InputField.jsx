function InputField(props){
    return(
        <input type={props.type} 
        placeholder ={props.placeholder} 
        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400"
        />
    )
}

export default InputField