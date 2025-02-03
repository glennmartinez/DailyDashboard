export interface DashboardConfig {
    name: string;
    description: string;
    layout: LayoutConfig;
}

interface LayoutConfig {
    rows: RowConfig[];
}

interface RowConfig {
    height: number;
    widget: WidgetConfig[];
}

interface WidgetConfig {
    type: string;
    width: number;
    config: Record<string, any>;
}