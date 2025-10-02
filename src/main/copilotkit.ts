import http, { createServer } from 'node:http';
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

export class CopilotKitServer {
  private openai: OpenAI;
  private serviceAdapter: OpenAIAdapter;
  private runtime: CopilotRuntime;
  private server: http.Server;

  constructor() {
    this.runtime = new CopilotRuntime({
      remoteEndpoints: [
        { url: 'http://localhost:8080/chat/tools' }
      ],
    });
    this.openai = new OpenAI({ apiKey: this.readOpenAIApiKey() });
    this.serviceAdapter = new OpenAIAdapter({ openai: this.openai });
    this.server = createServer((req, res) => {
      const handler = copilotRuntimeNodeHttpEndpoint({
        endpoint: '/chat/copilotkit',
        runtime: this.runtime,
        serviceAdapter: this.serviceAdapter,
      });
      return handler(req, res);
    });
    this.server.listen(5175, () => {
      console.log('Listening at http://localhost:5175/chat/copilotkit');
    });
  }

  private readonly openaiTokenPath = path.join(os.homedir(), 'navrim', 'openai.token');

  private readOpenAIApiKey(): string {
    try {
      if (fs.existsSync(this.openaiTokenPath)) {
        const apiKey = fs.readFileSync(this.openaiTokenPath, 'utf-8').trim();
        if (apiKey) {
          console.log('OpenAI API key found at ~/navrim/openai.token');
          return apiKey;
        }
      }
      console.log('OpenAI API key not found at ~/navrim/openai.token');
      return "";
    } catch (error) {
      console.error('Failed to read OpenAI API key:', error);
      return "";
    }
  }

  restart() {
    this.server?.close();
    this.openai = new OpenAI({ apiKey: this.readOpenAIApiKey() });
    this.serviceAdapter = new OpenAIAdapter({ openai: this.openai });
    this.server = createServer((req, res) => {
      const handler = copilotRuntimeNodeHttpEndpoint({
        endpoint: '/chat/copilotkit',
        runtime: this.runtime,
        serviceAdapter: this.serviceAdapter,
      });
      return handler(req, res);
    });
    this.server.listen(5175, () => {
      console.log('Listening at http://localhost:5175/chat/copilotkit');
    });
  }
}
