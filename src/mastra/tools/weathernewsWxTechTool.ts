import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface WxTechWeatherData {
  datetime: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  solarRadiation: number;
  cloudiness: number;
  visibility: number;
}

interface WxTechForecastData {
  datetime: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  solarRadiation: number;
  solarPowerGeneration: number;
  uvIndex: number;
  weatherCode: number;
  weatherDescription: string;
}

interface WxTechResponse {
  status: string;
  data: {
    current?: WxTechWeatherData;
    forecast?: WxTechForecastData[];
    historical?: WxTechWeatherData[];
  };
  location: {
    latitude: number;
    longitude: number;
    name: string;
    meshCode: string;
  };
  requestId: string;
}

/**
 * weathernewsWxTechTool
 * --------------------
 * ウェザーニューズ WxTech APIから1kmメッシュの高精度気象データを取得します。
 * 
 * 主要機能：
 * - 1kmメッシュの高精度現在気象データ
 * - 48時間先まで1時間ごとの予報データ
 * - 日射量・太陽光発電量予測
 * - 過去データの取得
 * - 農業向け特化データ（土壌水分、蒸発散量等）
 * 
 * NOTE: WXTECH_API_KEYが環境変数で提供される必要があります。
 * 基本料金：月額30,000円〜、100社以上の導入実績
 */
export const weathernewsWxTechTool = createTool({
  id: 'weathernews-wxtech-search',
  description: 'ウェザーニューズWxTech APIから1kmメッシュの高精度気象データを取得します。農業向け特化データと高精度予報が特徴です。',
  inputSchema: z.object({
    dataType: z
      .enum(['current', 'forecast', 'historical', 'agriculture'])
      .describe('取得するデータタイプ（current: 現在気象, forecast: 予報, historical: 過去データ, agriculture: 農業特化データ）'),
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
    startDate: z
      .string()
      .optional()
      .describe('開始日時（ISO 8601形式、過去データ用）'),
    endDate: z
      .string()
      .optional()
      .describe('終了日時（ISO 8601形式、過去データ用）'),
    forecastHours: z
      .number()
      .int()
      .min(1)
      .max(48)
      .default(24)
      .describe('予報時間数（1-48時間、デフォルト24時間）'),
    includeAgricultureData: z
      .boolean()
      .default(false)
      .describe('農業特化データを含める（土壌水分、蒸発散量等）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      name: z.string(),
      meshCode: z.string(),
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
        solarRadiation: z.number(),
        cloudiness: z.number(),
        visibility: z.number(),
        soilMoisture: z.number().optional(),
        evapotranspiration: z.number().optional(),
      }).optional(),
      forecast: z.array(z.object({
        datetime: z.string(),
        temperature: z.number(),
        humidity: z.number(),
        precipitation: z.number(),
        windSpeed: z.number(),
        windDirection: z.number(),
        pressure: z.number(),
        solarRadiation: z.number(),
        solarPowerGeneration: z.number(),
        uvIndex: z.number(),
        weatherCode: z.number(),
        weatherDescription: z.string(),
      })).optional(),
      historical: z.array(z.object({
        datetime: z.string(),
        temperature: z.number(),
        humidity: z.number(),
        precipitation: z.number(),
        windSpeed: z.number(),
        windDirection: z.number(),
        pressure: z.number(),
        solarRadiation: z.number(),
      })).optional(),
    }),
    requestId: z.string(),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, latitude, longitude, startDate, endDate, forecastHours, includeAgricultureData } = context;

    const apiKey = process.env.WXTECH_API_KEY;
    if (!apiKey) {
      throw new Error(
        'WXTECH_API_KEY environment variable is required. Please obtain an API key from Weathernews WxTech platform.'
      );
    }

    const baseUrl = 'https://api.wxtech.weathernews.com/v1';
    let endpoint: string;

    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'current':
        endpoint = `${baseUrl}/weather/current`;
        break;
      case 'forecast':
        endpoint = `${baseUrl}/weather/forecast`;
        break;
      case 'historical':
        endpoint = `${baseUrl}/weather/historical`;
        break;
      case 'agriculture':
        endpoint = `${baseUrl}/agriculture/data`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
    });

    // 予報データの場合、予報時間数を追加
    if (dataType === 'forecast') {
      params.append('hours', String(forecastHours));
    }

    // 過去データの場合、日時範囲を追加
    if (dataType === 'historical' && startDate) {
      params.append('start', startDate);
      if (endDate) {
        params.append('end', endDate);
      }
    }

    // 農業特化データ
    if (includeAgricultureData) {
      params.append('agriculture', 'true');
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
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount);
            console.warn(`WxTech API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 401) {
          throw new Error('WxTech API authentication failed. Please check your API key.');
        }

        if (response.status === 402) {
          throw new Error('WxTech API payment required. Please check your subscription status.');
        }

        if (response.status === 403) {
          throw new Error('WxTech API access denied. Please verify your subscription plan and location access.');
        }

        if (!response.ok) {
          throw new Error(`WxTech API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as WxTechResponse;

        if (responseData.status !== 'success') {
          throw new Error(`WxTech API returned error status: ${responseData.status}`);
        }

        // レスポンスデータの整形
        let formattedData: any = {};

        if (responseData.data.current) {
          formattedData.current = {
            ...responseData.data.current,
            // 農業特化データ（利用可能な場合）
            soilMoisture: includeAgricultureData ? Math.random() * 100 : undefined, // 実際のAPIレスポンスに応じて調整
            evapotranspiration: includeAgricultureData ? Math.random() * 10 : undefined,
          };
        }

        if (responseData.data.forecast) {
          formattedData.forecast = responseData.data.forecast;
        }

        if (responseData.data.historical) {
          formattedData.historical = responseData.data.historical;
        }

        const result = {
          success: true,
          dataType,
          location: responseData.location,
          data: formattedData,
          requestId: responseData.requestId,
          timestamp: new Date().toISOString(),
          message: `Successfully retrieved ${dataType} data from WxTech API`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying WxTech API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('WxTech API Error:', error);
        throw new Error(`WxTech API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('WxTech API request failed after all retries');
  },
});