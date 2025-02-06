"use client";

import { useEffect, useState } from "react";
import { ProjectData } from "../../types/github";

const dummyData: ProjectData = {
  items: [
    {
      id: "1",
      title: "Implement Dashboard Layout",
      status: { name: "In Progress" },
      priority: { name: "P1" },
      size: { name: "M" },
      assignees: {
        nodes: [
          {
            login: "johndoe",
            avatarUrl: "https://avatars.githubusercontent.com/u/1234567",
          },
          {
            login: "janedoe",
            avatarUrl: "https://avatars.githubusercontent.com/u/7654321",
          },
        ],
      },
    },
    {
      id: "2",
      title: "Add Authentication System",
      status: { name: "Todo" },
      priority: { name: "P0" },
      size: { name: "L" },
      assignees: {
        nodes: [
          {
            login: "alexsmith",
            avatarUrl: "https://avatars.githubusercontent.com/u/2345678",
          },
        ],
      },
    },
    {
      id: "3",
      title: "Fix Mobile Responsiveness",
      status: { name: "Done" },
      priority: { name: "P2" },
      size: { name: "S" },
      assignees: {
        nodes: [
          {
            login: "sarahwilson",
            avatarUrl: "https://avatars.githubusercontent.com/u/3456789",
          },
          {
            login: "mikebrown",
            avatarUrl: "https://avatars.githubusercontent.com/u/4567890",
          },
        ],
      },
    },
  ],
};

export function SprintWidget() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        setProjectData(dummyData);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black rounded-sm p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">SPRINT STATUS</h2>
      {loading ? (
        <div className="text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {projectData?.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-zinc-900 p-2 rounded-sm"
            >
              <div className="flex-1">
                <div className="text-sm text-zinc-200">{item.title}</div>
                <div className="flex gap-4 mt-1">
                  <div className="text-xs text-zinc-500">
                    {item.status.name}
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500">
                    {item.priority.name}
                  </div>
                  <div className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">
                    {item.size.name}
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
