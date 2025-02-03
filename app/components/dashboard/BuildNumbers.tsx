const builds = [
  { name: "PUG", time: "2 DAYS AGO", version: "5.5-DEV-0344" },
  { name: "EAC", time: "13 DAYS AGO", version: "5.5-DEV-4291" },
  { name: "SDOG", time: "12 DAYS AGO", version: "5.5-OD-23-008" },
  { name: "CAC", time: "12 DAYS AGO", version: "5.5" },
];

export function BuildNumbers() {
  return (
    <div className="bg-black rounded-sm p-4">
      <h2 className="text-lg font-bold mb-4 text-zinc-200">BUILD NUMBERS</h2>
      <div className="space-y-3">
        {builds.map((build, index) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm text-zinc-300"
          >
            <span className="font-medium">{build.name}</span>
            <div className="flex gap-4">
              <span className="text-zinc-500">{build.version}</span>
              <span>{build.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 