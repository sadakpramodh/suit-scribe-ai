import { useState, useRef } from "react";
import { Plus, Search, Filter, Calendar, FileText, Upload, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  useLitigationCases,
  type LitigationCaseInsert,
} from "@/hooks/useLitigationCases";
import { usePermissions } from "@/hooks/usePermissions";
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
  const { hasPermission } = usePermissions();

  // Sanitize Excel/CSV row to prevent formula injection
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      // Strip leading formula characters (=, +, -, @)
      return value.replace(/^[=+\-@]/, "").trim();
    }
    return value;
  };

  // Parse date in dd-mm-yyyy format
  const parseDateDDMMYYYY = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    // Try to parse dd-mm-yyyy format
    const parts = String(dateStr).split(/[-/]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    // Fallback to standard date parsing
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Extract numbers from text (e.g., "Rs. 10,000" -> 10000)
  const extractNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    
    const str = String(value);
    // Extract all digits and decimal point
    const numbers = str.replace(/[^\d.]/g, '');
    const parsed = parseFloat(numbers);
    
    return isNaN(parsed) ? null : parsed;
  };

  const getColumnValue = (
    row: Record<string, unknown>,
    possibleNames: string[]
  ): unknown => {
    for (const name of possibleNames) {
      const entry = Object.entries(row).find(
        ([key]) => key.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (!entry) {
        continue;
      }

      const [, value] = entry;
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return null;
  };

  const getStringValue = (value: unknown): string => {
    if (typeof value === "string") {
      return value;
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  };

  const parseDateValue = (value: unknown): string | null => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    // First try dd-mm-yyyy format
    if (typeof value === "string") {
      const ddmmyyyyDate = parseDateDDMMYYYY(value);
      if (ddmmyyyyDate) {
        return ddmmyyyyDate.toISOString().split("T")[0];
      }
    }

    // Fallback to standard parsing
    const dateValue =
      value instanceof Date
        ? value
        : typeof value === "string" || typeof value === "number"
          ? new Date(value)
          : null;

    if (!dateValue || Number.isNaN(dateValue.getTime())) {
      return null;
    }

    return dateValue.toISOString().split("T")[0];
  };

  const parseNumberValue = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      // Use extractNumber for better text extraction
      const extracted = extractNumber(value);
      return extracted;
    }
    return null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasPermission("upload_excel_litigation")) {
      toast.error("You don't have permission to upload files");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().match(/\.(xlsx|xls)$/);

    if (!isCSV && !isExcel) {
      toast.error("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size allowed is 5MB.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      let jsonData: Record<string, unknown>[] = [];

      if (isCSV) {
        // Parse CSV file
        const text = await file.text();
        const result = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
        });
        jsonData = result.data;
      } else {
        // Parse Excel file
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        
        // Look for Sheet1 specifically
        const sheetName = workbook.SheetNames.includes("Sheet1") ? "Sheet1" : workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          defval: "",
        });
      }

      console.log("Excel data parsed:", jsonData);
      console.log("First row sample:", jsonData[0]);

      if (jsonData.length === 0) {
        toast.error("No data found in the Excel file");
        return;
      }

      // Validate row count (1000 row limit)
      const MAX_ROWS = 1000;
      if (jsonData.length > MAX_ROWS) {
        toast.error(`Too many rows. Maximum ${MAX_ROWS} rows allowed. Found ${jsonData.length} rows.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const casesData: LitigationCaseInsert[] = jsonData.map((row, index) => {
        const sanitizedRow: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(row)) {
          sanitizedRow[key] = sanitizeValue(value);
        }

        const srNoRaw =
          getColumnValue(sanitizedRow, ["Sr. No.", "Sr No", "SrNo", "Sr.No.", "Serial No"]) ?? index + 1;
        const srNo = parseNumberValue(srNoRaw) ?? index + 1;

        const caseData: LitigationCaseInsert = {
          sr_no: srNo,
          parties: getStringValue(
            getColumnValue(sanitizedRow, ["Parties", "Party", "parties"])
          )
            .substring(0, 500)
            .trim(),
          forum: getStringValue(
            getColumnValue(sanitizedRow, ["Forum", "forum", "Court"])
          )
            .substring(0, 200)
            .trim(),
          particular: getStringValue(
            getColumnValue(sanitizedRow, ["Particular", "particular", "Particulars", "Details"])
          )
            .substring(0, 1000)
            .trim() || null,
          start_date: null,
          last_hearing_date: null,
          next_hearing_date: null,
          amount_involved: null,
          treatment_resolution: getStringValue(
            getColumnValue(sanitizedRow, ["Treatment undertaken Resolution", "Treatment", "Resolution", "Treatment undertaken", "treatment_resolution"])
          )
            .substring(0, 2000)
            .trim() || null,
          remarks: getStringValue(
            getColumnValue(sanitizedRow, ["Remarks", "remarks", "Remark", "Notes"])
          )
            .substring(0, 2000)
            .trim() || null,
          status: "Active",
        };

        const startDate = parseDateValue(
          getColumnValue(sanitizedRow, ["Start Date", "StartDate", "start_date", "Date of Filing"])
        );
        if (startDate) {
          caseData.start_date = startDate;
        }

        const lastHearingDate = parseDateValue(
          getColumnValue(sanitizedRow, ["Last Date of Hearing", "Last Hearing Date", "LastHearingDate", "last_hearing_date", "Last Hearing"])
        );
        if (lastHearingDate) {
          caseData.last_hearing_date = lastHearingDate;
        }

        const nextDate = parseDateValue(
          getColumnValue(sanitizedRow, ["Next Date", "NextDate", "next_hearing_date", "Next Hearing Date", "Next Hearing"])
        );
        if (nextDate) {
          caseData.next_hearing_date = nextDate;
        }

        const amount = parseNumberValue(
          getColumnValue(sanitizedRow, ["Amount involved", "Amount Involved", "AmountInvolved", "amount_involved", "Amount"])
        );
        if (amount !== null) {
          const MAX_AMOUNT = 999_999_999_999; // 12 digits max
          if (amount >= 0 && amount <= MAX_AMOUNT) {
            caseData.amount_involved = amount;
          } else {
            console.warn(`Amount out of range for row ${index + 1}:`, amount);
          }
        }

        return caseData;
      });

      console.log("Processed cases data:", casesData);

      // Validate that at least parties and forum are provided
      const validCases = casesData.filter(
        (caseItem) => caseItem.parties !== "" && caseItem.forum !== ""
      );
      
      if (validCases.length === 0) {
        toast.error("No valid cases found. Please ensure 'Parties' and 'Forum' columns are present.");
        return;
      }

      if (validCases.length < casesData.length) {
        toast.warning(`${casesData.length - validCases.length} rows skipped due to missing required fields`);
      }

      await bulkInsertCases(validCases);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process Excel file. Please check the format.");
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!hasPermission("delete_dispute")) {
      toast.error("You don't have permission to delete cases");
      return;
    }
    
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
          {hasPermission("upload_excel_litigation") && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload CSV/Excel
              </Button>
            </>
          )}
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
                          {hasPermission("delete_dispute") && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCase(litigationCase.id)}
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          )}
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
