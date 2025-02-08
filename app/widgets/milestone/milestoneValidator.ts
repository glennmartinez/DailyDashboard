 import { MilestoneWidgetConfig } from "./types";

export interface MilestoneValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface MilestoneConfig {
  projectNumber: number;
}

export function milestoneValidator(
  config: MilestoneConfig
): MilestoneValidationResult {
  const errors: string[] = [];

  if (
    !config.projectNumber ||
    typeof config.projectNumber !== "number" ||
    config.projectNumber <= 0 ||
    !Number.isInteger(config.projectNumber)
  ) {
    errors.push("Project number must be a positive integer");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export interface WidgetConfigValidator<T> {
  validate(config: T): boolean;
}

export class MilestoneValidator
  implements WidgetConfigValidator<MilestoneWidgetConfig>
{
  validate(config: MilestoneWidgetConfig): boolean {
    if (!config) return false;

    if (!config.owner || typeof config.owner !== "string") {
      console.error("Invalid or missing owner in milestone widget config");
      return false;
    }

    if (!config.repo || typeof config.repo !== "string") {
      console.error("Invalid or missing repo in milestone widget config");
      return false;
    }

    return true;
  }
}
