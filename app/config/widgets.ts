/* eslint-disable @typescript-eslint/no-explicit-any */
import { WidgetRegistry } from "../services/widgetRegistry";
import { SprintAdapter } from "../widgets/sprint/sprintAdapter";
import { validateSprintConfig } from "../widgets/sprint/sprintValidator";
import { SprintWidget } from "../widgets/sprint/sprintWidget";

export function setupWidgetRegistry(): WidgetRegistry {
  const registry = new WidgetRegistry();

  registry.registerWidget("sprint", {
    component: SprintWidget,
    adapter: new SprintAdapter(),
    validateConfig: (config: any): boolean => {
      const { valid, errors } = validateSprintConfig(config);

      if (!valid) {
        throw new Error(
          `Sprint widget configuration is invalid: ${errors.join(", ")}`
        );
      }
      return true;
    },
    defaultWidth: 2,
    defaultHeight: 1,
  });

  return registry;
}
