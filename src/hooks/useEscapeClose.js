import { useEffect } from "react"

function useEscapeClose(onClose, enabled = true) {
    useEffect(() => {
        if (!enabled || typeof onClose !== "function") return

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault()
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose, enabled])
}

export default useEscapeClose
