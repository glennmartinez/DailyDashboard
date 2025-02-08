import { MilestonesResponse, ProjectData } from "../types/github";

export const githubService = {
  async fetchProjectItems(projectNumber: number): Promise<ProjectData> {
    const response = await fetch(`/api/github?projectNumber=${projectNumber}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project data: ${response.statusText}`);
    }

    const data = await response.json();
    return { items: data.items };
  },

  async fetchMilestoneItems(owner: string, repo: string): Promise<MilestonesResponse> {
    const response = await fetch(
      `/api/github/milestones?owner=${owner}&repo=${repo}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch milestone data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },
};
