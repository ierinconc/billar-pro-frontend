function Logo(){
    return (
        <div className="flex items-center gap-2">
            <svg width="40" height="16" viewBox="0 0 40 16">
                <circle cx="8" cy="8" r="7" fill="#ef4444"/>
                <circle cx="20" cy="8" r="7" fill="#eab308"/>
                <circle cx="32" cy="8" r="7" fill="#22c55e"/>
            </svg>
            <span className="text-white font-bold text-2xl">BillarPro</span>
        </div>
    )
}

export default Logo