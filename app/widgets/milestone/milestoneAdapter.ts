import { WidgetAdapter } from "../../types/widget";
import { MilestoneData, MilestoneWidgetConfig } from "./types";
import {
  githubService,
} from "../../services/githubService";
import { MilestonesResponse } from "../../types/github";

export class MilestoneAdapter
  implements WidgetAdapter<MilestoneWidgetConfig, MilestoneData>
{
  private config: MilestoneWidgetConfig | null = null;

  async initialize(config: MilestoneWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<MilestoneData> {
    if (!this.config) {
      throw new Error("Adapter must be initialized before fetching data");
    }

    try {
      const response: MilestonesResponse =
        await githubService.fetchMilestoneItems(
          this.config.owner,
          this.config.repo
        );

      return {
        milestones: response.milestones.map((milestone) => ({
          id: `${this.config?.owner}/${this.config?.repo}/${milestone.title}`,
          title: milestone.title,
          dueDate: milestone.dueOn,
          description: milestone.description,
          progress: {
            completed: Math.round(milestone.progressPercentage) || 0,
          },
          status: milestone.state,
          issuesOpen: milestone.issuesOpen,
          issuesClosed: milestone.issuesClosed,
        })),
      };
    } catch (error) {
      console.error("Error fetching milestone data:", error);
      throw error;
    }
  }
}
