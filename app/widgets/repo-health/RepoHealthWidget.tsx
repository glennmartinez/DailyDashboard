"use client";

import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { RepoHealthWidgetConfig, RepoHealthData } from "./types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function RepoHealthWidget({
  config,
  adapters,
}: WidgetProps<RepoHealthWidgetConfig>) {
  const [data, setData] = useState<RepoHealthData | null>(null);
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
        console.error("Error fetching repo health data:", error);
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
      <div className="bg-black rounded-sm p-4">
        <div className="text-zinc-500">Loading repository health...</div>
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
      <h2 className="text-lg font-bold text-zinc-200 mb-4">
        REPOSITORY HEALTH
      </h2>

      {/* Code Coverage & Tests */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">
          Code Coverage & Tests
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-3 rounded-sm">
            <div className="text-zinc-500 text-sm">Coverage</div>
            <div className="text-lg font-bold text-zinc-200">
              {data.coverage.percentage.toFixed(1)}%
            </div>
          </div>
          <div className="bg-zinc-900 p-3 rounded-sm">
            <div className="text-zinc-500 text-sm">Total Tests</div>
            <div className="text-lg font-bold text-zinc-200">
              {data.coverage.totalTests}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {data.coverage.passedTests} passed, {data.coverage.failedTests}{" "}
              failed
            </div>
          </div>
          <div className="bg-zinc-900 p-3 rounded-sm">
            <div className="text-zinc-500 text-sm">Pass Rate</div>
            <div className="text-lg font-bold text-zinc-200">
              {(
                (data.coverage.passedTests / data.coverage.totalTests) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Trend */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">
          Coverage Trend
        </h3>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.coverage.trend}>
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
                domain={[
                  (dataMin) => Math.floor(dataMin - 5),
                  (dataMax) => Math.ceil(dataMax + 5),
                ]}
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
                formatter={(value: number) => [
                  `${value.toFixed(1)}%`,
                  "Coverage",
                ]}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Workflow Runs */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">
          Recent Workflow Runs
        </h3>
        <div className="space-y-2">
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
    </div>
  );
}
