# Reusable Project Footer Template

This template allows you to add a consistent footer with version tracking and GitHub links to any Next.js project.

## Quick Setup (3 steps)

### 1. Copy the footer component

Copy `src/components/project-footer.tsx` to your project's components folder.

### 2. Update next.config.ts

Add these env variables:

```ts
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || require('./package.json').version,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
};
```

### 3. Add to your page

```tsx
import { ProjectFooter } from '@/components/project-footer';

// In your component return:
<ProjectFooter
  projectName="YourProjectName"
  githubRepo="devenspear/your-repo-name"
/>
```

## Optional: Auto-increment version on deploy

Add these scripts to package.json:

```json
{
  "scripts": {
    "version:patch": "npm version patch --no-git-tag-version",
    "version:minor": "npm version minor --no-git-tag-version",
    "version:major": "npm version major --no-git-tag-version",
    "deploy": "npm run version:patch && git add package.json && git commit -m 'bump version' && git push && vercel --prod --yes"
  }
}
```

Then deploy with: `npm run deploy`

## What the footer shows

- Copyright Deven Spear [current year]
- Project name (links to GitHub repo)
- Version number (from package.json)
- Commit SHA (short, links to specific commit on GitHub)

## Styling

The footer uses Tailwind CSS with:
- `text-xs` - Small, readable text
- `text-zinc-500` - Gray color (not pure white)
- `hover:text-zinc-300` - Lighter on hover
- `font-mono` - Monospace for version/SHA

Easily customizable by editing the component.
