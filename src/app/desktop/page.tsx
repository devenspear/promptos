'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import { MODEL_LABELS, ModelKey } from '@/lib/meta-prompts';
import { ProjectFooter } from '@/components/project-footer';
import { generatePromptsClient } from '@/lib/anthropic-client';

interface Prompts {
  claude: string;
  gpt4: string;
  gemini: string;
  grok: string;
}

interface UsageStats {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

// Storage keys
const API_KEY_STORAGE = 'promptos_api_key';
const SETTINGS_STORAGE = 'promptos_settings';

type BackgroundType = 'solid' | 'gradient-linear' | 'gradient-radial';

interface BackgroundSettings {
  type: BackgroundType;
  color1: string;
  color2: string;
  opacity: number; // 0-100
}

interface AppSettings {
  defaultModel: ModelKey;
  autoCopyModel: ModelKey | null;
  showFormatInfo: boolean;
  background: BackgroundSettings;
}

const DEFAULT_BACKGROUND: BackgroundSettings = {
  type: 'gradient-linear',
  color1: '#09090b', // zinc-950
  color2: '#18181b', // zinc-900
  opacity: 100,
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'claude',
  autoCopyModel: null,
  showFormatInfo: true,
  background: DEFAULT_BACKGROUND,
};

// Preset background options
const BACKGROUND_PRESETS = [
  { name: 'Default Dark', color1: '#09090b', color2: '#18181b' },
  { name: 'Deep Purple', color1: '#1e1033', color2: '#0f0a1a' },
  { name: 'Ocean Blue', color1: '#0c1929', color2: '#0a1420' },
  { name: 'Forest Green', color1: '#0a1f1a', color2: '#051210' },
  { name: 'Warm Ember', color1: '#1f1410', color2: '#120a08' },
  { name: 'Midnight', color1: '#0a0a0f', color2: '#000000' },
];

// Helper to generate background style from settings
function getBackgroundStyle(bg: BackgroundSettings | undefined): React.CSSProperties {
  // Use defaults if bg is undefined
  const background = bg || DEFAULT_BACKGROUND;
  const alpha = background.opacity / 100;

  // Convert hex to rgba
  const hexToRgba = (hex: string, a: number) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } catch {
      return `rgba(9, 9, 11, ${a})`; // fallback to zinc-950
    }
  };

  const color1 = background.color1 || '#09090b';
  const color2 = background.color2 || '#18181b';

  if (background.type === 'solid') {
    return { backgroundColor: hexToRgba(color1, alpha) };
  } else if (background.type === 'gradient-linear') {
    return {
      background: `linear-gradient(to bottom, ${hexToRgba(color1, alpha)}, ${hexToRgba(color2, alpha)})`,
    };
  } else {
    return {
      background: `radial-gradient(ellipse at center, ${hexToRgba(color1, alpha)}, ${hexToRgba(color2, alpha)})`,
    };
  }
}

