export function BuildOverview() {
  return (
    <div className="border-2 border-zinc-800 bg-black rounded-sm p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">BUILD OVERVIEW</h2>
      <div className="text-sm text-zinc-500 mb-2">7/19 RED</div>
      <div className="h-2 bg-red-500 rounded-sm">
        <div className="h-full bg-green-500 rounded-sm" style={{ width: '65%' }} />
      </div>
    </div>
  );
} 