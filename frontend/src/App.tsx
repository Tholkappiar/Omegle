import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Omegle from "./components/Omegle";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthForm />}></Route>
                <Route path="/omegle" element={<Omegle />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
