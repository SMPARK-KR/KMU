const API_KEY = process.env.AIRKOREA_API_KEY;
const decodeKey = decodeURIComponent(API_KEY);
const BASE_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

async function test() {
  console.log('Using API Key (first 10):', API_KEY?.substring(0, 10));
  console.log('Using Decoded Key (first 10):', decodeKey?.substring(0, 10));

  const sidoName = '서울';
  const keys = [API_KEY, decodeKey];

  for (const key of keys) {
    if (!key) continue;
    console.log(`\n--- Testing with key ---`);
    const url = `${BASE_URL}/getCtprvnRltmMesureDnsty?serviceKey=${key}&returnType=json&numOfRows=1&pageNo=1&sidoName=${encodeURIComponent(sidoName)}&ver=1.0`;
    
    try {
      console.log('Fetching from:', url);
      const response = await fetch(url);
      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Response (first 300 chars):', text.substring(0, 300));
      
      try {
        const json = JSON.parse(text);
        console.log('Body JSON header:', json.response?.header);
        if (json.response?.body?.items) {
          console.log('Success! Found item:', json.response.body.items[0]);
        }
      } catch (e) {
        console.log('Note: Response is not JSON.');
        if (text.includes('SERVICE_KEY_IS_NOT_REGISTERED_ERROR')) {
          console.error('ERROR: API Key is not registered or invalid.');
        } else if (text.includes('LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDED_ERROR')) {
          console.error('ERROR: Daily quota exceeded.');
        }
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

test();
