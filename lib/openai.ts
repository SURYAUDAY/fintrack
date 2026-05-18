import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("OPENAI_API_KEY is not set — AI features will fail.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = "gpt-4o-mini";
