export const CONFIG = {
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    ENVIRONMENT: process.env.NODE_ENV || "development",
    FRONTEND_URL:
        process.env.NODE_ENV === "production"
            ? process.env.PROD_FRONTEND_URL || "https://yourapp.com"
            : process.env.LOCAL_FRONTEND_URL || "http://localhost:5173",
};
