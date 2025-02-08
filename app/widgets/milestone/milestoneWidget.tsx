"use client";

import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { MilestoneData, MilestoneWidgetConfig } from "./types";

function getProgressColor(completed: number): string {
  if (completed >= 75) return "bg-green-500/20 text-green-500";
  if (completed >= 50) return "bg-yellow-500/20 text-yellow-500";
  return "bg-blue-500/20 text-blue-500";
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-500";
    case "in progress":
      return "text-yellow-500";
    default:
      return "text-zinc-500";
  }
}

export function MilestoneWidget({
  config,
  width,
  height,
  adapters,
}: WidgetProps<MilestoneWidgetConfig>) {
  const [data, setData] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);

  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        await adapter.initialize(config);
        const fetchedData = await adapter.fetchData();
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching milestone data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [adapter, config]);

  return (
    <div
      className="bg-black rounded-sm p-4"
      style={{ gridColumn: `span ${width}`, gridRow: `span ${height}` }}
    >
      <h2 className="text-lg font-bold mb-4 text-zinc-200">MILESTONES</h2>
      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {data?.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="bg-zinc-900 p-3 rounded-sm space-y-2"
            >
              <div className="flex justify-between items-start">
                <div className="text-sm text-zinc-200">{milestone.title}</div>
                <div className={`text-xs ${getStatusColor(milestone.status)}`}>
                  {milestone.status}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-zinc-500">
                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <div className="text-xs text-red-500">
                    Open: {milestone.issuesOpen}
                  </div>
                  <div className="text-xs text-green-500">
                    Closed: {milestone.issuesClosed}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${getProgressColor(
                      milestone.progress.completed
                    )}`}
                  >
                    {milestone.progress.completed}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{
                    width: `${milestone.progress.completed}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
