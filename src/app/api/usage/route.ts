import { NextResponse } from 'next/server';

// Claude Sonnet 4 pricing (as of 2024)
// Input: $3.00 per million tokens
// Output: $15.00 per million tokens
const CLAUDE_SONNET_PRICING = {
  input: 3.00 / 1_000_000,   // $0.000003 per token
  output: 15.00 / 1_000_000, // $0.000015 per token
};

// Simple in-memory tracking (resets on server restart)
// For production, you'd use a database or Vercel KV
let sessionUsage = {
  totalInputTokens: 0,
  totalOutputTokens: 0,
  requestCount: 0,
  lastReset: new Date().toISOString(),
};

export async function GET() {
  const inputCost = sessionUsage.totalInputTokens * CLAUDE_SONNET_PRICING.input;
  const outputCost = sessionUsage.totalOutputTokens * CLAUDE_SONNET_PRICING.output;
  const totalCost = inputCost + outputCost;

  return NextResponse.json({
    provider: 'Anthropic',
    model: 'Claude Sonnet 4',
    session: {
      inputTokens: sessionUsage.totalInputTokens,
      outputTokens: sessionUsage.totalOutputTokens,
      totalTokens: sessionUsage.totalInputTokens + sessionUsage.totalOutputTokens,
      requestCount: sessionUsage.requestCount,
      estimatedCost: totalCost,
      lastReset: sessionUsage.lastReset,
    },
    pricing: {
      inputPer1M: '$3.00',
      outputPer1M: '$15.00',
    },
  });
}

// Called by the generate API to track usage
export async function POST(request: Request) {
  try {
    const { input_tokens, output_tokens } = await request.json();

    sessionUsage.totalInputTokens += input_tokens || 0;
    sessionUsage.totalOutputTokens += output_tokens || 0;
    sessionUsage.requestCount += 1;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 400 });
  }
}

// ========================================
// OPENROUTER USAGE API (Inactive - kept for future use)
// ========================================
/*
export async function GET_OPENROUTER() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter credits error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      totalCredits: data.data?.total_credits || 0,
      totalUsage: data.data?.total_usage || 0,
      remaining: (data.data?.total_credits || 0) - (data.data?.total_usage || 0),
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
*/
