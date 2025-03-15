"use client";

import { useState } from "react";
import { Calendar, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReleaseGanttChart from "@/components/release-gantt-chart";
import ReleaseTimeline from "@/components/release-timeline";
import ScrollableTimeline from "@/components/scrollable-timeline";
import { releases } from "@/lib/data";

export default function ReleasesPage() {
  const [selectedReleases, setSelectedReleases] = useState(
    releases.map((release) => release.id)
  );

  const toggleRelease = (releaseId: string) => {
    setSelectedReleases((prev) =>
      prev.includes(releaseId)
        ? prev.filter((id) => id !== releaseId)
        : [...prev, releaseId]
    );
  };

  const filteredReleases = releases.filter((release) =>
    selectedReleases.includes(release.id)
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Release Roadmap</h1>
          <p className="text-muted-foreground">
            Track and manage your team's release cycles
          </p>
        </div>
        <Card className="md:w-[300px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Releases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {releases.map((release) => (
              <div key={release.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`release-${release.id}`}
                  checked={selectedReleases.includes(release.id)}
                  onCheckedChange={() => toggleRelease(release.id)}
                />
                <label
                  htmlFor={`release-${release.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  {release.name}
                  {release.status === "current" && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Current
                    </Badge>
                  )}
                  {release.status === "past" && (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      Past
                    </Badge>
                  )}
                  {release.status === "future" && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Future
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gantt" className="w-full">
        <TabsList>
          <TabsTrigger value="gantt" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Gantt Chart
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="scrollable">Scrollable Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="gantt" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Release Gantt Chart</CardTitle>
              <CardDescription>
                Visualize release steps and timelines across multiple releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <div className="min-w-[800px]">
                  <ReleaseGanttChart releases={filteredReleases} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Release Timeline</CardTitle>
              <CardDescription>
                View releases in a timeline format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReleaseTimeline releases={filteredReleases} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="scrollable" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scrollable Timeline</CardTitle>
              <CardDescription>
                Scroll through releases in an interactive timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollableTimeline releases={filteredReleases} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
