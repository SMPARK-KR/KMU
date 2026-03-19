import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOCK_DATA } from "./mockData";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const MODELS = ["gemini-flash-latest", "gemini-pro-latest"];

export async function fetchNationalData() {
  const prompt = `대한민국 주요 도시(서울, 부산, 인천, 대구, 광주)의 현재 날씨와 미세먼지(PM10, PM2.5) 데이터를 생성해 주세요. 
  응답은 반드시 다음과 같은 JSON 형식이어야 합니다:
  [
    { "city": "서울", "temp": 12, "pm10": 35, "pm25": 18, "status": "좋음" },
    ...
  ]`;

  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    let delay = INITIAL_BACKOFF_MS;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`Fetching data from ${modelName} (Attempt ${attempt + 1})`);
        
        // Add a 15-second timeout to the generateContent call
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("API Timeout")), 15000)
        );
        
        const resultPromise = model.generateContent(prompt);
        const result = await Promise.race([resultPromise, timeoutPromise]) as any;
        
        const response = await result.response;
        const text = response.text();
        
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid response format");
      } catch (error: any) {
        const isRetriable = error.message?.includes("503") || 
                          error.message?.includes("429") || 
                          error.message?.includes("Service Unavailable") ||
                          error.message?.includes("API Timeout");
        
        if (isRetriable && attempt < MAX_RETRIES - 1) {
          console.warn(`Retryable error on ${modelName}: ${error.message}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }

        if (error.message?.includes("429")) {
          console.warn(`[Quota Exceeded] Switching to mock data for ${modelName}.`);
        } else {
          console.error(`[API Error] ${modelName}:`, error.message);
        }
        break; 
      }
    }
  }

  // Gracefully return mock data without a loud console.error
  return MOCK_DATA;
}
