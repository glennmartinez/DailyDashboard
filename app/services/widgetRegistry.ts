import { WidgetDefinition } from "../types/widget";

export class WidgetRegistry {
  private widgets = new Map<string, WidgetDefinition>();

  registerWidget(type: string, definition: WidgetDefinition): void {
    this.widgets.set(type, definition);
  }

  getWidget(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  getRegisteredWidgets(): string[] {
    return Array.from(this.widgets.keys());
  }
}
