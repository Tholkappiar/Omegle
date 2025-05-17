import { ArrowRight, PhoneOff } from "lucide-react";

type ControlsProps = {
    isCallActive: boolean;
    onEndCall: () => void;
    onNextCall: () => void;
};

export const Controls = ({
    isCallActive,
    onEndCall,
    onNextCall,
}: ControlsProps) => {
    return (
        <div className="flex gap-6 px-8 rounded-3xl justify-center py-1 my-4">
            <button
                onClick={onNextCall}
                disabled={!isCallActive}
                className={`rounded-full w-12 h-12 flex items-center justify-center border shadow-lg text-white transition
                    ${
                        isCallActive
                            ? "bg-green-600"
                            : "bg-gray-400 cursor-not-allowed opacity-50"
                    }`}
            >
                <ArrowRight className="w-5 h-5" />
            </button>
            <button
                onClick={onEndCall}
                disabled={!isCallActive}
                className={`rounded-full w-12 h-12 flex items-center justify-center border shadow-lg text-white transition
                    ${
                        isCallActive
                            ? "bg-red-500"
                            : "bg-gray-400 cursor-not-allowed opacity-50"
                    }`}
            >
                <PhoneOff className="w-5 h-5" />
            </button>
        </div>
    );
};
