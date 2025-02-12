"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { WidgetProps } from "../../types/widget";
import { IssuesAnalyticsWidgetConfig, IssueStatistics } from "./types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function IssuesAnalyticsWidget({
  config,
  adapters,
}: WidgetProps<IssuesAnalyticsWidgetConfig>) {
  const [data, setData] = useState<IssueStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    config.timeRange || "month"
  );

  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await adapter.initialize({ ...config, timeRange });
        const fetchedData = await adapter.fetchData();
        console.log("Fetched Data:", fetchedData); // Debug log
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching issues data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [adapter, config, timeRange]);

  if (loading) {
    return (
      <div className="bg-black rounded-sm p-4">
        <div className="text-zinc-500">Loading issues analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-black rounded-sm p-4">
        <div className="text-zinc-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-zinc-200">ISSUES ANALYTICS</h2>
        <select
          className="bg-zinc-800 text-zinc-200 rounded px-2 py-1 text-sm"
          value={timeRange}
          onChange={(e) =>
            setTimeRange(e.target.value as "week" | "month" | "quarter")
          }
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
        </select>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 p-3 rounded-sm">
          <div className="text-zinc-500 text-sm">Total Issues</div>
          <div className="text-2xl font-bold text-zinc-200">
            {data.total || 0}
          </div>
        </div>
        <div className="bg-zinc-900 p-3 rounded-sm">
          <div className="text-zinc-500 text-sm">Open</div>
          <div className="text-2xl font-bold text-green-500">
            {data.open || 0}
          </div>
        </div>
        <div className="bg-zinc-900 p-3 rounded-sm">
          <div className="text-zinc-500 text-sm">Closed</div>
          <div className="text-2xl font-bold text-blue-500">
            {data.closed || 0}
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      {data.timeline && data.timeline.length > 0 && (
        <div className="h-40 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline}>
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181B",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
                labelStyle={{ color: "#9CA3AF" }}
                itemStyle={{ color: "#9CA3AF" }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="opened"
                name="Opened"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="closed"
                name="Closed"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Labels and Assignees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Top Labels</h3>
          <div className="space-y-2">
            {data.byLabel &&
              data.byLabel.slice(0, 5).map((label) => (
                <div
                  key={label.name}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `#${label.color}` }}
                    />
                    <span className="text-sm text-zinc-300">{label.name}</span>
                  </div>
                  <span className="text-sm text-zinc-500">{label.count}</span>
                </div>
              ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Top Assignees
          </h3>
          <div className="space-y-2">
            {data.byAssignee &&
              data.byAssignee.slice(0, 5).map((assignee) => (
                <div
                  key={assignee.login}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={assignee.avatarUrl}
                      alt={assignee.login}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-zinc-300">
                      {assignee.login}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {assignee.count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
