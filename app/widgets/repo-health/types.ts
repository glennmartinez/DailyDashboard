export interface RepoHealthWidgetConfig {
  owner: string;
  repo: string;
  branch?: string; // Default to main/master if not specified
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

export interface RepoHealthData {
  commitActivity: CommitActivity[];
  coverage: CodeCoverage;
}
