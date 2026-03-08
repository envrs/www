# RepoLens Deployment Guide

This guide walks through deploying RepoLens to production on Vercel with GitHub webhook integration.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub organization or personal account
- Supabase project (https://supabase.com)
- API keys for LLM providers (OpenAI, Groq, or Anthropic)

## Step 1: Deploy to Vercel

### 1.1 Connect Repository

1. Visit https://vercel.com/new
2. Select your GitHub repository
3. Click "Import"

### 1.2 Environment Variables

Set these in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
GITHUB_TOKEN=ghp_xxx
GITHUB_WEBHOOK_SECRET=whsec_xxx
GITHUB_APP_ID=123456
OPENAI_API_KEY=sk-xxx
GROQ_API_KEY=gsk_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 1.3 Deploy

Click "Deploy" and wait for the deployment to complete.

## Step 2: Create GitHub App

### 2.1 Register App

1. Go to GitHub Settings > Developer settings > GitHub Apps
2. Click "New GitHub App"
3. Fill in:
   - **App name**: `RepoLens`
   - **Homepage URL**: `https://your-domain.vercel.app`
   - **Webhook URL**: `https://your-domain.vercel.app/api/webhook`
   - **Webhook secret**: Generate a secure string and save it

### 2.2 Configure Permissions

Set the following permissions:

**Repository Permissions:**
- `contents`: Read-only
- `issues`: Read & write
- `pull_requests`: Read-only

**Organization Permissions:**
- None (optional)

### 2.3 Subscribe to Events

Select:
- `pull_request`

### 2.4 Create App and Get Credentials

1. Generate a private key (save it securely)
2. Note your App ID
3. Create a webhook secret if not already done

## Step 3: Update Environment Variables

Update Vercel environment variables with GitHub App credentials:

```bash
GITHUB_TOKEN=<Personal Access Token or OAuth Token>
GITHUB_WEBHOOK_SECRET=<Webhook secret from step 2.1>
GITHUB_APP_ID=<App ID from step 2.4>
```

## Step 4: Install App on Repository/Organization

1. In GitHub App settings, click "Install App"
2. Select organizations/repositories to grant access
3. Click "Install"

## Step 5: Verify Webhook

Test the webhook by:

1. Creating a new pull request in a connected repository
2. Checking the `/api/webhook` logs in Vercel
3. Confirming that a comment is posted on the PR

## Step 6: Configure LLM Provider

### Option A: OpenAI (Default)

1. Get API key from https://platform.openai.com/account/api-keys
2. Set `OPENAI_API_KEY` in Vercel
3. No additional configuration needed

### Option B: Groq

1. Get API key from https://console.groq.com
2. Set `GROQ_API_KEY` in Vercel
3. Update `src/lib/llm/provider.ts`:
   ```typescript
   const DEFAULT_PROVIDER = 'groq';
   ```

### Option C: Anthropic

1. Get API key from https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY` in Vercel
3. Update `src/lib/llm/provider.ts`:
   ```typescript
   const DEFAULT_PROVIDER = 'anthropic';
   ```

## Step 7: Database Setup

### 7.1 Create Supabase Project

1. Visit https://supabase.com
2. Create a new project
3. Copy project URL and service role key

### 7.2 Run Schema Migration

Connect to your Supabase project and execute:

```sql
-- Run contents of scripts/schema.sql
```

Or use Supabase SQL editor:
1. Go to SQL Editor
2. New Query
3. Paste schema.sql contents
4. Execute

### 7.3 Enable RLS Policies

RLS is already configured in schema.sql, so no additional setup needed.

## Step 8: Test the System

### 8.1 Create Test PR

1. Create a new branch in a connected repository
2. Make some code changes
3. Create a pull request
4. RepoLens should automatically:
   - Receive the webhook
   - Analyze the PR
   - Post a comment with findings
   - Store results in database

### 8.2 Access Dashboard

Visit `https://your-domain.vercel.app/dashboard` to:
- View all analyzed PRs
- See detailed findings per analyzer
- Track issues and patches

## Troubleshooting

### Webhook Not Triggered

1. Check webhook URL in GitHub App settings matches Vercel domain
2. Verify webhook secret in Vercel env vars
3. Check Vercel function logs for errors

### Analysis Not Running

1. Verify LLM API key is set in Vercel
2. Check function logs for API errors
3. Ensure Supabase connection is working

### Database Connection Errors

1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Test connection from Vercel Functions
3. Check RLS policies allow service role access

### GitHub API Errors

1. Verify `GITHUB_TOKEN` has required permissions
2. Check GitHub App installation status
3. Test GitHub API token separately

## Monitoring

### Vercel Monitoring

1. Go to Vercel Dashboard > Analytics
2. Monitor function execution times
3. Check error rates

### Supabase Monitoring

1. Go to Supabase Dashboard
2. Check database performance
3. Review query logs

### GitHub Integration

1. Go to GitHub App settings > Advanced
2. View recent deliveries
3. Check webhook payload responses

## Scaling Considerations

### Database

- Add database indexes for frequently queried fields
- Consider caching for repeated analyses
- Archive old reviews monthly

### API Rate Limits

- OpenAI: 3,500 RPM (free tier) - upgrade for higher limits
- GitHub: 5,000 requests/hour
- Consider queuing with Upstash Redis

### Concurrent Analyses

- Currently processes PRs sequentially
- For high volume: Add job queue (Bull, RabbitMQ)
- Increase Vercel function timeout to 60s for large PRs

## Updating

To update RepoLens:

1. Pull latest changes
2. Update environment variables if needed
3. Deploy to Vercel
4. Run any new migrations

## Security Best Practices

- Rotate GitHub App private keys regularly
- Keep API keys in Vercel secrets, never in code
- Enable branch protection requiring RepoLens review
- Regularly audit GitHub App permissions
- Monitor webhook logs for suspicious activity

## Support

For issues or questions:
- Check logs in Vercel Dashboard
- Review error messages in function logs
- Consult GitHub App documentation
- Open issue on GitHub repository
