'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { MainHeader } from '@/app/components/MainHeader';
import { DailyReportWidget } from '../components/DailyReportWidget';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DailyInputPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleReportSubmit = (data: any) => {
    console.log('日報データ:', data);
    // ここでAIに自動処理させる
    // 実際のアプリでは API に送信してデータを保存
  };

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
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">📝 営農日報</h1>
                <p className="text-muted-foreground">
                  今日の農作業内容を記録してください。AIが自動で分析・整理します。
                </p>
              </div>
              
              <DailyReportWidget onSubmit={handleReportSubmit} />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}