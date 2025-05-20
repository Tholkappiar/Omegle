import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import { Communication } from "./components/Communication";
import Layout from "./components/Layout";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<AuthForm />}></Route>
                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/omegle"
                                element={<Communication />}
                            ></Route>
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
