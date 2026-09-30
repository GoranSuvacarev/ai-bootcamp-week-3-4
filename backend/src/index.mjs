import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHintServer } from "./hint.mjs";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envPath)) process.loadEnvFile(envPath);

const port = 3001;
const server = createHintServer();

server.listen(port, "127.0.0.1", () => {
  console.log(`AI coach API ready at http://127.0.0.1:${port}`);
});
