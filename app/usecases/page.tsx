'use client';

import { Tweet } from 'react-tweet';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Twitter } from 'lucide-react';

const tweetIds = [
  "1933834880951206092",
  "1933851662168527134",
  "1933880526756319597",
  "1933116823660368215",
  "1933153415905038645",
  "1933180942501527837",
  "1931274939539116479",
  "1929002460124754153",
  "1928792334654960103",
  "1928016389735915982",
  "1927527020595990980",
  "1926952876041023628",
  "1925892728518291752",
  "1925666739481690300",
  "1925602468047769646",
  "1925502010159444270",
  "1924395554106433740",
  "1924054507350356222"
];

export default function UsecasesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                ユースケース
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                AGRI-Agentが実際に活用されている事例をご紹介します。
              </p>
            </div>

            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-theme="light"
            >
              {tweetIds.map(id => (
                <div key={id} className="flex flex-col rounded-lg border bg-card text-card-foreground overflow-hidden">
                  <div className="flex-grow [&_>div]:mx-auto [&_>div]:h-full">
                    <Tweet id={id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 