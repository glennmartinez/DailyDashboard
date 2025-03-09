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
  task?: string; // Added task field for version numbers
  startDate?: string; // Added for explicit start date
  endDate?: string; // Added for explicit end date
}

export interface SerpentineChartData {
  title: string;
  dataPoints: DataPoint[];
}
