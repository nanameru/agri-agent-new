'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { MainHeader } from '@/app/components/MainHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import {
  Search,
  Target,
  FileCheck,
  Notebook,
  ShoppingCart,
  Home,
  DollarSign,
  CalendarDays,
  Droplets,
  MapPin,
  FileText,
  ClipboardList,
  Calendar,
  Zap,
  TrendingUp,
  BarChart4,
} from 'lucide-react';

const aiClusters = [
  {
    title: "農業データリサーチ",
    icon: Search,
    description: "補助金・助成金情報の自動監視と推薦",
    color: "bg-blue-500",
    agents: [
      {
        title: "補助金ウォッチャー",
        url: "/subsidy-watcher",
        icon: DollarSign,
        description: "全国の補助金情報を監視・推薦し、申請締切日を自動通知",
        details: {
          features: [
            "全国の補助金・助成金情報を常時監視",
            "利用可能な制度を自動で推薦・通知",
            "自動マッチングで最適な補助金を発見",
            "申請締切日を自動で通知"
          ],
          example: "「スマート農業導入支援事業」適合度:95% (IoTセンサー導入費用の最大1/2を補助)",
          benefits: "年間25時間の申請書類作成時間を削減"
        }
      }
    ]
  },
  {
    title: "生産管理・計画",
    icon: Target,
    description: "土壌・気象データを活用した最適化",
    color: "bg-green-500",
    agents: [
      {
        title: "作付プランナー",
        url: "/crop-planner",
        icon: CalendarDays,
        description: "土壌データ、気象予測、市場価格を分析し最適な作付計画を立案",
        details: {
          features: [
            "土壌データと気象予測の統合分析",
            "市場価格動向の予測",
            "最適な作付計画と輪作体系の立案",
            "リスク分散を考慮した品目選定"
          ],
          example: "来年度の最適作付計画: トマト30%、キュウリ25%、ナス25%、葉物野菜20%",
          benefits: "年間25時間の作付計画再計算時間を削減"
        }
      },
      {
        title: "水肥最適化ボット",
        url: "/irrigation-optimizer",
        icon: Droplets,
        description: "センサーデータと生育画像から品質を最大化する水・肥料管理",
        details: {
          features: [
            "センサーデータと生育画像の統合分析",
            "品質を最大化する水・肥料の最適タイミング提示",
            "水ストレス管理による糖度向上",
            "水使用量削減による環境負荷軽減"
          ],
          example: "トマト圃場へ「明日9:00に15分間の灌水を行うことで、糖度が12%向上する見込みです」",
          benefits: "平均糖度12%向上、水使用量30%削減、年間品質プレミアム+30万円"
        }
      }
    ]
  },
  {
    title: "申請・手続クラスター",
    icon: FileCheck,
    description: "農地取得から補助金申請まで自動化",
    color: "bg-purple-500",
    agents: [
      {
        title: "農地取得ナビ",
        url: "/land-acquisition",
        icon: MapPin,
        description: "農地取得や賃借に関する法的手続きや必要書類をナビゲート",
        details: {
          features: ["法的手続きのステップガイド", "必要書類の自動チェックリスト", "手続き進捗管理", "関連機関への連絡先提供"],
          example: "農地法第3条許可申請に必要な書類一覧と提出スケジュールを自動生成",
          benefits: "手続き時間を50%短縮"
        }
      },
      {
        title: "補助金フォームビルダー",
        url: "/subsidy-forms",
        icon: FileText,
        description: "推薦された補助金の申請フォームに営農データを基に自動入力",
        details: {
          features: ["営農データからの自動入力", "申請書類の一括作成", "提出前チェック機能", "進捗管理ダッシュボード"],
          example: "スマート農業導入支援事業の申請書を営農データから自動生成",
          benefits: "申請書作成時間を80%削減"
        }
      }
    ]
  },
  {
    title: "日報・ナレッジ",
    icon: Notebook,
    description: "作業記録の自動化と知識管理",
    color: "bg-orange-500",
    agents: [
      {
        title: "日報パーサー",
        url: "/daily-report",
        icon: ClipboardList,
        description: "音声や手書きメモの日報を構造化データに変換し自動記録",
        details: {
          features: ["音声入力対応", "手書きメモのOCR", "構造化データ変換", "自動分析・レポート生成"],
          example: "音声で「今日はトマトの収穫3時間、出荷準備1時間」→自動でデータベースに記録",
          benefits: "年間110時間の日報入力・集計時間を削減"
        }
      },
      {
        title: "労務シフトオーガナイザー",
        url: "/work-scheduler",
        icon: Calendar,
        description: "作業計画に基づき最適な人員配置と労務シフトを自動作成",
        details: {
          features: ["作業計画との連動", "スキルマッチング", "労働時間最適化", "法令遵守チェック"],
          example: "収穫期に必要な人員を自動算出し、最適なシフト表を作成",
          benefits: "年間20時間の労務シフト表作成時間を削減"
        }
      }
    ]
  },
  {
    title: "市場・販路拡大",
    icon: ShoppingCart,
    description: "ブランディングと販売チャネル最適化",
    color: "bg-red-500",
    agents: [
      {
        title: "Agri-Pitch AI",
        url: "/agri-pitch",
        icon: Zap,
        description: "作物の特徴や生産者の想いを基に魅力的なブランドストーリーを自動生成",
        details: {
          features: ["品質データ活用", "ブランドストーリー自動生成", "EC商品説明文作成", "販売促進資料作成"],
          example: "糖度12%向上データを活用し「太陽の恵みをたっぷり受けた甘みあふれるトマト」のキャッチコピーを生成",
          benefits: "直販比率50%達成で年間+30万円の収益向上"
        }
      },
      {
        title: "直販チャネルマッチャー",
        url: "/sales-channel",
        icon: TrendingUp,
        description: "作物の特性や顧客層に合わせ最も収益性の高い直販チャネルを推薦",
        details: {
          features: ["作物特性分析", "顧客層マッチング", "収益性シミュレーション", "販売チャネル最適化"],
          example: "高糖度トマトは高級食材店・直売所が最適、収益性25%向上見込み",
          benefits: "中間マージン15%削減で年間収益大幅改善"
        }
      }
    ]
  },
  {
    title: "生活・移住支援",
    icon: Home,
    description: "地方移住と営農生活の総合支援",
    color: "bg-indigo-500",
    agents: [
      {
        title: "お試し滞在サーチャー",
        url: "/trial-stay",
        icon: MapPin,
        description: "地方移住希望者向けに短期滞在プログラムや空き家情報を検索・提供",
        details: {
          features: ["短期滞在プログラム検索", "空き家情報提供", "地域体験プログラム紹介", "移住支援制度案内"],
          example: "○○地域の1週間農業体験プログラム、空き家付き農地情報を提供",
          benefits: "移住前のリスク軽減とスムーズな地域統合"
        }
      },
      {
        title: "生活コストシミュレーター",
        url: "/cost-simulator",
        icon: BarChart4,
        description: "移住後の生活費や営農収支をシミュレーションしリアルな生活設計を支援",
        details: {
          features: ["生活費シミュレーション", "営農収支予測", "副業収入計算", "投資回収期間算出"],
          example: "移住後の生活費月20万円、営農収入月25万円、副業8万円で安定した生活設計が可能",
          benefits: "現実的な移住計画で成功率向上"
        }
      }
    ]
  }
];

