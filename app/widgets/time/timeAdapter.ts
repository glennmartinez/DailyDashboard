import { WidgetAdapter } from "../../types/widget";
import { TimeWidgetConfig, TimeData } from "./types";

export class TimeAdapter implements WidgetAdapter<TimeWidgetConfig, TimeData> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async initialize(_config: TimeWidgetConfig): Promise<void> {
    // No initialization needed
  }

  async fetchData(): Promise<TimeData> {
    return {
      currentTime: new Date(),
    };
  }
}
