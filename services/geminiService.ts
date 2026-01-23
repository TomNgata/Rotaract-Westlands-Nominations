
import { GoogleGenAI } from "@google/genai";
import { Nomination, Position, Member } from "../types";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  private getClient(): GoogleGenAI | null {
    if (!this.apiKey) return null;
    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    return this.ai;
  }

  async getDashboardInsights(nominations: Nomination[], positions: Position[], members: Member[]) {
    const client = this.getClient();
    if (!client) {
      return "AI Insights unavailable. Please configure VITE_GEMINI_API_KEY in your .env file.";
    }

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
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Unable to generate insights at this time. Please check your network and API quota.";
    }
  }
}

export const geminiService = new GeminiService();
