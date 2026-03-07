# Contributing to RepoLens

Thank you for your interest in contributing to RepoLens! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/www.git
cd www
npm install
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Setup Development Environment

```bash
cp .env.local.example .env.local
# Fill in your development environment variables
npm run dev
```

## Development Guidelines

### Code Style

- Use TypeScript with strict mode enabled
- Follow existing code patterns
- Use Prettier for formatting (automatic on commit)
- Use ESLint for linting

### File Structure

- Components in `/src/components` with clear directory structure
- API routes in `/src/app/api` organized by feature
- Utilities in `/src/lib` with appropriate subdirectories
- Keep files small and focused (under 300 lines ideal)

### Naming Conventions

- Components: PascalCase (e.g., `PullRequestCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `usePullRequests.ts`)
- Utilities: camelCase (e.g., `validateWebhook.ts`)
- Database: snake_case (e.g., `pull_requests`)

### TypeScript

- Use strict types, avoid `any`
- Export types from files they're used in
- Create interfaces for API contracts
- Use type guards for runtime validation

### Error Handling

```typescript
try {
  // code
} catch (error) {
  console.error('[v0] Detailed error message:', error);
  throw new Error('User-friendly error message');
}
```

## Testing

### Running Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Test Structure

- Write tests for analyzers
- Test LLM provider selection
- Verify webhook signature validation
- Test API endpoints with mock data

## Adding Features

### Adding a New Analyzer

1. Create `/src/lib/analyzers/my-analyzer.ts`
2. Extend `BaseAnalyzer` class
3. Implement `analyze()` method
4. Add to analyzer registry in `/src/lib/analyzers/index.ts`
5. Create tests
6. Update documentation

Example:
```typescript
import { BaseAnalyzer, AnalysisResult } from './types';

export class MyAnalyzer extends BaseAnalyzer {
  name = 'my_analyzer';
  description = 'Description of what this analyzer does';

  async analyze(files: string[], changes: string): Promise<AnalysisResult> {
    // Implementation
  }
}
```

### Adding a New API Endpoint

1. Create route file in `/src/app/api/your-endpoint/route.ts`
2. Implement request handler
3. Add error handling
4. Document in README
5. Add tests

### Adding Dashboard Page

1. Create page in `/src/app/dashboard/your-page/page.tsx`
2. Use `DashboardLayout` component
3. Use existing UI components
4. Add to navigation in `DashboardLayout`

## Database Migrations

### Creating a Migration

1. Create SQL file in `/scripts/migrations/001_description.sql`
2. Add comments explaining changes
3. Use idempotent SQL (CREATE IF NOT EXISTS)
4. Test against development database

### Applying Migrations

```bash
# For production, use Supabase UI or:
npm run migrate
```

## Documentation

### Update Documentation When

- Adding/changing features
- Modifying API contracts
- Changing environment variables
- Updating deployment steps

### Documentation Format

- Use clear, concise language
- Include code examples
- Add troubleshooting sections
- Include links to related docs

## Commit Messages

Follow conventional commits:

```
feat: Add new analyzer for accessibility
fix: Handle null values in webhook payload
docs: Update deployment guide for Vercel
refactor: Simplify LLM provider selection
test: Add tests for security analyzer
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Dependencies, build

## Pull Request Process

### Before Submitting

1. Update to latest main branch
2. Run tests: `npm test`
3. Run linter: `npm run lint`
4. Update relevant documentation
5. Test in development environment

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] Tested locally
- [ ] No console errors

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. At least one approval required
2. All checks must pass
3. Address feedback in new commits
4. Maintainer merges when ready

## Debugging

### Enable Debug Logging

```typescript
console.log('[v0] Debug message:', data);
```

### Vercel Functions

1. View logs in Vercel dashboard
2. Check `/api/` endpoint logs
3. Monitor for timeout issues

### Database Debugging

```typescript
// In Supabase SQL editor or with client
const result = await supabase.from('table').select('*').limit(1);
console.log('[v0] Query result:', result);
```

## Performance Tips

- Use database indexes for frequent queries
- Cache analyzer results when appropriate
- Batch webhook processing for multiple files
- Consider pagination for large result sets
- Profile with Vercel Analytics

## Security Considerations

- Never commit API keys or secrets
- Validate all webhook signatures
- Sanitize database queries
- Use parameterized queries
- Keep dependencies updated

## Deployment

### Staging

Commits to `develop` branch auto-deploy to staging.

### Production

Merges to `main` branch auto-deploy to production.

## Questions?

- Open an issue for questions or discussions
- Ask in GitHub Discussions
- Check existing issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
