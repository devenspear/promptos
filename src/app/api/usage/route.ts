import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // Get credits/usage from OpenRouter
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

    // OpenRouter returns: { data: { total_credits, total_usage } }
    // total_credits = credits purchased (in USD)
    // total_usage = credits used (in USD)

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
