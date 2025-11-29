# PromptOS

Transform your vague ideas into perfectly crafted prompts optimized for every major LLM.

## What It Does

PromptOS takes your rough idea (e.g., "help me write better emails") and generates four specialized prompts, each optimized for a different LLM:

- **Claude** - XML-tagged prompts leveraging Claude's structured reasoning
- **GPT-4** - Markdown + JSON schema format for OpenAI models
- **Gemini** - Clean markdown with explicit task definitions
- **Grok** - Direct conversational prompts with real-time context

Each prompt follows the best practices and formatting preferences for its target model.

## Features

- Single-click prompt generation for 4 major LLMs
- Copy-to-clipboard for each generated prompt
- Expandable prompt cards for detailed viewing
- Format info panels explaining each model's preferences
- Mobile-optimized responsive design
- Optional password protection
- API usage tracking (session-based)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/devenspear/promptos.git
cd promptos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
# Required - Get your key at https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional - Set a password to protect access
ACCESS_PASSWORD=your_password_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `ACCESS_PASSWORD` - (Optional) Password to protect the app
4. Deploy

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/) |
| `ACCESS_PASSWORD` | No | If set, users must enter this password to use the app |
| `NEXT_PUBLIC_APP_URL` | No | Your app's URL (for metadata) |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **AI**: Anthropic Claude API (claude-sonnet-4)
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── generate/      # Prompt generation endpoint
│   │   └── usage/         # Usage tracking endpoint
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles + Tailwind
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── prompt-card.tsx    # Prompt display card
│   ├── usage-display.tsx  # API usage stats
│   └── project-footer.tsx # Footer with version
└── lib/
    ├── meta-prompts.ts    # Meta-prompt for generation
    └── utils.ts           # Utility functions
```

## How It Works

1. User enters a vague intent (e.g., "help me brainstorm product ideas")
2. The intent is sent to Claude with a meta-prompt
3. Claude generates four optimized prompts in a single API call
4. Each prompt is formatted specifically for its target model
5. User copies the relevant prompt and uses it with their preferred LLM

## Cost

PromptOS uses Claude Sonnet 4 via the Anthropic API. Typical costs:

- ~$0.003-0.01 per prompt generation
- Session usage is displayed in the app header

## License

MIT

## Author

Built by Deven Spear
