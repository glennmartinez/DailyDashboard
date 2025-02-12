export interface MilestoneWidgetConfig {
  owner: string;
  repo: string;
}

export interface MilestoneData {
  milestones: {
    id: string;
    title: string;
    dueDate: string;
    progress: {
      completed: number;
    };
    status: string;
    issuesOpen: number;
    issuesClosed: number;
  }[];
}
