import { NextRequest, NextResponse } from 'next/server';
import { META_PROMPT } from '@/lib/meta-prompts';

export async function POST(request: NextRequest) {
  try {
    const { intent } = await request.json();

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        { error: 'Intent is required' },
        { status: 400 }
      );
    }

    // ========================================
    // ANTHROPIC API (Active)
    // ========================================
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: META_PROMPT,
        messages: [
          {
            role: 'user',
            content: `User's intent: "${intent}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate prompts' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    // Extract usage for potential future tracking
    const usage = data.usage;
    console.log('Anthropic usage:', usage);

    if (!content) {
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      );
    }

    // Parse the JSON response from the model
    let prompts;
    try {
      // Handle potential markdown code blocks
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      prompts = JSON.parse(jsonContent.trim());
    } catch {
      console.error('Failed to parse model response:', content);
      return NextResponse.json(
        { error: 'Failed to parse generated prompts' },
        { status: 500 }
      );
    }

    // Track usage (fire and forget)
    if (usage) {
      fetch(new URL('/api/usage', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
        }),
      }).catch(() => {}); // Ignore errors
    }

    return NextResponse.json({
      prompts,
      usage: {
        input_tokens: usage?.input_tokens || 0,
        output_tokens: usage?.output_tokens || 0,
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ========================================
// OPENROUTER API (Inactive - kept for future use)
// ========================================
/*
export async function POST_OPENROUTER(request: NextRequest) {
  try {
    const { intent } = await request.json();

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        { error: 'Intent is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'PromptOS',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'system',
            content: META_PROMPT,
          },
          {
            role: 'user',
            content: `User's intent: "${intent}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate prompts' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in response' },
        { status: 500 }
      );
    }

    // Parse the JSON response from the model
    let prompts;
    try {
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.slice(0, -3);
      }
      prompts = JSON.parse(jsonContent.trim());
    } catch {
      console.error('Failed to parse model response:', content);
      return NextResponse.json(
        { error: 'Failed to parse generated prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/
