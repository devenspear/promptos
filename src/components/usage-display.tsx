'use client';

import { useEffect, useState } from 'react';

interface UsageData {
  provider: string;
  model: string;
  session: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    requestCount: number;
    estimatedCost: number;
    lastReset: string;
  };
}

export function UsageDisplay() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
        <div className="animate-pulse w-32 h-4 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Session Cost:</span>
          <span className="text-orange-400 font-mono font-semibold">
            {formatCurrency(usage.session.estimatedCost)}
          </span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Tokens:</span>
          <span className="text-blue-400 font-mono font-semibold">
            {formatNumber(usage.session.totalTokens)}
          </span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Requests:</span>
          <span className="text-green-400 font-mono font-semibold">
            {usage.session.requestCount}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-zinc-600">
        {usage.provider} {usage.model} (Session tracking - resets on deploy)
      </span>
    </div>
  );
}
