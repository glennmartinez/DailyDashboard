"use client";

import { DashboardLoader } from "../../services/dashboardLoader";
import { ClientDashboard } from "../../components/ClientDashboard";
import { setupWidgetRegistry } from "../../widgets/widgets-registry";
import { Suspense, useEffect, useState } from "react";
import { DashboardConfig } from "@/app/types/dashboard";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "../../components/ui/loading";

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfig | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const registry = setupWidgetRegistry();
        const loader = DashboardLoader.create(registry);

        console.log("Loading dashboard with ID:", id);
        if (!id) {
          throw new Error("No dashboard ID provided");
        }

        const config = await loader.loadDashboardConfig(id);
        console.log("Loaded dashboard config:", config);

        if (!config || !loader.validateDashboard(config)) {
          setError(true);
          return;
        }

        console.log("Setting dashboard config:", config);
        setDashboardConfig(config);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !dashboardConfig) {
    return <div className="text-red-500">Error loading dashboard</div>;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientDashboard dashboardData={dashboardConfig} />
    </Suspense>
  );
}
