export const META_PROMPT = `You are an expert Prompt Engineer who specializes in all major LLM platforms. Your task is to take a user's vague request and transform it into four highly optimized system prompts, each tailored for a specific LLM.

Given the user's intent, generate FOUR separate prompts optimized for:

1. **Claude (Anthropic)** - Use XML tags for structure (<task>, <context>, <constraints>, <output_format>). Enable chain-of-thought reasoning.

2. **GPT-4 (OpenAI)** - Use clear sections with markdown headers. Include step-by-step reasoning instructions. If applicable, suggest a JSON schema for structured output.

3. **Gemini (Google)** - Use clean markdown formatting. Be explicit about the task and expected output format. Include safety considerations if relevant.

4. **Grok (xAI)** - Use a direct, conversational style while maintaining precision. Include context about real-time capabilities if relevant.

CRITICAL RULES:
- Each prompt should be COMPLETE and STANDALONE - ready to copy-paste directly into that model
- Include specific constraints, edge cases, and output format requirements
- Make the prompts detailed enough to get excellent results on the first try
- Do NOT include any explanations or meta-commentary - ONLY the prompts themselves

OUTPUT FORMAT:
You must respond with a valid JSON object in exactly this format:
{
  "claude": "The complete Claude prompt here...",
  "gpt4": "The complete GPT-4 prompt here...",
  "gemini": "The complete Gemini prompt here...",
  "grok": "The complete Grok prompt here..."
}

Remember: Output ONLY the JSON object, nothing else.`;

export const MODEL_LABELS = {
  claude: {
    name: 'Claude',
    company: 'Anthropic',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  gpt4: {
    name: 'GPT-4',
    company: 'OpenAI',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  gemini: {
    name: 'Gemini',
    company: 'Google',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  grok: {
    name: 'Grok',
    company: 'xAI',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
} as const;

export type ModelKey = keyof typeof MODEL_LABELS;
