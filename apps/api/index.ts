import app from "./app";

export type ApiType = typeof app;

export default {
    port: 3001,
    fetch: app.fetch,
} 