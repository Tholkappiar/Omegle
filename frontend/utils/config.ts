export const CONFIG = {
    apiUrl: import.meta.env.VITE_API_URL,
    isProd: import.meta.env.MODE === "production",
    isDev: import.meta.env.MODE === "development",
};
