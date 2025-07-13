// src/plugins/ai-router.ts
import type { FastifyPluginAsync } from "fastify";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import Data from "../assets/data.json";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const model = anthropic("claude-3-5-haiku-latest");

const prompt = `You are AI Cyber Crime Investigator. You are given a list of messages and you need to analyze them and assist the user with their queries.`;

const aiRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/ai", async (req, reply) => {
    const body =
      typeof req.body === "object" && req.body !== null
        ? (req.body as { messages?: unknown })
        : {};

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: JSON.stringify(Data),
          },
        ];

    reply.header("X-Vercel-AI-Data-Stream", "v1");
    reply.header("Content-Type", "text/plain; charset=utf-8");

    const result = streamText({
      model,
      messages,
      onError: (error) => {
        console.error(error);
      },
    });

    return reply.send(result.toDataStream());
  });
};

export default aiRouter;
