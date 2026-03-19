import { MOCK_DATA } from './mockData';

export interface AirQualityData {
  city: string;
  pm10: number;
  pm25: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  dataTime: string;
  status: string;
}

const API_KEY = process.env.AIRKOREA_API_KEY;
const BASE_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

function getStatus(value: number, type: 'pm10' | 'pm25') {
  if (type === 'pm10') {
    if (value <= 30) return '좋음';
    if (value <= 80) return '보통';
    if (value <= 150) return '나쁨';
    return '매우나쁨';
  } else {
    if (value <= 15) return '좋음';
    if (value <= 35) return '보통';
    if (value <= 75) return '나쁨';
    return '매우나쁨';
  }
}

export async function fetchAirQualityData(): Promise<AirQualityData[]> {
  if (!API_KEY) {
    console.error('AIRKOREA_API_KEY is not defined');
    return getFallbackData();
  }

  const provinces = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];
  
  try {
    const results = await Promise.all(
      provinces.map(async (sidoName) => {
        const url = `${BASE_URL}/getCtprvnRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=1&pageNo=1&sidoName=${encodeURIComponent(sidoName)}&ver=1.0`;
        
        try {
          const response = await fetch(url, { next: { revalidate: 3600 } });
          if (!response.ok) {
            console.warn(`API returned ${response.status} for ${sidoName}`);
            return null;
          }
          
          const text = await response.text();
          if (text.includes('<') && !text.includes('{')) {
            // Probably XML error message
            console.warn(`API returned XML for ${sidoName}: ${text.substring(0, 50)}`);
            return null;
          }

          const data = JSON.parse(text);
          const item = data.response?.body?.items?.[0];
          
          if (!item) return null;

          const parseValue = (val: any) => {
            if (val === '-' || val === null || val === undefined || val === '') return 0;
            const parsed = Number(val);
            return isNaN(parsed) ? 0 : parsed;
          };

          return {
            city: sidoName,
            pm10: parseValue(item.pm10Value),
            pm25: parseValue(item.pm25Value),
            o3: parseValue(item.o3Value),
            no2: parseValue(item.no2Value),
            co: parseValue(item.coValue),
            so2: parseValue(item.so2Value),
            dataTime: item.dataTime || new Date().toISOString(),
            status: item.khaiGrade || getStatus(parseValue(item.pm10Value), 'pm10'),
          };
        } catch (err) {
          return null;
        }
      })
    );

    const validResults = results.filter((item): item is AirQualityData => item !== null);
    
    if (validResults.length === 0) {
      console.warn('No valid API data fetched. Using fallback data.');
      return getFallbackData();
    }

    return validResults;
  } catch (error) {
    console.error('Error in fetchAirQualityData:', error);
    return getFallbackData();
  }
}

function getFallbackData(): AirQualityData[] {
  // Map mock data to our interface
  return MOCK_DATA.map(item => ({
    city: item.city,
    pm10: item.pm10,
    pm25: item.pm25,
    o3: 0.03, // Default value for charts
    no2: 0.02,
    co: 0.4,
    so2: 0.003,
    dataTime: new Date().toISOString(),
    status: item.status
  }));
}
