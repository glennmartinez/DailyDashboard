# Widget and Dashboard Configuration Guide

This guide explains how to create and configure new widgets and dashboards in the system.

## Widget Implementation

### 1. Widget Structure

A widget consists of the following components:

- Widget Component (React component)
- Widget Adapter (Data fetching logic)
- Widget Validator (Configuration validation)
- Widget Types (TypeScript interfaces)

### 2. Required Interfaces

#### Widget Props Interface

```typescript
export interface WidgetProps<T = any> {
  config: T; // Widget configuration
  width: number; // Widget width in grid units
  height: number; // Widget height in grid units
  adapters: WidgetAdapter<T, any>[]; // Data adapters
}
```

#### Widget Adapter Interface

```typescript
export interface WidgetAdapter<TConfig = any, TData = any> {
  initialize(config: TConfig): Promise<void>;
  fetchData(): Promise<TData>;
}
```

#### Widget Definition Interface

```typescript
export interface WidgetDefinition<TConfig = any, TData = any> {
  component: React.ComponentType<WidgetProps<TConfig>>;
  adapter: WidgetAdapter<TConfig, TData>;
  validateConfig: (config: any) => boolean;
  defaultWidth: number;
  defaultHeight: number;
}
```

### 3. Example Implementation (Sprint Widget)

#### Widget Configuration Type

```typescript
// types.ts
interface SprintWidgetConfig {
  owner: string; // Repository owner
  repos: string[]; // List of repositories
  project: string; // Project identifier
}
```

#### Widget Validator

```typescript
// sprintValidator.ts
export function validateSprintConfig(config: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const conf = config as SprintWidgetConfig;

  if (typeof conf.owner !== "string" || conf.owner.trim() === "") {
    errors.push("The 'owner' field must be a non-empty string.");
  }

  if (!Array.isArray(conf.repos)) {
    errors.push("The 'repos' field must be an array.");
  }

  if (typeof conf.project !== "string" || conf.project.trim() === "") {
    errors.push("The 'project' field must be a non-empty string.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

#### Widget Registration

```typescript
// config/widgets.ts
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
```

## Dashboard Configuration

### 1. YAML Configuration

Widgets are defined in `dashboards-config/widgets.yml`:

```yaml
widgets:
  sprint:
    type: "sprint"
    defaultWidth: 2
    defaultHeight: 2
    component: "SprintWidget"
    validationRules:
      owner:
        type: "string"
        required: true
      repos:
        type: "array"
        required: true
        items:
          type: "string"
      project:
        type: "string"
        required: true
```

### 2. Dashboard Layout

Dashboards are configured using YAML files. Example dashboard configuration:

```yaml
id: "main-dashboard"
title: "Main Dashboard"
description: "Main development dashboard"
rows:
  - widgets:
      - type: "sprint"
        width: 2
        height: 2
        config:
          owner: "your-org"
          repos: ["repo1", "repo2"]
          project: "PROJ-123"
```

### 3. Important Notes

- Each row's total width must not exceed the maximum row width (default: 4)
- Widget configurations are validated against their respective validation rules
- Widget dimensions (width/height) are specified in grid units
- Default dimensions can be overridden in the dashboard configuration

## Loading and Registration

The system automatically:

1. Loads widget definitions from the YAML configuration
2. Registers widgets with the WidgetRegistry
3. Validates dashboard configurations against registered widgets
4. Renders the dashboard layout with the configured widgets
