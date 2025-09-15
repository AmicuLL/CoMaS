import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  server: {
    /*https: {
      key: fs.readFileSync("./certificate/privkey.pem"),
      cert: fs.readFileSync("./certificate/fullchain.pem"),
    },
    host: "a****.****.***", //YOUR_DOMAIN
    port: 443,*/
  },
  plugins: [react()],
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
});
