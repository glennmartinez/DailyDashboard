export interface ReleaseStep {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  description?: string;
}

export interface Release {
  id: string;
  name: string;
  version: string;
  date: string;
  description: string;
  status: "past" | "current" | "future";
  important?: boolean;
  color?: string;
  steps?: ReleaseStep[];
}

// This is maintained for consistency with ScrollableTimeline component
export interface ReleaseTimelineWidgetProps {
  releases: Release[];
  title?: string;
}

// Configuration for the widget
export interface ReleaseTimelineWidgetConfig {
  title?: string;
  owner?: string;
  repo?: string;
}

// Data returned by the adapter and passed to the widget
export interface ReleaseTimelineWidgetData {
  releases: Release[];
  title: string;
}
