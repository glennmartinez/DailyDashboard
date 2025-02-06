"use client";

import { useEffect, useState, use } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { DashboardConfig } from "../../types/dashboard";
import { setupWidgetRegistry } from "../../config/widgets";

export default function DynamicDashboard({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const widgetRegistry = setupWidgetRegistry();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`/api/dashboard/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }
        const data = await response.json();
        setDashboard(data);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-zinc-500">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  if (!dashboard) {
    return (
      <DashboardLayout>
        <div className="text-zinc-500">Dashboard not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-4 gap-4 p-4">
        {dashboard.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="col-span-4">
            <div className="grid grid-cols-4 gap-4">
              {row.widgets.map((widget, widgetIndex) => {
                const widgetDef = widgetRegistry.getWidget(widget.type);
                if (!widgetDef) {
                  console.error(
                    `Widget type ${widget.type} not found in registry`
                  );
                  return null;
                }
                const WidgetComponent = widgetDef.component;
                return (
                  <WidgetComponent
                    key={`${rowIndex}-${widgetIndex}`}
                    config={widget.config}
                    width={widget.width}
                    height={widget.height || widgetDef.defaultHeight}
                    adapters={[widgetDef.adapter]}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
