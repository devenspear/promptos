'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import { MODEL_LABELS, ModelKey } from '@/lib/meta-prompts';
import { ProjectFooter } from '@/components/project-footer';
import { UsageDisplay } from '@/components/usage-display';

interface Prompts {
  claude: string;
  gpt4: string;
  gemini: string;
  grok: string;
}

export default function Home() {
  const [intent, setIntent] = useState('');
  const [prompts, setPrompts] = useState<Prompts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showAllInfo, setShowAllInfo] = useState(true); // Default ON
  const [expandedCard, setExpandedCard] = useState<ModelKey | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if already authenticated by trying to hit an API
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      textareaRef.current?.focus();
    } else if (isAuthenticated === false) {
      passwordRef.current?.focus();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('Invalid password');
      }
    } catch {
      setAuthError('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent.trim()) return;

    setLoading(true);
    setError('');
    setPrompts(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intent.trim() }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompts');
      }

      setPrompts(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  // Clear results and start fresh
  const handleClear = () => {
    setPrompts(null);
    setIntent('');
    setError('');
    setExpandedCard(null);
    textareaRef.current?.focus();
  };

  // Loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4 safe-area-inset">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Deven&apos;s Prompt OS
            </h1>
            <p className="text-white text-base sm:text-lg">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-4 sm:p-6">
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 sm:py-4 text-white text-base placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
                />

                {authError && (
                  <p className="text-red-400 text-sm sm:text-base mb-4 text-center">{authError}</p>
                )}

                <Button
                  type="submit"
                  disabled={authLoading || !password}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg touch-target"
                >
                  {authLoading ? 'Authenticating...' : 'Enter'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col safe-area-inset">

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-4 sm:py-8 flex-1 w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 sm:mb-4">
            Deven&apos;s Prompt OS
          </h1>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-xl mx-auto mb-4 sm:mb-6 px-2">
            Transform your vague ideas into perfectly crafted prompts for every major LLM
          </p>
          <UsageDisplay />
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
                  // Auto-resize textarea
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = Math.max(100, textareaRef.current.scrollHeight) + 'px';
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you need..."
                className="min-h-[100px] sm:min-h-[120px] bg-transparent border-0 text-white placeholder:text-zinc-400 text-base sm:text-lg md:text-xl resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 pt-2 px-1 sm:px-2">
                <span className="text-xs sm:text-sm text-zinc-500 hidden sm:block">
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Enter</kbd> to generate
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  {prompts && (
                    <Button
                      type="button"
                      onClick={handleClear}
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:text-white hover:border-zinc-500 font-semibold px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-lg touch-target flex-1 sm:flex-none"
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
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-4 sm:px-6 py-3 sm:py-2 text-base sm:text-lg touch-target flex-1 sm:flex-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
                className="h-10 sm:h-9 px-4 sm:px-4 text-sm sm:text-base text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-500 touch-target"
              >
                {showAllInfo ? 'Hide All Format Info' : 'Show All Format Info'}
              </Button>
            </div>

            {/* Cards Grid */}
            <div className={`grid gap-3 sm:gap-6 animate-in fade-in duration-500 ${
              expandedCard
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => {
                // If a card is expanded, only show that card
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
                    <span className={`bg-gradient-to-r ${model.color} bg-clip-text text-transparent font-bold text-base sm:text-lg md:text-xl`}>
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

      <ProjectFooter
        projectName="PromptOS"
        githubRepo="devenspear/promptos"
      />
    </div>
  );
}
