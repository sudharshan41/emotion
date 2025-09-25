import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
};

export function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
