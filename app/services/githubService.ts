import { ProjectData } from "../types/github";

export const githubService = {
  async fetchProjectItems(projectNumber: number): Promise<ProjectData> {
    const response = await fetch(`/api/github?projectNumber=${projectNumber}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project data: ${response.statusText}`);
    }

    const data = await response.json();
    return { items: data.items };
  },
};
