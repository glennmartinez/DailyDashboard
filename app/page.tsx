// File: app/page.tsx
"use client";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { DashboardManager } from "./services/dashboardManager";
import { WidgetRegistry } from "./services/widgetRegistry";
import { DashboardConfig } from "./types/dashboard";

export default function Home() {
  const [dashboards, setDashboards] = useState<
    (DashboardConfig & { component?: React.ComponentType })[]
  >([]);

  useEffect(() => {
    const loadDashboards = async () => {
      // Initialize widget registry and dashboard manager
      const widgetRegistry = new WidgetRegistry();
      const dashboardManager = new DashboardManager(widgetRegistry);

      // Initialize and load dashboards
      await dashboardManager.initialize();
      const loadedDashboards = dashboardManager.getDashboards();

      // Set only the dynamically loaded dashboards
      setDashboards(loadedDashboards);
    };

    loadDashboards().catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="col-span-full">
        <h1 className="text-2xl font-bold text-zinc-200 mb-8">Dashboards</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-black rounded-sm p-6 hover:bg-zinc-900 transition-colors"
            >
              <h2 className="text-lg font-bold text-zinc-200">
                {dashboard.name}
              </h2>
              <p className="text-sm text-zinc-500">{dashboard.description}</p>
              <a
                href={`/dashboard/${dashboard.id}`}
                className="text-blue-400 block mt-2"
              >
                Go to dashboard
              </a>
            </div>
          ))}
          {/* Sample Dashboard */}
          <div
            key={"sampledashboard"}
            className="bg-black rounded-sm p-6 hover:bg-zinc-900 transition-colors"
          >
            <h2 className="text-lg font-bold text-zinc-200">
              {"Sample Dashboard"}
            </h2>
            <p className="text-sm text-zinc-500">{"A sample dashboard"}</p>
            <a
              href={"/dashboard/sampledashboard"}
              className="text-blue-400 block mt-2"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
