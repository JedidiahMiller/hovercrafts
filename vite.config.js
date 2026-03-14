import checker from "vite-plugin-checker";
import path from "path";
import compression from "compression";

export default {
  plugins: [
    checker({
      typescript: true,
    }),
    {
      name: "dev-compression",
      configureServer(server) {
        server.middlewares.use(compression());
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    minify: "esbuild",
    target: "esnext",
  },
};
