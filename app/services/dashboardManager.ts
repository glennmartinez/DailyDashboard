import { DashboardLoader } from "./dashboardLoader";
import { WidgetRegistry } from "./widgetRegistry";

export class DashboardManager {
  constructor(
    private registry: WidgetRegistry,
    private loader: DashboardLoader
  ) {}

  async initialize(): Promise<void> {}
}
