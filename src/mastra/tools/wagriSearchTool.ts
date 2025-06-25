import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface WAGRIFarmlandData {
  farmlandId: string;
  area: number;
  coordinates: number[][];
  cropType?: string;
  soilType?: string;
  landUse?: string;
}

interface WAGRIWeatherData {
  date: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  solarRadiation: number;
  windSpeed: number;
}

interface WAGRISoilData {
  soilType: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

interface WAGRITokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface WAGRIResponse {
  farmlandData?: WAGRIFarmlandData[];
  weatherData?: WAGRIWeatherData[];
  soilData?: WAGRISoilData[];
  totalCount: number;
  message?: string;
}

/**
 * wagriSearchTool
 * ---------------
 * WAGRI（農業データ連携基盤）から筆ポリゴン、農業気象、土壌図データを取得します。
 * 
 * 主要機能：
 * - 筆ポリゴンデータ（全国約290万区画の農地情報）
 * - 1kmメッシュ農業気象データ
 * - AI土壌図データ
 * - 農畜産物市況データ
 * - 水稲収穫適期診断
 * 
 * NOTE: WAGRI_CLIENT_IDおよびWAGRI_CLIENT_SECRETが環境変数で提供される必要があります。
 * アクセストークンは毎回自動取得されます（有効期限: 約12時間）。
 */
export const wagriSearchTool = createTool({
  id: 'wagri-agriculture-search',
  description: 'WAGRI（農業データ連携基盤）から農地情報、気象データ、土壌情報を検索取得します。市町村レベルでの精密な農業データ分析が可能です。',
  inputSchema: z.object({
    dataType: z
      .enum(['farmland', 'weather', 'soil', 'market', 'harvest'])
      .describe('取得するデータタイプ（farmland: 筆ポリゴン, weather: 気象データ, soil: 土壌データ, market: 市況データ, harvest: 収穫適期診断）'),
    region: z
      .string()
      .min(1)
      .describe('対象地域（市町村コードまたは緯度経度）'),
    startDate: z
      .string()
      .optional()
      .describe('開始日（YYYY-MM-DD形式、気象・市況データ用）'),
    endDate: z
      .string()
      .optional()
      .describe('終了日（YYYY-MM-DD形式、気象・市況データ用）'),
    cropType: z
      .string()
      .optional()
      .describe('作物種別（水稲、麦、大豆等）'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(100)
      .describe('取得件数の上限（1-1000）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    data: z.object({
      farmlandData: z.array(z.object({
        farmlandId: z.string(),
        area: z.number(),
        coordinates: z.array(z.array(z.number())),
        cropType: z.string().optional(),
        soilType: z.string().optional(),
        landUse: z.string().optional(),
      })).optional(),
      weatherData: z.array(z.object({
        date: z.string(),
        temperature: z.number(),
        humidity: z.number(),
        precipitation: z.number(),
        solarRadiation: z.number(),
        windSpeed: z.number(),
      })).optional(),
      soilData: z.array(z.object({
        soilType: z.string(),
        ph: z.number(),
        organicMatter: z.number(),
        nitrogen: z.number(),
        phosphorus: z.number(),
        potassium: z.number(),
      })).optional(),
    }),
    totalCount: z.number(),
    region: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, region, startDate, endDate, cropType, limit } = context;

    const clientId = process.env.WAGRI_CLIENT_ID;
    const clientSecret = process.env.WAGRI_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error(
        'WAGRI_CLIENT_ID and WAGRI_CLIENT_SECRET environment variables are required. Please obtain credentials from WAGRI platform.'
      );
    }

    // アクセストークンの取得
    let accessToken: string;
    try {
      accessToken = await getWAGRIAccessToken(clientId, clientSecret);
    } catch (error) {
      throw new Error(`Failed to obtain WAGRI access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // WAGRIのAPIエンドポイント（統合農地データ取得API v3）
    const baseEndpoint = 'https://api.wagri.net/v3';
    let endpoint: string;
    
    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'farmland':
        endpoint = `${baseEndpoint}/farmland/polygons`;
        break;
      case 'weather':
        endpoint = `${baseEndpoint}/weather/agromesh`;
        break;
      case 'soil':
        endpoint = `${baseEndpoint}/soil/analysis`;
        break;
      case 'market':
        endpoint = `${baseEndpoint}/market/prices`;
        break;
      case 'harvest':
        endpoint = `${baseEndpoint}/diagnosis/harvest`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      region: region,
      limit: String(limit),
      format: 'json',
    });

    // 日付パラメータ（気象・市況データ用）
    if (startDate && (dataType === 'weather' || dataType === 'market')) {
      params.append('start_date', startDate);
    }
    if (endDate && (dataType === 'weather' || dataType === 'market')) {
      params.append('end_date', endDate);
    }
    
    // 作物種別（収穫適期診断用）
    if (cropType && dataType === 'harvest') {
      params.append('crop_type', cropType);
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
            'X-Authorization': accessToken,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * retryCount;
            console.warn(`WAGRI API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 401) {
          throw new Error('WAGRI API authentication failed. Please check your client ID and client secret.');
        }

        if (response.status === 403) {
          throw new Error('WAGRI API access denied. Please verify your subscription status and data access permissions.');
        }

        if (!response.ok) {
          throw new Error(`WAGRI API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as WAGRIResponse;

        // レスポンスデータの整形
        const result = {
          success: true,
          dataType,
          data: {
            farmlandData: responseData.farmlandData || [],
            weatherData: responseData.weatherData || [],
            soilData: responseData.soilData || [],
          },
          totalCount: responseData.totalCount || 0,
          region,
          message: responseData.message || `Successfully retrieved ${dataType} data from WAGRI`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * retryCount;
          console.warn(`Retrying WAGRI API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('WAGRI API Error:', error);
        throw new Error(`WAGRI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('WAGRI API request failed after all retries');
  },
});

/**
 * WAGRIアクセストークンを取得する関数
 */
async function getWAGRIAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const tokenUrl = 'https://api.wagri2.net/token'; // 新URL
  
  const payload = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = (await response.json()) as WAGRITokenResponse;
    
    if (!tokenData.access_token) {
      throw new Error('No access token received from WAGRI');
    }

    return tokenData.access_token;
  } catch (error) {
    console.error('WAGRI Token Error:', error);
    throw new Error(`Failed to obtain WAGRI access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}