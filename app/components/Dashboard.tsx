"use client";

import { DashboardRow, DashboardWidget } from "./layout/DashboardLayout";
import { useWidgetRegistry } from "../hooks/useWidgetRegistry";
import { DashboardConfig } from "../types/dashboard";

export function Dashboard({ dashboard }: { dashboard: DashboardConfig }) {
  const registry = useWidgetRegistry();
  console.log("Dashboard data:", dashboard); // Debug log

  // Group widgets by row
  const rows = new Map<number, DashboardConfig["widgets"]>();
  if (dashboard.widgets) {
    console.log("Processing widgets:", dashboard.widgets); // Debug log
    dashboard.widgets.forEach((widget) => {
      const rowWidgets = rows.get(widget.position.row) || [];
      rowWidgets.push(widget);
      rows.set(widget.position.row, rowWidgets);
    });
  }

  console.log("Rows map:", Array.from(rows.entries())); // Debug log

  return (
    <div className="flex flex-col gap-4">
      {Array.from(rows.entries())
        .sort(([a], [b]) => a - b) // Sort by row index
        .map(([rowIndex, rowWidgets]) => {
          console.log(`Rendering row ${rowIndex}:`, rowWidgets); // Debug log
          return (
            <DashboardRow key={`row-${rowIndex}`}>
              {rowWidgets
                .sort((a, b) => a.position.col - b.position.col) // Sort by column
                .map((widget) => {
                  const widgetDef = registry.getWidget(widget.type);
                  console.log(`Widget ${widget.id} definition:`, widgetDef); // Debug log
                  if (!widgetDef) return null;

                  const Component = widgetDef.component;
                  const width =
                    widget.position.width || widgetDef.defaultWidth || 6;
                  return (
                    <DashboardWidget key={widget.id} width={width}>
                      <Component
                        config={widget.config || {}}
                        adapters={[widgetDef.adapter]}
                        width={width}
                        height={
                          widget.position.height || widgetDef.defaultHeight
                        }
                      />
                    </DashboardWidget>
                  );
                })}
            </DashboardRow>
          );
        })}
    </div>
  );
}
