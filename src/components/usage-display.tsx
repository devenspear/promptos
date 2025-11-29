'use client';

import { useEffect, useState } from 'react';

interface UsageData {
  totalCredits: number;
  totalUsage: number;
  remaining: number;
}

export function UsageDisplay() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Get current month name for display
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <div className="animate-pulse w-20 h-4 bg-zinc-800 rounded" />
      </div>
    );
  }

  if (error || !usage) {
    return null; // Silently fail - don't break the UI
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">API Cost:</span>
          <span className="text-orange-400 font-mono font-semibold">
            {formatCurrency(usage.totalUsage)}
          </span>
        </div>
        <span className="text-zinc-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">Remaining:</span>
          <span className="text-green-400 font-mono font-semibold">
            {formatCurrency(usage.remaining)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-zinc-600">{currentMonth} (Lifetime via OpenRouter)</span>
    </div>
  );
}
