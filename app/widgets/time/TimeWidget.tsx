"use client";

import { useEffect, useState } from "react";
import { WidgetProps } from "../../types/widget";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TimeWidgetConfig, TimeData } from "./types";

export function TimeWidget({ width, height }: WidgetProps<TimeWidgetConfig>) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="bg-black rounded-sm p-4 h-full"
      style={{ gridColumn: `span ${width}`, gridRow: `span ${height}` }}
    >
      <div className="flex flex-col justify-center items-center h-full">
        <div className="text-6xl font-bold text-zinc-200">
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
        <div className="text-lg text-zinc-500 mt-2">
          {time.toLocaleDateString("en-US", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
