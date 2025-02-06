import { ProjectData } from "../types/github";

export const githubService = {
  async fetchProjectItems(): Promise<ProjectData> {
    const response = await fetch("/api/github");

    if (!response.ok) {
      throw new Error(`Failed to fetch project data: ${response.statusText}`);
    }

    const data = await response.json();
    return { items: data.items };
  },

  async updateIssueStatus(id: string, status: string): Promise<void> {
    const response = await fetch("/api/github", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update issue status: ${response.statusText}`);
    }
  },
};
