/* eslint-disable @typescript-eslint/no-explicit-any */
// This code implements DashboardLoader using asynchronous methods and YAML parsing.
// It assumes your project has a DashboardConfig type, a WidgetRegistry already set up,
// and that widget definitions include defaultWidth/defaultHeight and a validateConfig function.

import { DashboardConfig } from "../types/dashboard";
import { WidgetRegistry } from "./widgetRegistry";

export class DashboardLoader {
  private widgetRegistry: WidgetRegistry;

  constructor(widgetRegistry: WidgetRegistry) {
    this.widgetRegistry = widgetRegistry;
  }

  static create(widgetRegistry: WidgetRegistry): DashboardLoader {
    return new DashboardLoader(widgetRegistry);
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

        if (typeof validationFunction === "function") {
          this.widgetRegistry.registerWidget(name, {
            ...definition,
            validator: validationFunction,
          });
        } else {
          this.widgetRegistry.registerWidget(name, definition);
        }
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
    if (!dashboardConfig.widgets) {
      console.error(
        `Dashboard config in ${fileName} does not contain widgets.`
      );
      return false;
    }

    for (const widget of dashboardConfig.widgets) {
      const widgetDef = this.widgetRegistry.getWidget(widget.type);
      if (!widgetDef) {
        console.error(
          `Widget type "${widget.type}" in file ${fileName} is not registered.`
        );
        return false;
      }

      if (!widget.position) {
        widget.position = { row: 0, col: 0 };
      }

      // Validate widget configuration
      try {
        if (widgetDef.validator) {
          if (!widgetDef.validator(widget.config || {})) {
            console.error(
              `Widget of type "${widget.type}" in file ${fileName} has invalid configuration`
            );
            return false;
          }
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `Widget of type "${widget.type}" in file ${fileName} has invalid configuration: ${errorMessage}`
        );
        return false;
      }
    }

    return true;
  }

  private validateRow(row: any, fileName: string): boolean {
    const widgets = row.widgets || [];
    if (!Array.isArray(widgets)) {
      console.error(
        `Row in file ${fileName} is missing a valid widgets array.`
      );
      return false;
    }

    for (const widget of widgets) {
      const widgetDef = this.widgetRegistry.getWidget(widget.type);
      if (!widgetDef) {
        console.error(
          `Widget type "${widget.type}" in file ${fileName} is not registered.`
        );
        return false;
      }

      try {
        if (widgetDef.validator) {
          if (!widgetDef.validator(widget.config || {})) {
            console.error(
              `Widget of type "${widget.type}" in file ${fileName} has invalid configuration`
            );
            return false;
          }
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(
          `Widget of type "${widget.type}" in file ${fileName} has invalid configuration: ${errorMessage}`
        );
        return false;
      }
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

  private convertNestedConfigToFlat(config: any): DashboardConfig {
    const widgets = [];
    let currentRow = 0;

    // Handle row-based configuration
    if (Array.isArray(config.widgets)) {
      for (const item of config.widgets) {
        if (item.row && Array.isArray(item.row)) {
          let currentCol = 0;
          for (const widget of item.row) {
            widgets.push({
              id: `${widgets.length}`,
              type: widget.type,
              title: widget.title,
              position: {
                row: currentRow,
                col: currentCol,
              },
              config: widget.config,
            });
            currentCol += 1;
          }
          currentRow += 1;
        }
      }
    }

    return {
      id: config.id,
      title: config.name,
      description: config.description,
      layout: {
        rows: currentRow,
        columns: 12,
      },
      widgets,
    };
  }

  async loadDashboardConfig(path: string): Promise<DashboardConfig | null> {
    try {
      console.log("Loading dashboard config for path:", path); // Debug log
      const response = await fetch(`/api/dashboard/${path}`);
      if (!response.ok) {
        throw new Error("Failed to load dashboard configuration");
      }
      const rawConfig = await response.json();
      console.log("Raw config received:", rawConfig); // Debug log

      // Ensure widgets array exists
      if (!rawConfig.widgets || !Array.isArray(rawConfig.widgets)) {
        console.error(
          "Invalid dashboard config: missing or invalid widgets array"
        );
        return null;
      }

      const config: DashboardConfig = {
        id: rawConfig.id || path,
        title: rawConfig.name,
        description: rawConfig.description,
        layout: {
          rows:
            Math.max(...rawConfig.widgets.map((w: any) => w.position.row)) + 1,
          columns: 12,
        },
        widgets: rawConfig.widgets.map((widget: any) => ({
          id: widget.id,
          type: widget.type,
          title: widget.title,
          position: {
            row: widget.position.row || 0,
            col: widget.position.col || 0,
            width:
              widget.position.width ||
              this.widgetRegistry.getWidget(widget.type)?.defaultWidth ||
              6,
            height:
              widget.position.height ||
              this.widgetRegistry.getWidget(widget.type)?.defaultHeight ||
              1,
          },
          config: widget.config || {},
        })),
      };

      console.log("Processed config:", config); // Debug log
      return this.validateDashboardConfig(config, path) ? config : null;
    } catch (error) {
      console.error("Error loading dashboard configuration:", error);
      return null;
    }
  }

  validateDashboard(config: DashboardConfig): boolean {
    return this.validateDashboardConfig(config, config.id || "unknown");
  }
}
