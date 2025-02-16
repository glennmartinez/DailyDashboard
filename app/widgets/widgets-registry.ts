/* eslint-disable @typescript-eslint/no-explicit-any */
import { WidgetRegistry } from "../services/widgetRegistry";
import { MotivationalWidget } from "./motivational/MotivationalWidget";
import { SprintAdapter } from "./sprint/sprintAdapter";
import { SprintValidator } from "./sprint/sprintValidator";
import { SprintWidget } from "./sprint/sprintWidget";
import { MotivationalAdapter } from "./motivational/motivationalAdapter";
import { MilestoneWidget } from "./milestone/milestoneWidget";
import { MilestoneAdapter } from "./milestone/milestoneAdapter";
import { milestoneValidator } from "./milestone/milestoneValidator";
import { IssuesAnalyticsWidget } from "./issues-analytics/IssuesAnalyticsWidget";
import { IssuesAnalyticsAdapter } from "./issues-analytics/issuesAnalyticsAdapter";
import { RepoHealthWidget } from "./repo-health/RepoHealthWidget";
import { RepoHealthAdapter } from "./repo-health/repoHealthAdapter";
import { WorkflowBuildsWidget } from "./workflow-builds/WorkflowBuildsWidget";
import { WorkflowBuildsAdapter } from "./workflow-builds/workflowBuildsAdapter";

export function setupWidgetRegistry(): WidgetRegistry {
  console.log("Setting up widget registry..."); // Debug log
  const registry = new WidgetRegistry();

  // Create validator instance
  const sprintValidator = new SprintValidator();

  // Default validator for widgets that don't need specific validation
  const defaultValidator = () => true;

  // Register all widgets with their components and adapters
  registry.registerWidget("sprint", {
    component: SprintWidget,
    adapter: new SprintAdapter(),
    validator: (config: any) => sprintValidator.validate(config),
    defaultWidth: 6,
    defaultHeight: 2,
  });

  registry.registerWidget("motivational", {
    component: MotivationalWidget,
    adapter: new MotivationalAdapter(),
    validator: defaultValidator,
    defaultWidth: 6,
    defaultHeight: 1,
  });

  registry.registerWidget("milestone", {
    component: MilestoneWidget,
    adapter: new MilestoneAdapter(),
    validator: (config: any) => milestoneValidator(config).isValid,
    defaultWidth: 6,
    defaultHeight: 2,
  });

  registry.registerWidget("issues-analytics", {
    component: IssuesAnalyticsWidget,
    adapter: new IssuesAnalyticsAdapter(),
    validator: defaultValidator,
    defaultWidth: 6,
    defaultHeight: 2,
  });

  registry.registerWidget("repo-health", {
    component: RepoHealthWidget,
    adapter: new RepoHealthAdapter(),
    validator: defaultValidator,
    defaultWidth: 6,
    defaultHeight: 2,
  });

  registry.registerWidget("workflow-builds", {
    component: WorkflowBuildsWidget,
    adapter: new WorkflowBuildsAdapter(),
    validator: defaultValidator,
    defaultWidth: 6,
    defaultHeight: 2,
  });

  console.log(
    "Widget registry setup complete. Registered widgets:",
    registry.getRegisteredWidgets()
  ); // Debug log
  return registry;
}
