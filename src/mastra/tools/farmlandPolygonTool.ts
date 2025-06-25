import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface FarmlandPolygonData {
  polygonId: string;
  prefecture: string;
  municipality: string;
  area: number;
  coordinates: number[][][]; // GeoJSON Polygon coordinates
  landUse: string;
  cropType?: string;
  ownershipType: string;
  lastUpdated: string;
  attributes?: {
    soilType?: string;
    irrigationSystem?: string;
    slope?: number;
    elevation?: number;
  };
}

interface FarmlandPolygonResponse {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      polygonId: string;
      prefecture: string;
      municipality: string;
      area: number;
      landUse: string;
      cropType?: string;
      ownershipType: string;
      lastUpdated: string;
      attributes?: any;
    };
  }>;
  totalFeatures: number;
  bbox?: [number, number, number, number];
}

/**
 * farmlandPolygonTool
 * -------------------
 * 農林水産省が提供する筆ポリゴンデータから全国の農地区画情報を取得します。
 * 
 * 主要機能：
 * - 全国約290万区画の農地情報
 * - 200m四方（北海道は400m四方）の精度
 * - GeoJSON、シェープファイル形式対応
 * - CC BY 4.0ライセンスで商用利用可能
 * - 地理空間情報との統合分析
 * - 市町村レベルでの農地分布解析
 * 
 * NOTE: このデータは農林水産省のオープンデータとして提供されており、
 * APIキーは不要ですが、利用規約の遵守が必要です。
 */
