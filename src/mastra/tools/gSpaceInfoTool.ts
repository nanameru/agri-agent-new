import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GSpaceDataset {
  datasetId: string;
  title: string;
  description: string;
  organization: string;
  category: string;
  format: string[];
  license: string;
  spatialExtent: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  temporalExtent: {
    start: string;
    end: string;
  };
  keywords: string[];
  downloadUrl: string;
  apiEndpoint?: string;
  lastUpdated: string;
  fileSize?: number;
}

interface GSpaceSearchResponse {
  totalResults: number;
  page: number;
  limit: number;
  datasets: GSpaceDataset[];
  categories: string[];
  organizations: string[];
}

interface GSpaceDataResponse {
  datasetId: string;
  format: string;
  data: any; // データ形式によって変動
  metadata: {
    coordinates: string;
    projection: string;
    encoding: string;
  };
  downloadInfo: {
    url: string;
    size: number;
    checksum: string;
  };
}

/**
 * gSpaceInfoTool
 * --------------
 * G空間情報センターから約12,000のデータセットを検索し、地理空間情報と農業データを統合的に利用します。
 * 
 * 主要機能：
 * - 約12,000のデータセット検索
 * - 筆ポリゴンや土地利用情報の取得
 * - 地理空間情報と農業データの統合
 * - 衛星画像・航空写真データ
 * - 地形・地質・気象データ
 * - オープンデータの一括取得
 * 
 * NOTE: G空間情報センターのデータは基本的にオープンデータですが、
 * 一部のデータセットは利用申請が必要な場合があります。
 */
