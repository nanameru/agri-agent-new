'use client';

import React, { useEffect } from 'react';
import { useModel } from './ModelContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ModelProvider = 'openai' | 'claude' | 'gemini' | 'bedrock';

interface Model {
  id: string;
  provider: ModelProvider;
  name: string;
  displayName: string;
}

const models: Model[] = [
  { id: 'claude-3-7-sonnet-20250219', provider: 'claude', name: 'claude-3-7-sonnet-20250219', displayName: 'Amazon Bedrock' },
];

const providerConfig = {
  openai: { 
    label: 'OpenAI', 
    color: 'text-green-700',
    badgeColor: 'bg-green-100 text-green-800 border-green-200'
  },
  claude: { 
    label: 'Claude', 
    color: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  gemini: { 
    label: 'Gemini', 
    color: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  bedrock: { 
    label: 'Bedrock', 
    color: 'text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
};

export const ModelSelector = () => {
  const { currentModel, setCurrentModel } = useModel();

  const selectedModel = models.find(m => m.name === currentModel.modelName) || models[0];

  const handleModelChange = async (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    const newModelConfig = {
      provider: model.provider,
      modelName: model.name
    };
    
    // Contextの状態を更新
    setCurrentModel(newModelConfig);
    
    // Send model change to API
    try {
      await fetch('/api/set-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModelConfig),
      });
    } catch (error) {
      console.error('Failed to update model:', error);
    }
  };

  return (
    <Select value={selectedModel.id} onValueChange={handleModelChange}>
      <SelectTrigger className="w-[280px] h-9">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${providerConfig[selectedModel.provider].badgeColor}`}>
              {providerConfig[selectedModel.provider].label}
            </span>
            <span className="text-sm font-medium">{selectedModel.displayName}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(
          models.reduce((acc, model) => {
            if (!acc[model.provider]) acc[model.provider] = [];
            acc[model.provider].push(model);
            return acc;
          }, {} as Record<ModelProvider, Model[]>)
        ).map(([provider, providerModels]) => (
          <div key={provider}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {providerConfig[provider as ModelProvider].label}
            </div>
            {providerModels.map((model) => (
              <SelectItem key={model.id} value={model.id} className="pl-6">
                <div className="flex items-center justify-between w-full">
                  <span>{model.displayName}</span>
                  {selectedModel.id === model.id && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};