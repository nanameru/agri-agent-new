import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface EStatSearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  region?: string;
  year?: string;
  url?: string;
}

interface EStatApiResponse {
  result?: {
    dataList?: Array<{
      '@id': string;
      '@title': string;
      '@description'?: string;
      '@category'?: string;
      '@region'?: string;
      '@year'?: string;
      '@url'?: string;
    }>;
  };
}

/**
 * eStatSearchTool
 * ---------------
 * e-Stat API（政府統計のポータルサイト）から農林水産業関連の統計データを検索します。
 * 農林業センサス、作物統計調査、農業産出額統計等のデータが取得可能です。
 *
 * NOTE: The API key must be provided via the environment variable `E_STAT_APP_ID`.
 */
export const eStatSearchTool = createTool({
  id: 'e-stat-search',
  description: 'Search agricultural and forestry statistics data from e-Stat (Japan government statistics portal). Can search for agricultural census, crop statistics, agricultural output statistics, and more.',
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe('Search keyword for statistics data (in Japanese). Examples: "農林業センサス", "作物統計", "農業産出額"'),
    region: z
      .string()
      .optional()
      .describe('Region code for prefecture or municipality filtering. Optional.'),
    statsField: z
      .string()
      .optional()
      .describe('Statistics field code. Use "04" for agriculture, forestry and fisheries. Optional.'),
    fromYear: z
      .number()
      .int()
      .min(1950)
      .max(2050)
      .optional()
      .describe('Start year for data period filtering. Optional.'),
    toYear: z
      .number()
      .int()
      .min(1950)
      .max(2050)
      .optional()
      .describe('End year for data period filtering. Optional.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20)
      .describe('Maximum number of results to return (1-100). Defaults to 20.'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        region: z.string().optional(),
        year: z.string().optional(),
        url: z.string().optional(),
      }),
    ),
    totalCount: z.number().optional(),
    searchInfo: z.object({
      query: z.string(),
      region: z.string().optional(),
      statsField: z.string().optional(),
      fromYear: z.number().optional(),
      toYear: z.number().optional(),
    }),
  }),
  execute: async ({ context }) => {
    const { query, region, statsField, fromYear, toYear, limit } = context;

    const appId = process.env.E_STAT_APP_ID;
    if (!appId) {
      throw new Error(
        'E_STAT_APP_ID environment variable is not set. Please provide your e-Stat API application ID.'
      );
    }

    // e-Stat API エンドポイント (データセット検索API) -> (統計表情報取得API)
    const endpoint = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList';
    
    // クエリパラメータの構築
    const params = new URLSearchParams({
      appId: appId,
      searchWord: query,
      limit: String(limit),
      lang: 'J', // 日本語
    });

    // オプションパラメータの追加
    if (region) {
      params.append('areaLvl', region);
    }
    
    if (statsField) {
      params.append('statsField', statsField);
    }
    
    // 期間フィルタ
    if (fromYear) {
      params.append('openYears', String(fromYear));
    }
    
    if (toYear && fromYear) {
      // 期間指定の場合
      params.set('openYears', `${fromYear}-${toYear}`);
    }

    // レート制限対策: リトライロジックを追加
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 1500; // 1.5秒（政府APIは慎重に）

    while (retryCount < maxRetries) {
      try {
        const resp = await fetch(`${endpoint}?${params.toString()}`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AGRI-Agent/1.0',
          },
        });

        if (resp.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * retryCount;
            console.warn(`e-Stat API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (!resp.ok) {
          throw new Error(`e-Stat API error: ${resp.status} ${resp.statusText}`);
        }

        const json = (await resp.json()) as EStatApiResponse;

        // APIレスポンスの処理
        const dataList = json.result?.dataList ?? [];
        const simplified: EStatSearchResult[] = dataList.slice(0, limit).map((item) => ({
          id: item['@id'],
          title: item['@title'],
          description: item['@description'],
          category: item['@category'] || '農林水産業',
          region: item['@region'],
          year: item['@year'],
          url: item['@url'],
        }));

        return {
          results: simplified,
          totalCount: dataList.length,
          searchInfo: {
            query,
            region,
            statsField,
            fromYear,
            toYear,
          },
        };
      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && error.message.includes('429')) {
          retryCount++;
          const delay = baseRetryDelay * retryCount;
          console.warn(`Retrying e-Stat API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('e-Stat API rate limit exceeded after all retries');
  },
});