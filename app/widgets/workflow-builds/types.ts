export interface WorkflowBuildsWidgetConfig {
  owner: string;
  repo: string;
  branch?: string;
}

export interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string;
  url: string;
  createdAt: string;
}

export interface WorkflowBuildsData {
  recentWorkflowRuns: WorkflowRun[];
}