import { WidgetAdapter } from "../../types/widget";
import { RepoHealthWidgetConfig, RepoHealthData } from "./types";

export class RepoHealthAdapter
  implements WidgetAdapter<RepoHealthWidgetConfig, RepoHealthData>
{
  private config: RepoHealthWidgetConfig | null = null;

  async initialize(config: RepoHealthWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<RepoHealthData> {
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
          `Failed to fetch repository health data: ${
            errorData.error || response.statusText
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching repository health data:", error);
      throw error;
    }
  }
}