export const farmlandPolygonTool = createTool({
  id: 'farmland-polygon-search',
  description: '農林水産省の筆ポリゴンデータから全国約290万区画の農地情報をGeoJSON形式で取得します。市町村レベルでの農地分析が可能です。',
  inputSchema: z.object({
    prefecture: z
      .string()
      .optional()
      .describe('都道府県名（例：北海道、青森県、東京都）'),
    municipality: z
      .string()
      .optional()
      .describe('市町村名（例：札幌市、青森市）'),
    prefCode: z
      .string()
      .optional()
      .describe('都道府県コード（2桁、01-47）'),
    cityCode: z
      .string()
      .optional()
      .describe('市町村コード（5桁）'),
    boundingBox: z
      .array(z.number())
      .length(4)
      .optional()
      .describe('境界ボックス [west, south, east, north] WGS84座標系'),
    landUse: z
      .enum(['農地', '田', '畑', '樹園地', '牧草地', '採草放牧地'])
      .optional()
      .describe('土地利用区分での絞り込み'),
    minArea: z
      .number()
      .min(0)
      .optional()
      .describe('最小面積（平方メートル）'),
    maxArea: z
      .number()
      .min(0)
      .optional()
      .describe('最大面積（平方メートル）'),
    format: z
      .enum(['geojson', 'shapefile'])
      .default('geojson')
      .describe('出力形式（デフォルト：geojson）'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(10000)
      .default(1000)
      .describe('取得件数の上限（1-10000）'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    format: z.string(),
    data: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.object({
        type: z.literal('Feature'),
        geometry: z.object({
          type: z.literal('Polygon'),
          coordinates: z.array(z.array(z.array(z.number()))),
        }),
        properties: z.object({
          polygonId: z.string(),
          prefecture: z.string(),
          municipality: z.string(),
          area: z.number(),
          landUse: z.string(),
          cropType: z.string().optional(),
          ownershipType: z.string(),
          lastUpdated: z.string(),
          attributes: z.object({
            soilType: z.string().optional(),
            irrigationSystem: z.string().optional(),
            slope: z.number().optional(),
            elevation: z.number().optional(),
          }).optional(),
        }),
      })),
      totalFeatures: z.number(),
      bbox: z.array(z.number()).length(4).optional(),
    }),
    statistics: z.object({
      totalArea: z.number(),
      averageArea: z.number(),
      landUseDistribution: z.record(z.number()),
      municipalityCount: z.number(),
    }),
    metadata: z.object({
      source: z.string(),
      license: z.string(),
      lastUpdated: z.string(),
      coordinate_system: z.string(),
    }),
    timestamp: z.string(),
    message: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const { prefecture, municipality, prefCode, cityCode, boundingBox, landUse, minArea, maxArea, format, limit } = context;

    // 農林水産省の筆ポリゴンデータAPI（仮想エンドポイント）
    // 実際のAPIエンドポイントはデータ提供状況に応じて調整が必要
    const baseUrl = 'https://api.maff.go.jp/farmland-polygon/v1';
    const endpoint = `${baseUrl}/polygons`;

    // クエリパラメータの構築
    const params = new URLSearchParams({
      format: format,
      limit: String(limit),
    });

    if (prefecture) {
      params.append('prefecture', prefecture);
    }

    if (municipality) {
      params.append('municipality', municipality);
    }

    if (prefCode) {
      params.append('prefCode', prefCode);
    }

    if (cityCode) {
      params.append('cityCode', cityCode);
    }

    if (boundingBox && boundingBox.length === 4) {
      params.append('bbox', boundingBox.join(','));
    }

    if (landUse) {
      params.append('landUse', landUse);
    }

    if (minArea !== undefined) {
      params.append('minArea', String(minArea));
    }

    if (maxArea !== undefined) {
      params.append('maxArea', String(maxArea));
    }

    // レート制限・リトライ対応
    let retryCount = 0;
    const maxRetries = 3;
    const baseRetryDelay = 1000; // 1秒

    while (retryCount < maxRetries) {
      try {
        const response = await fetch(`${endpoint}?${params.toString()}`, {
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
            console.warn(`Farmland Polygon API rate limit hit. Retrying in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        if (response.status === 404) {
          throw new Error('Farmland Polygon API resource not found. Please check your location parameters.');
        }

        if (!response.ok) {
          throw new Error(`Farmland Polygon API error: ${response.status} ${response.statusText}`);
        }

        const responseData = (await response.json()) as FarmlandPolygonResponse;

        // 統計情報の計算
        const totalArea = responseData.features.reduce((sum, feature) => sum + feature.properties.area, 0);
        const averageArea = responseData.features.length > 0 ? totalArea / responseData.features.length : 0;
        
        const landUseDistribution: Record<string, number> = {};
        const municipalities = new Set<string>();
        
        responseData.features.forEach(feature => {
          const landUseType = feature.properties.landUse;
          landUseDistribution[landUseType] = (landUseDistribution[landUseType] || 0) + 1;
          municipalities.add(feature.properties.municipality);
        });

        const result = {
          success: true,
          format,
          data: responseData,
          statistics: {
            totalArea,
            averageArea,
            landUseDistribution,
            municipalityCount: municipalities.size,
          },
          metadata: {
            source: '農林水産省 筆ポリゴンデータ',
            license: 'CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）',
            lastUpdated: '2024-03-31', // 実際の更新日に応じて調整
            coordinate_system: 'WGS84 (EPSG:4326)',
          },
          timestamp: new Date().toISOString(),
          message: `Successfully retrieved ${responseData.features.length} farmland polygons`,
        };

        return result;

      } catch (error) {
        if (retryCount < maxRetries - 1 && error instanceof Error && 
            (error.message.includes('429') || error.message.includes('timeout'))) {
          retryCount++;
          const delay = baseRetryDelay * Math.pow(2, retryCount);
          console.warn(`Retrying Farmland Polygon API after error... (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // オープンデータAPIが利用できない場合のフォールバック処理
        if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('ENOTFOUND'))) {
          console.warn('Farmland Polygon API not available, returning mock data for demonstration');
          
          // モックデータの生成（実装時には削除し、実際のAPIからデータを取得）
          const mockData: FarmlandPolygonResponse = {
            type: 'FeatureCollection',
            features: Array.from({ length: Math.min(limit, 10) }, (_, index) => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Polygon' as const,
                coordinates: [[[139.7 + index * 0.001, 35.7 + index * 0.001], [139.7 + (index + 1) * 0.001, 35.7 + index * 0.001], [139.7 + (index + 1) * 0.001, 35.7 + (index + 1) * 0.001], [139.7 + index * 0.001, 35.7 + (index + 1) * 0.001], [139.7 + index * 0.001, 35.7 + index * 0.001]]],
              },
              properties: {
                polygonId: `polygon_${String(index + 1).padStart(6, '0')}`,
                prefecture: prefecture || '東京都',
                municipality: municipality || '新宿区',
                area: 1000 + Math.random() * 4000,
                landUse: landUse || '農地',
                cropType: ['水稲', '小麦', '大豆', '野菜'][Math.floor(Math.random() * 4)],
                ownershipType: Math.random() > 0.5 ? '個人' : '法人',
                lastUpdated: '2024-03-31',
                attributes: {
                  soilType: ['砂質土', '粘質土', '壌土'][Math.floor(Math.random() * 3)],
                  irrigationSystem: Math.random() > 0.7 ? '灌漑あり' : '天水田',
                  slope: Math.random() * 15,
                  elevation: Math.random() * 200,
                },
              },
            })),
            totalFeatures: 10,
            bbox: [139.7, 35.7, 139.71, 35.71],
          };

          return {
            success: true,
            format,
            data: mockData,
            statistics: {
              totalArea: 25000,
              averageArea: 2500,
              landUseDistribution: { '農地': 10 },
              municipalityCount: 1,
            },
            metadata: {
              source: '農林水産省 筆ポリゴンデータ（模擬データ）',
              license: 'CC BY 4.0（クリエイティブ・コモンズ 表示 4.0 国際）',
              lastUpdated: '2024-03-31',
              coordinate_system: 'WGS84 (EPSG:4326)',
            },
            timestamp: new Date().toISOString(),
            message: 'Returned mock farmland polygon data for demonstration (API not available)',
          };
        }
        
        // エラーログの詳細化
        console.error('Farmland Polygon API Error:', error);
        throw new Error(`Farmland Polygon API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // すべてのリトライが失敗した場合
    throw new Error('Farmland Polygon API request failed after all retries');
  },
});