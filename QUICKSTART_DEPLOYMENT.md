# RepoLens - Quick Start (5 Minutes)

## TL;DR - Deploy in 5 Steps

### Step 1: Set Supabase URL & Keys
```bash
# In Vercel dashboard Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Step 2: Create GitHub App
- Go to github.com/settings/apps/new
- **Webhook URL**: `https://your-app.vercel.app/api/webhook`
- Save: `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`
- Generate Personal Token → save as `GITHUB_TOKEN`

### Step 3: Set GitHub & LLM Variables
```bash
# GitHub
GITHUB_APP_ID=123456
GITHUB_WEBHOOK_SECRET=your-secret-key
GITHUB_TOKEN=ghp_...
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA..."

# LLM (pick one)
OPENAI_API_KEY=sk-...
# OR
GROQ_API_KEY=gsk_...
# OR  
ANTHROPIC_API_KEY=sk-ant-...

# Auth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### Step 4: Initialize Database
```bash
# In Supabase SQL Editor, run:
# scripts/schema.sql
```

### Step 5: Deploy
```bash
git push  # Auto-deploys to Vercel
```

---

## Architecture

```
PR Created on GitHub
        ↓
    Webhook Event
        ↓
  /api/webhook (validates signature)
        ↓
  Analysis Engine
  (runs 6 analyzers in parallel)
        ↓
  LLM Provider (OpenAI/Groq/Anthropic)
        ↓
  Stores in Supabase
        ↓
  Posts comment on PR
  + Generates autofix patches
```

---

## Features Enabled

✅ **Code Quality Analysis** - Complexity, readability, DRY violations
✅ **Security Review** - Vulnerabilities, hardcoded secrets, unsafe patterns
✅ **Performance Analysis** - N+1 queries, inefficient algorithms, memory leaks
✅ **Architecture Review** - Design patterns, coupling, breaking changes
✅ **Linting & Style** - ESLint rules, TypeScript strict mode, naming conventions
✅ **Documentation** - Missing JSDoc, outdated docs, type coverage

✅ **Dashboard** - View all PRs, findings, and statistics
✅ **Autofix Engine** - Generate and apply code patches automatically
✅ **Issue Creation** - Auto-create GitHub issues for critical findings
✅ **Multi-LLM Support** - Switch between OpenAI, Groq, Anthropic
✅ **GitHub OAuth** - Secure login with GitHub account
✅ **Supabase Storage** - Persistent data across deployments

---

## Test It

1. Create a PR in any monitored repository
2. Watch the webhook trigger on Vercel logs
3. See analysis results in Supabase dashboard
4. View PR comment with findings
5. Check `/dashboard` for review summary

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Invalid signature` | Check `GITHUB_WEBHOOK_SECRET` matches GitHub App |
| `LLM API error` | Verify `OPENAI_API_KEY` (or other) is correct |
| `Supabase connection failed` | Check `NEXT_PUBLIC_SUPABASE_URL` and keys |
| `Webhook not triggering` | Confirm GitHub App is installed on repos |
| `OAuth redirect error` | Update OAuth callback URL in GitHub App settings |

---

## What's Next

- [ ] Configure webhook events in GitHub App settings
- [ ] Install GitHub App on your organization
- [ ] Customize analyzer settings in `/dashboard/settings`
- [ ] Create first PR to test the system
- [ ] Review findings in `/dashboard/reviews`
- [ ] Apply autofix patches for auto-fixable issues
- [ ] Create issues for critical security findings

---

## Support

Detailed setup guide: See `SETUP_GUIDE.md`
Troubleshooting: See `SETUP_GUIDE.md#troubleshooting`
