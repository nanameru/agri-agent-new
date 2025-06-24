'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { 
  Calculator, 
  Image, 
  Video, 
  Code, 
  FileText,
  Presentation, 
  Bot,
  ExternalLink,
  Sparkles,
  Settings,
  Monitor,
  Brain,
  Layers,
  Grid3X3,
  Github,
  MousePointer,
  Hand,
  Eye,
  Chrome,
  Terminal,
  FileCode,
  Music,
  Search,
  Maximize,
  LogOut,
  Shrink,
  BarChart3,
  Database
} from 'lucide-react';

// ツールアイコンのマッピング
const toolIconMap: Record<string, any> = {
  htmlSlideTool: Presentation,
  presentationPreviewTool: Monitor,
  braveSearchTool: Search,
  eStatSearchTool: BarChart3,
  grokXSearchTool: Brain,
  geminiImageGenerationTool: Image,
  imagen4GenerationTool: Sparkles,
  v0CodeGenerationTool: Code,
  graphicRecordingTool: Layers,
  githubListIssuesTool: Github,
  browserSessionTool: Chrome,
  browserGotoTool: ExternalLink,
  browserObserveTool: Eye,
  browserActTool: Hand,
  browserExtractTool: Shrink,
  browserScreenshotTool: Maximize,
  browserWaitTool: Terminal,
  browserCloseTool: LogOut,
  browserCaptchaDetectTool: Eye,
  weatherTool: Brain,
  claudeIssueTool: Github,
  claudeAnalysisTool: Brain,
  fileAppendTool: FileText,
  websiteAnalysisTool: Search,
  sourceValidationTool: Search,
  citationExtractionTool: FileText,
  contentSynthesisTool: Brain,
};

// ツールカテゴリのマッピング
const toolCategoryMap: Record<string, string> = {
  htmlSlideTool: 'プレゼンテーション',
  presentationPreviewTool: 'プレゼンテーション',
  braveSearchTool: '情報検索',
  eStatSearchTool: '情報検索',
  grokXSearchTool: '情報検索',
  geminiImageGenerationTool: '画像生成',
  imagen4GenerationTool: '画像生成',
  v0CodeGenerationTool: 'コード生成',
  graphicRecordingTool: 'デザイン・視覚化',
  githubListIssuesTool: 'GitHub連携',
  browserSessionTool: 'ブラウザ操作',
  browserGotoTool: 'ブラウザ操作',
  browserObserveTool: 'ブラウザ操作',
  browserActTool: 'ブラウザ操作',
  browserExtractTool: 'ブラウザ操作',
  browserScreenshotTool: 'ブラウザ操作',
  browserWaitTool: 'ブラウザ操作',
  browserCloseTool: 'ブラウザ操作',
  browserCaptchaDetectTool: 'ブラウザ操作',
  browserContextCreateTool: 'ブラウザ操作',
  browserSessionQueryTool: 'ブラウザ操作',
  browserDownloadTool: 'ブラウザ操作',
  browserUploadTool: 'ブラウザ操作',
  weatherTool: '情報取得',
  fileAppendTool: 'ファイル操作',
  visualSlideEditorTool: 'デザイン・視覚化',
};

