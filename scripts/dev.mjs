import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = ["@quattro-kong/backend", "@quattro-kong/frontend"].map((workspace) =>
  spawn(npm, ["run", "dev", "--workspace", workspace, ...process.argv.slice(2)], { stdio: "inherit" }),
);

const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((child) => child.on("exit", (code) => {
  stop();
  process.exitCode = code ?? 0;
}));
