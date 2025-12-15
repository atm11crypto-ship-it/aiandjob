export interface PredictionData {
  industry: string;
  country: string;
  role: string;
  jobDescription: string;
  predictionDate: string; // YYYY-MM
  confidence: string; // Percentage or High/Medium/Low
  replacementTechnology: string;
  transferableSkills: string;
  futureJob: string;
  stepsToStart: string;
}

export interface JobInput {
  industry: string;
  country: string;
  role: string;
}