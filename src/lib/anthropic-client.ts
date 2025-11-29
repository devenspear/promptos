// Client-side Anthropic API calls for Tauri desktop app
import { META_PROMPT } from './meta-prompts';

interface AnthropicResponse {
  content: Array<{ text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface GenerateResult {
  prompts: {
    claude: string;
    gpt4: string;
    gemini: string;
    grok: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function generatePromptsClient(
  intent: string,
  apiKey: string
): Promise<GenerateResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
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
    throw new Error('Failed to generate prompts');
  }

  const data: AnthropicResponse = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error('No content in response');
  }

  // Parse the JSON response from the model
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.slice(7);
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.slice(3);
  }
  if (jsonContent.endsWith('```')) {
    jsonContent = jsonContent.slice(0, -3);
  }

  const prompts = JSON.parse(jsonContent.trim());

  return {
    prompts,
    usage: {
      input_tokens: data.usage?.input_tokens || 0,
      output_tokens: data.usage?.output_tokens || 0,
    },
  };
}

// Store API key in localStorage (Tauri app only - keys stay on device)
const API_KEY_STORAGE_KEY = 'promptos_anthropic_api_key';

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setStoredApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

export function clearStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}
