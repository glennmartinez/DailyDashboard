import { WidgetAdapter } from "../../types/widget";
import { SprintData, SprintWidgetConfig } from "./types";

export class SprintAdapter
  implements WidgetAdapter<SprintWidgetConfig, SprintData>
{
  initialize(config: SprintWidgetConfig): Promise<void> {
    throw new Error("Method not implemented.");
  }
  fetchData(): Promise<SprintData> {
    throw new Error("Method not implemented.");
  }
}