export default function DesktopHome() {
  const [intent, setIntent] = useState('');
  const [prompts, setPrompts] = useState<Prompts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showAllInfo, setShowAllInfo] = useState(true);
  const [expandedCard, setExpandedCard] = useState<ModelKey | null>(null);
  const [sessionUsage, setSessionUsage] = useState<UsageStats>({
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

  // Load API key and settings on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE);
    if (storedKey) {
      setApiKey(storedKey);
      setApiKeyInput(storedKey);
    }

    const storedSettings = localStorage.getItem(SETTINGS_STORAGE);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        // Deep merge background settings to handle old stored settings without background
        const mergedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          background: {
            ...DEFAULT_BACKGROUND,
            ...(parsed.background || {}),
          },
        };
        setSettings(mergedSettings);
        setShowAllInfo(parsed.showFormatInfo ?? true);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save settings when they change
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(updated));
  };

  // Clear results and start fresh
  const handleClear = () => {
    setPrompts(null);
    setIntent('');
    setError('');
    setExpandedCard(null);
    textareaRef.current?.focus();
  };

  // Focus management
  useEffect(() => {
    if (!isInitialized) return;

    if (apiKey && !showSettings) {
      textareaRef.current?.focus();
    } else if (showSettings) {
      apiKeyRef.current?.focus();
    }
  }, [apiKey, showSettings, isInitialized]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem(API_KEY_STORAGE, apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setShowSettings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;

    // If no API key, show settings
    if (!apiKey) {
      setShowSettings(true);
      setError('Please set your Anthropic API key first');
      return;
    }

    setLoading(true);
    setError('');
    setPrompts(null);

    try {
      const result = await generatePromptsClient(intent.trim(), apiKey);
      setPrompts(result.prompts);

      // Update session usage
      const inputCost = (result.usage.input_tokens / 1_000_000) * 3;
      const outputCost = (result.usage.output_tokens / 1_000_000) * 15;
      setSessionUsage((prev) => ({
        inputTokens: prev.inputTokens + result.usage.input_tokens,
        outputTokens: prev.outputTokens + result.usage.output_tokens,
        estimatedCost: prev.estimatedCost + inputCost + outputCost,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      // If it's an auth error, prompt for API key
      if (message.includes('401') || message.includes('invalid') || message.includes('key')) {
        setShowSettings(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  // Get background style from settings
  const backgroundStyle = getBackgroundStyle(settings.background);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={backgroundStyle}>
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={backgroundStyle}>
      {/* Top Bar with Settings */}
      <div className="flex justify-end items-center px-4 py-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="text-zinc-500 hover:text-white"
          title="Settings"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </Button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveApiKey}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>

                  {/* API Key Section */}
                  <div className="mb-6">
                    <label className="block text-zinc-400 text-sm mb-2">
                      Anthropic API Key
                    </label>
                    <input
                      ref={apiKeyRef}
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-2 font-mono"
                    />
                    <p className="text-zinc-500 text-xs">
                      Your API key is stored locally.{' '}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-400 hover:text-orange-300 underline"
                      >
                        Get your key
                      </a>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-zinc-700 my-6" />

                  {/* Default Model */}
                  <div className="mb-4">
                    <label className="block text-zinc-400 text-sm mb-2">
                      Default Model (shown first)
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => updateSettings({ defaultModel: e.target.value as ModelKey })}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => (
                        <option key={key} value={key}>
                          {MODEL_LABELS[key].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto-copy */}
                  <div className="mb-4">
                    <label className="block text-zinc-400 text-sm mb-2">
                      Auto-copy prompt after generation
                    </label>
                    <select
                      value={settings.autoCopyModel || ''}
                      onChange={(e) => updateSettings({ autoCopyModel: e.target.value as ModelKey || null })}
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="">Disabled</option>
                      {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => (
                        <option key={key} value={key}>
                          {MODEL_LABELS[key].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Show Format Info */}
                  <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showFormatInfo}
                        onChange={(e) => {
                          updateSettings({ showFormatInfo: e.target.checked });
                          setShowAllInfo(e.target.checked);
                        }}
                        className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-orange-500 focus:ring-orange-500/50"
                      />
                      <span className="text-zinc-300 text-sm">Show format info by default</span>
                    </label>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-zinc-700 my-6" />

                  {/* Background Settings Section */}
                  <h3 className="text-white font-semibold mb-4">Background</h3>

                  {/* Background Type */}
                  <div className="mb-4">
                    <label className="block text-zinc-400 text-sm mb-2">Style</label>
                    <select
                      value={settings.background.type}
                      onChange={(e) =>
                        updateSettings({
                          background: { ...settings.background, type: e.target.value as BackgroundType },
                        })
                      }
                      className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="solid">Solid Color</option>
                      <option value="gradient-linear">Linear Gradient</option>
                      <option value="gradient-radial">Radial Gradient</option>
                    </select>
                  </div>

                  {/* Preset Colors */}
                  <div className="mb-4">
                    <label className="block text-zinc-400 text-sm mb-2">Presets</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUND_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            updateSettings({
                              background: {
                                ...settings.background,
                                color1: preset.color1,
                                color2: preset.color2,
                              },
                            })
                          }
                          className="p-2 rounded-lg border border-zinc-600 hover:border-zinc-400 transition-colors"
                          style={{
                            background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`,
                          }}
                          title={preset.name}
                        >
                          <span className="text-xs text-white/70">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">
                        {settings.background.type === 'solid' ? 'Color' : 'Color 1'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.background.color1}
                          onChange={(e) =>
                            updateSettings({
                              background: { ...settings.background, color1: e.target.value },
                            })
                          }
                          className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={settings.background.color1}
                          onChange={(e) =>
                            updateSettings({
                              background: { ...settings.background, color1: e.target.value },
                            })
                          }
                          className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        />
                      </div>
                    </div>
                    {settings.background.type !== 'solid' && (
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Color 2</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.background.color2}
                            onChange={(e) =>
                              updateSettings({
                                background: { ...settings.background, color2: e.target.value },
                              })
                            }
                            className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={settings.background.color2}
                            onChange={(e) =>
                              updateSettings({
                                background: { ...settings.background, color2: e.target.value },
                              })
                            }
                            className="flex-1 bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transparency Slider */}
                  <div className="mb-6">
                    <label className="block text-zinc-400 text-sm mb-2">
                      Transparency: {100 - settings.background.opacity}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={settings.background.opacity}
                      onChange={(e) =>
                        updateSettings({
                          background: { ...settings.background, opacity: parseInt(e.target.value) },
                        })
                      }
                      className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <p className="text-zinc-500 text-xs mt-1">
                      Lower values make the window more transparent
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-zinc-700 my-6" />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Reset all settings to defaults
                        localStorage.removeItem(SETTINGS_STORAGE);
                        setSettings(DEFAULT_SETTINGS);
                        setShowAllInfo(DEFAULT_SETTINGS.showFormatInfo);
                      }}
                      className="flex-1 border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 font-semibold py-3 text-base"
                    >
                      Reset Defaults
                    </Button>
                    <Button
                      type="submit"
                      disabled={!apiKeyInput.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 text-base"
                    >
                      Save Settings
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-8 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
            PromptOS
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-4 sm:mb-6 px-2">
            Transform your vague ideas into perfectly crafted prompts for every major LLM
          </p>

          {/* Session Usage Display */}
          {sessionUsage.estimatedCost > 0 && (
            <div className="inline-flex items-center gap-4 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full">
              <span>
                Session: {sessionUsage.inputTokens.toLocaleString()} in /{' '}
                {sessionUsage.outputTokens.toLocaleString()} out
              </span>
              <span className="text-orange-400">
                ~${sessionUsage.estimatedCost.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-6 sm:mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-xl sm:rounded-2xl p-2 sm:p-3">
              <Textarea
                ref={textareaRef}
                value={intent}
                onChange={(e) => {
                  setIntent(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height =
                      Math.max(100, textareaRef.current.scrollHeight) + 'px';
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you need..."
                className="min-h-[100px] sm:min-h-[120px] bg-transparent border-0 text-white placeholder:text-zinc-400 text-base sm:text-lg md:text-xl resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 px-1 sm:px-2">
                <span className="text-xs sm:text-sm text-zinc-500 hidden sm:block">
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                    Cmd
                  </kbd>{' '}
                  +{' '}
                  <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
                    Enter
                  </kbd>{' '}
                  to generate
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  {prompts && (
                    <Button
                      type="button"
                      onClick={handleClear}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 font-semibold px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-lg flex-1 sm:flex-none"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Start Over
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading || !intent.trim()}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-lg flex-1 sm:flex-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Prompts'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {prompts && (
          <>
            {/* Global Info Toggle */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllInfo(!showAllInfo)}
                className="h-10 sm:h-9 px-4 sm:px-4 text-sm sm:text-base text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-500"
              >
                {showAllInfo ? 'Hide All Format Info' : 'Show All Format Info'}
              </Button>
            </div>

            {/* Cards Grid */}
            <div
              className={`grid gap-3 sm:gap-6 animate-in fade-in duration-500 ${
                expandedCard ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => {
                if (expandedCard && expandedCard !== key) return null;

                return (
                  <PromptCard
                    key={key}
                    modelKey={key}
                    prompt={prompts[key]}
                    showInfo={showAllInfo}
                    isExpanded={expandedCard === key}
                    onExpand={() => setExpandedCard(expandedCard === key ? null : key)}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Empty State */}
        {!prompts && !loading && (
          <div className="text-center py-8 sm:py-16">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8">
              {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key, index) => {
                const model = MODEL_LABELS[key];
                return (
                  <div
                    key={key}
                    className={`${model.bgColor} ${model.borderColor} border-2 rounded-xl p-3 sm:p-4 animate-pulse`}
                    style={{ animationDelay: `${index * 0.15}s`, animationDuration: '2s' }}
                  >
                    <span
                      className={`bg-gradient-to-r ${model.color} bg-clip-text text-transparent font-bold text-base sm:text-lg md:text-xl`}
                    >
                      {model.name}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300 mt-1">{model.company}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-white text-sm sm:text-base md:text-lg px-4">
              Enter your idea above to generate optimized prompts for all four models
            </p>
          </div>
        )}
      </div>

      <ProjectFooter projectName="PromptOS Desktop" githubRepo="devenspear/promptos" />
    </div>
  );
}
