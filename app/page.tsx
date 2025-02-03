import { Button } from "./components/ui/button";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { BlockersWidget } from "./components/dashboard/BlockersWidget";
import { CodeFreezeWidget } from "./components/dashboard/CodeFreezeWidget";
import { TimeWidget } from "./components/dashboard/TimeWidget";
import { BuildOverview } from "./components/dashboard/BuildOverview";
import { HallOfShame } from "./components/dashboard/HallOfShame";
import { BuildNumbers } from "./components/dashboard/BuildNumbers";
import { BuildAnalyticsWidget } from "./components/dashboard/BuildAnalyticsWidget";
import { SprintWidget } from "./components/dashboard/SprintWidget";

//TODO: Implement this with the DashboardLoader
export default function Home() {
  return (
    <DashboardLayout>
      <BlockersWidget />
      <CodeFreezeWidget />
      <TimeWidget />
      <BuildOverview />
      <div className="bg-black rounded-sm p-4">
        <h2 className="text-lg font-bold mb-4 text-zinc-200">OD-RELEASES</h2>
      </div>
      <HallOfShame />
      <BuildNumbers />
      <div className="bg-black rounded-sm p-4">
        <h2 className="text-lg font-bold mb-4 text-zinc-200">
          WIKI MARKDOWN ANALYTICS
        </h2>
      </div>
      <SprintWidget />
      <div className="bg-black rounded-sm p-4">
        <h2 className="text-lg font-bold mb-4 text-zinc-200">
          MACRO BROWSER ERRORS
        </h2>
      </div>
      <div className="bg-black rounded-sm p-4">
        <h2 className="text-lg font-bold mb-4 text-zinc-200">SPRINT ACTIONS</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-zinc-300">
          <li>This action is a test for the atlasboard widget</li>
          <li>Action 2</li>
          <li>Get a final decision / plan on tinymce 4 upgrade</li>
          <li>Fix the builds</li>
        </ul>
      </div>
      <BuildAnalyticsWidget />
    </DashboardLayout>
  );
}
