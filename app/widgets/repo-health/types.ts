export interface RepoHealthWidgetConfig {
  owner: string;
  repo: string;
  branch?: string; // Default to main/master if not specified
}

export interface BranchProtection {
  isEnabled: boolean;
  requiredApprovals: number;
  requiresStatusChecks: boolean;
  restrictsPushes: boolean;
}

export interface CommitActivity {
  date: string;
  count: number;
}

export interface CodeCoverage {
  percentage: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  trend: {
    date: string;
    percentage: number;
  }[];
}

export interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string;
  url: string;
  createdAt: string;
}

export interface RepoHealthData {
  branchProtection: BranchProtection;
  commitActivity: CommitActivity[];
  coverage: CodeCoverage;
  recentWorkflowRuns: WorkflowRun[];
}
