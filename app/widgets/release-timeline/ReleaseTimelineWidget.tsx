"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WidgetProps } from "@/app/types/widget";
import ScrollableTimeline from "./components/ScrollableTimeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { releases as fallbackReleases } from "./data";

export function ReleaseTimelineWidget({ data }: WidgetProps<any>) {
  // Extract data with fallbacks
  const { releases = fallbackReleases, title = "Release Timeline" } =
    data || {};

  if (!releases || releases.length === 0) {
    console.warn("No release data available, using fallback data");
    // Use fallback data
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Track and visualize project release timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <ScrollableTimeline releases={fallbackReleases} />
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-slate-400">{title}</CardTitle>
        <CardDescription>
          Track and visualize project release timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className=" w-full">
          <ScrollableTimeline releases={releases} />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ReleaseTimelineWidget;
