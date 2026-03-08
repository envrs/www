export type Database = {
  public: {
    Tables: {
      pull_requests: {
        Row: {
          id: string;
          repo_id: string;
          github_pr_id: number;
          number: number;
          title: string;
          description: string | null;
          author: string;
          branch: string;
          base_branch: string;
          status: 'pending' | 'in_progress' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          repo_id: string;
          github_pr_id: number;
          number: number;
          title: string;
          description?: string | null;
          author: string;
          branch: string;
          base_branch: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'in_progress' | 'completed' | 'failed';
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          pr_id: string;
          review_type: string;
          summary: string;
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
          findings: any;
          llm_provider: string;
          model_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pr_id: string;
          review_type: string;
          summary: string;
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
          findings?: any;
          llm_provider: string;
          model_used: string;
          created_at?: string;
        };
      };
      review_findings: {
        Row: {
          id: string;
          review_id: string;
          file_path: string;
          line_number: number | null;
          code_snippet: string | null;
          issue: string;
          suggestion: string | null;
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          file_path: string;
          line_number?: number | null;
          code_snippet?: string | null;
          issue: string;
          suggestion?: string | null;
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
          category: string;
          created_at?: string;
        };
      };
    };
  };
};
