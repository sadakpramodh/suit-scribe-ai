import { AlertCircle, FileText, Gavel, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const upcomingHearings = [
    { id: 1, caseNumber: "WP/2024/14113", title: "Sahara vs Welspun Corp", date: "2025-10-25", forum: "High Court" },
    { id: 2, caseNumber: "ARB/2024/5678", title: "Contract Dispute - Vendor Agreement", date: "2025-10-27", forum: "Arbitration" },
    { id: 3, caseNumber: "CIV/2024/9012", title: "Property Dispute", date: "2025-10-28", forum: "District Court" },
  ];

  const recentDisputesByValue = [
    { id: 1, name: "Infrastructure Contract Breach", value: 150, status: "active", type: "Arbitration" },
    { id: 2, name: "Labour Dispute - Factory Workers", value: 45, status: "pending", type: "Labour Court" },
    { id: 3, name: "International Trade Dispute", value: 200, status: "active", type: "International" },
    { id: 4, name: "Tax Assessment Challenge", value: 80, status: "pending", type: "Court" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of all litigation and dispute matters</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Disputes"
          value="47"
          icon={FileText}
          trend={{ value: "+5 this month", isPositive: false }}
          variant="default"
        />
        <StatCard
          title="Litigation Cases"
          value="23"
          icon={Gavel}
          trend={{ value: "+2 this month", isPositive: false }}
          variant="warning"
        />
        <StatCard
          title="Overdue Matters"
          value="8"
          icon={AlertCircle}
          variant="destructive"
        />
        <StatCard
          title="Total Value"
          value="₹5,840Cr"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              Upcoming Hearings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingHearings.map((hearing) => (
                <div
                  key={hearing.id}
                  className="flex items-start justify-between rounded-lg border border-border p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{hearing.title}</p>
                    <p className="text-xs text-muted-foreground">{hearing.caseNumber}</p>
                    <Badge variant="outline" className="mt-2">
                      {hearing.forum}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(hearing.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {Math.ceil((new Date(hearing.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/litigation">
              <Button variant="ghost" className="mt-4 w-full">
                View All Cases
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              High-Value Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDisputesByValue.map((dispute) => (
                <div
                  key={dispute.id}
                  className="flex items-start justify-between rounded-lg border border-border p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-sm"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{dispute.name}</p>
                    <p className="text-xs text-muted-foreground">{dispute.type}</p>
                    <Badge 
                      variant={dispute.status === "active" ? "active" : "pending"}
                      className="mt-2"
                    >
                      {dispute.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">₹{dispute.value}Cr</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/pre-litigation">
              <Button variant="ghost" className="mt-4 w-full">
                View All Disputes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <CardTitle>Matter Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-primary">15</p>
              <p className="mt-1 text-xs text-muted-foreground">Arbitration</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-warning">18</p>
              <p className="mt-1 text-xs text-muted-foreground">Court Cases</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-success">8</p>
              <p className="mt-1 text-xs text-muted-foreground">Labour Disputes</p>
            </div>
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-2xl font-bold text-destructive">6</p>
              <p className="mt-1 text-xs text-muted-foreground">International</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
