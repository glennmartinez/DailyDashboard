"use client";

import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { TreeCoverageWidgetConfig, TreeCoverageData } from "./types";

interface FolderStat {
  folder: string;
  fullPath: string;
  trackedLines: number;
  coveredLines: number;
  partialLines: number;
  missedLines: number;
  coveragePercentage: number;
  children?: FolderStat[];
}

interface FolderRowProps {
  stat: FolderStat;
  level?: number;
  expanded: boolean;
  onToggle: () => void;
}

const FolderRow = ({ stat, level = 0, expanded, onToggle }: FolderRowProps) => {
  const getCoverageColor = (percentage: number): string => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <>
      <tr className="border-t border-zinc-800 text-sm hover:bg-zinc-900/50 cursor-pointer">
        <td className="py-2 pl-2 text-zinc-300">
          <span
            style={{ marginLeft: `${level * 20}px` }}
            className="inline-block"
          >
            {stat.children && stat.children.length > 0 && (
              <span className="inline-block w-4 mr-1">
                {expanded ? "▼" : "▶"}
              </span>
            )}
            {stat.folder}
          </span>
        </td>
        <td className="py-2 text-right text-zinc-400">
          {stat.trackedLines.toLocaleString()}
        </td>
        <td className="py-2 text-right text-green-500">
          {stat.coveredLines.toLocaleString()}
        </td>
        <td className="py-2 text-right text-yellow-500">
          {stat.partialLines.toLocaleString()}
        </td>
        <td className="py-2 text-right text-red-500">
          {stat.missedLines.toLocaleString()}
        </td>
        <td
          className={`py-2 text-right pr-2 ${getCoverageColor(
            stat.coveragePercentage
          )}`}
        >
          {stat.coveragePercentage.toFixed(1)}%
        </td>
      </tr>
      {expanded &&
        stat.children?.map((child, index) => (
          <FolderRow
            key={`${stat.fullPath}-${child.folder}-${index}`}
            stat={child}
            level={level + 1}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </>
  );
};

export function TreeCoverageWidget({
  config,
  width,
  height,
  adapters,
}: WidgetProps<TreeCoverageWidgetConfig>) {
  const [data, setData] = useState<TreeCoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await adapter.initialize({ ...config, depth: 2 });
        const coverageData = await adapter.fetchData();
        setData(coverageData);
        // Initialize expanded state for all root folders
        const initialExpanded = coverageData.folderStats.reduce((acc, stat) => {
          acc[stat.fullPath] = true;
          return acc;
        }, {} as { [key: string]: boolean });
        setExpandedFolders(initialExpanded);
      } catch (error) {
        console.error("Error fetching tree coverage data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch coverage data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [adapter, config]);

  const toggleFolder = (fullPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [fullPath]: !prev[fullPath],
    }));
  };

  return (
    <div
      className="bg-black rounded-sm p-4 h-full"
      style={{ gridColumn: `span ${width}`, gridRow: `span ${height}` }}
    >
      <h2 className="text-lg font-bold mb-4 text-zinc-200">
        CODE COVERAGE BY FOLDER
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-200"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-zinc-400 text-sm">
                <th className="pb-2 pl-2">Folder</th>
                <th className="pb-2 text-right">Lines</th>
                <th className="pb-2 text-right">Covered</th>
                <th className="pb-2 text-right">Partial</th>
                <th className="pb-2 text-right">Missed</th>
                <th className="pb-2 text-right pr-2">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {data?.folderStats.map((stat) => (
                <FolderRow
                  key={stat.fullPath}
                  stat={stat}
                  expanded={expandedFolders[stat.fullPath]}
                  onToggle={() => toggleFolder(stat.fullPath)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
