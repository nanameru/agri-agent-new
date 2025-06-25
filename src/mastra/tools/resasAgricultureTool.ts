import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface RESASAgricultureOutputData {
  prefCode: string;
  prefName: string;
  cityCode?: string;
  cityName?: string;
  year: number;
  value: number;
  cropName?: string;
  unit?: string;
}

interface RESASEmploymentData {
  prefCode: string;
  prefName: string;
  cityCode?: string;
  cityName?: string;
  year: number;
  employeeNumber: number;
  industry: string;
}

interface RESASResponse {
  message: string | null;
  result: {
    boundaryYear: number;
    data: Array<{
      prefCode: number;
      prefName: string;
      cityCode?: number;
      cityName?: string;
      years: Array<{
        year: number;
        value: number;
      }>;
    }>;
  };
}

/**
 * resasAgricultureTool
 * -------------------
 * RESAS（地域経済分析システム）から市町村別の農業産出額と就業人口データを取得します。
 * 
 * 主要機能：
 * - 市町村別農業産出額（2009-2018年）
 * - 農業就業人口データ
 * - 作物別生産額統計
 * - 地域農業経済分析データ
 * 
 * NOTE: RESAS_API_KEYが環境変数で提供される必要があります。
 * 2025年3月の新システムリリース予定により、APIアクセス機能が拡充される見込みです。
 */
export const resasAgricultureTool = createTool({
  id: 'resas-agriculture-search',
  description: 'RESAS（地域経済分析システム）から市町村別の農業産出額、就業人口、作物別生産統計を取得します。地域農業経済の分析に最適です。',
  inputSchema: z.object({
    dataType: z
      .enum(['output', 'employment', 'crops', 'trend'])
      .describe('取得するデータタイプ（output: 農業産出額, employment: 就業人口, crops: 作物別統計, trend: 産業動向）'),
    prefCode: z
      .string()
      .min(2)
      .max(2)
      .describe('都道府県コード（2桁、例：01=北海道、13=東京都、27=大阪府）'),
    cityCode: z
      .string()
      .optional()
      .describe('市区町村コード（5桁、未指定時は都道府県全体）'),
    yearFrom: z
      .number()
      .int()
      .min(2009)
      .max(2023)
      .default(2018)
      .describe('開始年（2009-2023、デフォルト2018）'),
    yearTo: z
      .number()
      .int()
      .min(2009)
      .max(2023)
      .optional()
      .describe('終了年（未指定時は開始年のみ）'),
    cropType: z
      .string()
      .optional()
      .describe('作物種別（米、野菜、果樹等、作物別統計用）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dataType: z.string(),
    prefCode: z.string(),
    prefName: z.string(),
    cityCode: z.string().optional(),
    cityName: z.string().optional(),
    data: z.array(z.object({
      year: z.number(),
      value: z.number(),
      cropName: z.string().optional(),
      industry: z.string().optional(),
      unit: z.string().optional(),
      rank: z.number().optional(),
    })),
    boundaryYear: z.number().optional(),
    totalRecords: z.number(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { dataType, prefCode, cityCode, yearFrom, yearTo, cropType } = context;

    const apiKey = process.env.RESAS_API_KEY;
    if (!apiKey) {
      throw new Error(
        'RESAS_API_KEY environment variable is required. Please obtain an API key from RESAS platform.'
      );
    }

    const baseUrl = 'https://opendata.resas-portal.go.jp/api/v1';
    let endpoint: string;

    // データタイプに応じてエンドポイントを決定
    switch (dataType) {
      case 'output':
        // 農業産出額
        endpoint = `${baseUrl}/industry/agriculture/outputPer100Yen`;
        break;
      case 'employment':
        // 農業就業人口
        endpoint = `${baseUrl}/industry/agriculture/employeePer100Yen`;
        break;
      case 'crops':
        // 作物別統計
        endpoint = `${baseUrl}/industry/agriculture/crop`;
        break;
      case 'trend':
        // 産業動向
        endpoint = `${baseUrl}/industry/agriculture/trend`;
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      prefCode: prefCode,
      yearFrom: String(yearFrom),
    });

    if (cityCode) {
      params.append('cityCode', cityCode);
    }

    if (yearTo) {
      params.append('yearTo', String(yearTo));
    }

    if (cropType && dataType === 'crops') {
      params.append('cropType', cropType);
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
            'X-API-KEY': apiKey,
            'User-Agent': 'AgriAgent/1.0 (Agricultural Data Analysis Tool)',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount);
            console.warn(`RESAS API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 403) {
          throw new Error('RESAS API access denied. Please verify your API key and access permissions.');
        }

        if (response.status === 400) {
          throw new Error('RESAS API bad request. Please check your parameters (prefCode, cityCode, year range).');
        }

        if (!response.ok) {
          throw new Error(`RESAS API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as RESASResponse;

        if (responseData.message && responseData.message !== null) {
          throw new Error(`RESAS API error: ${responseData.message}`);
        }

        if (!responseData.result || !responseData.result.data) {
          throw new Error('RESAS API returned no data');
        }

        // レスポンスデータの整形
        const formattedData: any[] = [];
        
        responseData.result.data.forEach(item => {
          item.years.forEach(yearData => {
            formattedData.push({
              year: yearData.year,
              value: yearData.value,
              cropName: cropType || undefined,
              industry: dataType === 'employment' ? '農業' : undefined,
              unit: dataType === 'output' ? '千万円' : dataType === 'employment' ? '人' : undefined,
              rank: undefined, // ランキングデータがある場合は設定
            });
          });
        });

        // 年度順にソート
        formattedData.sort((a, b) => a.year - b.year);

        const result = {
          success: true,
          dataType,
          prefCode,
          prefName: responseData.result.data[0]?.prefName || '',
          cityCode: cityCode,
          cityName: responseData.result.data[0]?.cityName,
          data: formattedData,
          boundaryYear: responseData.result.boundaryYear,
          totalRecords: formattedData.length,
          message: `Successfully retrieved ${dataType} data from RESAS`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying RESAS API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // エラーログの詳細化
        console.error('RESAS API Error:', error);
        throw new Error(`RESAS API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('RESAS API request failed after all retries');
  },
});