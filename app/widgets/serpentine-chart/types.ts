// serpentine-chart/types.ts

// Define the configuration for our widget
export interface SerpentineChartWidgetConfig {
  title?: string;
  dataSource?: string;
}

// Define the data structure we'll use
export interface DataPoint {
  category: string;
  value: number;
  color?: string;
  date?: Date;
  formattedDate?: string;
  task?: string;
  startDate?: string;
  endDate?: string;
}

export interface SerpentineChartData {
  title: string;
  dataPoints: DataPoint[];
}
