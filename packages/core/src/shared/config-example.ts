export namespace Config {
    // Helper function to safely retrieve required environment variables on the backend
    const getEnvOrThrow = (key: string): string => {
        if (typeof process === "undefined" || !process.env) {
            throw new Error(`Environment configuration is only available in a Node.js/Server environment (attempted to read "${key}").`);
        }
        const value = process.env[key];
        if (!value) {
            throw new Error(`Required environment variable "${key}" is not set.`);
        }
        return value;
    };

    // Retrieve contract settings from environment variables safely
    export const CONTRACT_ADDRESS = getEnvOrThrow("CONTRACT_ADDRESS");
    export const API_NETWORK_URL = getEnvOrThrow("API_NETWORK_URL");
    export const PRIVATE_KEY = getEnvOrThrow("PRIVATE_KEY");

    // Optional URL configuration helper for local frontend or integrations
    export const API_BACKEND_URL_BASE = typeof process !== "undefined" && process.env 
        ? process.env.API_BACKEND_URL_BASE || "" 
        : "";
}