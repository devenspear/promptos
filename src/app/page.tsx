'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt-card';
import { MODEL_LABELS, ModelKey } from '@/lib/meta-prompts';

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
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'test' }),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
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
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent mb-2">
              PromptOS
            </h1>
            <p className="text-zinc-500">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6">
                <input
                  ref={passwordRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
                />

                {authError && (
                  <p className="text-red-400 text-sm mb-4 text-center">{authError}</p>
                )}

                <Button
                  type="submit"
                  disabled={authLoading || !password}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3"
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent mb-4">
            PromptOS
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Transform your vague ideas into perfectly crafted prompts for every major LLM
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-green-500/20 to-purple-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-2">
              <Textarea
                ref={textareaRef}
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you need... (e.g., 'a python script to scrape amazon prices')"
                className="min-h-[120px] bg-transparent border-0 text-white placeholder:text-zinc-500 text-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between pt-2 px-2">
                <span className="text-xs text-zinc-500">
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Cmd</kbd> + <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">Enter</kbd> to generate
                </span>
                <Button
                  type="submit"
                  disabled={loading || !intent.trim()}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
        </form>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {prompts && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => (
              <PromptCard
                key={key}
                modelKey={key}
                prompt={prompts[key]}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!prompts && !loading && (
          <div className="text-center py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              {(Object.keys(MODEL_LABELS) as ModelKey[]).map((key) => {
                const model = MODEL_LABELS[key];
                return (
                  <div
                    key={key}
                    className={`${model.bgColor} ${model.borderColor} border rounded-xl p-4 opacity-50`}
                  >
                    <span className={`bg-gradient-to-r ${model.color} bg-clip-text text-transparent font-bold`}>
                      {model.name}
                    </span>
                    <p className="text-xs text-zinc-500 mt-1">{model.company}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-zinc-500">
              Enter your idea above to generate optimized prompts for all four models
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
