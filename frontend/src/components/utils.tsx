import toast from "react-hot-toast";

export function showToast(message: string) {
    toast.custom((t) => {
        t.duration = 8000;
        return (
            <div
                className={`${
                    t.visible ? "animate-enter" : "animate-leave"
                } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-purple-500 ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 pt-0.5">
                            <p className="text-2xl font-DynaPuff bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                b
                            </p>
                        </div>
                        <div className="ml-3 flex items-center">
                            <p className="text-sm text-gray-500">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-purple-300">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    });
}
