import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const API_KEY = process.env.AIRKOREA_API_KEY;
const decodeKey = decodeURIComponent(API_KEY);
const BASE_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

async function test() {
  console.log('Using API Key:', API_KEY);
  console.log('Using Decoded Key:', decodeKey);

  const sidoName = '서울';
  // Try both encoded and decoded keys just in case
  const keys = [API_KEY, decodeKey];

  for (const key of keys) {
    console.log(`\nTesting with key: ${key.substring(0, 10)}...`);
    const url = `${BASE_URL}/getCtprvnRltmMesureDnsty?serviceKey=${key}&returnType=json&numOfRows=1&pageNo=1&sidoName=${encodeURIComponent(sidoName)}&ver=1.0`;
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Response (first 500 chars):', text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log('Success! Header:', json.response?.header);
        if (json.response?.body?.items) {
          console.log('Item found:', json.response.body.items[0]);
        }
      } catch (e) {
        console.log('Failed to parse as JSON.');
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

test();
