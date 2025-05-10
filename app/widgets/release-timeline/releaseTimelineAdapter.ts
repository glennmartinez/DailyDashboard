import { releases } from "./data";
import type { Release, ReleaseTimelineWidgetConfig } from "./types";
import { addDays, format } from "date-fns";

export class ReleaseTimelineAdapter {
  async fetchData(config: ReleaseTimelineWidgetConfig): Promise<{ releases: Release[], title: string }> {
    try {
      // In a real scenario, you might fetch from an API based on config
      // For now, we'll use the static data and enhance it
      
      // Enhance releases with steps if they don't have them
      const enhancedReleases = releases.map(release => {
        if (release.steps?.length) {
          return release;
        }
        
        // If steps don't exist, generate some based on the release date
        const releaseDate = new Date(release.date);
        const steps = [
          {
            id: `${release.id}-step1`,
            name: "Planning",
            startDate: format(addDays(releaseDate, -21), 'yyyy-MM-dd'),
            endDate: format(addDays(releaseDate, -14), 'yyyy-MM-dd'),
            completed: release.status === 'past' || release.status === 'current'
          },
          {
            id: `${release.id}-step2`,
            name: "Development",
            startDate: format(addDays(releaseDate, -14), 'yyyy-MM-dd'),
            endDate: format(addDays(releaseDate, -7), 'yyyy-MM-dd'),
            completed: release.status === 'past' || release.status === 'current'
          },
          {
            id: `${release.id}-step3`,
            name: "Testing",
            startDate: format(addDays(releaseDate, -7), 'yyyy-MM-dd'),
            endDate: format(releaseDate, 'yyyy-MM-dd'),
            completed: release.status === 'past'
          },
          {
            id: `${release.id}-step4`,
            name: "Deployment",
            startDate: format(releaseDate, 'yyyy-MM-dd'),
            endDate: format(addDays(releaseDate, 1), 'yyyy-MM-dd'),
            completed: release.status === 'past'
          }
        ];
        
        return {
          ...release,
          steps,
          // Add default colors based on status
          color: release.color || (
            release.status === 'current' 
              ? '#3b82f6' // blue-500
              : release.status === 'past'
                ? '#6b7280' // gray-500
                : '#10b981' // emerald-500 for future
          )
        };
      });
      
      return { 
        releases: enhancedReleases,
        title: config.title || "Release Timeline"
      };
    } catch (error) {
      console.error("Error fetching release timeline data:", error);
      return { 
        releases: [],
        title: config.title || "Release Timeline"
      };
    }
  }
}
