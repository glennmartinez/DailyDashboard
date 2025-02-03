export function BlockersWidget() {
  return (
    <div className="bg-black rounded-sm p-4">
      <h2 className="text-xl font-bold text-red-500">6 BLOCKERS</h2>
      <div className="space-y-4 mt-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-zinc-800 rounded-full" />
          <div>
            <div className="font-medium text-zinc-200">CONFDEV-24079</div>
            <div className="text-sm text-zinc-500">Business Teams</div>
          </div>
        </div>
      </div>
    </div>
  );
} 