/* eslint-disable @typescript-eslint/no-explicit-any */
import { WidgetAdapter } from "../../types/widget";
import { MotivationalService } from "../../services/motivationalService";

interface MotivationalConfig {
  refreshInterval?: number;
}

interface MotivationalData {
  message: string;
}

export class MotivationalAdapter
  implements WidgetAdapter<MotivationalConfig, MotivationalData>
{
  private config: MotivationalConfig | null = null;
  private service: MotivationalService;

  constructor() {
    this.service = new MotivationalService();
  }

  async initialize(config: MotivationalConfig): Promise<void> {
    this.config = config;
  }

  async fetchData(): Promise<MotivationalData> {
    const message = await this.service.getMessageOfTheDay();
    return { message };
  }
}
