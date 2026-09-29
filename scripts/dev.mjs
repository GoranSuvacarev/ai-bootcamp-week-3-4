import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const backendPath = fileURLToPath(new URL("../backend/src/index.mjs", import.meta.url));
const vitePath = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const frontendPath = fileURLToPath(new URL("../frontend/", import.meta.url));
const children = [
  spawn(process.execPath, [backendPath], { stdio: "inherit" }),
  spawn(process.execPath, [vitePath, ...process.argv.slice(2)], { stdio: "inherit", cwd: frontendPath }),
];

const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) => child.on("exit", (code) => {
  stop();
  process.exitCode = code ?? 0;
}));
