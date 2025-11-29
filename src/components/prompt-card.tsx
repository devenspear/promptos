'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MODEL_LABELS, ModelKey } from '@/lib/meta-prompts';

const FORMAT_DESCRIPTIONS: Record<ModelKey, { format: string; description: string }> = {
  claude: {
    format: 'XML Tags',
    description: 'Claude excels with XML-structured prompts using tags like <task>, <context>, <constraints>. This hierarchical format helps Claude parse complex instructions and enables superior chain-of-thought reasoning.',
  },
  gpt4: {
    format: 'Markdown + JSON Schema',
    description: 'GPT-4 performs best with markdown headers (##) for sections and JSON schemas for structured outputs. Step-by-step instructions leverage its strong reasoning capabilities.',
  },
  gemini: {
    format: 'Clean Markdown',
    description: 'Gemini prefers explicit, well-formatted markdown with clear task definitions. It responds well to safety considerations and explicit output format specifications.',
  },
  grok: {
    format: 'Direct Conversational',
    description: 'Grok works best with direct, conversational prompts that maintain precision. Its real-time knowledge means prompts can reference current events and trends.',
  },
};

interface PromptCardProps {
  modelKey: ModelKey;
  prompt: string;
  showInfo: boolean;
  isExpanded: boolean;
  onExpand: () => void;
}

export function PromptCard({ modelKey, prompt, showInfo, isExpanded, onExpand }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const model = MODEL_LABELS[modelKey];
  const formatInfo = FORMAT_DESCRIPTIONS[modelKey];

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't expand if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    onExpand();
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`
        ${model.bgColor} ${model.borderColor} border-2 cursor-pointer
        transition-all duration-300 ease-in-out
        ${isExpanded
          ? 'col-span-1 md:col-span-2 row-span-2 z-10 scale-100'
          : 'hover:scale-[1.02]'
        }
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className={`bg-gradient-to-r ${model.color} bg-clip-text text-transparent font-bold text-lg`}>
              {model.name}
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              {model.company}
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`
              h-10 px-5 text-sm font-semibold
              transition-all duration-200
              ${copied
                ? 'bg-green-500/20 border-green-500 text-green-400 scale-105'
                : 'hover:scale-110 hover:bg-white/10'
              }
            `}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showInfo && (
          <div className="bg-black/30 rounded-lg p-3 border border-zinc-700 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold bg-gradient-to-r ${model.color} bg-clip-text text-transparent`}>
                Format:
              </span>
              <span className="text-xs text-white font-mono">{formatInfo.format}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {formatInfo.description}
            </p>
          </div>
        )}
        <pre
          className={`
            whitespace-pre-wrap text-sm font-mono bg-black/20 p-4 rounded-lg overflow-y-auto text-zinc-200
            transition-all duration-300
            ${isExpanded ? 'max-h-[60vh]' : 'max-h-64'}
          `}
        >
          {prompt}
        </pre>
        {isExpanded && (
          <p className="text-xs text-zinc-500 text-center animate-pulse">
            Click anywhere to collapse
          </p>
        )}
      </CardContent>
    </Card>
  );
}
