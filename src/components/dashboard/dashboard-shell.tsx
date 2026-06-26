import type { ReactNode } from "react";

import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
};

type DashboardStat = {
  label: string;
  value: string;
  icon: ReactNode;
  description?: string;
};

export function DashboardShell({
  eyebrow,
  title,
  description,
  actions,
  sidebar,
  children,
}: DashboardShellProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeading eyebrow={eyebrow} title={title} description={description} />
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>

      {sidebar ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          <aside className="rounded-lg border bg-card p-3">{sidebar}</aside>
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function DashboardStatGrid({
  stats,
  className,
}: {
  stats: DashboardStat[];
  className?: string;
}) {
  return (
    <section className={cn("grid gap-4 md:grid-cols-3", className)}>
      {stats.map((stat) => (
        <Card className="bg-white" key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{stat.label}</CardTitle>
              {stat.description ? (
                <CardDescription className="mt-1">{stat.description}</CardDescription>
              ) : null}
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-primary">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-950">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed border-sky-200 bg-sky-50/40", className)}>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="mt-2 max-w-md">{description}</CardDescription>
        </div>
        {action ? <div>{action}</div> : null}
      </CardContent>
    </Card>
  );
}
