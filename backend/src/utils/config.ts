interface Config {
    PORT: number;
    ENVIRONMENT: string;
    FRONTEND_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: number;
    SMTP_USER: string;
    SMTP_PASS: string;
}

function getEnvVar(name: string, fallback = ""): string {
    const value = process.env[name];
    if (!value) {
        console.warn(
            `Environment variable ${name} is not set. Using fallback: "${fallback}"`
        );
    }
    return value || fallback;
}

export const CONFIG: Config = {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    ENVIRONMENT: process.env.NODE_ENV || "development",
    FRONTEND_URL:
        process.env.NODE_ENV === "production"
            ? getEnvVar("PROD_FRONTEND_URL", "https://yourapp.com")
            : getEnvVar("LOCAL_FRONTEND_URL", "http://localhost:5173"),
    SMTP_HOST: getEnvVar("SMTP_HOST"),
    SMTP_PORT: parseInt(getEnvVar("SMTP_PORT", "587")),
    SMTP_USER: getEnvVar("SMTP_USER"),
    SMTP_PASS: getEnvVar("SMTP_PASS"),
};
