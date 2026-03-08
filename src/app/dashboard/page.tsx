import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPullRequests, getFindings } from '@/lib/supabase/server';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Card className="border-destructive bg-destructive/5">
      <CardContent className="pt-6">
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  let prs: any[] = [];
  let findings: any[] = [];
  let error: string | null = null;

  try {
    prs = await getPullRequests(100);
  } catch (e) {
    console.error('[RepoLens] Failed to fetch PRs:', e);
    error = 'Failed to load pull requests';
  }

  try {
    findings = await getFindings(100);
  } catch (e) {
    console.error('[RepoLens] Failed to fetch findings:', e);
    error = error || 'Failed to load findings';
  }

  const stats = {
    totalPRs: prs.length,
    completedPRs: prs.filter((p) => p.status === 'completed').length,
    criticalIssues: findings.filter((f) => f.severity === 'critical').length,
    highIssues: findings.filter((f) => f.severity === 'high').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 py-8 px-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            AI-powered code review analysis for your GitHub repositories
          </p>
        </div>

        {error && <ErrorDisplay message={error} />}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total PRs Analyzed</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalPRs}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Completed Reviews</p>
                <p className="text-3xl font-bold text-foreground">{stats.completedPRs}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-destructive">{stats.criticalIssues}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                <p className="text-3xl font-bold text-accent">{stats.highIssues}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews Section */}
        <Card className="border border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl">Recent Pull Requests</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {prs.length > 0 ? (
              <div className="space-y-4">
                {prs.slice(0, 5).map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-sm leading-tight">
                        {pr.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{pr.number} by {pr.author} • {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={pr.status === 'completed' ? 'default' : 'secondary'}
                      className="ml-2 flex-shrink-0"
                    >
                      {pr.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pull requests analyzed yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Push a PR to your connected repository to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Findings Section */}
        {findings.length > 0 && (
          <Card className="border border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl">Top Issues Found</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {findings.slice(0, 10).map((finding) => (
                  <div
                    key={finding.id}
                    className="flex items-start justify-between pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">{finding.issue}</p>
                      <p className="text-xs text-muted-foreground">
                        {finding.file_path}
                        {finding.line_number && `:${finding.line_number}`}
                      </p>
                    </div>
                    <Badge
                      variant={finding.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="ml-2 flex-shrink-0"
                    >
                      {finding.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
