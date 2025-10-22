import { useState } from "react";
import { Plus, Search, Filter, Calendar, FileText } from "lucide-react";
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

export default function Litigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const litigationCases = [
    {
      id: "WP/2024/14113",
      company: "Welspun Corp Ltd",
      opponent: "Sahara Construction",
      forum: "High Court",
      matterType: "Civil",
      value: 150,
      stage: "Hearing",
      nextHearingDate: "2025-10-25",
      status: "active",
      externalCounsel: "M/s Legal Associates",
      responsibleUser: "Adv. Sharma",
    },
    {
      id: "ARB/2024/5678",
      company: "Welspun Steel",
      opponent: "Vendor Logistics Pvt",
      forum: "Arbitration",
      matterType: "Arbitration",
      value: 45,
      stage: "Filing",
      nextHearingDate: "2025-10-27",
      status: "active",
      externalCounsel: "M/s Arbitration Experts",
      responsibleUser: "Adv. Mehta",
    },
    {
      id: "LAB/2024/9012",
      company: "Welspun Enterprises",
      opponent: "Workers Union",
      forum: "Labour Court",
      matterType: "Labour",
      value: 20,
      stage: "Judgment",
      nextHearingDate: "2025-11-05",
      status: "pending",
      externalCounsel: "M/s Labour Law Firm",
      responsibleUser: "Adv. Patel",
    },
    {
      id: "CIV/2024/3456",
      company: "Welspun Corp Ltd",
      opponent: "Tax Department",
      forum: "District Court",
      matterType: "Civil",
      value: 80,
      stage: "Replies",
      nextHearingDate: "2025-11-12",
      status: "active",
      externalCounsel: "M/s Tax Consultants",
      responsibleUser: "Adv. Kumar",
    },
    {
      id: "INT/2024/7890",
      company: "Welspun Global",
      opponent: "Global Trade Inc",
      forum: "International Court",
      matterType: "International",
      value: 200,
      stage: "Hearing",
      nextHearingDate: null,
      status: "closed",
      externalCounsel: "M/s International Law Partners",
      responsibleUser: "Adv. Singh",
    },
  ];

  const getStatusVariant = (status: string): "active" | "pending" | "closed" => {
    return status as "active" | "pending" | "closed";
  };

  const filteredCases = litigationCases.filter((matter) => {
    const matchesSearch =
      searchQuery === "" ||
      matter.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || matter.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Litigation Cases</h1>
          <p className="mt-1 text-muted-foreground">Track all active court and arbitration proceedings</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Case
        </Button>
      </div>

      <Card className="shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Cases</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
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
                  <TableHead>Case Number</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Forum</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Next Hearing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((matter) => (
                  <TableRow key={matter.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="font-medium">{matter.id}</TableCell>
                    <TableCell>{matter.company}</TableCell>
                    <TableCell>{matter.opponent}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{matter.forum}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">₹{matter.value}Cr</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{matter.stage}</span>
                    </TableCell>
                    <TableCell>
                      {matter.nextHearingDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(matter.nextHearingDate).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(matter.status)}>
                        {matter.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Documents
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
            <CardTitle className="text-sm">By Forum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High Court</span>
              <span className="font-semibold text-foreground">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">District Court</span>
              <span className="font-semibold text-foreground">6</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Arbitration</span>
              <span className="font-semibold text-foreground">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Labour Court</span>
              <span className="font-semibold text-foreground">4</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">By Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Filing</span>
              <span className="font-semibold text-foreground">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Replies</span>
              <span className="font-semibold text-foreground">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hearing</span>
              <span className="font-semibold text-warning">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Judgment</span>
              <span className="font-semibold text-success">7</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-sm">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High Risk</span>
              <span className="font-semibold text-destructive">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Medium Risk</span>
              <span className="font-semibold text-warning">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Risk</span>
              <span className="font-semibold text-success">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Closed</span>
              <span className="font-semibold text-muted-foreground">15</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
