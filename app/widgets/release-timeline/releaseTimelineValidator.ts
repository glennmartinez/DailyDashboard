import type { ReleaseTimelineWidgetConfig } from "./types";

export function releaseTimelineValidator(config: ReleaseTimelineWidgetConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // No required fields for now, but you can add validation rules if needed
  // For example, if you want to make owner and repo required:
  /*
  if (!config.owner) {
    errors.push('Owner is required');
  }
  
  if (!config.repo) {
    errors.push('Repository is required');
  }
  */

  return {
    isValid: errors.length === 0,
    errors,
  };
}
