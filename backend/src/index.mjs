import { createHintServer } from "./hint.mjs";

const port = 3001;
const server = createHintServer();

server.listen(port, "127.0.0.1", () => {
  console.log(`AI coach API ready at http://127.0.0.1:${port}`);
});
