# RepoLens - Setup & Deployment Guide

## Overview

RepoLens is a standalone Next.js 15 web application that provides autonomous AI-powered PR reviews using GitHub webhooks and Supabase for data persistence. It supports multiple LLM providers (OpenAI, Groq, Anthropic) and offers 6 comprehensive analysis dimensions.

## Prerequisites

- Node.js 18+ and npm/pnpm
- GitHub Organization with admin access
- Supabase account (free tier works)
- OpenAI API key (or Groq/Anthropic alternative)
- Vercel account (for deployment)

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization and region
4. Create project with a strong password

### 1.2 Initialize Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Execute the SQL schema from `scripts/schema.sql`
3. Verify all tables are created:
   - `organizations`
   - `repositories`
   - `pull_requests`
   - `findings`
   - `issues`
   - `autofix_patches`
   - `users`

### 1.3 Get Connection Keys

In Settings → API:
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Create GitHub App

### 2.1 Register GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Fill in:
   - **App name**: RepoLens
   - **Homepage URL**: `https://your-domain.com`
   - **Webhook URL**: `https://your-domain.com/api/webhook`
   - **Webhook secret**: Generate random string (save this!)

### 2.2 Configure Permissions

**Repository permissions:**
- Pull requests: Read & Write
- Issues: Read & Write
- Contents: Read (only)
- Workflows: Read (only)

**Organization permissions:**
- Members: Read (only)

**User permissions:**
- Email addresses: Read (only)

**Subscribe to events:**
- ✅ Pull request
- ✅ Issues

### 2.3 Generate Credentials

1. In GitHub App settings:
   - Copy **App ID** → `GITHUB_APP_ID`
   - Generate **Client Secret** → `GITHUB_APP_CLIENT_SECRET`
   - Generate **Private Key** → `GITHUB_APP_PRIVATE_KEY` (save as multi-line)

2. Get **Personal Access Token** (for API calls):
   - Go to Settings → Personal access tokens (classic)
   - Click "Generate new token"
   - Scopes: `repo`, `workflow`, `read:org`
   - Copy token → `GITHUB_TOKEN`

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env.local`

Copy from `.env.local.example` and fill in all values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# GitHub
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
NEXT_PUBLIC_GITHUB_APP_ID=123456
GITHUB_APP_CLIENT_SECRET=ghu_xxxxxxxxxxxxxx

# LLM Providers (at least one required)
OPENAI_API_KEY=sk-xxxxx
GROQ_API_KEY=gsk_xxxxx  # Optional
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Optional

# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com

# App Config
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NODE_ENV=production
```

### 3.2 Install GitHub App

1. In GitHub App settings, go to "Install App"
2. Select your organization
3. Grant repository access (all repos or specific ones)
4. Complete installation

---

## Step 4: Deploy to Vercel

### 4.1 Connect Repository

```bash
# If not already connected
vercel link

# Or deploy directly
vercel
```

### 4.2 Add Environment Variables

In Vercel dashboard:
1. Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set for `Production`, `Preview`, and `Development` as needed

### 4.3 Deploy

```bash
git push  # Vercel automatically deploys on push

# Or manually trigger
vercel --prod
```

---

## Step 5: Complete GitHub Webhook Setup

### 5.1 Update Webhook URL

In GitHub App settings:
1. Go to "Webhook URL"
2. Set to: `https://your-vercel-domain.com/api/webhook`
3. Keep the webhook secret same as `GITHUB_WEBHOOK_SECRET`

### 5.2 Test Webhook

1. Create a test PR in any repository
2. Check Supabase to verify:
   - PR appears in `pull_requests` table
   - Analysis results appear in `findings` table
3. Verify comment posted on PR

---

## Step 6: Configure LLM Providers

### Option A: OpenAI (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create API key with `gpt-4-turbo` access
3. Set `OPENAI_API_KEY` in environment variables

### Option B: Groq

1. Go to [groq.com/console](https://groq.com/console)
2. Create API key
3. Set `GROQ_API_KEY` in environment variables

### Option C: Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Set `ANTHROPIC_API_KEY` in environment variables

---

## Step 7: Access Dashboard

### 7.1 First Login

1. Go to `https://your-domain.com/dashboard`
2. Click "Sign in with GitHub"
3. Authorize RepoLens app
4. You'll be redirected to dashboard

### 7.2 View Reviews

- **Dashboard**: Overview of all PRs and findings
- **Reviews**: List all analyzed pull requests
- **Repositories**: See monitored repos and stats
- **Settings**: Configure LLM provider and analyzers

---

## Troubleshooting

### Webhook Not Triggering

1. Check GitHub App is installed on repositories
2. Verify webhook secret matches `GITHUB_WEBHOOK_SECRET`
3. In GitHub App → Recent deliveries, check for errors
4. Test with: `curl -X POST https://your-domain.com/api/webhook -d '...'`

### Analysis Not Starting

1. Check `OPENAI_API_KEY` (or other LLM provider)
2. Verify Supabase connection in environment variables
3. Check Vercel logs: `vercel logs`
4. Look for errors in API routes

### Database Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` has permissions
3. Test connection: `psql postgresql://...`
4. Verify Row Level Security policies aren't blocking

### GitHub OAuth Issues

1. Verify `GITHUB_APP_CLIENT_ID` and `GITHUB_APP_CLIENT_SECRET`
2. Check redirect URI matches: `https://your-domain.com/api/auth/github/callback`
3. In GitHub App settings, confirm OAuth settings are saved

---

## Architecture Summary

```
GitHub
  ↓ (Webhook)
Vercel Next.js App
  ├── POST /api/webhook → Validate + Queue
  ├── Analysis Engine → Runs all 6 analyzers
  ├── LLM Provider (OpenAI/Groq/Anthropic)
  └── Supabase (PostgreSQL)
      ├── Store findings
      ├── Generate patches
      └── Create issues
```

---

## Key API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhook` | POST | Receive GitHub PR events |
| `/api/auth/github/callback` | GET | GitHub OAuth callback |
| `/api/patches/apply` | POST | Apply autofix patches |
| `/api/issues/create` | POST | Create GitHub issues |
| `/api/reviews` | GET | List PR reviews |

---

## Monitoring & Maintenance

### Check Webhook Health

```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM pull_requests;
SELECT COUNT(*) FROM findings;
SELECT status, COUNT(*) FROM pull_requests GROUP BY status;
```

### Monitor LLM Usage

- OpenAI: [Usage dashboard](https://platform.openai.com/account/usage/overview)
- Groq: Check API key usage in Groq console
- Anthropic: Check usage in console

### Rotate Secrets

1. Generate new GitHub token → update `GITHUB_TOKEN`
2. Generate new webhook secret → update both GitHub App and `GITHUB_WEBHOOK_SECRET`
3. Rotate LLM API keys quarterly

---

## Performance Optimization

- Analysis timeout: 30 seconds per PR
- Max files analyzed: 50 per PR
- LLM model: gpt-4-turbo (balance cost/quality)
- Database: Supabase auto-scaling handles growth

---

## Support & Resources

- RepoLens Docs: Check `/docs` directory
- GitHub Issues: Report bugs on main repository
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- NextAuth Docs: [next-auth.js.org](https://next-auth.js.org)
- AI SDK: [sdk.vercel.ai](https://sdk.vercel.ai)

---

## Next Steps

1. ✅ Supabase setup
2. ✅ GitHub App creation
3. ✅ Environment variables
4. ✅ Deploy to Vercel
5. ✅ Configure webhooks
6. ✅ Test with PR creation
7. View results in dashboard

Happy coding with RepoLens!
