"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

const StagewiseToolbar = () => {
  useEffect(() => {
    // 開発モードでのみ一度だけ初期化する
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_STAGEWISE_ENABLED === 'true') {
      // 重複して初期化されるのを防ぐためのフラグ
      if (!(window as any).__STGWS_INITIALIZED__) {
        try {
          // Dynamic import to handle missing @stagewise/toolbar gracefully
          import('@stagewise/toolbar').then(({ initToolbar }) => {
            initToolbar({
              plugins: [],
            });
            (window as any).__STGWS_INITIALIZED__ = true;
          }).catch((error) => {
            console.warn('Stagewise toolbar not available:', error.message);
          });
        } catch (error) {
          console.warn('Failed to load Stagewise toolbar:', error);
        }
      }
    }
  }, []);

  return (
    <div className="bg-background border-t border-border">
      {/* 提案リストのJSXを削除 */}
    </div>
  );
};

export default StagewiseToolbar; 