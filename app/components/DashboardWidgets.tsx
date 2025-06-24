'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Droplets, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Thermometer,
  Sprout
} from 'lucide-react';

export const DashboardWidgets = () => {
  // モックデータ
  const effectsData = {
    revenue: { current: 110, target: 190, unit: '万円/年' },
    timeSaved: { current: 120, target: 180, unit: '時間/年' },
    qualityImprovement: { current: 8, target: 12, unit: '%向上' }
  };

  const subsidyData = [
    {
      name: 'スマート農業導入支援事業',
      match: 95,
      deadline: '2025年3月31日',
      amount: '最大50万円'
    },
    {
      name: '農業次世代人材投資資金',
      match: 88,
      deadline: '2025年2月15日', 
      amount: '年間150万円'
    }
  ];

  const cropPlanData = {
    currentCrop: 'トマト',
    nextRecommendation: '明日9:00に15分間の灌水',
    qualityForecast: '糖度12%向上の見込み',
    waterReduction: '30%削減'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 収益効果ウィジェット */}
      <Card className="agri-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            収益向上効果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">年間収益増</span>
                <span className="text-xs text-muted-foreground">
                  {effectsData.revenue.current}/{effectsData.revenue.target}{effectsData.revenue.unit}
                </span>
              </div>
              <Progress value={(effectsData.revenue.current / effectsData.revenue.target) * 100} className="h-2" />
              <div className="text-2xl font-bold text-primary mt-2">
                +{effectsData.revenue.current}万円
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              目標まで残り {effectsData.revenue.target - effectsData.revenue.current}万円
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 時間削減効果ウィジェット */}
      <Card className="agri-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-secondary" />
            時間削減効果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">年間削減時間</span>
                <span className="text-xs text-muted-foreground">
                  {effectsData.timeSaved.current}/{effectsData.timeSaved.target}{effectsData.timeSaved.unit}
                </span>
              </div>
              <Progress value={(effectsData.timeSaved.current / effectsData.timeSaved.target) * 100} className="h-2" />
              <div className="text-2xl font-bold text-secondary mt-2">
                {effectsData.timeSaved.current}時間
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              週あたり約2.3時間の余裕を創出
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 品質向上ウィジェット */}
      <Card className="agri-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-accent" />
            品質向上効果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">糖度向上</span>
                <span className="text-xs text-muted-foreground">
                  {effectsData.qualityImprovement.current}/{effectsData.qualityImprovement.target}{effectsData.qualityImprovement.unit}
                </span>
              </div>
              <Progress value={(effectsData.qualityImprovement.current / effectsData.qualityImprovement.target) * 100} className="h-2" />
              <div className="text-2xl font-bold text-accent mt-2">
                +{effectsData.qualityImprovement.current}%
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              品質プレミアムで+30万円/年
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 補助金ウォッチャー */}
      <Card className="agri-card md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-primary" />
            補助金ウォッチャー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subsidyData.map((subsidy, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex-1">
                  <div className="font-medium text-sm">{subsidy.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    適合度: {subsidy.match}% | 締切: {subsidy.deadline}
                  </div>
                </div>
                <div className="text-right mr-3">
                  <div className="font-bold text-primary">{subsidy.amount}</div>
                </div>
                <Button size="sm" className="agri-button">
                  申請
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 水肥最適化ボット */}
      <Card className="agri-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Droplets className="h-4 w-4 text-blue-500" />
            水肥最適化
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{cropPlanData.currentCrop}圃場</span>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    {cropPlanData.nextRecommendation}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {cropPlanData.qualityForecast}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">水使用量削減</span>
              <span className="font-medium text-primary">{cropPlanData.waterReduction}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};