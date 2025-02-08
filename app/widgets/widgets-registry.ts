/* eslint-disable @typescript-eslint/no-explicit-any */
import { WidgetRegistry } from "../services/widgetRegistry";
import { MotivationalWidget } from "./motivational/MotivationalWidget";
import { SprintAdapter } from "./sprint/sprintAdapter";
import { SprintValidator } from "./sprint/sprintValidator";
import { SprintWidget } from "./sprint/sprintWidget";
import { MotivationalAdapter } from "./motivational/motivationalAdapter";
import { MilestoneWidget } from "./milestone/milestoneWidget";
import { MilestoneAdapter } from "./milestone/milestoneAdapter";
import { MilestoneValidator } from "./milestone/milestoneValidator";

function registerWidget(
  registry: WidgetRegistry,
  name: string,
  component: any,
  adapter: any,
  validateConfig: (config: any) => boolean,
  defaultWidth: number,
  defaultHeight: number
) {
  registry.registerWidget(name, {
    component,
    adapter,
    validateConfig,
    defaultWidth,
    defaultHeight,
  });
}

export function setupWidgetRegistry(): WidgetRegistry {
  const registry = new WidgetRegistry();
  const milestoneValidator = new MilestoneValidator();
  const sprintValidator = new SprintValidator();

  registerWidget(
    registry,
    "sprint",
    SprintWidget,
    new SprintAdapter(),
    (config: any): boolean => {
      return sprintValidator.validate(config);
    },
    2,
    1
  );

  registerWidget(
    registry,
    "motivational",
    MotivationalWidget,
    new MotivationalAdapter(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (config: any): boolean => {
      return true; // TODO: Implement proper validation for motivational widget
    },
    2,
    1
  );

  registerWidget(
    registry,
    "milestone",
    MilestoneWidget,
    new MilestoneAdapter(),
    (config: any): boolean => {
      return milestoneValidator.validate(config);
    },
    2,
    1
  );

  return registry;
}
