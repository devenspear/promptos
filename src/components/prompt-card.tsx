'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MODEL_LABELS, ModelKey } from '@/lib/meta-prompts';

interface PromptCardProps {
  modelKey: ModelKey;
  prompt: string;
}

export function PromptCard({ modelKey, prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const model = MODEL_LABELS[modelKey];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={`${model.bgColor} ${model.borderColor} border-2 transition-all hover:scale-[1.02]`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className={`bg-gradient-to-r ${model.color} bg-clip-text text-transparent font-bold`}>
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
            className="h-8 px-3"
          >
            {copied ? (
              <span className="text-green-500">Copied!</span>
            ) : (
              'Copy'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm font-mono bg-black/20 p-4 rounded-lg max-h-64 overflow-y-auto">
          {prompt}
        </pre>
      </CardContent>
    </Card>
  );
}
