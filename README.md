# RepoLens - AI-Powered PR Review System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square)](https://supabase.com)

A comprehensive Next.js 15 web application that provides autonomous code reviews using multiple AI models and advanced analysis engines. RepoLens integrates with GitHub via webhooks to analyze pull requests across quality, security, performance, architecture, linting, and documentation dimensions.

## 🎯 Overview

RepoLens is a production-ready PR review system built with:
- **Next.js 15** App Router for full-stack capabilities
- **Supabase** PostgreSQL with Row Level Security
- **Multi-provider LLM support** (OpenAI, Groq, Anthropic)
- **6 specialized analyzers** for comprehensive code review
- **GitHub webhook integration** for real-time analysis
- **Auto-fix engine** with confidence scoring
- **v0.dev compatible** architecture with shadcn/ui patterns

## ✨ Key Features

- ✅ **Multi-Analyzer System**: 6 specialized analyzers (Quality, Security, Performance, Architecture, Linting, Documentation)
- ✅ **Multi-Provider LLM**: Switch between OpenAI, Groq, and Anthropic
- ✅ **GitHub Integration**: Real-time webhooks, PR comments, issue creation
- ✅ **Autofix Engine**: AI-generated patches with confidence scoring
- ✅ **Dashboard UI**: Real-time review tracking and findings visualization
- ✅ **Database Storage**: Supabase PostgreSQL with Row Level Security
- ✅ **Webhook Verification**: Secure signature validation
- ✅ **v0.dev Compatible**: Full TypeScript, Next.js 15, shadcn/ui patterns
- ✅ **Production Ready**: Error handling, logging, performance optimization

## 📑 Table of Contents

- [Overview](#overview--key-features)
- [Architecture](#architecture-overview)
- [Database Schema](#database-schema)
- [Analyzers](#analyzers)
- [API Routes](#api-routes)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)


## 🏗️ Architecture Overview

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: Supabase (PostgreSQL) with RLS policies
- **AI/LLM**: Multi-provider support (OpenAI, Groq, Anthropic)
- **Styling**: Tailwind CSS with custom design tokens
- **GitHub Integration**: Webhooks + GitHub REST API

### Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── webhook/route.ts      # GitHub webhook handler
│   │   ├── analyze/route.ts      # Code analysis endpoint
│   │   └── issues/route.ts       # GitHub issues creation
│   ├── dashboard/                # Dashboard pages
│   │   ├── reviews/              # PR reviews listing & details
│   │   ├── organizations/        # Org management
│   │   ├── repositories/         # Repo management
│   │   └── settings/             # Configuration
│   ├── globals.css               # Global styles & design tokens
│   └── layout.tsx                # Root layout
├── lib/
│   ├── env.ts                    # Environment variable validation
│   ├── supabase/                 # Database client
│   ├── llm/                      # LLM provider abstraction
│   ├── analyzers/                # Code analysis engines
│   ├── autofix/                  # Patch generation
│   └── github/                   # GitHub integration
├── components/
│   ├── ui/                       # Reusable UI components
│   └── layout/                   # Layout components
└── scripts/
    └── schema.sql                # Database schema migration
```

## 📊 Database Schema

### Core Tables

1. **pull_requests** - Analyzed pull requests with metadata
2. **reviews** - Analysis results per PR
3. **findings** - Individual code issues from all analyzers
4. **patches** - Auto-generated fix suggestions
5. **issues** - GitHub issues created from findings
6. **organizations** - GitHub organizations
7. **repositories** - Tracked repositories
8. **user_settings** - User preferences and configurations

All tables include RLS policies for organization-level data isolation.

## 🔍 Analyzers

### 1. Code Quality Analyzer
Detects complexity issues, maintainability problems, and refactoring opportunities using pattern matching and LLM analysis.

### 2. Security Analyzer
Identifies hardcoded secrets, SQL injection vulnerabilities, XSS patterns, and unsafe code with CWE mapping.

### 3. Performance Analyzer
Finds N+1 queries, unbounded loops, large payloads, missing indexes, and memory leak patterns.

### 4. Architecture Analyzer
Reviews SOLID principles, design patterns, layer violations, and circular dependencies.

### 5. Linting Analyzer
Detects unused variables, naming inconsistencies, missing types, and formatting issues with auto-fix support.

### 6. Documentation Analyzer
Ensures JSDoc coverage, identifies missing comments, and tracks TODO/FIXME items.

## 🔌 API Routes

### POST /api/webhook
GitHub webhook handler for PR events with signature verification and analysis triggering.

### POST /api/analyze
On-demand analysis endpoint accepting code and file paths.

### POST /api/issues
Creates GitHub issues from critical/high severity findings.

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/envrs/www.git
cd www
npm install
```

### 2. Database Setup

Execute the schema migration:
```bash
npm run db:setup
```

### 3. Environment Configuration

Copy and configure your environment:
```bash
cp .env.local.example .env.local
```

Fill in all required variables (see Environment Variables section).

### 4. GitHub App Setup

Create a GitHub App with:
- **Webhook URL**: `https://your-domain.com/api/webhook`
- **Events**: `pull_request`
- **Permissions**: `contents:read`, `issues:write`, `pull_requests:read`

### 5. Run Development

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔐 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GitHub
GITHUB_TOKEN=ghp_xxx
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_APP_ID=your-app-id

# LLM Providers
OPENAI_API_KEY=sk-xxx
GROQ_API_KEY=gsk_xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 🚀 Deployment

### Deploy to Vercel

```bash
vercel deploy
```

Set all environment variables in Vercel project settings before deployment.

## 📝 License

MIT - See LICENSE file for details

## 🤝 Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/envrs/www/issues
- Documentation: See `/dashboard` section in the app
