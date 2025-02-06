import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
import { SprintWidgetConfig, SprintData } from "./types";

export function SprintWidget({
  config,
  width,
  height,
  adapters,
}: WidgetProps<SprintWidgetConfig>) {
  const [data, setData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the first adapter from the adapters array
  const adapter = adapters[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize adapter with the widget's config (params such as owner, repos, project, etc.)
        await adapter.initialize(config);
        const fetchedData = await adapter.fetchData();
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching sprint data:", error);
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
      className=" bg-black rounded-sm p-4"
      style={{ gridColumn: `span ${width}`, gridRow: `span ${height}` }}
    >
      <h2 className="text-lg font-bold mb-4 text-zinc-200">SPRINT STATUS</h2>
      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-2">
          {data?.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-zinc-900 p-2 rounded-sm"
            >
              <div className="flex-1">
                <div className="text-sm text-zinc-200">{item.title}</div>
                <div className="flex gap-4 mt-1 items-center">
                  <div
                    className={`text-xs ${
                      item.status.name === "In Progress"
                        ? "text-yellow-500"
                        : "text-zinc-500"
                    }`}
                  >
                    {item.status.name}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                      item.priority.name
                    )}`}
                  >
                    {item.priority.name}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full ${getSizeColor(
                      item.size?.name
                    )}`}
                  >
                    {item.size?.name}
                  </div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {item.assignees.nodes.map((assignee) => (
                  <img
                    key={assignee.login}
                    src={assignee.avatarUrl}
                    alt={assignee.login}
                    className="w-6 h-6 rounded-full border border-black"
                    title={assignee.login}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "p0":
      return "bg-red-500/20 text-red-500";
    case "p1":
      return "bg-orange-500/20 text-orange-500";
    case "p2":
      return "bg-yellow-500/20 text-yellow-500";
    case "p3":
      return "bg-green-500/20 text-green-500";
    default:
      return "bg-zinc-500/20 text-zinc-500";
  }
};

const getSizeColor = (size?: string): string => {
  if (!size) return "bg-zinc-500/20 text-zinc-500";

  switch (size.toLowerCase()) {
    case "xs":
      return "bg-blue-300/20 text-blue-300";
    case "s":
      return "bg-blue-400/20 text-blue-400";
    case "m":
      return "bg-blue-500/20 text-blue-500";
    case "l":
      return "bg-blue-600/20 text-blue-600";
    case "xl":
      return "bg-blue-700/20 text-blue-700";
    default:
      return "bg-zinc-500/20 text-zinc-500";
  }
};
