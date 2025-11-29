'use client';

/**
 * ProjectFooter - Reusable footer component for all Deven's projects
 *
 * USAGE: Copy this component to any project and update the props:
 *
 * <ProjectFooter
 *   projectName="PromptOS"
 *   githubRepo="devenspear/promptos"
 * />
 *
 * The version is auto-incremented via package.json and the commit SHA
 * is injected at build time via next.config.js
 */

import { useEffect, useState } from 'react';

interface ProjectFooterProps {
  projectName: string;
  githubRepo: string;
}

export function ProjectFooter({ projectName, githubRepo }: ProjectFooterProps) {
  const [version, setVersion] = useState<string>('');
  const [commitSha, setCommitSha] = useState<string>('');
  const year = new Date().getFullYear();

  useEffect(() => {
    // These are injected at build time via next.config.js
    setVersion(process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0');
    setCommitSha(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local');
  }, []);

  const githubUrl = `https://github.com/${githubRepo}`;
  const commitUrl = commitSha && commitSha !== 'local'
    ? `${githubUrl}/commit/${process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}`
    : githubUrl;

  return (
    <footer className="w-full py-4 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          &copy; {year} Deven Spear. All rights reserved.
        </span>
        <div className="flex items-center gap-3">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            {projectName}
          </a>
          <span className="text-zinc-600">|</span>
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-zinc-300 transition-colors"
          >
            v{version}
          </a>
          <span className="text-zinc-600">|</span>
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-zinc-300 transition-colors"
          >
            {commitSha}
          </a>
        </div>
      </div>
    </footer>
  );
}
