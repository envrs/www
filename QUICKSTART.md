# RepoLens Quick Start Guide

Get RepoLens up and running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier works)
- GitHub personal access token

## 1. Clone & Install (1 minute)

```bash
git clone https://github.com/envrs/www.git
cd www
npm install
```

## 2. Configure Environment (1 minute)

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Get from Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# GitHub Personal Access Token
GITHUB_TOKEN=ghp_xxx

# For local testing, generate any random string
GITHUB_WEBHOOK_SECRET=your-webhook-secret-here

# LLM API Key (use one)
OPENAI_API_KEY=sk-xxx
# OR
GROQ_API_KEY=gsk_xxx
# OR
ANTHROPIC_API_KEY=sk-ant-xxx

# Local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 3. Setup Database (1 minute)

```bash
# Connect to Supabase SQL editor and execute:
# Scripts > schema.sql contents
```

Or use Supabase CLI:
```bash
npm install -g supabase
supabase db pull  # Creates local migration
```

## 4. Run Development Server (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000

## 5. Test Webhook (1 minute)

Create a test PR in any repository you control:
1. Make a code change
2. Create a PR
3. Check `/api/webhook` logs
4. RepoLens should analyze and comment

## Key URLs

- **Dashboard**: http://localhost:3000/dashboard
- **Landing Page**: http://localhost:3000
- **API Webhook**: http://localhost:3000/api/webhook

## Common Tasks

### Change LLM Provider

Edit `src/lib/llm/provider.ts`:
```typescript
const DEFAULT_PROVIDER = 'openai';  // or 'groq', 'anthropic'
```

### Add New Analyzer

```typescript
// src/lib/analyzers/my-analyzer.ts
import { BaseAnalyzer, AnalysisResult } from './types';

export class MyAnalyzer extends BaseAnalyzer {
  name = 'my_analyzer';
  description = 'What it does';

  async analyze(files: string[], changes: string): Promise<AnalysisResult> {
    // Your implementation
    return {
      analyzer: this.name,
      findings: [],
      metrics: {},
      summary: 'Done',
      timestamp: new Date(),
      autoFixable: 0,
    };
  }
}
```

Then register in `src/lib/analyzers/index.ts`:
```typescript
import { MyAnalyzer } from './my-analyzer';

export const analyzers: BaseAnalyzer[] = [
  // ... existing
  new MyAnalyzer(),
];
```

### View Database

```bash
# Via Supabase dashboard
# Or use Supabase CLI
supabase db list
```

### Check Webhook Logs

```bash
# Vercel (production)
vercel logs /api/webhook

# Local (dev)
npm run dev  # Check console output
```

## Troubleshooting

### "GITHUB_WEBHOOK_SECRET is required"
Set in `.env.local`, can be any random string for local testing

### "Connection refused to Supabase"
Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### "OpenAI API error"
Verify API key and check rate limits in OpenAI dashboard

### "Webhook not triggered"
For local testing, use a tunneling service:
```bash
npm install -g localtunnel
lt --port 3000
# Update GitHub App webhook URL to tunneled URL
```

### Database schema errors
Recreate tables in Supabase SQL editor:
```sql
-- Drop existing
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS pull_requests CASCADE;
-- ... etc

-- Re-run schema.sql
```

## Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
3. See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture
4. Review [README.md](./README.md) for full documentation

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Format code
npm run format

# Lint code
npm run lint

# Database reset (Supabase UI)
# Danger: Deletes all data
```

## Project Structure Quick Ref

```
/src
  /app              - Next.js pages and routes
  /lib              - Utilities and libraries
  /components       - React components
/scripts            - Database migrations
/docs               - Documentation
```

## Getting Help

- Check [FAQ section](#faq)
- Review error logs in console
- Read CONTRIBUTING.md for guidelines
- Open GitHub issue for bugs
- Check GitHub Discussions for questions

## FAQ

**Q: Can I use this without LLM providers?**
A: Partially. Pattern-based analyzers (Security, Linting) work without LLM. Others need API keys.

**Q: How much does this cost?**
A: Free tier covered if using free Supabase, OpenAI free trial, etc. Check provider pricing.

**Q: Can I deploy on other platforms?**
A: Yes. Node.js compatible platforms work (Railway, Render, etc.)

**Q: How do I secure this?**
A: Add GitHub OAuth, rate limiting, and audit logging (see DEPLOYMENT.md)

**Q: Can I customize analyzers?**
A: Yes. Edit analyzer prompts in `src/lib/analyzers/*.ts`

## Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment guide.

---

**Need something else?** Check the full documentation files.
