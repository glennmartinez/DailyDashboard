"use client";

import { DashboardLoader } from "../../services/dashboardLoader";
import { ClientDashboard } from "../../components/ClientDashboard";
import { setupWidgetRegistry } from "../../widgets/widgets-registry";
import { Suspense, useEffect, useState } from "react";
import { Dashboard } from "@/app/types/dashboard";
import { useParams } from "next/navigation";

const DashboardPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [dashboardConfig, setDashboardConfig] = useState<Dashboard | null>(
    null
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const registry = setupWidgetRegistry();
    const loader = DashboardLoader.create(registry);

    const loadDashboard = async () => {
      if (!id) return;

      const config = await loader.loadDashboardConfig(id);
      if (!config || !loader.validateDashboard(config)) {
        setError(true);
        return;
      }

      const dashboard: Dashboard = {
        name: config.title,
        description: config.description || "",
        rows: [
          {
            height: config.layout?.rows || 1,
            widgets: config.widgets.map((w) => ({
              type: w.type,
              width: w.position.width || 1,
              height: w.position.height,
              config: w.config || {},
            })),
          },
        ],
      };

      setDashboardConfig(dashboard);
    };

    loadDashboard();
  }, [id]);

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: Invalid dashboard configuration
      </div>
    );
  }

  if (!dashboardConfig) {
    return <div className="text-zinc-500 p-4">Loading dashboard...</div>;
  }

  return (
    <Suspense
      fallback={<div className="text-zinc-500 p-4">Loading dashboard...</div>}
    >
      <ClientDashboard dashboardData={dashboardConfig} />
    </Suspense>
  );
};

export default DashboardPage;
