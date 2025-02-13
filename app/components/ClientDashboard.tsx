"use client";

import { Dashboard } from "./Dashboard";
import { setupWidgetRegistry } from "../widgets/widgets-registry";
import { WidgetRegistryProvider } from "./providers/WidgetRegistryProvider";
import { Dashboard as DashboardType } from "../types/dashboard";

interface ClientDashboardProps {
  dashboardData: DashboardType;
}

export function ClientDashboard({ dashboardData }: ClientDashboardProps) {
  const registry = setupWidgetRegistry();

  return (
    <WidgetRegistryProvider registry={registry}>
      <Dashboard dashboard={dashboardData} />
    </WidgetRegistryProvider>
  );
}
