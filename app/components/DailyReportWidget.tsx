'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mic, Send, Camera, Calendar, MapPin } from 'lucide-react';

interface DailyReportWidgetProps {
  onSubmit?: (data: any) => void;
}

export const DailyReportWidget = ({ onSubmit }: DailyReportWidgetProps) => {
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    field: '',
    crop: '',
    workType: '',
    hours: '',
    weather: '',
    notes: '',
    photos: [] as File[]
  });
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(reportData);
    }
    // リセット
    setReportData({
      date: new Date().toISOString().split('T')[0],
      field: '',
      crop: '',
      workType: '',
      hours: '',
      weather: '',
      notes: '',
      photos: []
    });
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // 実際のアプリでは音声認識APIを実装
  };

  return (
    <Card className="agri-card w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          今日の営農日報
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">作業日</label>
              <Input
                type="date"
                value={reportData.date}
                onChange={(e) => setReportData(prev => ({ ...prev, date: e.target.value }))}
                className="agri-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">圃場</label>
              <Input
                placeholder="例: 第1圃場"
                value={reportData.field}
                onChange={(e) => setReportData(prev => ({ ...prev, field: e.target.value }))}
                className="agri-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作物</label>
              <Input
                placeholder="例: トマト"
                value={reportData.crop}
                onChange={(e) => setReportData(prev => ({ ...prev, crop: e.target.value }))}
                className="agri-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作業内容</label>
              <Input
                placeholder="例: 収穫作業"
                value={reportData.workType}
                onChange={(e) => setReportData(prev => ({ ...prev, workType: e.target.value }))}
                className="agri-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作業時間</label>
              <Input
                placeholder="例: 3.5"
                value={reportData.hours}
                onChange={(e) => setReportData(prev => ({ ...prev, hours: e.target.value }))}
                className="agri-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">天気</label>
              <Input
                placeholder="例: 晴れ"
                value={reportData.weather}
                onChange={(e) => setReportData(prev => ({ ...prev, weather: e.target.value }))}
                className="agri-input"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">詳細メモ</label>
            <div className="relative">
              <Textarea
                placeholder="今日の作業内容や気づきを記録してください..."
                value={reportData.notes}
                onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
                className="agri-input min-h-[100px] pr-12"
              />
              <Button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute top-2 right-2 p-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-secondary'}`}
                size="sm"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              写真追加
            </Button>
            
            <Button
              type="submit"
              className="agri-button"
            >
              <Send className="h-4 w-4" />
              日報を送信
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};