export interface ProjectData {
  items: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  status: {
    name: string;
  };
  priority: {
    name: string;
  };
  size: {
    name: string;
  };
  milestone: MilestoneData | null;
  assignees: {
    nodes: AssigneeNode[];
  };
}

export interface MilestoneData {
  title: string;
  dueOn: string;
  description: string;
  progressPercentage: number;
  state: string;
  issues: IssueData[];
  issuesOpen: number;
  issuesClosed: number;
}

export interface IssueData {
  title: string;
  number: number;
  state: string;
  createdAt: string;
  updatedAt: string;
  assignees: {
    nodes: AssigneeNode[];
  };
  labels: {
    name: string;
    color: string;
  }[];
}

export interface AssigneeNode {
  login: string;
  avatarUrl: string;
}

export interface MilestonesResponse {
  milestones: MilestoneData[];
}
