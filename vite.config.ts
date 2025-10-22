import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // Allow binding to any local host/interface so you can use a custom virtual host
    // Example: map 'apollo.test' to 127.0.0.1 in your hosts file and run the dev server
    host: true,
    port: 8080,
    // Explicitly allow the custom virtual host used for local testing
    // Add other hosts here if you map additional virtual hosts in your hosts file
    allowedHosts: ['apollo.test'],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
