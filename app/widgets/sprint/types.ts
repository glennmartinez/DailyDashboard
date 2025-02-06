export interface SprintWidgetConfig {
  owner: string;
  repos: string[];
  project: string;
  projectNumber: number;
}

//TODO: Implement SprintData structure
export interface SprintData {
  items: {
    id: string;
    title: string;
    status: { name: string };
    assignees: { nodes: { login: string; avatarUrl: string }[] };
    size: { name: string };
    priority: { name: string };
  }[];
}
