import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer();

  // Fetch PR details
  const { data: pr } = await supabase
    .from('pull_requests')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!pr) {
    notFound();
  }

  // Fetch findings grouped by analyzer
  const { data: findings } = await supabase
    .from('findings')
    .select('*')
    .eq('pr_id', params.id)
    .order('severity', { ascending: false })
    .order('analyzer');

  // Group findings by analyzer
  const findingsByAnalyzer =
    findings?.reduce((acc: any, finding) => {
      const analyzer = finding.analyzer;
      if (!acc[analyzer]) {
        acc[analyzer] = [];
      }
      acc[analyzer].push(finding);
      return acc;
    }, {}) || {};

  const severityColors = {
    critical: 'destructive',
    high: 'destructive',
    medium: 'secondary',
    low: 'outline',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* PR Header */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{pr.title}</h1>
              <p className="mt-2 text-muted-foreground">
                {pr.org_name}/{pr.repo_name} • PR #{pr.pr_number}
              </p>
            </div>
            <Badge variant="default">{pr.status}</Badge>
          </div>
        </div>

        {/* PR Info */}
        <Card>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <p className="font-medium text-foreground">{pr.author}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">
                  {new Date(pr.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviewed</p>
                <p className="font-medium text-foreground">
                  {pr.reviewed_at ? new Date(pr.reviewed_at).toLocaleDateString() : 'Pending'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Head SHA</p>
                <p className="font-mono text-sm text-foreground">{pr.head_sha.substring(0, 7)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Findings by Analyzer */}
        {Object.entries(findingsByAnalyzer).map(([analyzer, analyzerFindings]: [string, any[]]) => {
          const severityCount = analyzerFindings.reduce((acc: any, f) => {
            acc[f.severity] = (acc[f.severity] || 0) + 1;
            return acc;
          }, {});

          return (
            <Card key={analyzer}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{analyzer} Analyzer</CardTitle>
                  <div className="flex gap-2">
                    {Object.entries(severityCount).map(([severity, count]: [string, any]) => (
                      <Badge
                        key={severity}
                        variant={severityColors[severity as keyof typeof severityColors] as any}
                      >
                        {severity}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyzerFindings.map((finding, idx) => (
                    <div key={idx} className="border-l-4 border-accent bg-secondary p-4 rounded">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                severityColors[
                                  finding.severity as keyof typeof severityColors
                                ] as any
                              }
                            >
                              {finding.severity}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">
                              {finding.file}:{finding.line}
                            </span>
                          </div>
                          <p className="mt-2 font-medium text-foreground">{finding.message}</p>
                          {finding.data?.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {finding.data.description}
                            </p>
                          )}
                          {finding.data?.suggestion && (
                            <div className="mt-3 bg-background p-3 rounded text-sm">
                              <p className="font-medium text-foreground">Suggestion:</p>
                              <p className="mt-1 text-muted-foreground">
                                {finding.data.suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {findings && findings.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">✨ No issues found!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
