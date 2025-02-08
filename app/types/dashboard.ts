/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DashboardConfig {
  name: string;
  description: string;
  rows: DashboardRow[];
}

export interface DashboardRow {
  height: number; // 1-12 units
  maxUnits?: number; // Optional limit per row (default 12)
  widgets: WidgetConfig[];
}

export interface WidgetConfig {
  type: string;
  width: number; // 1-12 units
  height?: number; // Optional height units (1-12)
  config?: Record<string, any>;
}
