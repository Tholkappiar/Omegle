import React, { useState } from "react";
import { authClient } from "../../lib/auth-client";

const AuthForm: React.FC = () => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(import.meta.env.VITE_API_URL);

        if (mode === "login") {
            await authClient.signIn.email({ email, password });
        } else {
            await authClient.signUp.email({ email, password, name });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    {mode === "login" ? "Welcome Back" : "Create an Account"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            required
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                    >
                        {mode === "login" ? "Login" : "Sign Up"}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    {mode === "login" ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("signup")}
                                className="text-blue-600 hover:underline"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className="text-blue-600 hover:underline"
                            >
                                Log in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
