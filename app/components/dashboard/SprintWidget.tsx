"use client";

import { useEffect, useState } from "react";
import { ProjectData } from "../../types/github";
import { githubService } from "../../services/githubService";

export function SprintWidget() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await githubService.fetchProjectItems();
        setProjectData(data);
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
                <div className="text-xs text-zinc-500">{item.status.name}</div>
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
