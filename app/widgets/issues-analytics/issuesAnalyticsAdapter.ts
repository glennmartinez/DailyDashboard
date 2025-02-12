import { WidgetAdapter } from "../../types/widget";
import { IssuesAnalyticsWidgetConfig, IssueStatistics } from "./types";

export class IssuesAnalyticsAdapter
  implements WidgetAdapter<IssuesAnalyticsWidgetConfig, IssueStatistics>
{
  private config: IssuesAnalyticsWidgetConfig | null = null;

  async initialize(config: IssuesAnalyticsWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<IssueStatistics> {
    if (!this.config) {
      throw new Error("Adapter must be initialized before fetching data");
    }

    try {
      const response = await fetch(
        `/api/github/issues-analytics?owner=${this.config.owner}&repo=${
          this.config.repo
        }&timeRange=${this.config.timeRange || "month"}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch issues analytics data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching issues analytics data:", error);
      throw error;
    }
  }
}
