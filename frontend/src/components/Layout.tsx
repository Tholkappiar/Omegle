import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div className="h-screen w-screen flex flex-col">
            <Outlet />
        </div>
    );
};

export default Layout;
