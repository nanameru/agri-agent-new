'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PanelLeft, Wheat, Sun, CloudRain, Thermometer } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ModelSelector } from './ModelSelector';

interface MainHeaderProps {
  onMenuClick?: () => void;
}

export const MainHeader = ({ onMenuClick }: MainHeaderProps) => {
  const isMobile = useIsMobile();

  // Mock weather data - in real app, this would come from an API
  const weatherData = {
    temperature: 24,
    condition: "sunny",
    humidity: 65
  };

  return (
    <header className="agri-header sticky top-0 z-40 w-full shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left side: Logo and Menu */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10"
              onClick={onMenuClick}
            >
              <PanelLeft className="h-5 w-5 text-primary" />
              <span className="sr-only">Open Menu</span>
            </Button>
          )}
          
          {/* 🌾 AGRI-Agent Logo */}
          <div className="flex items-center gap-2">
            <Wheat className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-primary hidden sm:inline">
              AGRI-Agent
            </span>
          </div>
        </div>
        
        {/* Center: Model selector */}
        <div className="flex-1 flex justify-center">
          <ModelSelector />
        </div>
        
        {/* Right side: Weather Info */}
        <div className="flex items-center gap-4">
          {!isMobile && (
            <div className="flex items-center gap-3 px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-1">
                {weatherData.condition === "sunny" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <CloudRain className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium text-primary">
                  {weatherData.temperature}°C
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-muted-foreground">
                  {weatherData.humidity}%
                </span>
              </div>
            </div>
          )}
          
          {/* Mobile weather indicator */}
          {isMobile && (
            <div className="flex items-center gap-1">
              <Sun className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-primary">
                {weatherData.temperature}°C
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 