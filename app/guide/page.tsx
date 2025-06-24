'use client';

import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { MainHeader } from '@/app/components/MainHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from 'react';
import { 
  Search, 
  Target, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Users,
  Bot,
  Brain,
  Calendar,
  DollarSign,
  BarChart,
  MapPin,
  Wheat,
  Sprout,
  Clock,
  Award,
  CheckCircle
} from 'lucide-react';

export default function FarmingGuidePage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const agentClusters = [
    {
      id: 'research',
      title: '農業データリサーチ',
      icon: Search,
      color: 'bg-blue-500',
      agents: [
        {
          name: '補助金ウォッチャー',
          description: '全国の補助金・助成金情報を常時監視し、利用可能な制度を自動で推薦・通知',
          features: ['自動マッチング', '申請締切通知', '適合度95%の精密分析']
        }
      ],
      benefits: ['年間25時間の申請作業削減', 'IoTセンサー導入費用最大1/2補助']
    },
    {
      id: 'production',
      title: '生産管理・計画',
      icon: Target,
      color: 'bg-green-500',
      agents: [
        {
          name: '作付プランナー',
          description: '土壌データ、気象予測、市場価格を分析し、最適な作付計画と輪作体系を立案',
          features: ['データ分析', '輪作最適化', '収益予測']
        },
        {
          name: '水肥最適化ボット',
          description: 'センサーデータと生育画像から、品質を最大化する水・肥料の最適なタイミングと量を提示',
          features: ['リアルタイム監視', '糖度12%向上', '水使用量30%削減']
        }
      ],
      benefits: ['平均糖度12%向上', '水使用量30%削減', '年間25時間の計画作業削減']
    },
    {
      id: 'application',
      title: '申請・手続クラスター',
      icon: FileText,
      color: 'bg-purple-500',
      agents: [
        {
          name: '農地取得ナビ',
          description: '農地取得や賃借に関する法的手続きや必要書類をナビゲート',
          features: ['法的手続き支援', '書類作成支援', 'ステップガイド']
        },
        {
          name: '補助金フォームビルダー',
          description: '推薦された補助金の申請フォームに、営農データを基に必要な事項を自動入力',
          features: ['自動入力', 'データ連携', 'エラーチェック']
        }
      ],
      benefits: ['年間25時間の書類作成削減', '申請ミス0件達成']
    },
    {
      id: 'knowledge',
      title: '日報・ナレッジクラスター',
      icon: BookOpen,
      color: 'bg-orange-500',
      agents: [
        {
          name: '日報パーサー',
          description: '音声や手書きメモの日報を構造化データに変換し、自動で記録・整理',
          features: ['音声認識', '手書き認識', '自動分類']
        },
        {
          name: '労務シフトオーガナイザー',
          description: '作業計画に基づき、最適な人員配置と労務シフトを自動で作成',
          features: ['最適配置', 'シフト自動生成', '効率性分析']
        }
      ],
      benefits: ['年間110時間の日報作業削減', '労務効率20%向上']
    },
    {
      id: 'marketing',
      title: '市場・販路拡大クラスター',
      icon: TrendingUp,
      color: 'bg-red-500',
      agents: [
        {
          name: 'Agri-Pitch AI',
          description: '作物の特徴や生産者の想いを基に、魅力的なブランドストーリーやEC商品説明文を自動生成',
          features: ['ブランディング', 'ストーリー生成', 'SEO最適化']
        },
        {
          name: '直販チャネルマッチャー',
          description: '作物の特性や顧客層に合わせ、最も収益性の高い直販チャネルを推薦',
          features: ['チャネル分析', '顧客マッチング', '収益最適化']
        }
      ],
      benefits: ['直販比率50%達成', '中間マージン15%削減', '年間60万円収益向上']
    },
    {
      id: 'lifestyle',
      title: '生活・移住支援クラスター',
      icon: Users,
      color: 'bg-indigo-500',
      agents: [
        {
          name: 'お試し滞在サーチャー',
          description: '地方移住希望者向けに、短期の短期滞在プログラムや空き家情報を検索・提供',
          features: ['プログラム検索', '空き家情報', '地域紹介']
        },
        {
          name: '生活コストシミュレーター',
          description: '移住後の生活費や営農収支をシミュレーションし、リアルな生活設計を支援',
          features: ['収支計算', 'リスク分析', '生活設計']
        }
      ],
      benefits: ['移住成功率80%', 'IT副業との両立支援']
    }
  ];

  const economicEffects = [
    {
      category: '年間作業時間削減',
      value: '180時間/年',
      icon: Clock,
      items: [
        { name: '日報入力・集計の自動化', value: '110時間/年' },
        { name: '申請書類の自動生成', value: '25時間/年' },
        { name: '作付・水肥計画の再計算', value: '25時間/年' },
        { name: '労務シフト表の自動作成', value: '20時間/年' }
      ]
    },
    {
      category: '収益向上効果',
      value: '+190万円/年',
      icon: DollarSign,
      items: [
        { name: '農業純益の向上', value: '+110万円/年' },
        { name: '副業収入の創出', value: '+80万円/年' }
      ]
    },
    {
      category: '品質向上効果',
      value: '+60万円/年',
      icon: Award,
      items: [
        { name: '品質プレミアム', value: '+30万円/年' },
        { name: '直販マージン改善', value: '+30万円/年' }
      ]
    }
  ];

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
          <div className="container mx-auto px-6 py-8 max-w-6xl">
            
            {/* ヘッダーセクション */}
            <div className="text-center mb-12">
              <div className="p-8 bg-primary/5 rounded-full shadow-lg border-2 border-primary/10 relative w-fit mx-auto mb-6">
                <Wheat size={48} className="text-primary" />
                <Sprout size={24} className="text-secondary absolute -top-2 -right-2" />
              </div>
              <h1 className="text-4xl font-bold text-primary mb-4">🌾 営農ガイド</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                6つの専門AIエージェントクラスターが連携して、あなたの農業経営を最適化します
              </p>
            </div>

            {/* 概要カード */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 mb-12 border border-primary/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">+190万円</div>
                  <div className="text-sm text-muted-foreground">年間収益向上</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">180時間</div>
                  <div className="text-sm text-muted-foreground">年間作業時間削減</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">+12%</div>
                  <div className="text-sm text-muted-foreground">農産物糖度向上</div>
                </div>
              </div>
            </div>

            {/* AIエージェントクラスター */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Bot className="text-primary" />
                6つの専門AIエージェントクラスター
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agentClusters.map((cluster) => (
                  <div key={cluster.id} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${cluster.color} p-3 rounded-lg`}>
                        <cluster.icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-card-foreground">{cluster.title}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {cluster.agents.map((agent, index) => (
                        <div key={index} className="border-l-4 border-primary/30 pl-4">
                          <h4 className="font-medium text-card-foreground mb-2">{agent.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {agent.features.map((feature, idx) => (
                              <span key={idx} className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-sm font-medium text-card-foreground mb-2">主な効果:</h5>
                      <div className="space-y-1">
                        {cluster.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle size={14} className="text-green-500" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 定量的効果 */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <BarChart className="text-primary" />
                定量的効果
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {economicEffects.map((effect, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <effect.icon className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{effect.category}</h3>
                        <div className="text-2xl font-bold text-primary">{effect.value}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {effect.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{item.name}</span>
                          <span className="font-medium text-card-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 実装ロードマップ */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Calendar className="text-primary" />
                実装ロードマップ
              </h2>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Phase 1</div>
                    <h3 className="text-xl font-semibold">2025年 実証フェーズ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">対象・焦点</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 特定地域の協力農家（数十軒）</li>
                        <li>• 中核機能の検証と改良</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">主要開発</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 水肥最適化ボット</li>
                        <li>• 日報パーサー</li>
                        <li>• 補助金ウォッチャー</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Phase 2</div>
                    <h3 className="text-xl font-semibold">2026年 展開フェーズ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">対象・焦点</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 100農家への拡大</li>
                        <li>• 対象地域と品目の拡大</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">主要開発</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Agri-Pitch AI</li>
                        <li>• 直販チャネルマッチャー</li>
                        <li>• 収益向上効果の実証</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">Phase 3</div>
                    <h3 className="text-xl font-semibold">2028年 全国展開フェーズ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">対象・焦点</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 1,000農家への展開</li>
                        <li>• JAや地方自治体との連携強化</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">主要開発</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 地域単位での生産・販売最適化</li>
                        <li>• 地域農業全体の競争力向上</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 社会的インパクト */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <MapPin className="text-primary" />
                社会的インパクト
              </h2>
              
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8 border border-primary/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">時間的余裕の創出</h3>
                      <p className="text-muted-foreground">AIが年間180時間の事務作業を削減し、その時間を地域活動へ再投資可能にします。</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">地域活動の担い手増加</h3>
                      <p className="text-muted-foreground">創出された時間で地域の祭りやブランドPR活動に新たな人材が参加し、高齢化が進む地域の伝統文化を維持・活性化します。</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">地域経済の活性化</h3>
                      <p className="text-muted-foreground">農業の収益性向上と地域ブランド確立により、農産物直販で地域内経済循環が拡大します。</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-card-foreground">地方移住の促進</h3>
                      <p className="text-muted-foreground">「IT副業×スマート農業」という新しい働き方のモデルが、ITスキルを持つ新たな人材を都市部から地方へ呼び込みます。</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center">
              <div className="bg-primary text-primary-foreground rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-4">次世代農業を共に実装しよう</h2>
                <p className="mb-6 opacity-90">
                  「IT副業×スマート農業」という新しい働き方を、あなたのスキルとアイデアで共に創り上げ、<br />
                  日本の農業と地方の未来を変えませんか。
                </p>
                <div className="space-y-2 text-sm opacity-80">
                  <div>次回ハッカソン: 2025年7月26日〜28日</div>
                  <div>ハッシュタグ: #次世代農業ハッカソン</div>
                </div>
              </div>
            </section>

          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}