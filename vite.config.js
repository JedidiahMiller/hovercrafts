import checker from "vite-plugin-checker";
import path from "path";

export default {
  plugins: [
    checker({
      typescript: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
