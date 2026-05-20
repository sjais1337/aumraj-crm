export default function Loader(){
    return ( 
        <div className="flex items-center justify-center w-full h-screen">
            <div className="relative w-5 h-5 bg-blue rounded-full animate-dot-flashing-delay">
            <div className="absolute top-0 left-[-30px] w-5 h-5 bg-blue rounded-full animate-dot-flashing-before"></div>
            <div className="absolute top-0 left-[30px] w-5 h-5 bg-blue rounded-full animate-dot-flashing-after"></div>
            </div>
        </div>
    )
}