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

// e-Stat APIのレスポンス型（簡易版とフル版の両方に対応）
interface EStatApiResponse {
  // 簡易版のレスポンス（APIバージョンや設定によって返される）
  result?: {
    status?: string;
    errorMsg?: string;
    dataList?: Array<{
      id?: string;
      title?: string;
      description?: string;
      category?: string;
      region?: string;
      year?: string;
      url?: string;
      // その他のフィールド
      [key: string]: any;
    }>;
  };
  // フル版のレスポンス
  GET_STATS_LIST?: {
    RESULT?: {
      STATUS?: string;
      ERROR_MSG?: string;
      DATE?: string;
    };
    PARAMETER?: {
      LANG?: string;
      STATS_DATA_ID?: string;
      DATA_FORMAT?: string;
      LIMIT?: string;
      METAGET_FLG?: string;
    };
    DATALIST_INF?: {
      NUMBER?: string;
      LIST_INF?: Array<{
        STAT_NAME?: {
          '@code': string;
          '$': string;
        };
        GOV_ORG?: {
          '@code': string;
          '$': string;
        };
        STATISTICS_NAME?: string;
        TITLE?: string;
        CYCLE?: string;
        SURVEY_DATE?: string;
        OPEN_DATE?: string;
        SMALL_AREA?: string;
        MAIN_CATEGORY?: {
          '@code': string;
          '$': string;
        };
        SUB_CATEGORY?: {
          '@code': string;
          '$': string;
        };
        OVERALL_TOTAL_NUMBER?: string;
        UPDATED_DATE?: string;
        STATISTICS_URL?: string;
        TABLE_URL?: string;
        DESCRIPTION?: string;
        TABULATION_SUB_CATEGORY1?: {
          '@code': string;
          '$': string;
        };
        [key: string]: any; // その他のフィールドに対応
      }>;
    };
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
      params.append('searchKind', '2'); // 地域検索を有効化
      params.append('statsCode', region);
    }
    
    if (statsField) {
      params.append('statsField', statsField);
    } else {
      // デフォルトで農林水産業の統計を検索
      params.append('statsField', '04');
    }
    
    // 期間フィルタ
    if (fromYear && toYear) {
      // 期間指定の場合 (YYYY-YYYY形式)
      params.append('searchKind', '1'); // 調査年月検索
      params.append('fromDate', `${fromYear}01`);
      params.append('toDate', `${toYear}12`);
    } else if (fromYear) {
      params.append('searchKind', '1');
      params.append('fromDate', `${fromYear}01`);
      params.append('toDate', `${fromYear}12`);
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

        const responseText = await resp.text();
        console.log('e-Stat API Raw Response:', responseText);
        
        let json: EStatApiResponse;
        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          throw new Error('Invalid JSON response from e-Stat API');
        }
        
        // デバッグ: APIレスポンスの構造を確認
        console.log('e-Stat API Parsed Response:', JSON.stringify(json, null, 2));

        let dataList: any[] = [];
        let totalCount = 0;
        
        // フル版のレスポンスをチェック
        if (json.GET_STATS_LIST) {
          // エラーチェック
          if (json.GET_STATS_LIST.RESULT?.STATUS !== '0' && json.GET_STATS_LIST.RESULT?.STATUS !== undefined) {
            const errorMsg = json.GET_STATS_LIST.RESULT?.ERROR_MSG || 'Unknown error';
            throw new Error(`e-Stat API returned error: ${errorMsg}`);
          }
          
          dataList = json.GET_STATS_LIST.DATALIST_INF?.LIST_INF ?? [];
          totalCount = parseInt(json.GET_STATS_LIST.DATALIST_INF?.NUMBER || '0', 10);
        }
        // 簡易版のレスポンスをチェック
        else if (json.result) {
          if (json.result.status && json.result.status !== 'success' && json.result.status !== '0') {
            const errorMsg = json.result.errorMsg || 'Unknown error';
            throw new Error(`e-Stat API returned error: ${errorMsg}`);
          }
          
          dataList = json.result.dataList ?? [];
          totalCount = dataList.length;
        }
        
        console.log('DataList length:', dataList.length);
        
        // データがない場合
        if (dataList.length === 0) {
          console.log('No data found for query:', query);
          return {
            results: [],
            totalCount: 0,
            searchInfo: {
              query,
              region,
              statsField,
              fromYear,
              toYear,
            },
          };
        }
        
        const simplified: EStatSearchResult[] = dataList.slice(0, limit).map((item, index) => {
          // フル版のレスポンス形式
          if (item.TITLE !== undefined || item.STATISTICS_NAME !== undefined) {
            return {
              id: `estat_${index}_${Date.now()}`,
              title: item.TITLE || item.STATISTICS_NAME || 'No title',
              description: item.DESCRIPTION || `${item.SURVEY_DATE || ''} ${item.CYCLE || ''}`.trim(),
              category: item.MAIN_CATEGORY?.$  || '農林水産業',
              region: item.SMALL_AREA || undefined,
              year: item.SURVEY_DATE?.substring(0, 4),
              url: item.STATISTICS_URL || item.TABLE_URL,
            };
          }
          // 簡易版のレスポンス形式
          else {
            return {
              id: item.id || `estat_${index}_${Date.now()}`,
              title: item.title || 'No title',
              description: item.description || '',
              category: item.category || '農林水産業',
              region: item.region || undefined,
              year: item.year || undefined,
              url: item.url || undefined,
            };
          }
        });

        return {
          results: simplified,
          totalCount: totalCount,
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