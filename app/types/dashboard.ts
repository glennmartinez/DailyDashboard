/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DashboardConfig {
  id?: string;
  name: string;
  description: string;
  rows: DashboardRow[];
  widgets?: WidgetConfig[];
}

export interface DashboardRow {
  height: number;
  widget: WidgetConfig[]; // primary property
  widgets?: WidgetConfig[]; // optional alias
}

export interface WidgetConfig {
  type: string;
  width: number;
  height?: number;
  config: Record<string, unknown>;
  component: React.ComponentType<any>;
  adapters?: string[];
  props?: Record<string, any>;
}
