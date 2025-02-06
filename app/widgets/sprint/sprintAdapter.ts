import { WidgetAdapter } from "../../types/widget";
import { SprintData, SprintWidgetConfig } from "./types";
import { githubService } from "../../services/githubService";

export class SprintAdapter
  implements WidgetAdapter<SprintWidgetConfig, SprintData>
{
  private config: SprintWidgetConfig | null = null;

  async initialize(config: SprintWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<SprintData> {
    if (!this.config) {
      throw new Error("Adapter must be initialized before fetching data");
    }

    try {
      const projectData = await githubService.fetchProjectItems(
        this.config.projectNumber
      );
      return {
        items: projectData.items.map((item) => ({
          id: item.id,
          title: item.title,
          status: { name: item.status.name },
          assignees: {
            nodes: item.assignees.nodes.map((node) => ({
              login: node.login,
              avatarUrl: node.avatarUrl,
            })),
          },
          size: { name: item.size.name },
          priority: { name: item.priority.name },
        })),
      };
    } catch (error) {
      console.error("Error fetching sprint data:", error);
      throw error;
    }
  }
}
