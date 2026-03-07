import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase/server';

export default async function ReviewsPage() {
  const supabase = getSupabaseServer();

  const { data: prs } = await supabase
    .from('pull_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          <p className="mt-2 text-muted-foreground">
            All analyzed pull requests
          </p>
        </div>

        {prs && prs.length > 0 ? (
          <div className="space-y-4">
            {prs.map(pr => (
              <Card key={pr.id}>
                <CardContent className="pt-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {pr.title}
                        </h3>
                        <Badge
                          variant={
                            pr.status === 'reviewed' ? 'default' : 'secondary'
                          }
                        >
                          {pr.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {pr.org_name}/{pr.repo_name} • PR #{pr.pr_number}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        By {pr.author} • {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                      {pr.body && (
                        <p className="mt-2 line-clamp-2 text-sm text-foreground">
                          {pr.body}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <Link href={`/dashboard/reviews/${pr.id}`}>
                        <Button variant="default">View Details</Button>
                      </Link>
                      <a
                        href={pr.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline"
                      >
                        View on GitHub →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Connect a repository and create a pull request to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
