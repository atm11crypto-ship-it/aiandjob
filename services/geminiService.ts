import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PredictionData, JobInput } from "../types";

/* const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); */

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    predictions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          industry: { type: Type.STRING },
          country: { type: Type.STRING },
          role: { type: Type.STRING },
          jobDescription: { type: Type.STRING, description: "A one-sentence description of the job." },
          predictionDate: { type: Type.STRING, description: "Predicted replacement date in YYYY-MM format." },
          confidence: { type: Type.STRING, description: "Confidence level of prediction (e.g., '85%' or 'High')." },
          replacementTechnology: { type: Type.STRING, description: "What technology or AI system will replace it." },
          transferableSkills: { type: Type.STRING, description: "Comma-separated list of skills useful for future roles." },
          futureJob: { type: Type.STRING, description: "A recommended job role to aim for." },
          stepsToStart: { type: Type.STRING, description: "3 actionable steps to start transitioning into the future job." },
        },
        required: [
          "industry",
          "country",
          "role",
          "jobDescription",
          "predictionDate",
          "confidence",
          "replacementTechnology",
          "transferableSkills",
          "futureJob",
          "stepsToStart",
        ],
      },
    },
  },
  required: ["predictions"],
};

export const generatePrediction = async (input: JobInput): Promise<PredictionData[]> => {
  const prompt = `
    Analyze the following job role specifically:
    Industry: ${input.industry}
    Country: ${input.country}
    Role: ${input.role}

    Provide a detailed prediction about when this specific role might be significantly impacted or replaced by AI/automation in this specific market.
    Be realistic based on current technological trends.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    return data.predictions || [];
  } catch (error) {
    console.error("Error generating prediction:", error);
    throw new Error("Failed to generate prediction. Please try again.");
  }
};

export const generateBulkPredictions = async (industry: string): Promise<PredictionData[]> => {
    const prompt = `
      Identify 5 common job roles in the "${industry}" industry that are at high risk of automation or AI displacement in the next 10 years.
      Provide predictions for each. Assumed context is global or major tech hubs if unspecified.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });
  
      const text = response.text;
      if (!text) return [];
  
      const data = JSON.parse(text);
      return data.predictions || [];
    } catch (error) {
      console.error("Error generating bulk predictions:", error);
      throw new Error("Failed to generate predictions.");
    }
  };