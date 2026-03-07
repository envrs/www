import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseServer } from '@/lib/supabase/server';

export default async function OrganizationsPage() {
  const supabase = getSupabaseServer();

  // Fetch unique organizations from pull requests
  const { data: orgs } = await supabase
    .from('pull_requests')
    .select('org_name')
    .distinct()
    .order('org_name');

  // Get stats for each org
  const orgStats = await Promise.all(
    (orgs || []).map(async org => {
      const { count: prCount } = await supabase
        .from('pull_requests')
        .select('*', { count: 'exact' })
        .eq('org_name', org.org_name);

      const { count: issueCount } = await supabase
        .from('issues')
        .select('id', { count: 'exact' })
        .in('pr_id', []);

      return {
        name: org.org_name,
        prs: prCount || 0,
      };
    })
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="mt-2 text-muted-foreground">
            Connected GitHub organizations
          </p>
        </div>

        {orgStats && orgStats.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orgStats.map(org => (
              <Card key={org.name}>
                <CardContent>
                  <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {org.prs} pull requests analyzed
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    disabled
                  >
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No organizations yet. Install the GitHub App to get started.
              </p>
              <Button variant="default" className="mt-4" disabled>
                Install GitHub App
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
