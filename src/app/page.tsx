import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const features = [
    {
      icon: '🔍',
      title: 'Code Quality Analysis',
      description: 'Comprehensive analysis of code complexity, maintainability, and best practices',
    },
    {
      icon: '🛡️',
      title: 'Security Review',
      description: 'Detect vulnerabilities, hardcoded secrets, and unsafe patterns',
    },
    {
      icon: '⚡',
      title: 'Performance Optimization',
      description: 'Identify bottlenecks, N+1 queries, and optimization opportunities',
    },
    {
      icon: '🏗️',
      title: 'Architecture Review',
      description: 'Assess design patterns and adherence to architectural principles',
    },
    {
      icon: '✨',
      title: 'Linting & Style',
      description: 'Enforce consistent code style and detect linting violations',
    },
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Ensure comprehensive JSDoc comments and inline documentation',
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-foreground">RepoLens</h1>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button variant="default" disabled>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h2 className="text-5xl font-bold text-foreground">
          Autonomous AI-Powered Code Reviews
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          Analyze pull requests across multiple dimensions: quality, security, performance, architecture, linting, and documentation.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/dashboard">
            <Button variant="default" size="lg">
              Get Started
            </Button>
          </Link>
          <Button variant="outline" size="lg" disabled>
            View Docs
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border bg-card py-20">
        <div className="container">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            Comprehensive Analysis
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map(feature => (
              <Card key={feature.title}>
                <CardContent className="text-center">
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 text-center">
        <h3 className="text-3xl font-bold text-foreground">
          Ready to improve your code quality?
        </h3>
        <p className="mt-4 text-muted-foreground">
          Connect your GitHub organization and start getting AI-powered reviews on every PR.
        </p>
        <Button variant="default" size="lg" className="mt-8" disabled>
          Install GitHub App
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 RepoLens. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
