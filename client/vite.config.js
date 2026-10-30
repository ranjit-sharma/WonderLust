import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Express runs on 8080; proxying keeps the session cookie same-origin in dev.
    proxy: { "/api": "http://localhost:8080" },
  },
});
