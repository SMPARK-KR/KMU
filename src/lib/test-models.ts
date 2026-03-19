import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = value;
      }
    }
  }
}

async function listAllModels() {
  loadEnv();
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const resultsFile = path.resolve(process.cwd(), "model-test-results.txt");
  let results = "Testing models...\n";

  if (!apiKey) {
    fs.writeFileSync(resultsFile, "GEMINI_API_KEY not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const testModels = [
    "gemini-1.5-flash", 
    "gemini-1.5-flash-latest", 
    "gemini-1.5-pro", 
    "gemini-1.5-pro-latest", 
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-1.0-pro"
  ];

  for (const m of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("hi");
      await result.response;
      results += `VALID: ${m}\n`;
    } catch (e: any) {
      results += `INVALID/BUSY: ${m} - ${e.message}\n`;
    }
  }
  fs.writeFileSync(resultsFile, results);
  console.log("Done. Results in model-test-results.txt");
}

listAllModels();
