import { useState } from "react";
import { Search, Filter, Upload, Trash2, FileText, Clock, TrendingUp } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NewDisputeDialog from "@/components/NewDisputeDialog";
import StatCard from "@/components/StatCard";
import { useDisputes } from "@/hooks/useDisputes";
import { format } from "date-fns";

export default function PreLitigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { disputes, loading, deleteDispute, updateDisputeStatus } = useDisputes();

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pending": "destructive",
      "Under Review": "secondary",
      "Response Sent": "default",
      "Closed": "outline",
    };
    return variants[status] || "default";
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.dispute_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.responsible_user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.notice_from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalValue: disputes.reduce((sum, d) => sum + d.value, 0),
    byType: disputes.reduce((acc, d) => {
      acc[d.dispute_type] = (acc[d.dispute_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: disputes.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pre-Litigation Disputes</h1>
          <p className="mt-1 text-muted-foreground">Manage disputes before court filing</p>
        </div>
        <NewDisputeDialog />
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Response Sent">Response Sent</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDisputes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No disputes found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first dispute to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell className="font-medium">{dispute.company}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dispute.dispute_type}</Badge>
                      </TableCell>
                      <TableCell>{dispute.notice_from}</TableCell>
                      <TableCell className="font-semibold">₹{dispute.value}Cr</TableCell>
                      <TableCell>
                        {format(new Date(dispute.reply_due_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={dispute.status}
                          onValueChange={(value) => updateDisputeStatus(dispute.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge variant={getStatusVariant(dispute.status)}>
                              {dispute.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Response Sent">Response Sent</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dispute.responsible_user}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Dispute</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this dispute? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteDispute(dispute.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Disputes"
          value={disputes.length.toString()}
          icon={Clock}
          trend={stats.byStatus["Pending"] ? {
            value: `${stats.byStatus["Pending"]} pending action`,
            isPositive: false
          } : undefined}
        />
        <StatCard
          title="By Type"
          value={Object.keys(stats.byType).length.toString()}
          icon={FileText}
        />
        <StatCard
          title="Total Value"
          value={`₹${stats.totalValue.toFixed(2)} Cr`}
          icon={TrendingUp}
          variant="success"
        />
      </div>
    </div>
  );
}
