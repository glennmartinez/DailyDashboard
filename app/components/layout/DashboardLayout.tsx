import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-900 p-4">
      <div className={cn("max-w-[2000px] mx-auto space-y-1", className)}>
        {children}
      </div>
    </div>
  );
}

export function DashboardRow({
  children,
  height,
  className,
}: {
  children: React.ReactNode;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-12 gap-1", className)}
      style={{
        minHeight: `${height * 6}vh`,
      }}
    >
      {children}
    </div>
  );
}

export function DashboardWidget({
  children,
  width,
  className,
}: {
  children: React.ReactNode;
  width: number;
  className?: string;
}) {
  return (
    <div
      className={cn("min-h-[150px]", className)}
      style={{
        gridColumn: `span ${width}`,
      }}
    >
      {children}
    </div>
  );
}
