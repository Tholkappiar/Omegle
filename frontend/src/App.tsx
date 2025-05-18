import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import { Communication } from "./components/Communication";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthForm />}></Route>
                <Route path="/omegle" element={<Communication />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
