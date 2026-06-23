import { createContext, useContext, useEffect, useMemo, useState } from "react"

const ThemeContext = createContext(null)
const STORAGE_KEY = "billarpro-theme"

function getInitialTheme() {
    if (typeof window === "undefined") return "dark"
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark") return saved
    return "dark"
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        document.documentElement.style.colorScheme = theme
        window.localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const value = useMemo(() => ({
        theme,
        isLight: theme === "light",
        toggleTheme: () => setTheme((current) => current === "dark" ? "light" : "dark"),
        setTheme
    }), [theme])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme debe usarse dentro de ThemeProvider")
    }
    return context
}
