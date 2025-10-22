import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "warning" | "success" | "destructive";
}

export default function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-l-primary",
    warning: "border-l-warning",
    success: "border-l-success",
    destructive: "border-l-destructive",
  };

  return (
    <Card className={cn(
      "border-l-4 p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-elegant)]",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={cn(
              "mt-2 text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-3",
          variant === "warning" && "bg-warning/10",
          variant === "success" && "bg-success/10",
          variant === "destructive" && "bg-destructive/10",
          variant === "default" && "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === "warning" && "text-warning",
            variant === "success" && "text-success",
            variant === "destructive" && "text-destructive",
            variant === "default" && "text-primary"
          )} />
        </div>
      </div>
    </Card>
  );
}
