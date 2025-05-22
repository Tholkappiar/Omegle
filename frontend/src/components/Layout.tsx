import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div className="h-screen w-screen flex flex-col">
            <div>
                <Toaster position="top-right" />
            </div>
            <Outlet />
        </div>
    );
};

export default Layout;
