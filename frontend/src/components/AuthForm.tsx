import type React from "react";
import { useState, type ChangeEvent } from "react";
import { authClient } from "../../lib/auth-client";
import type { userAuthRequest } from "./communication/types";
import { showToast } from "./utils";
import OTPInput from "./OtpInput";

const AuthForm: React.FC = () => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [isLoading, setIsLoading] = useState(false);
    const [isOTPsection, SetIsOTPsection] = useState<boolean>(false);
    const [authReq, setAuthReq] = useState<userAuthRequest>({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { email } = authReq;
            let response;
            if (mode === "login") {
                response = await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "sign-in",
                });
                console.log(response);
                if (response.data?.success) {
                    if (!response.error) {
                        SetIsOTPsection(true);
                    }
                }
                if (response.error?.message) {
                    showToast(response?.error.message);
                }
            } else {
                const { email, password, name } = authReq;
                if (!name) {
                    console.error("name not provided");
                    return;
                }
                response = await authClient.signUp.email({
                    email,
                    password,
                    name,
                });
                if (!response.error) {
                    showToast(
                        "Verification Email sent, Please verify the Email"
                    );
                    return;
                }
                if (response.error.message) showToast(response?.error.message);
            }
        } catch (error) {
            console.error("Authentication error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setAuthReq((prev) => ({
            ...prev,
            [name]: value.trim(),
        }));
    }

    return isOTPsection ? (
        <OTPInput email={authReq.email} />
    ) : (
        <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-purple-100 to-blue-100 p-4">
            <div className="relative w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Decorative bubbles */}
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-pink-100 opacity-70"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-100 opacity-70"></div>
                <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 opacity-50"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-DynaPuff text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                        bubbly
                    </h2>

                    {/* Mode toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="p-1 bg-gray-100 rounded-full flex w-64">
                            <button
                                onClick={() => setMode("login")}
                                className={`w-1/2 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    mode === "login"
                                        ? "bg-white text-purple-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setMode("signup")}
                                className={`w-1/2 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                                    mode === "signup"
                                        ? "bg-white text-purple-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        {mode === "signup" && (
                            <div className="relative group">
                                <input
                                    type="text"
                                    id="name"
                                    placeholder=" "
                                    value={authReq.name}
                                    required
                                    name="name"
                                    onChange={onChange}
                                    className="peer w-full px-5 py-4 text-gray-700 bg-gray-50 rounded-2xl border-2 border-transparent outline-none transition-all duration-300 focus:border-purple-400 focus:bg-white"
                                />
                                <label
                                    htmlFor="name"
                                    className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 transform
            peer-focus:-translate-y-9 peer-focus:-translate-x-4 peer-focus:text-xs peer-focus:text-purple-500
            ${
                authReq.name
                    ? "-translate-y-9 -translate-x-4 text-xs text-purple-500"
                    : ""
            }
        `}
                                >
                                    Full Name
                                </label>
                            </div>
                        )}

                        <div className="relative group my-6">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder=" "
                                value={authReq.email}
                                required
                                onChange={onChange}
                                className="w-full px-5 py-4 text-gray-700 bg-gray-50 rounded-2xl border-2 border-transparent outline-none transition-all duration-300 focus:border-purple-400 focus:bg-white peer"
                            />
                            <label
                                htmlFor="email"
                                className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 transform
            peer-focus:-translate-y-9 peer-focus:-translate-x-4 peer-focus:text-xs peer-focus:text-purple-500
            ${
                authReq.email
                    ? "-translate-y-9 -translate-x-4 text-xs text-purple-500"
                    : ""
            }
        `}
                            >
                                Email Address
                            </label>
                        </div>
                        {mode === "signup" && (
                            <div className="relative group">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder=" "
                                    value={authReq.password}
                                    required
                                    onChange={onChange}
                                    className="w-full px-5 py-4 text-gray-700 bg-gray-50 rounded-2xl border-2 border-transparent outline-none transition-all duration-300 focus:border-purple-400 focus:bg-white peer"
                                />
                                <label
                                    htmlFor="password"
                                    className={`absolute left-5 top-4 text-gray-400 transition-all duration-300 transform
            peer-focus:-translate-y-9 peer-focus:-translate-x-4 peer-focus:text-xs peer-focus:text-purple-500
            ${
                authReq.password
                    ? "-translate-y-9 -translate-x-4 text-xs text-purple-500"
                    : ""
            }
        `}
                                >
                                    Password
                                </label>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                <span>
                                    {mode === "login" ? "Login" : "Sign Up"}
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center justify-center w-full">
                            <hr className="w-full h-px bg-gray-200 border-0" />
                            <span className="absolute px-3 text-xs font-medium text-gray-500 bg-white">
                                or continue with
                            </span>
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </button>
                            <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.126-5.864 10.126-11.854z" />
                                </svg>
                            </button>
                            <button className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">
                                <svg
                                    className="w-6 h-6 text-gray-700"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm5.144 14.5h-10.288c-.472 0-.856-.384-.856-.856v-6.788c0-.472.384-.856.856-.856h10.288c.472 0 .856.384.856.856v6.788c0 .472-.384.856-.856.856zm-5.144-3.043l-4.671-3.241v.818l4.671 3.241 4.671-3.241v-.818l-4.671 3.241z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