// ツール説明のマッピング
const toolDescriptionMap: Record<string, string> = {
  htmlSlideTool: 'プロフェッショナルなHTMLプレゼンテーションスライドを生成します。企業レベルの品質で、16:9アスペクト比、多様なレイアウトに対応。',
  presentationPreviewTool: 'HTMLコンテンツのプレビューを表示し、リアルタイムでプレゼンテーションの見た目を確認できます。',
  braveSearchTool: 'Brave Search APIを使用してウェブ検索を実行し、最新の情報を取得します。最大20件の検索結果を返します。',
  eStatSearchTool: 'e-Stat（政府統計ポータルサイト）から農林業センサス、作物統計、農業産出額等の統計データを市町村レベルで検索できます。',
  grokXSearchTool: 'Grok\'s X.ai APIを使用してライブデータを含む高度な検索を実行します。最新のトレンドや情報にアクセス。',
  geminiImageGenerationTool: 'Google Gemini (Imagen 3)を使用してテキストプロンプトから高品質な画像を生成します。複数アスペクト比対応。',
  imagen4GenerationTool: 'Google最新のImagen 4モデルを使用して、より詳細で高品質な画像を生成します。',
  v0CodeGenerationTool: 'Vercelのv0 AIモデルを使用してWebアプリケーションのコードを生成します。React、Next.js対応。',
  graphicRecordingTool: 'タイムラインベースのグラフィックレコーディング（グラレコ）を視覚的要素と共に作成します。',
  githubListIssuesTool: '指定されたGitHubリポジトリのIssueを一覧表示します。',
  browserSessionTool: '新しいブラウザセッションを開始し、操作を準備します。',
  browserGotoTool: '指定されたURLにブラウザでアクセスします。',
  browserObserveTool: '現在のブラウザのビューポートを観察し、コンテンツを返します。',
  browserActTool: 'ブラウザ上でクリックや入力などのアクションを実行します。',
  browserExtractTool: 'ブラウザのページから特定の情報を抽出します。',
  browserScreenshotTool: '現在のブラウザのスクリーンショットを撮影します。',
  browserWaitTool: '特定の条件が満たされるまでブラウザの操作を待機します。',
  browserCloseTool: '現在アクティブなブラウザセッションを終了します。',
  browserCaptchaDetectTool: 'ブラウザ上のCAPTCHAを検出し、自動的に解決します。',
  weatherTool: '指定された場所の天気情報を取得します。',
  claudeIssueTool: 'Claudeを使用してGitHub Issueを分析・作成します。',
  claudeAnalysisTool: 'Claudeを使用してコードやプロジェクトを詳細に分析します。',
  fileAppendTool: 'ファイルにテキストを追加します。',
  websiteAnalysisTool: 'ウェブサイトを詳細に分析し、情報を抽出します。',
  sourceValidationTool: '情報源を検証し、信頼性を確認します。',
  citationExtractionTool: 'テキストから引用情報を抽出します。',
  contentSynthesisTool: '複数の情報源から内容を統合し、要約します。',
};

// ツール機能のマッピング
const toolFeaturesMap: Record<string, string[]> = {
  htmlSlideTool: ['多様なレイアウト', '図解自動生成', 'レスポンシブデザイン', 'プロ品質'],
  presentationPreviewTool: ['リアルタイムプレビュー', 'HTMLレンダリング', 'インタラクティブ表示'],
  braveSearchTool: ['リアルタイム検索', '最大20件の結果', 'プライバシー重視'],
  eStatSearchTool: ['政府統計データ', '市町村レベル', '農林業特化', '地域・期間フィルタ'],
  grokXSearchTool: ['ライブデータ', 'AI強化検索', 'トレンド分析', 'リアルタイム情報'],
  geminiImageGenerationTool: ['Imagen 3エンジン', '多様なアスペクト比', '高品質出力', 'カスタムシード'],
  imagen4GenerationTool: ['最新Imagen 4', '超高品質', '詳細な画像', '最先端AI'],
  v0CodeGenerationTool: ['React/Next.js', 'AI強化コード', 'Web最適化', 'モダンUI'],
  graphicRecordingTool: ['タイムライン作成', '視覚的要素', 'グラレコ生成', 'プロフェッショナル'],
  githubListIssuesTool: ['リポジトリ指定', 'Issue一覧', '状態フィルタ'],
  browserSessionTool: ['セッション管理', 'ヘッドレスブラウザ', '分離環境'],
  browserGotoTool: ['URL指定', 'ページ遷移', 'ナビゲーション'],
  browserObserveTool: ['コンテンツ取得', 'DOMスナップショット', '視覚情報'],
  browserActTool: ['クリック操作', 'フォーム入力', 'UI操作自動化'],
  browserExtractTool: ['データ抽出', 'セレクタ指定', '情報取得'],
  browserScreenshotTool: ['フルページ', '要素指定', '画像保存'],
  browserWaitTool: ['要素待機', '時間待機', '条件指定'],
  browserCloseTool: ['セッション終了', 'リソース解放', 'クリーンアップ'],
  browserCaptchaDetectTool: ['CAPTCHA検出', '自動解決', 'AI認識'],
  weatherTool: ['天気情報', 'リアルタイム', '予報提供'],
  claudeIssueTool: ['Issue分析', 'AIサポート', '自動作成'],
  claudeAnalysisTool: ['コード分析', 'プロジェクト理解', 'AI分析'],
  fileAppendTool: ['テキスト追加', 'ファイル更新', '簡単操作'],
  websiteAnalysisTool: ['ウェブ分析', '情報抽出', '構造解析'],
  sourceValidationTool: ['ソース検証', '信頼性確認', 'ファクトチェック'],
  citationExtractionTool: ['引用抽出', '参考文献', '出典管理'],
  contentSynthesisTool: ['情報統合', '要約作成', 'AI分析'],
};

