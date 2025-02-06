import { SprintWidgetConfig } from "./types";

export function validateSprintConfig(config: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof config !== "object" || config === null) {
    errors.push("Configuration must be an object.");
    return { valid: false, errors };
  }

  const conf = config as SprintWidgetConfig;

  // Validate owner: must be a non-empty string.
  if (typeof conf.owner !== "string" || conf.owner.trim() === "") {
    errors.push("The 'owner' field must be a non-empty string.");
  }

  // Validate repos: must be an array with at least one non-empty string.
  if (!Array.isArray(conf.repos)) {
    errors.push("The 'repos' field must be an array.");
  } else if (conf.repos.length === 0) {
    errors.push("The 'repos' array must contain at least one repository.");
  } else {
    for (const repo of conf.repos) {
      if (typeof repo !== "string" || repo.trim() === "") {
        errors.push(
          "Each entry in the 'repos' array must be a non-empty string."
        );
        break;
      }
    }
  }

  // Validate project: must be a non-empty string.
  if (typeof conf.project !== "string" || conf.project.trim() === "") {
    errors.push("The 'project' field must be a non-empty string.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
