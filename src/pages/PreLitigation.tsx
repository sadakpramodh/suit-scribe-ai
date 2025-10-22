import { useState } from "react";
import { Plus, Search, Filter, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PreLitigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const disputes = [
    {
      id: "DIS-2024-001",
      company: "Welspun Corp Ltd",
      disputeType: "Arbitration",
      value: 150,
      noticeFrom: "Sahara Construction",
      noticeDate: "2024-10-01",
      replyDueDate: "2024-11-01",
      status: "pending",
      responsibleUser: "Adv. Sharma",
      daysRemaining: 10,
    },
    {
      id: "DIS-2024-002",
      company: "Welspun Steel",
      disputeType: "Court",
      value: 45,
      noticeFrom: "Vendor Logistics Pvt",
      noticeDate: "2024-09-15",
      replyDueDate: "2024-10-15",
      status: "overdue",
      responsibleUser: "Adv. Mehta",
      daysRemaining: -7,
    },
    {
      id: "DIS-2024-003",
      company: "Welspun Enterprises",
      disputeType: "Labour",
      value: 20,
      noticeFrom: "Workers Union",
      noticeDate: "2024-10-10",
      replyDueDate: "2024-11-10",
      status: "active",
      responsibleUser: "Adv. Patel",
      daysRemaining: 19,
    },
    {
      id: "DIS-2024-004",
      company: "Welspun Corp Ltd",
      disputeType: "International",
      value: 200,
      noticeFrom: "Global Trade Inc",
      noticeDate: "2024-08-20",
      replyDueDate: "2024-09-20",
      status: "closed",
      responsibleUser: "Adv. Kumar",
      daysRemaining: 0,
    },
  ];

  const getStatusVariant = (status: string): "active" | "pending" | "overdue" | "closed" => {
    return status as "active" | "pending" | "overdue" | "closed";
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      searchQuery === "" ||
      dispute.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.noticeFrom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pre-Litigation Disputes</h1>
          <p className="mt-1 text-muted-foreground">Manage disputes before court filing</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Dispute
        </Button>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Disputes</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search disputes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notice From</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Reply Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>{dispute.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dispute.disputeType}</Badge>
                    </TableCell>
                    <TableCell>{dispute.noticeFrom}</TableCell>
                    <TableCell className="font-semibold">₹{dispute.value}Cr</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(dispute.replyDueDate).toLocaleDateString('en-IN')}
                        </p>
                        {dispute.daysRemaining > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {dispute.daysRemaining} days left
                          </p>
                        )}
                        {dispute.daysRemaining < 0 && (
                          <p className="text-xs text-destructive">
                            {Math.abs(dispute.daysRemaining)} days overdue
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(dispute.status)}>
                        {dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dispute.responsibleUser}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Upload className="h-3 w-3" />
                          Upload
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">Timeline Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">15-day notices</span>
              <span className="font-semibold text-foreground">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">30-day notices</span>
              <span className="font-semibold text-warning">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">60-day notices</span>
              <span className="font-semibold text-foreground">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">90+ day notices</span>
              <span className="font-semibold text-destructive">2</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">By Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Arbitration</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Court</span>
              <span className="font-semibold text-foreground">6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labour</span>
              <span className="font-semibold text-foreground">4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">International</span>
              <span className="font-semibold text-foreground">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">Value Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">&lt; ₹50Cr</span>
              <span className="font-semibold text-foreground">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">₹50-100Cr</span>
              <span className="font-semibold text-warning">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">₹100-200Cr</span>
              <span className="font-semibold text-destructive">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">&gt; ₹200Cr</span>
              <span className="font-semibold text-destructive">1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
