/* eslint-disable @typescript-eslint/no-explicit-any */
// This code implements DashboardLoader using asynchronous methods and YAML parsing.
// It assumes your project has a DashboardConfig type, a WidgetRegistry already set up,
// and that widget definitions include defaultWidth/defaultHeight and a validateConfig function.

import {
  DashboardConfig,
  DashboardRow,
  WidgetConfig,
} from "../types/dashboard";
import { WidgetRegistry } from "./widgetRegistry";

// Define a maximum allowed row width (e.g. grid columns available)
const MAX_ROW_WIDTH = 4;

export class DashboardLoader {
  private widgetRegistry: WidgetRegistry;

  constructor(widgetRegistry: WidgetRegistry) {
    this.widgetRegistry = widgetRegistry;
  }

  async loadWidgetDefinitions(): Promise<void> {
    try {
      const response = await fetch("/api/dashboard/widgets");
      if (!response.ok) {
        throw new Error("Failed to fetch widget definitions");
      }
      const data = await response.json();
      const widgets = data?.widgets;

      if (!widgets || typeof widgets !== "object") {
        throw new Error("Invalid widget definitions format");
      }

      // Register each widget definition
      Object.entries(widgets).forEach(([name, definition]: [string, any]) => {
        if (
          !definition.defaultWidth ||
          !definition.defaultHeight ||
          !definition.component
        ) {
          throw new Error(
            `Invalid widget definition for ${name}: missing required properties`
          );
        }

        const validationFunction = this.createValidationFunction(
          definition.validationRules
        );

        this.widgetRegistry.registerWidget(name, {
          defaultWidth: definition.defaultWidth,
          defaultHeight: definition.defaultHeight,
          component: definition.component,
          validateConfig: validationFunction,
          adapter: definition.adapter,
        });
      });
    } catch (err) {
      console.error("Error loading widget definitions:", err);
    }
  }

  private createValidationFunction(
    rules: Record<string, { required?: boolean; type?: string }>
  ): (config: Record<string, any>) => boolean {
    return (config: Record<string, any>) => {
      if (!rules) return true;

      try {
        Object.entries(rules).forEach(([field, rule]) => {
          const value = config?.[field];

          if (rule.required && value === undefined) {
            throw new Error(`Required field '${field}' is missing`);
          }

          if (value !== undefined) {
            if (rule.type === "array" && !Array.isArray(value)) {
              throw new Error(`Field '${field}' must be an array`);
            }
            if (rule.type === "string" && typeof value !== "string") {
              throw new Error(`Field '${field}' must be a string`);
            }
          }
        });
        return true;
      } catch (error) {
        console.error("Validation error:", error);
        return false;
      }
    };
  }

  async loadDashboards(): Promise<DashboardConfig[]> {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboards");
      }
      const { dashboards } = await response.json();

      // Validate each dashboard
      return dashboards.filter((dashboard) =>
        this.validateDashboardConfig(dashboard, dashboard.id)
      );
    } catch (err) {
      console.error("Error loading dashboards:", err);
      return [];
    }
  }

  private validateDashboardConfig(
    dashboardConfig: DashboardConfig,
    fileName: string
  ): boolean {
    if (!dashboardConfig.rows) {
      console.error(`Dashboard config in ${fileName} does not contain rows.`);
      return false;
    }

    for (const row of dashboardConfig.rows) {
      if (!this.validateRow(row, fileName)) {
        return false;
      }
    }
    return true;
  }

  private validateRow(row: any, fileName: string): boolean {
    // Use "widgets" or "widget" from the YAML row
    const widgets: WidgetConfig[] =
      (row as DashboardRow).widgets || (row as DashboardRow).widget || [];
    if (!Array.isArray(widgets)) {
      console.error(
        `Row in file ${fileName} is missing a valid widgets array.`
      );
      return false;
    }

    let totalRowWidth = 0;
    for (const widget of widgets) {
      // Look up the widget type in the registry
      const widgetDef = this.widgetRegistry.getWidget(widget.type);
      if (!widgetDef) {
        console.error(
          `Widget type "${widget.type}" in file ${fileName} is not registered.`
        );
        return false;
      }
      // Use the widget's default width if it isn't specified
      if (typeof widget.width !== "number") {
        widget.width = widgetDef.defaultWidth;
      }
      totalRowWidth += widget.width;

      // Validate widget configuration using its validator.
      try {
        widgetDef.validateConfig(widget.config);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `Widget of type "${widget.type}" in file ${fileName} has invalid configuration: ${errorMessage}`
        );
        return false;
      }
    }

    if (totalRowWidth > MAX_ROW_WIDTH) {
      console.error(
        `Row in file ${fileName} exceeds maximum allowed width: ${totalRowWidth} > ${MAX_ROW_WIDTH}`
      );
      return false;
    }
    return true;
  }

  async getDashboardById(id: string): Promise<DashboardConfig | null> {
    try {
      const response = await fetch(`/api/dashboard/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard ${id}`);
      }
      const dashboard = await response.json();

      if (!this.validateDashboardConfig(dashboard, id)) {
        return null;
      }
      return dashboard;
    } catch (err) {
      console.error(`Error retrieving dashboard with id ${id}:`, err);
      return null;
    }
  }
}
