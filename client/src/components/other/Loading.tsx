export default function Loading() {
    return (

        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">


            <div className="relative flex items-center justify-center">

                <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-brand-orange opacity-20 duration-1000"></span>
                <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-brand-orange opacity-30 delay-150 duration-1000"></span>


                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange shadow-xl shadow-red-200 ring-4 ring-white">

                    <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-white border-t-transparent" />
                </div>
            </div>
            <div className="mt-8 flex flex-col items-center gap-1">
                <h2 className="animate-pulse text-lg font-black tracking-tight text-gray-800">
                    HungryBuy
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    Verifying Access...
                </p>
            </div>
        </div>

    )
}
