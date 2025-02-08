# Dashboard System Architecture

## Class Diagram

```mermaid
classDiagram
    class DashboardManager {
        -loader: DashboardLoader
        -dashboards: DashboardConfig[]
        +initialize(): Promise<void>
        +getDashboards(): DashboardConfig[]
        +getDashboardById(id: string): Promise<DashboardConfig>
    }

    class DashboardLoader {
        -widgetRegistry: WidgetRegistry
        +loadWidgetDefinitions(): Promise<void>
        +loadDashboards(): Promise<DashboardConfig[]>
        +getDashboardById(id: string): Promise<DashboardConfig>
    }

    class WidgetRegistry {
        -widgets: Map<string, WidgetDefinition>
        +register(widget: WidgetDefinition): void
        +get(type: string): WidgetDefinition
    }

    class DashboardConfig {
        +id: string
        +name: string
        +description: string
        +rows: DashboardRow[]
        +widgets: WidgetConfig[]
    }

    class DashboardRow {
        +height: number
        +widget: WidgetConfig[]
        +widgets?: WidgetConfig[]
    }

    class WidgetConfig {
        +type: string
        +width: number
        +height: number
        +config: any
    }

    DashboardManager "1" --> "1" DashboardLoader : uses
    DashboardLoader "1" --> "1" WidgetRegistry : uses
    DashboardManager "1" --> "*" DashboardConfig : manages
    DashboardConfig "1" --> "*" DashboardRow : contains
    DashboardRow "1" --> "*" WidgetConfig : contains
    WidgetRegistry "1" --> "*" WidgetConfig : validates
```

This diagram illustrates the core classes and their relationships in the dashboard system:

- **DashboardManager**: Central class that manages dashboard initialization and retrieval
- **DashboardLoader**: Handles loading of widget definitions and dashboard configurations
- **WidgetRegistry**: Maintains registry of available widgets and their definitions
- **DashboardConfig**: Represents a complete dashboard configuration
- **DashboardRow**: Represents a row in the dashboard layout
- **WidgetConfig**: Represents individual widget configurations

The arrows indicate dependencies and relationships between classes, with multiplicities shown where relevant (1 to 1, 1 to many).
