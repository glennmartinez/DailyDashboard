"use client";

import { useEffect, useState } from "react";
import { MotivationalService } from "../../services/motivationalService";

export interface MotivationalWidgetProps {
  config?: Record<string, unknown>;
}

export function MotivationalWidget({ config }: MotivationalWidgetProps) {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  console.log(config);
  useEffect(() => {
    const loadMessage = async () => {
      try {
        const service = new MotivationalService();
        const todaysMessage = await service.getMessageOfTheDay();
        setMessage(todaysMessage);
      } catch (error) {
        console.error("Error loading motivational message:", error);
        setMessage("Stay positive and keep moving forward!");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessage();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-black rounded-sm p-4">
        <div className="text-zinc-500">Loading inspiration...</div>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-sm p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">
        DAILY INSPIRATION
      </h2>
      <div className="text-center">
        <div className="text-3xl mb-4">💫</div>
        <blockquote className="text-lg font-medium text-zinc-200 italic">
          {message}
        </blockquote>
      </div>
    </div>
  );
}
