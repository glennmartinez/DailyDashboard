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
  assignees: {
    nodes: {
      login: string;
      avatarUrl: string;
    }[];
  };
}