export const gSpaceInfoTool = createTool({
  id: 'gspace-info-search',
  description: 'G空間情報センターから地理空間情報と農業関連データセットを検索・取得します。約12,000のデータセットから統合的な地理空間分析が可能です。',
  inputSchema: z.object({
    operation: z
      .enum(['search', 'download', 'metadata', 'categories'])
      .describe('操作タイプ（search: データセット検索, download: データ取得, metadata: メタデータ取得, categories: カテゴリ一覧）'),
    keyword: z
      .string()
      .optional()
      .describe('検索キーワード（農業、土地利用、気象等）'),
    category: z
      .string()
      .optional()
      .describe('データカテゴリ（農林水産、国土・気象、インフラ等）'),
    organization: z
      .string()
      .optional()
      .describe('提供機関（農林水産省、国土地理院、気象庁等）'),
    spatialExtent: z
      .array(z.number())
      .length(4)
      .optional()
      .describe('空間範囲 [west, south, east, north] WGS84座標系'),
    format: z
      .enum(['geojson', 'shapefile', 'csv', 'xml', 'tiff', 'all'])
      .optional()
      .describe('データ形式での絞り込み'),
    temporalStart: z
      .string()
      .optional()
      .describe('時間範囲開始（YYYY-MM-DD）'),
    temporalEnd: z
      .string()
      .optional()
      .describe('時間範囲終了（YYYY-MM-DD）'),
    datasetId: z
      .string()
      .optional()
      .describe('データセットID（特定データの取得用）'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(50)
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
    operation: z.string(),
    data: z.union([
      // Search results
      z.object({
        totalResults: z.number(),
        page: z.number(),
        limit: z.number(),
        datasets: z.array(z.object({
          datasetId: z.string(),
          title: z.string(),
          description: z.string(),
          organization: z.string(),
          category: z.string(),
          format: z.array(z.string()),
          license: z.string(),
          spatialExtent: z.object({
            north: z.number(),
            south: z.number(),
            east: z.number(),
            west: z.number(),
          }),
          temporalExtent: z.object({
            start: z.string(),
            end: z.string(),
          }),
          keywords: z.array(z.string()),
          downloadUrl: z.string(),
          apiEndpoint: z.string().optional(),
          lastUpdated: z.string(),
          fileSize: z.number().optional(),
        })),
        categories: z.array(z.string()),
        organizations: z.array(z.string()),
      }),
      // Download data
      z.object({
        datasetId: z.string(),
        format: z.string(),
        data: z.any(),
        metadata: z.object({
          coordinates: z.string(),
          projection: z.string(),
          encoding: z.string(),
        }),
        downloadInfo: z.object({
          url: z.string(),
          size: z.number(),
          checksum: z.string(),
        }),
      }),
      // Categories list
      z.array(z.string()),
    ]),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { operation, keyword, category, organization, spatialExtent, format, temporalStart, temporalEnd, datasetId, limit, page } = context;

    const baseUrl = 'https://api.geospatial.jp/v1';
    let endpoint: string;

    // 操作タイプに応じてエンドポイントを決定
    switch (operation) {
      case 'search':
        endpoint = `${baseUrl}/datasets/search`;
        break;
      case 'download':
        if (!datasetId) {
          throw new Error('datasetId is required for download operation');
        }
        endpoint = `${baseUrl}/datasets/${datasetId}/download`;
        break;
      case 'metadata':
        if (!datasetId) {
          throw new Error('datasetId is required for metadata operation');
        }
        endpoint = `${baseUrl}/datasets/${datasetId}/metadata`;
        break;
      case 'categories':
        endpoint = `${baseUrl}/categories`;
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // クエリパラメータの構築（検索操作の場合）
    const params = new URLSearchParams();
    
    if (operation === 'search') {
      params.append('limit', String(limit));
      params.append('page', String(page));
      
      if (keyword) {
        params.append('q', keyword);
      }
      
      if (category) {
        params.append('category', category);
      }
      
      if (organization) {
        params.append('organization', organization);
      }
      
      if (spatialExtent && spatialExtent.length === 4) {
        params.append('bbox', spatialExtent.join(','));
      }
      
      if (format && format !== 'all') {
        params.append('format', format);
      }
      
      if (temporalStart) {
        params.append('temporal_start', temporalStart);
      }
      
      if (temporalEnd) {
        params.append('temporal_end', temporalEnd);
      }
    }

    // レート制限・リトライ対応
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 1000; // 1秒

    while (retryCount < maxRetries) {
      try {
        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AgriAgent/1.0 (Agricultural Data Analysis Tool)',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 429) {
          // レート制限エラーの場合、待機してリトライ
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = baseRetryDelay * Math.pow(2, retryCount);
            console.warn(`G-Space API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 404) {
          throw new Error('G-Space API resource not found. Please check your parameters.');
        }

        if (!response.ok) {
          throw new Error(`G-Space API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();

        const result = {
          success: true,
          operation,
          data: responseData,
          timestamp: new Date().toISOString(),
          message: `Successfully executed ${operation} operation on G-Space Information Center`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying G-Space API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // オープンデータAPIが利用できない場合のフォールバック処理
        if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ENOTFOUND'))) {
          console.warn('G-Space API not available, returning mock data for demonstration');
          
          // モックデータの生成（実装時には削除し、実際のAPIからデータを取得）
          if (operation === 'search') {
            const mockSearchData: GSpaceSearchResponse = {
              totalResults: 150,
              page: page,
              limit: limit,
              datasets: Array.from({ length: Math.min(limit, 10) }, (_, index) => ({
                datasetId: `dataset_${String(index + 1).padStart(6, '0')}`,
                title: `農業関連データセット ${index + 1}`,
                description: `農林水産省提供の農業統計・地理空間データ（模擬データ）`,
                organization: ['農林水産省', '国土地理院', '気象庁'][Math.floor(Math.random() * 3)],
                category: ['農林水産', '国土・気象', 'インフラ'][Math.floor(Math.random() * 3)],
                format: ['geojson', 'shapefile', 'csv'],
                license: 'CC BY 4.0',
                spatialExtent: {
                  north: 35.8 + Math.random() * 0.2,
                  south: 35.6 + Math.random() * 0.2,
                  east: 139.8 + Math.random() * 0.2,
                  west: 139.6 + Math.random() * 0.2,
                },
                temporalExtent: {
                  start: '2020-01-01',
                  end: '2024-12-31',
                },
                keywords: ['農業', '土地利用', '統計', '地理空間'],
                downloadUrl: `https://api.geospatial.jp/download/dataset_${String(index + 1).padStart(6, '0')}`,
                apiEndpoint: `https://api.geospatial.jp/v1/datasets/dataset_${String(index + 1).padStart(6, '0')}`,
                lastUpdated: '2024-03-31',
                fileSize: Math.floor(Math.random() * 100000) + 10000,
              })),
              categories: ['農林水産', '国土・気象', 'インフラ', '社会・経済'],
              organizations: ['農林水産省', '国土地理院', '気象庁', '統計局'],
            };

            return {
              success: true,
              operation,
              data: mockSearchData,
              timestamp: new Date().toISOString(),
              message: 'Returned mock search results for demonstration (API not available)',
            };
          } else if (operation === 'categories') {
            return {
              success: true,
              operation,
              data: ['農林水産', '国土・気象', 'インフラ', '社会・経済', '防災・安全', '環境・生態'],
              timestamp: new Date().toISOString(),
              message: 'Returned mock categories for demonstration (API not available)',
            };
          }
        }
        
        // エラーログの詳細化
        console.error('G-Space API Error:', error);
        throw new Error(`G-Space API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('G-Space API request failed after all retries');
  },
});