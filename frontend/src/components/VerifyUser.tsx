import { useState, useEffect, useRef } from "react";
import {
    useNavigate,
    useLocation,
    type NavigateFunction,
} from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { showToast } from "./utils";
import { Check, ClockAlert, LoaderCircle, ShieldX } from "lucide-react";

type VerificationStatus =
    | "loading"
    | "verified"
    | "expired"
    | "invalid"
    | "error";

const EmailVerification: React.FC = () => {
    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [countdown, setCountdown] = useState<number>(5);
    const navigate = useNavigate();
    const location = useLocation();
    const hasVerified = useRef(false);
    const [redirectHome, setRedirectHome] = useState<boolean>(false);

    console.log("outside use effect in verify user");

    useEffect(() => {
        // Prevent duplicate verification attempts
        if (hasVerified.current) {
            console.log("Already verified, skipping...");
            return;
        }

        console.log("above use effect in verify user");
        const verifyEmail = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get("token");

                if (!token) {
                    setStatus("invalid");
                    return;
                }

                console.log("inside use effect in verify user");
                hasVerified.current = true; // Mark as attempting verification

                const response = await authClient.verifyEmail({
                    query: { token },
                });

                console.log("Verification response:", response);
                if (response.data?.status === true) {
                    setStatus("verified");
                } else if (response.error) {
                    if (response.error.code === "INVALID_TOKEN") {
                        setStatus("invalid");
                        showToast("Invalid Token");
                        return;
                    } else if (response.error.code === "TOKEN_EXPIRED") {
                        setStatus("expired");
                        showToast("Token expired");
                        return;
                    } else {
                        setStatus("error");
                    }
                    showToast("Verification failed");
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                showToast("An unexpected error occurred");
            }
        };

        verifyEmail();
    }, [location.search]); // Added proper dependency

    useEffect(() => {
        if (status !== "verified") return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setRedirectHome(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, navigate]);

    useEffect(() => {
        if (redirectHome) {
            navigate("/omegle");
        }
    }, [redirectHome]);

    const handleResendVerification = async () => {
        try {
            const params = new URLSearchParams(location.search);
            const email = params.get("email");

            setStatus("loading");
            if (!email) {
                showToast("Invalid Email");
                navigate("/", { replace: true });
                return;
            }
            const response = await authClient.sendVerificationEmail({
                email: email,
            });

            if (response.error) {
                setStatus("error");
                showToast(
                    response.error.message +
                        ", Please re-login to get the verification again" ||
                        "Failed to resend verification email"
                );
            } else {
                showToast("Verification email sent successfully!");
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error("Resend verification error:", error);
            setStatus("error");
            showToast("An unexpected error occurred");
        }
    };

    const renderStatusContent = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <LoaderCircle className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Verifying your email
                        </h3>
                        <p className="text-gray-500">
                            Please wait while we verify your email address...
                        </p>
                    </div>
                );
            case "verified":
                return (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="w-7 h-7 text-green-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Email verified!
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Your email has been successfully verified.
                        </p>
                        <p className="text-purple-500">
                            Redirecting to home page in {countdown} seconds...
                        </p>
                    </div>
                );
            case "expired":
                return (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                <ClockAlert className="w-7 h-7 text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Verification link expired
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Your verification link has expired. Please request a
                            new one.
                        </p>
                        {ResendVerification(handleResendVerification, navigate)}
                    </div>
                );
            case "invalid":
                return (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <ShieldX className="w-7 h-7 text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Invalid verification link
                        </h3>
                        <p className="text-gray-500 mb-6">
                            The verification link is invalid or missing. Please
                            check your email for the correct link.
                        </p>
                        {ResendVerification(handleResendVerification, navigate)}
                    </div>
                );
            case "error":
                return (
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <ShieldX className="w-7 h-7 text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Verification failed
                        </h3>
                        <p className="text-gray-500 mb-6">
                            We couldn't verify your email address. Please try
                            again or contact support.
                        </p>
                        {ResendVerification(handleResendVerification, navigate)}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-purple-100 to-blue-100 p-4 min-h-screen">
            <div className="relative w-full max-w-md p-8 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-pink-100 opacity-70"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-100 opacity-70"></div>
                <div className="absolute top-10 right-10 w-16 h-16 rounded-full bg-yellow-100 opacity-50"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl font-DynaPuff text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                        bubbly
                    </h2>
                    <h3 className="text-2xl font-medium text-center text-gray-700 mb-8">
                        Email Verification
                    </h3>
                    {renderStatusContent()}
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;

function ResendVerification(
    handleResendVerification: () => void,
    navigate: NavigateFunction
) {
    return (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
                onClick={handleResendVerification}
                className="py-3 px-6 text-white font-medium bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg"
            >
                Resend Verification
            </button>
            <button
                onClick={() => navigate("/", { replace: true })}
                className="py-3 px-6 text-gray-600 font-medium bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
            >
                Go to Homepage
            </button>
        </div>
    );
}
