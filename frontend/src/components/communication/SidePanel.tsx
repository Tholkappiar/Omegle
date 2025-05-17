import type { ChangeEvent } from "react";
import type { RequestData } from "./types";

type SidePanelProps = {
    userData: RequestData;
    onDataChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const SidePanel = ({ userData, onDataChange }: SidePanelProps) => {
    return (
        <div className="w-1/3 flex flex-col items-center justify-center bg-white gap-4">
            <input
                className="p-2 border border-black rounded-xl"
                placeholder="Getting your Name ..."
                disabled
                name="user"
                value={userData.user}
                onChange={onDataChange}
                type="text"
            />
            {userData.partner && (
                <div className="text-sm text-gray-600">
                    Connected with: {userData.partner}
                </div>
            )}
        </div>
    );
};
