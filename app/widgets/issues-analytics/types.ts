export interface IssuesAnalyticsWidgetConfig {
  owner: string;
  repo: string;
  timeRange?: "week" | "month" | "quarter";
}

export interface IssueStatistics {
  total: number;
  open: number;
  closed: number;
  byLabel: {
    name: string;
    count: number;
    color: string;
  }[];
  byAssignee: {
    login: string;
    count: number;
    avatarUrl: string;
  }[];
  timeline: {
    date: string;
    opened: number;
    closed: number;
  }[];
}
