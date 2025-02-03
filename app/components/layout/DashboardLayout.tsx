export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-2">
          {children}
        </div>
      </div>
    </div>
  );
} 