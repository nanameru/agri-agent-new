import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface JWACurrentWeather {
  datetime: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  cloudiness: number;
  weatherCode: number;
  weatherDescription: string;
}

interface JWAForecastData {
  datetime: string;
  temperature: {
    max: number;
    min: number;
    avg: number;
  };
  humidity: number;
  precipitation: {
    probability: number;
    amount: number;
  };
  wind: {
    speed: number;
    direction: number;
    description: string;
  };
  pressure: number;
  weatherCode: number;
  weatherDescription: string;
  uvIndex: number;
  reliability: number;
}

interface JWALongTermForecast {
  period: string;
  temperature: {
    trend: string; // "高い" | "平年並み" | "低い"
    confidence: number;
  };
  precipitation: {
    trend: string; // "多い" | "平年並み" | "少ない"
    confidence: number;
  };
  summary: string;
}

interface JWADemandForecast {
  commodity: string;
  period: string;
  demandIndex: number;
  priceImpact: number;
  weatherFactor: string;
  confidence: number;
}

interface JWAResponse {
  status: string;
  data: {
    current?: JWACurrentWeather;
    forecast?: JWAForecastData[];
    longTermForecast?: JWALongTermForecast[];
    demandForecast?: JWADemandForecast[];
  };
  location: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  };
  requestId: string;
  message?: string;
}

/**
 * jwaForecastTool
 * ---------------
 * 日本気象協会（JWA）Weather X APIから商品需要予測にも活用される専門的な気象データを取得します。
 * 
 * 主要機能：
 * - 120時間（5日間）詳細予報
 * - 8週間先長期予報
 * - 196カ国対応グローバルデータ
 * - 商品需要予測データ
 * - 気象予測誤差20-40％改善の独自技術
 * - 農産物価格影響分析
 * 
 * NOTE: JWA_API_KEYが環境変数で提供される必要があります。
 */
export const jwaForecastTool = createTool({
  id: 'jwa-weather-forecast',
  description: '日本気象協会Weather X APIから高精度気象予報と商品需要予測データを取得します。農産物価格影響分析に最適です。',
  inputSchema: z.object({
    dataType: z
      .enum(['current', 'forecast', 'longTerm', 'demand', 'global'])
      .describe('取得するデータタイプ（current: 現在気象, forecast: 5日間予報, longTerm: 8週間長期予報, demand: 需要予測, global: 海外データ）'),
    latitude: z
      .number()
      .min(-90)
      .max(90)
      .describe('緯度（-90 to 90）'),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .describe('経度（-180 to 180）'),
    country: z
      .string()
      .optional()
      .describe('国コード（ISO 3166-1、グローバルデータ用）'),
    forecastHours: z
      .number()
      .int()
      .min(1)
      .max(120)
      .default(72)
      .describe('予報時間数（1-120時間、デフォルト72時間）'),
    commodity: z
      .string()
      .optional()
      .describe('商品名（米、野菜、果物等、需要予測用）'),
    includeUncertainty: z
      .boolean()
      .default(false)
      .describe('予測不確実性情報を含める'),
    language: z
      .enum(['ja', 'en'])
      .default('ja')
      .describe('言語設定'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      name: z.string(),
      country: z.string(),
    }),
    data: z.object({
      current: z.object({
        datetime: z.string(),
        temperature: z.number(),
        humidity: z.number(),
        precipitation: z.number(),
        windSpeed: z.number(),
        windDirection: z.number(),
        pressure: z.number(),
        visibility: z.number(),
        cloudiness: z.number(),
        weatherCode: z.number(),
        weatherDescription: z.string(),
      }).optional(),
      forecast: z.array(z.object({
        datetime: z.string(),
        temperature: z.object({
          max: z.number(),
          min: z.number(),
          avg: z.number(),
        }),
        humidity: z.number(),
        precipitation: z.object({
          probability: z.number(),
          amount: z.number(),
        }),
        wind: z.object({
          speed: z.number(),
          direction: z.number(),
          description: z.string(),
        }),
        pressure: z.number(),
        weatherCode: z.number(),
        weatherDescription: z.string(),
        uvIndex: z.number(),
        reliability: z.number(),
      })).optional(),
      longTermForecast: z.array(z.object({
        period: z.string(),
        temperature: z.object({
          trend: z.string(),
          confidence: z.number(),
        }),
        precipitation: z.object({
          trend: z.string(),
          confidence: z.number(),
        }),
        summary: z.string(),
      })).optional(),
      demandForecast: z.array(z.object({
        commodity: z.string(),
        period: z.string(),
        demandIndex: z.number(),
        priceImpact: z.number(),
        weatherFactor: z.string(),
        confidence: z.number(),
      })).optional(),
    }),
    requestId: z.string(),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, latitude, longitude, country, forecastHours, commodity, includeUncertainty, language } = context;

    const apiKey = process.env.JWA_API_KEY;
    if (!apiKey) {
      throw new Error(
        'JWA_API_KEY environment variable is required. Please obtain an API key from Japan Weather Association.'
      );
    }

    const baseUrl = 'https://api.weatherx.jwa.or.jp/v2';
    let endpoint: string;

    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'current':
        endpoint = `${baseUrl}/weather/current`;
        break;
      case 'forecast':
        endpoint = `${baseUrl}/weather/forecast`;
        break;
      case 'longTerm':
        endpoint = `${baseUrl}/weather/long-term`;
        break;
      case 'demand':
        endpoint = `${baseUrl}/demand/forecast`;
        break;
      case 'global':
        endpoint = `${baseUrl}/weather/global`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      lang: language,
      format: 'json',
    });

    if (country && dataType === 'global') {
      params.append('country', country);
    }

    if (dataType === 'forecast') {
      params.append('hours', String(forecastHours));
    }

    if (commodity && dataType === 'demand') {
      params.append('commodity', commodity);
    }

    if (includeUncertainty) {
      params.append('uncertainty', 'true');
    }

    // レート制限・リトライ対応
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 2000; // 2秒

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'AgriAgent/1.0 (Agricultural Data Analysis Tool)',
            'X-API-Version': '2.0',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount);
            console.warn(`JWA API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 401) {
          throw new Error('JWA API authentication failed. Please check your API key.');
        }

        if (response.status === 402) {
          throw new Error('JWA API payment required. Please check your subscription status.');
        }

        if (response.status === 403) {
          throw new Error('JWA API access denied. Please verify your subscription plan and location access.');
        }

        if (response.status === 404) {
          throw new Error('JWA API location not found. Please check latitude and longitude values.');
        }

        if (!response.ok) {
          throw new Error(`JWA API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as JWAResponse;

        if (responseData.status !== 'success') {
          throw new Error(`JWA API returned error: ${responseData.message || 'Unknown error'}`);
        }

        const result = {
          success: true,
          dataType,
          location: responseData.location,
          data: responseData.data,
          requestId: responseData.requestId,
          timestamp: new Date().toISOString(),
          message: `Successfully retrieved ${dataType} data from JWA Weather X API`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying JWA API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('JWA API Error:', error);
        throw new Error(`JWA API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('JWA API request failed after all retries');
  },
});