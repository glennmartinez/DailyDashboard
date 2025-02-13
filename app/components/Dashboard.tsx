"use client";

import {
  Dashboard as DashboardType,
  Row,
  Widget,
  NestedRow,
} from "../types/dashboard";
import { useWidgetRegistry } from "../hooks/useWidgetRegistry";
import { WidgetRegistry } from "../services/widgetRegistry";

function isWidget(item: Widget | NestedRow): item is Widget {
  return "type" in item;
}

function isNestedRow(item: Widget | NestedRow): item is NestedRow {
  return "isNested" in item;
}

function renderWidget(widget: Widget, registry: WidgetRegistry) {
  const definition = registry.getWidget(widget.type);
  if (!definition) {
    console.error(`No widget found for type: ${widget.type}`);
    return null;
  }

  const Component = definition.component;
  const style = {
    gridColumn: `span ${widget.width}`,
    gridRow: widget.height ? `span ${widget.height}` : "auto",
    minHeight: widget.height ? `${widget.height * 6}vh` : "auto",
  };

  return (
    <div key={widget.type} style={style}>
      <Component
        config={widget.config}
        adapters={[definition.adapter]}
        width={widget.width}
        height={widget.height}
      />
    </div>
  );
}

function renderRow(row: Row | NestedRow, registry: WidgetRegistry) {
  return (
    <div
      className="grid grid-cols-12 gap-4"
      style={{
        minHeight: row.height ? `${row.height * 6}vh` : "auto",
      }}
    >
      {row.widgets.map((item, index) => {
        if (isWidget(item)) {
          return renderWidget(item, registry);
        } else if (isNestedRow(item)) {
          // Handle nested row
          return (
            <div
              key={`nested-row-${index}`}
              className="grid grid-cols-subgrid gap-4"
              style={{
                gridColumn: `span ${item.width}`,
                gridRow: `span ${item.height}`,
              }}
            >
              {renderRow(item, registry)}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export function Dashboard({ dashboard }: { dashboard: DashboardType }) {
  const registry = useWidgetRegistry();

  return (
    <div className="flex flex-col gap-4 p-4">
      {dashboard.rows.map((row, index) => (
        <div key={`row-${index}`} className="w-full">
          {renderRow(row, registry)}
        </div>
      ))}
    </div>
  );
}
