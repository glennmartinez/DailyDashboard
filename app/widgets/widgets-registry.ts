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
import { IssuesAnalyticsWidget } from "./issues-analytics/IssuesAnalyticsWidget";
import { IssuesAnalyticsAdapter } from "./issues-analytics/issuesAnalyticsAdapter";
import { RepoHealthWidget } from "./repo-health/RepoHealthWidget";
import { RepoHealthAdapter } from "./repo-health/repoHealthAdapter";
import { WorkflowBuildsWidget } from "./workflow-builds/WorkflowBuildsWidget";
import { WorkflowBuildsAdapter } from "./workflow-builds/workflowBuildsAdapter";

function registerWidget(
  registry: WidgetRegistry,
  name: string,
  component: any,
  adapter: any,
  validator: (config: any) => boolean,
  defaultWidth: number,
  defaultHeight: number
) {
  registry.registerWidget(name, {
    component,
    adapter,
    validator,
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
    (config: any): boolean => sprintValidator.validate(config),
    2,
    1
  );

  registerWidget(
    registry,
    "motivational",
    MotivationalWidget,
    new MotivationalAdapter(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_config: any): boolean => true,
    2,
    1
  );

  registerWidget(
    registry,
    "milestone",
    MilestoneWidget,
    new MilestoneAdapter(),
    (config: any): boolean => milestoneValidator.validate(config),
    2,
    1
  );

  registerWidget(
    registry,
    "issues-analytics",
    IssuesAnalyticsWidget,
    new IssuesAnalyticsAdapter(),
    (config: any): boolean => {
      if (!config?.owner || typeof config.owner !== "string") return false;
      if (!config?.repo || typeof config.repo !== "string") return false;
      if (
        config.timeRange &&
        !["week", "month", "quarter"].includes(config.timeRange)
      )
        return false;
      return true;
    },
    6,
    2
  );

  registerWidget(
    registry,
    "repo-health",
    RepoHealthWidget,
    new RepoHealthAdapter(),
    (config: any): boolean => {
      if (!config?.owner || typeof config.owner !== "string") return false;
      if (!config?.repo || typeof config.repo !== "string") return false;
      if (config.branch && typeof config.branch !== "string") return false;
      return true;
    },
    6,
    6 // Updated height to match the new requirement
  );

  registerWidget(
    registry,
    "workflow-builds",
    WorkflowBuildsWidget,
    new WorkflowBuildsAdapter(),
    (config: any): boolean => {
      if (!config?.owner || typeof config.owner !== "string") return false;
      if (!config?.repo || typeof config.repo !== "string") return false;
      if (config.branch && typeof config.branch !== "string") return false;
      return true;
    },
    6,
    4 // Height for workflow builds
  );

  return registry;
}
