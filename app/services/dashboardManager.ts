// File: app/services/dashboardManager.ts

import { DashboardLoader } from "./dashboardLoader";
import { WidgetRegistry } from "./widgetRegistry";
import { DashboardConfig } from "../types/dashboard";

export class DashboardManager {
  private loader: DashboardLoader;
  private dashboards: DashboardConfig[] = [];

  constructor(widgetRegistry: WidgetRegistry) {
    this.loader = new DashboardLoader(widgetRegistry);
  }

  // Initialize widgets and dashboards by loading and caching them.
  async initialize(): Promise<void> {
    // First load and register widget definitions
    await this.loader.loadWidgetDefinitions();

    // Then load dashboards that use these widgets
    this.dashboards = await this.loader.loadDashboards();
  }

  // Returns the full list of dashboards.
  getDashboards(): DashboardConfig[] {
    return this.dashboards;
  }

  // Retrieve a single dashboard by its registered id.
  async getDashboardById(id: string): Promise<DashboardConfig | null> {
    return await this.loader.getDashboardById(id);
  }
}
