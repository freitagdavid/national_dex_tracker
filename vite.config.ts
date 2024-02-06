import path from "path";
import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    base: "https://freitagdavid.github.io/national_dex_tracker/",
    plugins: [
        react({
            babel: {
                plugins: [jotaiDebugLabel, jotaiReactRefresh],
                presets: ["jotai/babel/preset"],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
