'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, Wheat } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export const MainHeader = ({ onMenuClick }: MainHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={onMenuClick}
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          ) : (
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-primary/10 transition-colors duration-200" />
          )}
          
          <div className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">
              AGRI-Agent
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}; 