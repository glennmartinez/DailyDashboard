"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import type { Release } from "@/lib/types";
import { CheckCircle2, Circle, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScrollableTimelineProps {
  releases: Release[];
}

type ZoomLevel = "default" | "expanded";

export default function ScrollableTimeline({
  releases,
}: ScrollableTimelineProps) {
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(
    releases.find((r) => r.status === "current")?.id || releases[0]?.id || null
  );
  const [visibleReleases, setVisibleReleases] = useState<Set<string>>(
    new Set()
  );
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("default");
  const observerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const timelineRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Ensure we default to the current release
  useEffect(() => {
    // Find the current release
    const currentRelease = releases.find((r) => r.status === "current");

    // Set the selected release ID to the current release if available
    if (currentRelease) {
      setSelectedReleaseId(currentRelease.id);
    }

    // This should run only once on component mount
  }, [releases]);

  // Setup intersection observer to detect which releases are visible
  useEffect(() => {
    const options = {
      root: timelineRef.current,
      rootMargin: "0px",
      threshold: 0.3, // When 30% of the item is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-release-id");
        if (!id) return;

        if (entry.isIntersecting) {
          setVisibleReleases((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });

          // Set as selected release when it's the most visible
          if (entry.intersectionRatio > 0.5) {
            setSelectedReleaseId(id);

            // Sync sidebar scroll position
            const sidebarItem = document.querySelector(
              `[data-sidebar-id="${id}"]`
            );
            if (sidebarItem && sidebarRef.current) {
              sidebarRef.current.scrollTo({
                top:
                  sidebarItem.getBoundingClientRect().top +
                  sidebarRef.current.scrollTop -
                  100,
                behavior: "smooth",
              });
            }
          }
        } else {
          setVisibleReleases((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      });
    }, options);

    // Observe all release elements
    observerRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [releases]);

  // Scroll to the current release initially
  useEffect(() => {
    const currentReleaseElement = observerRefs.current.get(
      selectedReleaseId || ""
    );
    if (currentReleaseElement && timelineRef.current) {
      timelineRef.current.scrollTo({
        top: currentReleaseElement.offsetTop - 200,
        behavior: "smooth",
      });
    }

    // Sync sidebar scroll position
    const sidebarItem = document.querySelector(
      `[data-sidebar-id="${selectedReleaseId}"]`
    );
    if (sidebarItem && sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top:
          sidebarItem.getBoundingClientRect().top +
          sidebarRef.current.scrollTop -
          100,
        behavior: "smooth",
      });
    }
  }, [selectedReleaseId]);

  // Sort releases by date
  const sortedReleases = [...releases].sort((a, b) => {
    const aStart = new Date(a.steps[0]?.startDate || 0);
    const bStart = new Date(b.steps[0]?.startDate || 0);
    return bStart.getTime() - aStart.getTime(); // Newest first
  });

  // Get spacing based on zoom level
  const getZoomSpacing = () => {
    switch (zoomLevel) {
      case "default":
        return {
          releaseGap: "mb-3", // Small gap to fit 3+ releases
          stepGap: "mb-2",
          stepWidth: "w-[calc(50%-16px)]",
          headerSize: "w-4 h-4", // Small header dot
          stepSize: "h-4 w-4", // Small step indicators
          fontSize: "text-xs", // Small font size
          showDescription: false, // Hide descriptions to save space
          cardPadding: "p-2",
          headerPadding: "p-2",
          headerTranslate: "-translate-y-12",
        };
      case "expanded":
        return {
          releaseGap: "mb-0.3", // Tiny gap for maximum compression
          stepGap: "mb-0.3",
          stepWidth: "w-[calc(50%-4px)]",
          headerSize: "w-2 h-2", // Tiny header dot
          stepSize: "h-2 w-2", // Tiny step indicators
          fontSize: "text-[0.6rem]", // Tiny font size
          showDescription: false, // Hide descriptions
          cardPadding: "p-2", // Minimal padding
          headerPadding: "p-0.6", // Minimal header padding
          headerTranslate: "-translate-y-3", // Less space for header
        };
    }
  };

  const spacing = getZoomSpacing();

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header with zoom controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Scrollable Timeline</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Zoom:</span>
          <Select
            value={zoomLevel}
            onValueChange={(value) => setZoomLevel(value as ZoomLevel)}
          >
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default View</SelectItem>
              <SelectItem value="expanded">Expanded View</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-r-none"
              onClick={() => setZoomLevel("default")}
              disabled={zoomLevel === "default"}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-l-none border-l-0"
              onClick={() => setZoomLevel("expanded")}
              disabled={zoomLevel === "expanded"}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left sidebar with releases */}
        <div className="w-[250px] flex-shrink-0 relative">
          {/* Gradient overlays for scroll indication */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          <div ref={sidebarRef} className="h-full overflow-y-auto pr-4">
            <div className="py-16 space-y-4">
              {sortedReleases.map((release) => {
                const isSelected = selectedReleaseId === release.id;

                return (
                  <div
                    key={release.id}
                    data-sidebar-id={release.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-300 cursor-pointer",
                      isSelected
                        ? "border-2 border-primary shadow-md scale-100"
                        : "border-gray-200 scale-95 bg-gray-100",
                      release.status === "past" || release.status === "current"
                        ? "opacity-60 hover:opacity-80"
                        : isSelected
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-70"
                    )}
                    onClick={() => {
                      setSelectedReleaseId(release.id);

                      // Scroll to the release in the timeline
                      const releaseElement = observerRefs.current.get(
                        release.id
                      );
                      if (releaseElement && timelineRef.current) {
                        timelineRef.current.scrollTo({
                          top: releaseElement.offsetTop - 200,
                          behavior: "smooth",
                        });
                      }
                    }}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: isSelected ? release.color : "#d1d5db", // Grey out if not selected
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-medium",
                          isSelected ? "" : "text-gray-500" // Grey out text if not selected
                        )}
                      >
                        {release.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            isSelected && release.status === "current"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : ""
                          }
                          ${
                            isSelected && release.status === "past"
                              ? "bg-gray-50 text-gray-700 border-gray-200"
                              : ""
                          }
                          ${
                            isSelected && release.status === "future"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : ""
                          }
                          ${
                            !isSelected
                              ? "bg-gray-100 text-gray-500 border-gray-200"
                              : ""
                          }
                        `}
                      >
                        {release.status.charAt(0).toUpperCase() +
                          release.status.slice(1)}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isSelected ? "text-muted-foreground" : "text-gray-400" // Grey out text if not selected
                      )}
                    >
                      {format(new Date(release.steps[0]?.startDate), "MMM d")} -{" "}
                      {format(
                        new Date(
                          release.steps[release.steps.length - 1]?.endDate
                        ),
                        "MMM d, yyyy"
                      )}
                    </p>
                    <div className="flex mt-2 space-x-1">
                      {release.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="h-1 flex-1 rounded-full"
                          style={{
                            backgroundColor:
                              isSelected && step.completed
                                ? release.color
                                : "#e5e7eb",
                            opacity: isSelected
                              ? step.completed
                                ? 1
                                : 0.5
                              : 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side vertical timeline */}
        <div className="flex-1 relative">
          {/* Gradient overlays for scroll indication */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          {/* Scrollable timeline */}
          <div ref={timelineRef} className="h-full overflow-y-auto px-4">
            <div className="py-16 relative">
              {/* Central timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

              {sortedReleases.map((release, releaseIndex) => {
                const isSelected = selectedReleaseId === release.id;

                return (
                  <div
                    key={release.id}
                    ref={(el) => el && observerRefs.current.set(release.id, el)}
                    data-release-id={release.id}
                    className={cn(
                      spacing.releaseGap,
                      "relative",
                      visibleReleases.has(release.id)
                        ? "opacity-100"
                        : "opacity-50"
                    )}
                  >
                    {/* Release header */}
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 rounded-full",
                        spacing.headerPadding,
                        "border-4 border-white bg-white shadow-sm transition-all duration-300",
                        isSelected ? "scale-110" : "scale-100"
                      )}
                      style={{ backgroundColor: release.color }}
                      onClick={() => setSelectedReleaseId(release.id)}
                    >
                      <div
                        className={cn("rounded-full", spacing.headerSize)}
                        style={{ backgroundColor: release.color }}
                      />
                    </div>

                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 top-0 bg-white px-4 py-2 rounded-full shadow-sm",
                        "border transition-all duration-300 cursor-pointer",
                        spacing.headerTranslate,
                        zoomLevel === "expanded"
                          ? "text-[0.65rem] py-1 px-2"
                          : "text-xs py-1 px-3",
                        isSelected
                          ? "border-primary font-medium"
                          : "border-gray-200",
                        release.status === "past" ||
                          release.status === "current"
                          ? "opacity-70 hover:opacity-100"
                          : "opacity-100"
                      )}
                      onClick={() => setSelectedReleaseId(release.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{release.name}</span>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              release.status === "current"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : ""
                            }
                            ${
                              release.status === "past"
                                ? "bg-gray-50 text-gray-700 border-gray-200"
                                : ""
                            }
                            ${
                              release.status === "future"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ""
                            }
                            ${
                              zoomLevel === "expanded"
                                ? "text-[0.6rem] px-1 py-0"
                                : "text-[0.65rem] px-1.5 py-0"
                            }
                          `}
                        >
                          {release.status.charAt(0).toUpperCase() +
                            release.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Release steps on alternating sides */}
                    <div
                      className={cn(
                        "pt-8 pb-4",
                        zoomLevel === "expanded" ? "pt-3" : "pt-4"
                      )}
                    >
                      {release.steps.map((step, stepIndex) => {
                        const isEven = stepIndex % 2 === 0;

                        return (
                          <div
                            key={step.id}
                            className={cn(
                              "flex items-center relative",
                              spacing.stepGap,
                              isEven ? "flex-row" : "flex-row-reverse"
                            )}
                          >
                            {/* Timeline connector */}
                            <div
                              className={cn(
                                "absolute h-0.5 top-2",
                                isEven
                                  ? "left-[calc(50%+8px)]"
                                  : "right-[calc(50%+8px)]",
                                zoomLevel === "expanded"
                                  ? "w-[calc(50%-4px)]"
                                  : "w-[calc(50%-8px)]"
                              )}
                              style={{
                                backgroundColor: step.completed
                                  ? release.color
                                  : "#e5e7eb",
                                opacity: step.completed ? 1 : 0.5,
                              }}
                            />

                            {/* Step indicator */}
                            <div
                              className={cn(
                                "absolute left-1/2 -translate-x-1/2 rounded-full z-10 top-2",
                                "border-2 border-white"
                              )}
                              style={{
                                backgroundColor: step.completed
                                  ? release.color
                                  : "#e5e7eb",
                              }}
                            >
                              {step.completed ? (
                                <CheckCircle2 className={spacing.stepSize} />
                              ) : (
                                <Circle className={spacing.stepSize} />
                              )}
                            </div>

                            {/* Step content */}
                            <div
                              className={cn(
                                spacing.stepWidth,
                                spacing.fontSize,
                                "rounded-lg border transition-all duration-300",
                                spacing.cardPadding,
                                isSelected ? "shadow-sm" : "shadow-none",
                                step.completed ? "bg-gray-50" : "bg-white",
                                visibleReleases.has(release.id)
                                  ? isEven
                                    ? "translate-x-0"
                                    : "-translate-x-0"
                                  : isEven
                                  ? "-translate-x-8"
                                  : "translate-x-8"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium">{step.name}</h4>
                                  <p
                                    className={cn(
                                      zoomLevel === "expanded"
                                        ? "text-[0.6rem]"
                                        : "text-[0.65rem]",
                                      "text-muted-foreground"
                                    )}
                                  >
                                    {format(new Date(step.startDate), "MMM d")}{" "}
                                    - {format(new Date(step.endDate), "MMM d")}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    step.completed ? "default" : "outline"
                                  }
                                  className={cn(
                                    step.completed
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "",
                                    zoomLevel === "expanded"
                                      ? "text-[0.6rem] px-1 py-0"
                                      : "text-[0.65rem] px-1.5 py-0"
                                  )}
                                >
                                  {step.completed ? "Completed" : "Pending"}
                                </Badge>
                              </div>
                            </div>

                            {/* Empty space on the other side */}
                            <div className={spacing.stepWidth} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
