import { DashboardLayout } from '@/components/layout/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const providers = [
    { name: 'OpenAI', status: 'connected', model: 'gpt-4-turbo' },
    { name: 'Groq', status: 'available', model: 'mixtral-8x7b' },
    { name: 'Anthropic', status: 'available', model: 'claude-opus' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">Configure RepoLens for your organization</p>
        </div>

        {/* LLM Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle>LLM Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div
                  key={provider.name}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.model}</p>
                  </div>
                  <Badge variant={provider.status === 'connected' ? 'default' : 'secondary'}>
                    {provider.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analyzer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Enabled Analyzers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Code Quality', enabled: true },
                { name: 'Security', enabled: true },
                { name: 'Performance', enabled: true },
                { name: 'Architecture', enabled: true },
                { name: 'Linting', enabled: true },
                { name: 'Documentation', enabled: true },
              ].map((analyzer) => (
                <label
                  key={analyzer.name}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="checkbox"
                    defaultChecked={analyzer.enabled}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="font-medium text-foreground">{analyzer.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Webhook URL</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-secondary p-2 text-sm text-foreground font-mono">
                    {process.env.NEXT_PUBLIC_BASE_URL}/api/webhook
                  </code>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Events</p>
                <p className="mt-2 text-sm text-foreground">
                  • Pull request opened
                  <br />
                  • Pull request synchronize
                  <br />• Pull request reopened
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
