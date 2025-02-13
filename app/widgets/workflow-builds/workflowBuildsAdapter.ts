import { WidgetAdapter } from "../../types/widget";
import { WorkflowBuildsWidgetConfig, WorkflowBuildsData } from "./types";

export class WorkflowBuildsAdapter
  implements WidgetAdapter<WorkflowBuildsWidgetConfig, WorkflowBuildsData>
{
  private config: WorkflowBuildsWidgetConfig | null = null;

  async initialize(config: WorkflowBuildsWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<WorkflowBuildsData> {
    if (!this.config) {
      throw new Error("Adapter must be initialized before fetching data");
    }

    try {
      const response = await fetch(
        `/api/github/repo-health?owner=${this.config.owner}&repo=${
          this.config.repo
        }${this.config.branch ? `&branch=${this.config.branch}` : ""}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch workflow builds data: ${
            errorData.error || response.statusText
          }`
        );
      }

      const data = await response.json();
      return {
        recentWorkflowRuns: data.recentWorkflowRuns,
      };
    } catch (error) {
      console.error("Error fetching workflow builds data:", error);
      throw error;
    }
  }
}