"use client";

import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { WorkflowBuildsWidgetConfig, WorkflowBuildsData } from "./types";

export function WorkflowBuildsWidget({
  config,
  adapters,
}: WidgetProps<WorkflowBuildsWidgetConfig>) {
  const [data, setData] = useState<WorkflowBuildsData | null>(null);
  const [loading, setLoading] = useState(true);

  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await adapter.initialize(config);
        const fetchedData = await adapter.fetchData();
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching workflow builds data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [adapter, config]);

  if (loading) {
    return (
      <div className="bg-black rounded-sm p-4 min-h-[24vh]">
        <div className="text-zinc-500">Loading workflow builds...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-black rounded-sm p-4 min-h-[24vh]">
        <div className="text-zinc-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-sm p-4 min-h-[24vh]">
      <h2 className="text-lg font-bold text-zinc-200 mb-4">
        RECENT WORKFLOW BUILDS
      </h2>
      <div className="space-y-2 overflow-y-auto max-h-[calc(24vh-4rem)]">
        {data.recentWorkflowRuns.map((run, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-zinc-900 p-2 rounded-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  run.conclusion === "SUCCESS"
                    ? "bg-green-500"
                    : run.conclusion === "FAILURE"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              />
              <span className="text-sm text-zinc-300">{run.name}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(run.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
