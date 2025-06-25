import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface JMAForecastData {
  publishingOffice: string;
  reportDatetime: string;
  timeSeries: Array<{
    timeDefines: string[];
    areas: Array<{
      area: {
        name: string;
        code: string;
      };
      weatherCodes: string[];
      weathers: string[];
      winds: string[];
      waves?: string[];
    }>;
  }>;
}

interface JMAWeatherResponse {
  forecasts?: JMAForecastData[];
  error?: string;
}

interface AMeDASData {
  temp: [number, number]; // 気温 (現在値, 品質情報)
  humidity: [number, number]; // 湿度
  pressure: [number, number]; // 気圧
  precipitation: [number, number]; // 降水量
  windSpeed: [number, number]; // 風速
  windDirection: [number, number]; // 風向
  sunshine: [number, number]; // 日照時間
}

interface AMeDASResponse {
  [stationId: string]: AMeDASData;
}

/**
 * jmaWeatherTool
 * ---------------
 * 気象庁の非公式JSONエンドポイントからリアルタイム気象データを取得します。
 * 
 * 主要機能：
 * - 天気予報データ（3日間予報）
 * - AMeDAS観測データ（5分更新）
 * - 過去2週間分の気象データ
 * - 地域別詳細気象情報
 * 
 * NOTE: これは非公式APIのため、将来的に利用制限やエンドポイント変更の可能性があります。
 */
export const jmaWeatherTool = createTool({
  id: 'jma-weather-search',
  description: '気象庁の非公式APIから天気予報とAMeDAS観測データを取得します。農業に必要なリアルタイム気象情報を提供します。',
  inputSchema: z.object({
    dataType: z
      .enum(['forecast', 'amedas', 'overview'])
      .describe('取得するデータタイプ（forecast: 天気予報, amedas: AMeDAS観測データ, overview: 気象概況）'),
    areaCode: z
      .string()
      .min(6)
      .max(6)
      .describe('地域コード（6桁、例：130000=東京都、140000=神奈川県、270000=大阪府）'),
    date: z
      .string()
      .optional()
      .describe('対象日（YYYYMMDD形式、AMeDASデータ用、未指定時は最新データ）'),
    stationId: z
      .string()
      .optional()
      .describe('観測所ID（AMeDASデータ用、未指定時は地域内全観測所）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    areaCode: z.string(),
    data: z.object({
      forecast: z.object({
        publishingOffice: z.string(),
        reportDatetime: z.string(),
        areas: z.array(z.object({
          areaName: z.string(),
          areaCode: z.string(),
          weatherCodes: z.array(z.string()),
          weathers: z.array(z.string()),
          winds: z.array(z.string()),
          waves: z.array(z.string()).optional(),
        })),
      }).optional(),
      amedas: z.record(z.object({
        temperature: z.number().optional(),
        humidity: z.number().optional(),
        pressure: z.number().optional(),
        precipitation: z.number().optional(),
        windSpeed: z.number().optional(),
        windDirection: z.number().optional(),
        sunshine: z.number().optional(),
        quality: z.object({
          temperature: z.number().optional(),
          humidity: z.number().optional(),
          pressure: z.number().optional(),
          precipitation: z.number().optional(),
          windSpeed: z.number().optional(),
          windDirection: z.number().optional(),
          sunshine: z.number().optional(),
        }).optional(),
      })).optional(),
    }),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, areaCode, date, stationId } = context;

    let endpoint: string;
    const baseUrl = 'https://www.jma.go.jp/bosai';

    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'forecast':
        // 天気予報データ
        endpoint = `${baseUrl}/forecast/data/forecast/${areaCode}.json`;
        break;
      case 'amedas':
        // AMeDASデータ
        const targetDate = date || new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const hour = String(new Date().getHours()).padStart(2, '0');
        const minute = String(Math.floor(new Date().getMinutes() / 10) * 10).padStart(2, '0');
        endpoint = `${baseUrl}/amedas/data/map/${targetDate}${hour}${minute}00.json`;
        break;
      case 'overview':
        // 気象概況
        endpoint = `${baseUrl}/forecast/data/overview/${areaCode}.json`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // レート制限・リトライ対応
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 1000; // 1秒

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AgriAgent/1.0 (Agricultural Data Analysis Tool)',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount); // 指数バックオフ
            console.warn(`JMA API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`JMA API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        // データタイプに応じてレスポンスを整形
        let formattedData: any = {};

        if (dataType === 'forecast') {
          const forecastData = responseData as JMAForecastData[];
          if (forecastData && forecastData.length > 0) {
            const firstForecast = forecastData[0];
            formattedData.forecast = {
              publishingOffice: firstForecast.publishingOffice,
              reportDatetime: firstForecast.reportDatetime,
              areas: firstForecast.timeSeries?.[0]?.areas?.map(area => ({
                areaName: area.area.name,
                areaCode: area.area.code,
                weatherCodes: area.weatherCodes || [],
                weathers: area.weathers || [],
                winds: area.winds || [],
                waves: area.waves || [],
              })) || [],
            };
          }
        } 
        else if (dataType === 'amedas') {
          const amedasData = responseData as AMeDASResponse;
          const filteredData: any = {};
          
          Object.entries(amedasData).forEach(([stationKey, stationData]) => {
            // 特定の観測所が指定されている場合はフィルタリング
            if (stationId && stationKey !== stationId) {
              return;
            }
            
            filteredData[stationKey] = {
              temperature: stationData.temp?.[0],
              humidity: stationData.humidity?.[0],
              pressure: stationData.pressure?.[0],
              precipitation: stationData.precipitation?.[0],
              windSpeed: stationData.windSpeed?.[0],
              windDirection: stationData.windDirection?.[0],
              sunshine: stationData.sunshine?.[0],
              quality: {
                temperature: stationData.temp?.[1],
                humidity: stationData.humidity?.[1],
                pressure: stationData.pressure?.[1],
                precipitation: stationData.precipitation?.[1],
                windSpeed: stationData.windSpeed?.[1],
                windDirection: stationData.windDirection?.[1],
                sunshine: stationData.sunshine?.[1],
              },
            };
          });
          
          formattedData.amedas = filteredData;
        }
        else if (dataType === 'overview') {
          formattedData.overview = responseData;
        }

        const result = {
          success: true,
          dataType,
          areaCode,
          data: formattedData,
          timestamp: new Date().toISOString(),
          message: `Successfully retrieved ${dataType} data from JMA`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout') || error.message.includes('ECONNRESET'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying JMA API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('JMA API Error:', error);
        throw new Error(`JMA API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('JMA API request failed after all retries');
  },
});