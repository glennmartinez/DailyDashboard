export interface ProjectData {
  items: ProjectItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  status: {
    name: string;
  };
  assignees: {
    nodes: {
      login: string;
      avatarUrl: string;
    }[];
  };
} 