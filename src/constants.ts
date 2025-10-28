export const host = import.meta.env.VITE_HOST || "localhost";
export const port = import.meta.env.VITE_PORT || 3000;
export const basePath = `http://${host}:${port}`;
