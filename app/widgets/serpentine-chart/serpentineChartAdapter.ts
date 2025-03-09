// serpentine-chart/serpentineChartAdapter.ts
import { WidgetAdapter } from "../../types/widget";
import {
  SerpentineChartWidgetConfig,
  SerpentineChartData,
  DataPoint,
} from "./types";

export class SerpentineChartAdapter
  implements WidgetAdapter<SerpentineChartWidgetConfig, SerpentineChartData>
{
  private config: SerpentineChartWidgetConfig | null = null;

  async initialize(config: SerpentineChartWidgetConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<SerpentineChartData> {
    if (!this.config) {
      throw new Error("Adapter not initialized");
    }

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Generate sample data spanning 3 months
    const startDate = new Date(2023, 0, 1); // January 1, 2023
    const endDate = new Date(2023, 3, 1); // April 1, 2023

    // Helper function to get random number of days between min and max
    const getRandomDays = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Helper function to add days to a date
    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // Updated categories and their corresponding colors
    const categories = ["PC", "Xbox", "PS5", "China"];
    const colors = ["#9B59B6", "#2ECC71", "#3498DB", "#E74C3C"]; // Purple, Green, Blue, Red
    const sampleData: DataPoint[] = [];

    // Create activities for each platform with proper distribution
    categories.forEach((category, index) => {
      let currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + index * 3); // Stagger start dates

      const recordsForCategory = 5 + Math.floor(Math.random() * 2); // 5 to 6 records per category

      for (let i = 0; i < recordsForCategory; i++) {
        const duration = getRandomDays(4, 14); // 2 days to 2 weeks

        if (currentDate < endDate) {
          const startDateStr = formatDate(currentDate);
          const endDateObj = addDays(currentDate, duration);

          sampleData.push({
            category: category,
            value: duration,
            color: colors[index],
            date: new Date(currentDate),
            task: `v${(1 + Math.random() * 4).toFixed(2)}`, // Random version between v1.00 and v5.00
            startDate: startDateStr,
            endDate: formatDate(endDateObj),
          });

          // Add a gap between tasks (1-5 days)
          currentDate = addDays(endDateObj, getRandomDays(1, 5));
        }
      }
    });

    // Sort by date to ensure proper timeline display
    sampleData.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Process data to include formatted category with date
    const processedData = sampleData.map((item) => ({
      ...item,
      formattedDate: formatDate(item.date),
      category: `${item.category} (${formatDate(item.date)})`,
    }));

    return {
      title: this.config.title || "Platform Timeline (Q1 2023)",
      dataPoints: processedData,
    };
  }

  async dispose(): Promise<void> {
    // Clean up any resources if needed
  }
}

export default SerpentineChartAdapter;
