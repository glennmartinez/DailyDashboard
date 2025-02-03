'use client';

import { BuildLineChart } from '../charts/BuildLineChart';

export function BuildAnalyticsWidget() {
  return (
    <div className="bg-black rounded-sm p-4 h-[300px]">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">BUILD ANALYTICS</h2>
      <BuildLineChart />
    </div>
  );
} 