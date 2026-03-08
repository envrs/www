import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSupabaseServer } from '@/lib/supabase/server';

export default async function RepositoriesPage() {
  const supabase = getSupabaseServer();

  // Fetch unique repositories
  const { data: repos } = await supabase
    .from('pull_requests')
    .select('org_name, repo_name')
    .distinct()
    .order('org_name', { ascending: true })
    .order('repo_name', { ascending: true });

  // Get stats for each repo
  const repoStats = await Promise.all(
    (repos || []).map(async (repo) => {
      const { count: prCount } = await supabase
        .from('pull_requests')
        .select('*', { count: 'exact' })
        .eq('org_name', repo.org_name)
        .eq('repo_name', repo.repo_name);

      const { data: findingCounts } = await supabase
        .from('pull_requests')
        .select('id')
        .eq('org_name', repo.org_name)
        .eq('repo_name', repo.repo_name);

      return {
        org: repo.org_name,
        name: repo.repo_name,
        prs: prCount || 0,
      };
    })
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Repositories</h1>
          <p className="mt-2 text-muted-foreground">Monitored GitHub repositories</p>
        </div>

        {repoStats && repoStats.length > 0 ? (
          <div className="space-y-4">
            {repoStats.map((repo) => (
              <Card key={`${repo.org}/${repo.name}`}>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {repo.org}/{repo.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {repo.prs} pull requests analyzed
                      </p>
                    </div>
                    <Badge variant="secondary">{repo.prs}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No repositories yet. Check your GitHub App installation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
