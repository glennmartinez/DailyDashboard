/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Widget {
  id: string;
  type: string;
  title?: string;
  config: Record<string, any>;
  position: {
    row: number;
    col: number;
    width?: number;
    height?: number;
  };
}

export interface NestedRow {
  isNested: true;
  height: number;
  width: number;
  widgets: (Widget | NestedRow)[];
}

export interface Row {
  height: number;
  widgets: (Widget | NestedRow)[];
}

export interface Dashboard {
  id?: string;
  title: string;
  description?: string;
  layout?: {
    rows: number;
    columns: number;
  };
  widgets: Widget[];
}

// Make DashboardConfig identical to Dashboard to avoid conversion
export type DashboardConfig = Dashboard;

export interface WidgetConfig {
  id: string;
  type: string;
  title?: string;
  config?: Record<string, any>;
}
