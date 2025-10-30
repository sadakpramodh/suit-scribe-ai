import { useState, useRef } from "react";
import { Plus, Search, Filter, Calendar, FileText, Upload, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useLitigationCases } from "@/hooks/useLitigationCases";
import { toast } from "sonner";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cases, loading, deleteCase, bulkInsertCases } = useLitigationCases();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error("No data found in the Excel file");
        return;
      }

      const casesData = jsonData.map((row: any, index: number) => ({
        sr_no: row["Sr. No."] || index + 1,
        parties: row["Parties"] || "",
        forum: row["Forum"] || "",
        particular: row["Particular"] || "",
        start_date: row["Start Date"] ? new Date(row["Start Date"]).toISOString().split("T")[0] : null,
        last_hearing_date: row["Last Date of Hearing"] ? new Date(row["Last Date of Hearing"]).toISOString().split("T")[0] : null,
        next_hearing_date: row["Next Date"] ? new Date(row["Next Date"]).toISOString().split("T")[0] : null,
        amount_involved: row["Amount involved"] || null,
        treatment_resolution: row["Treatment undertaken Resolution"] || "",
        remarks: row["Remarks"] || "",
        status: "Active",
      }));

      await bulkInsertCases(casesData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process Excel file. Please check the format.");
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this case?")) {
      await deleteCase(id);
    }
  };

  const filteredCases = cases.filter((litigationCase) => {
    const matchesSearch =
      searchQuery === "" ||
      litigationCase.parties.toLowerCase().includes(searchQuery.toLowerCase()) ||
      litigationCase.forum.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || litigationCase.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Litigation Cases</h1>
          <p className="mt-1 text-muted-foreground">Track all active court and arbitration proceedings</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload Excel
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
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
                  <TableHead>Sr. No.</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Forum</TableHead>
                  <TableHead>Particular</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Last Hearing</TableHead>
                  <TableHead>Next Hearing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Loading cases...
                    </TableCell>
                  </TableRow>
                ) : filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No litigation cases found. Upload an Excel file to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((litigationCase) => (
                    <TableRow key={litigationCase.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{litigationCase.sr_no || "-"}</TableCell>
                      <TableCell>{litigationCase.parties}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{litigationCase.forum}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{litigationCase.particular || "-"}</TableCell>
                      <TableCell>
                        {litigationCase.start_date ? (
                          <span className="text-sm">
                            {new Date(litigationCase.start_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {litigationCase.last_hearing_date ? (
                          <span className="text-sm">
                            {new Date(litigationCase.last_hearing_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {litigationCase.next_hearing_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(litigationCase.next_hearing_date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {litigationCase.amount_involved ? `₹${Number(litigationCase.amount_involved).toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {litigationCase.treatment_resolution || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={litigationCase.status.toLowerCase() === "active" ? "active" : "closed"}>
                          {litigationCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCase(litigationCase.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <FileText className="h-3 w-3" />
                            Documents
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