export default function AIAgentsPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider className="h-screen">
      {isMobile ? (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <AppSidebar className="hidden md:block" />
      )}
      <SidebarInset className={`flex flex-col h-full ${!isMobile ? 'md:ml-14' : ''}`}>
        <MainHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-primary mb-2">🤖 AIエージェント一覧</h1>
                <p className="text-muted-foreground text-lg">
                  6つの専門クラスターが連携して、あなたの営農業務を24時間365日サポートします
                </p>
              </div>
              
              <div className="space-y-8">
                {aiClusters.map((cluster) => (
                  <div key={cluster.title} className="border border-border rounded-lg p-6 bg-card">
                    {/* クラスターヘッダー */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${cluster.color} text-white`}>
                        <cluster.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-primary">{cluster.title}</h2>
                        <p className="text-sm text-muted-foreground">{cluster.description}</p>
                      </div>
                    </div>
                    
                    {/* エージェント一覧 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cluster.agents.map((agent) => (
                        <div key={agent.title} className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                          <agent.icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{agent.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">詳細</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <agent.icon className="h-5 w-5 text-primary" />
                                  {agent.title}
                                </DialogTitle>
                                <DialogDescription>
                                  {agent.description}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {agent.details && (
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">主な機能</h4>
                                    <ul className="space-y-1">
                                      {agent.details.features.map((feature, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">活用例</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                      {agent.details.example}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-sm mb-2">期待される効果</h4>
                                    <p className="text-sm text-primary font-medium">
                                      {agent.details.benefits}
                                    </p>
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button asChild>
                                      <Link href={agent.url}>このエージェントを使用</Link>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 効果サマリー */}
              <div className="mt-12 border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-bold text-primary mb-4">🌟 期待される効果</h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary">+190万円</div>
                    <div className="text-sm text-muted-foreground">年間収益向上</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-secondary">180時間</div>
                    <div className="text-sm text-muted-foreground">年間時間削減</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-accent">+12%</div>
                    <div className="text-sm text-muted-foreground">品質向上</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}