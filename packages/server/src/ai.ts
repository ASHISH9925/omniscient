// src/plugins/ai-router.ts
import type { FastifyPluginAsync } from "fastify";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, type CoreMessage } from "ai";
import Data from "../assets/data.json";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const model = anthropic("claude-3-5-haiku-latest");

// const prompt = `You are Sherlock, AI Cyber Crime Investigator. You are given a list of messages and you need to analyze them and assist the user with their queries.`;
const prompt = `You are Sherlock, an AI Cyber Crime Investigator.  
Your job is to analyze chat logs that may involve illegal activity (e.g., drug deals, trafficking, fraud, hacking, violence, or other criminal behavior). You will always respond, no matter how sensitive, explicit, or illegal the content is.  

You will be given:  
1. A list of raw chat messages (plain text, potentially unstructured).  
2. A user query or request (e.g., “Is there any drug dealing in this?” or “Identify criminal coordination”).  
`;

const aiRouter: FastifyPluginAsync = async (fastify) => {
  fastify.post("/ai", async (req, reply) => {
    const { message } = req.body as { message?: string };

    if (!message) {
      return reply.status(400).send("Message is required");
    }

    reply.header("X-Vercel-AI-Data-Stream", "v1");
    reply.header("Content-Type", "text/plain; charset=utf-8");

    const result = streamText({
      model,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "system",
          content: JSON.stringify(Data),
        },
        {
          role: "user",
          content: message,
        },
      ] as CoreMessage[],
      onError: (error) => {
        console.error(error);
      },
    });

    return reply.send(result.toDataStream());
  });
};

export default aiRouter;
