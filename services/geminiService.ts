
import { GoogleGenAI } from "@google/genai";
import { Nomination, Position, Member } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getDashboardInsights(nominations: Nomination[], positions: Position[], members: Member[]) {
    const prompt = `
      You are an Elections Committee AI assistant for Rotaract Club of Westlands.
      Current Data:
      - Total Members: ${members.length}
      - Total Nominations: ${nominations.length}
      - Positions to Fill: ${positions.length}

      Rules:
      - Each candidate needs at least 2 nominations (1 extra if self-nominated).
      - President-Nominee (PN) and President-Nominee Designate (PND) are critical pipeline roles.

      Analyze the current status and provide 3-4 bullet points of high-level strategic insights for the elections committee.
      Focus on gaps, trends, or potential leadership bottlenecks.
      Keep it professional, concise, and helpful.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Unable to generate insights at this time. Please check your data manually.";
    }
  }
}

export const geminiService = new GeminiService();
