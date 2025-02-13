/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Widget {
  type: string;
  width: number;
  height?: number;
  config: Record<string, any>;
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
  name: string;
  description: string;
  rows: Row[];
}

export interface DashboardConfig {
  id?: string;
  title: string;
  description?: string;
  layout?: {
    rows: number;
    columns: number;
  };
  widgets: {
    id: string;
    type: string;
    title?: string;
    position: {
      row: number;
      col: number;
      width?: number;
      height?: number;
    };
    config?: Record<string, any>;
  }[];
}
