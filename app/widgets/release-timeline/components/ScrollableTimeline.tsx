"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import type { Release } from "../types";
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

  // Add this flag to prevent scroll conflicts
  const isManualScrolling = useRef(false);

  // Create a centralized scroll function
  const scrollToRelease = (releaseId: string) => {
    if (!releaseId) return;

    isManualScrolling.current = true;

    // Find elements
    const releaseElement = observerRefs.current.get(releaseId);
    const sidebarItem = document.querySelector(
      `[data-sidebar-id="${releaseId}"]`
    );

    // Scroll timeline
    if (releaseElement && timelineRef.current) {
      timelineRef.current.scrollTo({
        top: releaseElement.offsetTop - 100,
        behavior: "smooth",
      });
    }

    // Scroll sidebar
    if (sidebarItem && sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top:
          sidebarItem.offsetTop -
          sidebarRef.current.clientHeight / 2 +
          sidebarItem.clientHeight / 2,
        behavior: "smooth",
      });
    }

    // Reset the flag after scrolling completes
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 1000); // Covers typical scroll animation time
  };

  // Initial selection of current release
  useEffect(() => {
    // Find the current release
    const currentRelease = releases.find((r) => r.status === "current");

    if (currentRelease) {
      setSelectedReleaseId(currentRelease.id);

      // Wait for refs to be populated
      setTimeout(() => {
        scrollToRelease(currentRelease.id);
      }, 100);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Setup intersection observer to detect which releases are visible
  useEffect(() => {
    const options = {
      root: timelineRef.current,
      rootMargin: "0px",
      threshold: [0.3, 0.5, 0.7], // Multiple thresholds for better tracking
    };

    const observer = new IntersectionObserver((entries) => {
      // Only update visibility markers, but don't scroll
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-release-id");
        if (!id) return;

        if (entry.isIntersecting) {
          setVisibleReleases((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            return newSet;
          });

          // Update selected ID when releases pass through the center of the viewport
          if (entry.intersectionRatio > 0.5) {
            setSelectedReleaseId(id);
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

    // Observe all release elements after they're rendered
    const timer = setTimeout(() => {
      observerRefs.current.forEach((element) => {
        observer.observe(element);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [releases]);

  // Modified effect to handle scrolling the sidebar when selectedReleaseId changes
  useEffect(() => {
    if (!selectedReleaseId) return;

    // Don't scroll during manual interactions
    const timer = setTimeout(() => {
      // Always update sidebar position when selection changes (whether manually or automatically)
      const sidebarItem = document.querySelector(
        `[data-sidebar-id="${selectedReleaseId}"]`
      );
      if (sidebarItem && sidebarRef.current) {
        sidebarRef.current.scrollTo({
          top:
            sidebarItem.offsetTop -
            sidebarRef.current.clientHeight / 2 +
            sidebarItem.clientHeight / 2,
          behavior: isManualScrolling.current ? "smooth" : "auto",
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedReleaseId]);

  // Sort releases by date - change from newest first to oldest first
  const sortedReleases = [...releases].sort((a, b) => {
    const aStart = new Date(a.steps?.[0]?.startDate || a.date);
    const bStart = new Date(b.steps?.[0]?.startDate || b.date);
    return aStart.getTime() - bStart.getTime(); // Oldest first
  });

  // Get spacing based on zoom level
  const getZoomSpacing = () => {
    switch (zoomLevel) {
      case "default":
        return {
          releaseGap: "mb-3",
          stepGap: "mb-2",
          // Keep width the same but change how it's positioned
          stepWidth: "w-[calc(35%-16px)]",
          // Add new positioning values
          stepPosition: "ml-[15%]", // For left side cards
          stepPositionReverse: "mr-[15%]", // For right side cards
          headerSize: "w-4 h-4",
          cardPadding: "p-2",
          headerPadding: "p-2",
          headerTranslate: "-translate-y-12",
        };
      case "expanded":
        return {
          releaseGap: "mb-0.3",
          stepGap: "mb-1", // Reduced vertical gap between steps
          // Keep the same width as default
          stepWidth: "w-[calc(35%-16px)]",
          stepPosition: "ml-[15%]", // Keep same positioning as default
          stepPositionReverse: "mr-[15%]", // Keep same positioning as default
          headerSize: "w-2 h-2",
          stepSize: "h-2 w-2",
          fontSize: "text-[0.6rem]",
          cardHeight: "max-h-8", // Add specific height control
          cardContentHeight: "max-h-6", // Inner content height
          showDescription: false,
          cardPadding: "px-2 py-1", // Reduced vertical padding
          headerPadding: "p-0.6",
          headerTranslate: "-translate-y-3",
        };
    }
  };

  const spacing = getZoomSpacing();

  return (
    <div className="flex flex-col w-full h-full p-6 border rounded-lg shadow-sm border-slate-300 ">
      {/* Fixed Header with zoom controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-500">
          Scrollable Timeline
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-400 rounded-md">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-r-none border-0 bg-white hover:bg-white"
              onClick={() => setZoomLevel("default")}
            >
              <ZoomIn
                className={`h-4 w-4 ${
                  zoomLevel === "default" ? "text-slate-800" : "text-slate-400"
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-l-none border-l border-slate-400 bg-white hover:bg-white"
              onClick={() => setZoomLevel("expanded")}
            >
              <ZoomOut
                className={`h-4 w-4 ${
                  zoomLevel === "expanded" ? "text-slate-800" : "text-slate-400"
                }`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area with Fixed Sidebar and Scrollable Timeline */}
      <div className="flex flex-1 w-full">
        {/* Left sidebar with releases - fixed position */}
        <div className="w-[250px] flex-shrink-0 h-[calc(100vh-200px)] overflow-hidden">
          <div ref={sidebarRef} className="h-full overflow-y-auto pr-4 pb-16">
            <div className="py-16 space-y-4">
              {sortedReleases.map((release) => {
                const isSelected = selectedReleaseId === release.id;

                return (
                  <div
                    key={release.id}
                    data-sidebar-id={release.id}
                    className={cn(
                      "p-4 rounded-lg border border-slate-400 transition-all duration-300 cursor-pointer",
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
                      scrollToRelease(release.id);
                    }}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: isSelected ? release.color : "#d1d5db",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-medium",
                          isSelected ? "text-slate-900" : "text-gray-500" // Use dark text for selected items
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
                      {format(
                        new Date(release.steps?.[0]?.startDate || release.date),
                        "MMM d"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(
                          release.steps?.[release.steps?.length - 1]?.endDate ||
                            release.date
                        ),
                        "MMM d, yyyy"
                      )}
                    </p>
                    <div className="flex mt-2 space-x-1">
                      {release.steps?.map((step, idx) => (
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

        {/* Right side vertical timeline - scrollable content */}
        <div className="flex-1 relative h-[calc(100vh-200px)] overflow-hidden">
          {/* Gradient overlays for scroll indication */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

          {/* Scrollable timeline */}
          <div
            ref={timelineRef}
            className="h-full overflow-y-auto px-4"
            onScroll={() => {
              // Add this to detect manual scrolling by user
              isManualScrolling.current = true;
              clearTimeout(timelineRef.current.scrollTimer);
              timelineRef.current.scrollTimer = setTimeout(() => {
                isManualScrolling.current = false;
              }, 150);
            }}
          >
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
                      onClick={() => {
                        setSelectedReleaseId(release.id);
                        scrollToRelease(release.id);
                      }}
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
                      onClick={() => {
                        setSelectedReleaseId(release.id);
                        scrollToRelease(release.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 ml-1">
                          {release.name}
                        </span>{" "}
                        {/* Added ml-1 for left margin */}
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
                      {release.steps?.map((step, stepIndex) => {
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
                                  ? "w-[calc(35%-8px)]" // Updated width to match the gap between center and cards
                                  : "w-[calc(35%-8px)]" // Updated width to match the gap between center and cards
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
                                "rounded-lg border border-slate-300 transition-all duration-300",
                                spacing.cardPadding,
                                spacing.cardHeight, // Apply the height constraint
                                isSelected ? "shadow-sm" : "shadow-none",
                                step.completed ? "bg-gray-50" : "bg-white",
                                visibleReleases.has(release.id)
                                  ? isEven
                                    ? "translate-x-0"
                                    : "-translate-x-0"
                                  : isEven
                                  ? "-translate-x-8"
                                  : "translate-x-8",
                                // Apply positioning classes based on which side the step is on
                                isEven
                                  ? spacing.stepPosition
                                  : spacing.stepPositionReverse
                              )}
                            >
                              <div
                                className={cn(
                                  "flex items-center justify-between", // Changed from items-start to items-center
                                  spacing.cardContentHeight,
                                  "overflow-hidden"
                                )}
                              >
                                <div className="w-full mr-2">
                                  {" "}
                                  {/* Added margin-right for gap */}
                                  {zoomLevel === "expanded" ? (
                                    // Compact layout for expanded/zoomed-out view
                                    <div className="flex justify-between items-center w-full">
                                      <h4 className="font-medium text-slate-400 text-[0.65rem] truncate pr-1 max-w-[60%]">
                                        {" "}
                                        {/* Reduced max width */}
                                        {step.name}
                                      </h4>
                                      <p className="text-[0.55rem] text-muted-foreground whitespace-nowrap">
                                        {format(
                                          new Date(step.startDate),
                                          "MMM d"
                                        )}
                                        -
                                        {format(
                                          new Date(step.endDate),
                                          "MMM d"
                                        )}
                                      </p>
                                    </div>
                                  ) : (
                                    <>
                                      <h4 className="font-medium text-xs text-slate-400">
                                        {step.name}
                                      </h4>
                                      <p className="text-[0.65rem] text-muted-foreground">
                                        {format(
                                          new Date(step.startDate),
                                          "MMM d"
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          new Date(step.endDate),
                                          "MMM d"
                                        )}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    step.completed ? "default" : "outline"
                                  }
                                  className={cn(
                                    "flex-shrink-0", // Prevent badge from shrinking
                                    step.completed
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : "text-slate-400",
                                    zoomLevel === "expanded"
                                      ? "text-[0.5rem] px-1 py-0 h-3 min-w-fit whitespace-nowrap"
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
