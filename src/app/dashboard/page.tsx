import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSupabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = getSupabaseServer();

  // Fetch dashboard statistics
  const { data: prs } = await supabase
    .from('pull_requests')
    .select('status')
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: findings } = await supabase
    .from('findings')
    .select('severity')
    .order('created_at', { ascending: false })
    .limit(100);

  const stats = {
    totalPRs: prs?.length || 0,
    reviewedPRs: prs?.filter(p => p.status === 'reviewed').length || 0,
    criticalIssues: findings?.filter(f => f.severity === 'critical').length || 0,
    highIssues: findings?.filter(f => f.severity === 'high').length || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome to RepoLens</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total PRs Analyzed</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalPRs}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="text-3xl font-bold text-foreground">{stats.reviewedPRs}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-destructive">{stats.criticalIssues}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">High Severity</p>
                <p className="text-3xl font-bold text-accent">{stats.highIssues}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {prs && prs.length > 0 ? (
              <div className="space-y-4">
                {prs.slice(0, 5).map(pr => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{pr.title}</p>
                      <p className="text-sm text-muted-foreground">PR #{pr.pr_number}</p>
                    </div>
                    <Badge variant={pr.status === 'reviewed' ? 'default' : 'secondary'}>
                      {pr.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
