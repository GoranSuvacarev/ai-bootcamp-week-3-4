import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiPath = fileURLToPath(new URL("./index.mjs", import.meta.url));
const vitePath = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const api = spawn(process.execPath, [apiPath], { stdio: "inherit" });
const client = spawn(process.execPath, [vitePath, ...process.argv.slice(2)], { stdio: "inherit" });

const stop = () => {
  api.kill();
  client.kill();
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
api.on("exit", (code) => {
  client.kill();
  process.exitCode = code || 0;
});
client.on("exit", (code) => {
  api.kill();
  process.exitCode = code || 0;
});
