import { WidgetAdapter } from "../../types/widget";
import { TreeCoverageData, TreeCoverageWidgetConfig } from "./types";

export class TreeCoverageAdapter
  implements WidgetAdapter<TreeCoverageWidgetConfig, TreeCoverageData>
{
  private config: TreeCoverageWidgetConfig | null = null;

  async initialize(config: TreeCoverageWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<TreeCoverageData> {
    if (!this.config) {
      throw new Error("Adapter must be initialized before fetching data");
    }

    try {
      const { owner, repo, branch, depth = 2 } = this.config;
      const branchParam = branch ? `&branch=${branch}` : "";

      const response = await fetch(
        `/api/github/tree-coverage?owner=${owner}&repo=${repo}${branchParam}&depth=${depth}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Tree coverage API error:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });

        switch (response.status) {
          case 401:
            throw new Error("Unauthorized: Please check your Codecov token");
          case 404:
            throw new Error("Repository not found or not tracked by Codecov");
          case 429:
            throw new Error("Rate limit exceeded. Please try again later");
          default:
            throw new Error(
              `Failed to fetch tree coverage data: ${
                errorData.error || response.statusText
              }`
            );
        }
      }

      const data = await response.json();
      if (!data.folderStats || !Array.isArray(data.folderStats)) {
        console.error("Invalid response format:", data);
        throw new Error(
          "Invalid response format: missing or invalid folderStats"
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching tree coverage data:", error);
      throw error instanceof Error
        ? error
        : new Error("Unknown error occurred");
    }
  }
}
