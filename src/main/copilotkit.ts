import { createServer } from "node:http";
import {
  CopilotRuntime,
  copilotRuntimeNodeHttpEndpoint,
  OpenAIAdapter,
} from "@copilotkit/runtime";
import process from "node:process";
import OpenAI from "openai";

export function startCopilotKitServer() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const serviceAdapter = new OpenAIAdapter({ openai: openai });

  const server = createServer((req, res) => {
    const runtime = new CopilotRuntime({
      remoteEndpoints: [
        { url: "http://localhost:80/chat/tools" },
      ],
    });

    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: "/chat/copilotkit",
      runtime,
      serviceAdapter,
    });

    return handler(req, res);
  });

  server.listen(5175, () => {
    console.log("Listening at http://localhost:5175/chat/copilotkit");
  });
}
