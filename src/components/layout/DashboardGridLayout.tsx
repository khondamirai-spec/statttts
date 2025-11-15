import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type DashboardGridLayoutProps = PropsWithChildren<{
  className?: string;
}>;

export default function DashboardGridLayout({
  children,
  className,
}: DashboardGridLayoutProps) {
  return <div className={cn("dashboard-grid", className)}>{children}</div>;
}




