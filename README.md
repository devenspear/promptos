# PromptOS

Transform your vague ideas into perfectly crafted prompts optimized for every major LLM.

**Available as a web app and native macOS desktop app.**

## What It Does

PromptOS takes your rough idea (e.g., "help me write better emails") and generates four specialized prompts, each optimized for a different LLM:

- **Claude** - XML-tagged prompts leveraging Claude's structured reasoning
- **GPT-4** - Markdown + JSON schema format for OpenAI models
- **Gemini** - Clean markdown with explicit task definitions
- **Grok** - Direct conversational prompts with real-time context

Each prompt follows the best practices and formatting preferences for its target model.

## Features

### Web App
- Single-click prompt generation for 4 major LLMs
- Copy-to-clipboard for each generated prompt
- Expandable prompt cards for detailed viewing
- Format info panels explaining each model's preferences
- Mobile-optimized responsive design
- Optional password protection
- API usage tracking (session-based)
- "Start Over" button to quickly reset and generate new prompts

### macOS Desktop App
- Native macOS app built with Tauri
- Your Anthropic API key stored locally (no server needed)
- Window position and size persistence
- Settings panel for customization:
  - Default model preference
  - Auto-copy generated prompts
  - Toggle format info display
  - **Background customization**: solid colors, linear/radial gradients
  - **6 preset color themes**: Default Dark, Deep Purple, Ocean Blue, Forest Green, Warm Ember, Midnight
  - **Custom color pickers** with hex input
  - **Window transparency** slider (see your desktop through the app)
  - Reset to defaults button
- Lightweight and fast (~10MB app size)
- Works offline once API key is configured

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

### Web App
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **AI**: Anthropic Claude API (claude-sonnet-4)
- **Deployment**: Vercel

### macOS Desktop App
- **Framework**: Tauri 2.0
- **Backend**: Rust
- **Frontend**: Same Next.js codebase (static export)
- **Plugins**: Window state persistence

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints (web only)
│   │   ├── generate/      # Prompt generation endpoint (web only)
│   │   └── usage/         # Usage tracking endpoint (web only)
│   ├── desktop/
│   │   └── page.tsx       # Desktop app page (no auth, local API key)
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Web application page
│   └── globals.css        # Global styles + Tailwind
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── prompt-card.tsx    # Prompt display card
│   ├── usage-display.tsx  # API usage stats
│   └── project-footer.tsx # Footer with version
└── lib/
    ├── anthropic-client.ts # Client-side API calls (desktop)
    ├── meta-prompts.ts    # Meta-prompt for generation
    └── utils.ts           # Utility functions

src-tauri/                  # Tauri desktop app
├── src/
│   ├── lib.rs             # Main Tauri application
│   └── main.rs            # Entry point
├── icons/                 # App icons
├── Cargo.toml             # Rust dependencies
└── tauri.conf.json        # Tauri configuration
```

## Building the macOS Desktop App

### Prerequisites
- Node.js 18+
- Rust (install via `rustup`)
- Xcode Command Line Tools

### Build Steps

```bash
# Install dependencies
npm install

# Build the macOS app
npm run tauri:build
```

The built app will be at `src-tauri/target/release/bundle/macos/PromptOS.app`

### Development Mode

```bash
# Run in development mode with hot reload
npm run tauri:dev
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
