import { DashboardConfig } from "../types/dashboard";
import { join } from "path";
import  fs  from 'fs';

export class DashboardLoader {
  private configPath: string;

  constructor() {
    this.configPath = join(process.cwd(), "all/dashboards");
  }
  //TODO: Add Loader implementation
  async loadDashboards(): Promise<DashboardConfig[]> {
    // Implementation
    const configPath = join(__dirname__, "../all/dashboards");

    if (!fs.existsSync(configPath)) {
      return [];
    }

    const result: DashboardConfig[] = [];

    try {
      const files = fs.readdirSync(configPath);
      files.forEach((file) => {
        // Filter out non-YAML files
        if (file.endsWith(".yaml")) {
          const fileContent = fs.readFileSync(file, "utf8");
          const config = parseYaml(fileContent);

          if (config) {
            result.push({
              id: `dashboard-${Date.now()}`,
              name: process.env.DASHBOARD_NAME || "Dashboard",
              config,
            });
          }
        }
      });
    } catch (error) {
      console.error("Error loading dashboards:", error);
    }

    return result;
  }

  //TODO: Add get dashboard impl
  async getDashboardById(id: string): Promise<DashboardConfig | null> {
    // Implementation
  }
}
