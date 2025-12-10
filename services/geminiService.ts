import { GoogleGenAI, Type } from "@google/genai";
import { AIPersona, SimulationScenario } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Standard Analysis - Optimized for speed
export const analyzeData = async (fileContent: string, fileName: string): Promise<any> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Identity: You are The Prism Nexus Intelligence.
      Task: Rapidly analyze the provided data snippet from "${fileName}".
      
      Return a JSON object with:
      1. summary: A concise executive summary (max 30 words).
      2. keyTrends: 3 major trends.
      3. outliers: Any detected anomalies.
      4. metrics: Up to 5 key metrics found (label, value, change).
      5. suggestedActions: 3 strategic recommendations.
      
      Data:
      ${fileContent.substring(0, 10000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
            outliers: { type: Type.ARRAY, items: { type: Type.STRING } },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  change: { type: Type.STRING }
                }
              }
            },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Null response from Neural Core");
    return JSON.parse(text);

  } catch (error) {
    console.error("Nexus Analysis Error:", error);
    return null;
  }
};

// Predictive Simulation
export const runSimulation = async (scenario: string, contextData: string): Promise<SimulationScenario | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `
      Identity: You are Prophet, the predictive engine.
      Task: Simulate scenario: "${scenario}".
      Context: ${contextData.substring(0, 8000)}
      
      Output JSON:
      - id: unique hash
      - name: Scenario Codename
      - description: Brief outcome description
      - probability: 0-100
      - impact: 'LOW'|'MEDIUM'|'CRITICAL'|'EXTINCTION_LEVEL'
      - actionPath: 3 steps to mitigate/capitalize.
      - projectedMetrics: 3 changed metrics.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            probability: { type: Type.NUMBER },
            impact: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'CRITICAL', 'EXTINCTION_LEVEL'] },
            actionPath: { type: Type.ARRAY, items: { type: Type.STRING } },
            projectedMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Simulation Failed", e);
    return null;
  }
};

// Search Insights
export const searchInsights = async (query: string, context: string): Promise<string | null> => {
  if (!apiKey) return "Neural Link Offline.";
  try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: `
         You are Echo. Answer using context + web knowledge.
         Context: ${context.substring(0, 10000)}
         Query: "${query}"
       `,
       config: {
         tools: [{ googleSearch: {} }]
       }
     });
     
     // Extract grounding links if available
     const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
     let text = response.text || "No data.";
     
     if (chunks.length > 0) {
        text += "\n\nSources:\n" + chunks.map((c: any) => c.web?.uri).filter(Boolean).join('\n');
     }
     
     return text;
   } catch(e) {
     console.error("Search Error", e);
     return "Search failed.";
   }
};

// URL Analysis - Fixed for better extraction
export const analyzeUrl = async (url: string): Promise<any> => {
    if (!apiKey) return null;

    try {
        const prompt = `
            Task: Search for information about the following URL and provide a structured analysis.
            URL: ${url}
            
            Action:
            1. Use Google Search to find the content, title, and summary of the page at this URL.
            2. If the specific URL content is not directly accessible, search for the title or main topic associated with the URL string to infer context.
            3. Extract key statistics and topics.

            Output strictly raw JSON (no markdown):
            {
                "title": "Page Title",
                "summary": "Executive summary of the content found.",
                "keyStats": [{"label": "Stat Label", "value": "Stat Value"}],
                "topics": ["Topic 1", "Topic 2"]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text || "{}";
        // Clean markdown if present
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("URL Analysis Failed", e);
        return {
            title: "Analysis Failed",
            summary: "Could not retrieve live data for this URL. Ensure the URL is public and valid.",
            keyStats: [],
            topics: ["Connection Error"]
        };
    }
};