// 利用可能なすべてのツール名のリスト
const agentToolNames = [
  'weatherTool',
  'htmlSlideTool',
  'presentationPreviewTool',
  'braveSearchTool',
  'eStatSearchTool',
  'grokXSearchTool',
  'geminiImageGenerationTool',
  'imagen4GenerationTool',
  'v0CodeGenerationTool',
  'graphicRecordingTool',
  'githubListIssuesTool',
  'browserCaptchaDetectTool',
  'fileAppendTool',
  'browserSessionTool',
  'browserGotoTool',
  'browserObserveTool',
  'browserActTool',
  'browserExtractTool',
  'browserScreenshotTool',
  'browserWaitTool',
  'browserCloseTool',
  'browserContextCreateTool',
  'browserSessionQueryTool',
  'browserDownloadTool',
  'browserUploadTool',
  'visualSlideEditorTool',
];

// slideCreatorAgentからツール情報を動的に取得
function getToolsFromAgent() {
  // slideCreatorAgentで定義されているツール名を使用
  const toolNames = agentToolNames;
  
  return toolNames.map(toolName => {
    const displayName = toolName.replace(/Tool$/, '').replace(/([A-Z])/g, ' $1').trim();
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    
    return {
      id: toolName,
      name: getToolDisplayName(toolName),
      description: toolDescriptionMap[toolName] || `${formattedName}の機能を提供します。`,
      icon: toolIconMap[toolName] || Bot,
      category: toolCategoryMap[toolName] || 'その他',
      features: toolFeaturesMap[toolName] || ['高性能', 'AI強化', '自動化']
    };
  });
}

// ツール表示名を取得
function getToolDisplayName(toolName: string): string {
  const displayNames: Record<string, string> = {
    htmlSlideTool: 'HTML スライド生成',
    presentationPreviewTool: 'プレゼンテーション プレビュー',
    braveSearchTool: 'Brave Web検索',
    eStatSearchTool: 'e-Stat 統計検索',
    grokXSearchTool: 'Grok X検索',
    geminiImageGenerationTool: 'Gemini 画像生成',
    imagen4GenerationTool: 'Imagen 4 画像生成',
    v0CodeGenerationTool: 'v0 コード生成',
    graphicRecordingTool: 'グラフィック レコーディング',
    githubListIssuesTool: 'GitHub Issue一覧',
    browserSessionTool: 'ブラウザセッション開始',
    browserGotoTool: 'ブラウザ URL移動',
    browserObserveTool: 'ブラウザ 画面観察',
    browserActTool: 'ブラウザ 操作実行',
    browserExtractTool: 'ブラウザ 情報抽出',
    browserScreenshotTool: 'ブラウザ スクリーンショット',
    browserWaitTool: 'ブラウザ 待機',
    browserCloseTool: 'ブラウザセッション終了',
    browserCaptchaDetectTool: 'CAPTCHA検出・解決',
    browserContextCreateTool: 'ブラウザコンテキスト作成',
    browserSessionQueryTool: 'ブラウザセッション照会',
    browserDownloadTool: 'ブラウザ ダウンロード',
    browserUploadTool: 'ブラウザ アップロード',
    weatherTool: '天気情報取得',
    fileAppendTool: 'ファイル追記',
    visualSlideEditorTool: 'ビジュアルスライドエディタ',
  };
  
  return displayNames[toolName] || toolName;
}


interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: any;
    category: string;
    features: string[];
  };
}

function ToolCard({ tool }: ToolCardProps) {
  const ToolIcon = tool.icon;

  return (
    <Card className="flex flex-col h-full transition-all duration-300 ease-in-out hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="p-2 bg-muted rounded-lg border">
          <ToolIcon className="h-5 w-5 text-foreground" />
        </div>
        <CardTitle className="text-base font-semibold leading-tight">{tool.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-4 flex-grow">
        <Badge variant="outline">{tool.category}</Badge>
      </CardContent>
    </Card>
  );
}

interface CategoryCardProps {
  category: {
    name: string;
    count: number;
    icon: any;
  };
  onClick: () => void;
  isSelected: boolean;
}

function CategoryCard({ category, onClick, isSelected }: CategoryCardProps) {
  const CategoryIcon = category.icon;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="p-3 bg-muted rounded-lg border">
          <CategoryIcon className="h-6 w-6 text-foreground" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
          <CardDescription>{category.count}個のツール</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

// カテゴリアイコンのマッピング
const categoryIconMap: Record<string, any> = {
  'すべて': Grid3X3,
  'プレゼンテーション': Presentation,
  '情報検索': Search,
  '画像生成': Image,
  'コード生成': Code,
  'デザイン・視覚化': Layers,
  'GitHub連携': Github,
  'ブラウザ操作': Chrome,
  '情報取得': Brain,
  'Claude Code': Bot,
  'ファイル操作': FileText,
  '情報分析': Sparkles,
  'その他': Settings
};

export default function ToolsPage() {
  // 動的にツールデータを取得
  const toolsData = React.useMemo(() => getToolsFromAgent(), []);
  
  const [selectedCategory, setSelectedCategory] = React.useState('すべて');
  
  // カテゴリでフィルターを適用
  const filteredTools = React.useMemo(() => {
    if (selectedCategory === 'すべて') {
      return toolsData;
    }
    return toolsData.filter(tool => tool.category === selectedCategory);
  }, [toolsData, selectedCategory]);
  
  const categories = React.useMemo(() => {
    const categoryCount: Record<string, number> = {};
    toolsData.forEach(tool => {
      categoryCount[tool.category] = (categoryCount[tool.category] || 0) + 1;
    });
    
    return [
      { name: 'すべて', count: toolsData.length, icon: categoryIconMap['すべて'] },
      ...Object.entries(categoryCount).map(([name, count]) => ({ 
        name, 
        count, 
        icon: categoryIconMap[name] || categoryIconMap['その他']
      }))
    ];
  }, [toolsData]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* ヘッダー */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">使えるツール一覧</h1>
              <p className="text-muted-foreground">AGRI-Agentが使用できるツールのカテゴリ一覧です。</p>
            </div>

            {/* カテゴリカード一覧 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">カテゴリから選択</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categories.map(category => (
                  <CategoryCard 
                    key={category.name}
                    category={category}
                    onClick={() => setSelectedCategory(category.name)}
                    isSelected={selectedCategory === category.name}
                  />
                ))}
              </div>
            </div>

            {/* 選択されたカテゴリのツール一覧 */}
            {selectedCategory && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {selectedCategory === 'すべて' ? '全ツール' : `${selectedCategory}のツール`}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 