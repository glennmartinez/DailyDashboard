import { SprintWidgetConfig } from "./types";

export interface WidgetConfigValidator<T> {
  validate(config: T): boolean;
}

export class SprintValidator
  implements WidgetConfigValidator<SprintWidgetConfig>
{
  validate(config: SprintWidgetConfig): boolean {
    if (!config || typeof config !== "object") {
      console.error("Configuration must be an object.");
      return false;
    }

    // Validate owner
    if (typeof config.owner !== "string" || config.owner.trim() === "") {
      console.error("The 'owner' field must be a non-empty string.");
      return false;
    }

    // Validate repos
    if (!Array.isArray(config.repos) || config.repos.length === 0) {
      console.error("The 'repos' field must be a non-empty array.");
      return false;
    }

    if (
      config.repos.some(
        (repo) => typeof repo !== "string" || repo.trim() === ""
      )
    ) {
      console.error(
        "Each entry in the 'repos' array must be a non-empty string."
      );
      return false;
    }

    // Validate project
    if (typeof config.project !== "string" || config.project.trim() === "") {
      console.error("The 'project' field must be a non-empty string.");
      return false;
    }

    return true;
  }
}
