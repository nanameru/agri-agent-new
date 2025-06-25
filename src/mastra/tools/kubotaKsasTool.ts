import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface KSASFieldData {
  fieldId: string;
  fieldName: string;
  area: number;
  location: {
    latitude: number;
    longitude: number;
  };
  cropType: string;
  plantingDate: string;
  harvestDate?: string;
  soilType?: string;
  irrigationSystem?: string;
}

interface KSASWorkHistoryData {
  workId: string;
  fieldId: string;
  workDate: string;
  workType: string;
  machineType: string;
  duration: number;
  fuelConsumption: number;
  area: number;
  operatorName: string;
  notes?: string;
}

interface KSASHarvestData {
  harvestId: string;
  fieldId: string;
  harvestDate: string;
  cropType: string;
  yield: number;
  quality: string;
  moistureContent: number;
  proteinContent?: number;
  price?: number;
  totalRevenue?: number;
}

interface KSASMachineryData {
  machineId: string;
  machineName: string;
  machineType: string;
  model: string;
  operatingHours: number;
  fuelConsumption: number;
  maintenanceDate?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: string;
}

interface KSASResponse {
  status: string;
  data: {
    fields?: KSASFieldData[];
    workHistory?: KSASWorkHistoryData[];
    harvestRecords?: KSASHarvestData[];
    machinery?: KSASMachineryData[];
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

/**
 * kubotaKsasTool
 * --------------
 * クボタ KSAS（Kubota Smart Agri System）APIから圃場管理データを取得します。
 * 
 * 主要機能：
 * - 圃場情報（位置、面積、作業履歴）
 * - 収穫実績データ
 * - 農機稼働情報
 * - 作業計画・進捗管理
 * - 営農データ分析
 * 
 * NOTE: KSAS_API_KEYとKSAS_CLIENT_IDが環境変数で提供される必要があります。
 * 初年度無料（100圃場まで）、登録圃場数93万枚の実績
 */
export const kubotaKsasTool = createTool({
  id: 'kubota-ksas-search',
  description: 'クボタKSAS APIから圃場管理、作業履歴、収穫実績、農機稼働データを取得します。営農支援システムの包括的データが利用可能です。',
  inputSchema: z.object({
    dataType: z
      .enum(['fields', 'workHistory', 'harvest', 'machinery', 'analytics'])
      .describe('取得するデータタイプ（fields: 圃場情報, workHistory: 作業履歴, harvest: 収穫実績, machinery: 農機情報, analytics: 分析データ）'),
    userId: z
      .string()
      .min(1)
      .describe('ユーザーID（KSAS登録ユーザー）'),
    fieldId: z
      .string()
      .optional()
      .describe('圃場ID（特定圃場のデータ取得用）'),
    startDate: z
      .string()
      .optional()
      .describe('開始日（YYYY-MM-DD形式、作業履歴・収穫データ用）'),
    endDate: z
      .string()
      .optional()
      .describe('終了日（YYYY-MM-DD形式、作業履歴・収穫データ用）'),
    cropType: z
      .string()
      .optional()
      .describe('作物種別（水稲、小麦、大豆等）'),
    machineType: z
      .string()
      .optional()
      .describe('農機種別（トラクター、コンバイン、田植機等）'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(100)
      .describe('取得件数の上限（1-1000）'),
    page: z
      .number()
      .int()
      .min(1)
      .default(1)
      .describe('ページ番号'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    userId: z.string(),
    data: z.object({
      fields: z.array(z.object({
        fieldId: z.string(),
        fieldName: z.string(),
        area: z.number(),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        cropType: z.string(),
        plantingDate: z.string(),
        harvestDate: z.string().optional(),
        soilType: z.string().optional(),
        irrigationSystem: z.string().optional(),
      })).optional(),
      workHistory: z.array(z.object({
        workId: z.string(),
        fieldId: z.string(),
        workDate: z.string(),
        workType: z.string(),
        machineType: z.string(),
        duration: z.number(),
        fuelConsumption: z.number(),
        area: z.number(),
        operatorName: z.string(),
        notes: z.string().optional(),
      })).optional(),
      harvestRecords: z.array(z.object({
        harvestId: z.string(),
        fieldId: z.string(),
        harvestDate: z.string(),
        cropType: z.string(),
        yield: z.number(),
        quality: z.string(),
        moistureContent: z.number(),
        proteinContent: z.number().optional(),
        price: z.number().optional(),
        totalRevenue: z.number().optional(),
      })).optional(),
      machinery: z.array(z.object({
        machineId: z.string(),
        machineName: z.string(),
        machineType: z.string(),
        model: z.string(),
        operatingHours: z.number(),
        fuelConsumption: z.number(),
        maintenanceDate: z.string().optional(),
        location: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }).optional(),
        status: z.string(),
      })).optional(),
    }),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }).optional(),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, userId, fieldId, startDate, endDate, cropType, machineType, limit, page } = context;

    const apiKey = process.env.KSAS_API_KEY;
    const clientId = process.env.KSAS_CLIENT_ID;
    
    if (!apiKey || !clientId) {
      throw new Error(
        'KSAS_API_KEY and KSAS_CLIENT_ID environment variables are required. Please obtain credentials from Kubota KSAS platform.'
      );
    }

    const baseUrl = 'https://api.ksas.kubota.co.jp/v2';
    let endpoint: string;

    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'fields':
        endpoint = `${baseUrl}/fields`;
        break;
      case 'workHistory':
        endpoint = `${baseUrl}/work-history`;
        break;
      case 'harvest':
        endpoint = `${baseUrl}/harvest-records`;
        break;
      case 'machinery':
        endpoint = `${baseUrl}/machinery`;
        break;
      case 'analytics':
        endpoint = `${baseUrl}/analytics`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      userId: userId,
      limit: String(limit),
      page: String(page),
    });

    if (fieldId) {
      params.append('fieldId', fieldId);
    }

    if (startDate) {
      params.append('startDate', startDate);
    }

    if (endDate) {
      params.append('endDate', endDate);
    }

    if (cropType) {
      params.append('cropType', cropType);
    }

    if (machineType) {
      params.append('machineType', machineType);
    }

    // レート制限・リトライ対応
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 1500; // 1.5秒

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-Client-ID': clientId,
            'Content-Type': 'application/json',
            'User-Agent': 'AgriAgent/1.0 (Agricultural Data Analysis Tool)',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount);
            console.warn(`KSAS API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 401) {
          throw new Error('KSAS API authentication failed. Please check your API key and client ID.');
        }

        if (response.status === 403) {
          throw new Error('KSAS API access denied. Please verify your subscription status and user permissions.');
        }

        if (response.status === 404) {
          throw new Error('KSAS API resource not found. Please check your user ID and field ID.');
        }

        if (!response.ok) {
          throw new Error(`KSAS API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as KSASResponse;

        if (responseData.status !== 'success') {
          throw new Error(`KSAS API returned error: ${responseData.message || 'Unknown error'}`);
        }

        // ページネーション情報の計算
        const pagination = responseData.pagination ? {
          ...responseData.pagination,
          totalPages: Math.ceil(responseData.pagination.total / responseData.pagination.limit),
        } : undefined;

        const result = {
          success: true,
          dataType,
          userId,
          data: responseData.data,
          pagination,
          timestamp: new Date().toISOString(),
          message: `Successfully retrieved ${dataType} data from KSAS API`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying KSAS API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('KSAS API Error:', error);
        throw new Error(`KSAS API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('KSAS API request failed after all retries');
  },
});