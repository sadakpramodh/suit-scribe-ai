import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const disputeSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100),
  disputeType: z.enum(["Arbitration", "Court", "Labour", "International"], {
    required_error: "Please select a dispute type",
  }),
  value: z.string().min(1, "Value is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Value must be a positive number",
  }),
  noticeFrom: z.string().min(1, "Notice from party is required").max(100),
  noticeDate: z.string().min(1, "Notice date is required"),
  replyDueDate: z.string().min(1, "Reply due date is required"),
  responsibleUser: z.string().min(1, "Responsible user is required").max(100),
  description: z.string().max(500).optional(),
  documents: z.array(z.instanceof(File)).max(50, "Maximum 50 files allowed").optional(),
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

export default function NewDisputeDialog() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<DisputeFormValues>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      company: "",
      disputeType: undefined,
      value: "",
      noticeFrom: "",
      noticeDate: "",
      replyDueDate: "",
      responsibleUser: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (500MB max per file)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 500MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newFiles = [...selectedFiles, ...validFiles].slice(0, 50);
    setSelectedFiles(newFiles);
    
    if (newFiles.length >= 50) {
      toast({
        title: "File limit reached",
        description: "Maximum 50 files allowed",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (!user || selectedFiles.length === 0) return [];

    const uploadedPaths: string[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      uploadedPaths.push(fileName);
    }

    return uploadedPaths;
  };

  const onSubmit = async (data: DisputeFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a dispute",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload documents if any
      const documentPaths = await uploadDocuments();
      
      // Insert dispute into database
      const { error: insertError } = await supabase
        .from("disputes")
        .insert({
          user_id: user.id,
          company: data.company,
          dispute_type: data.disputeType,
          value: parseFloat(data.value),
          notice_from: data.noticeFrom,
          notice_date: data.noticeDate,
          reply_due_date: data.replyDueDate,
          responsible_user: data.responsibleUser,
          description: data.description || null,
          document_paths: documentPaths,
          status: "Pending",
        });

      if (insertError) throw insertError;
      
      toast({
        title: "Dispute Created",
        description: `The new dispute has been added successfully${documentPaths.length > 0 ? ` with ${documentPaths.length} document(s)` : ""}.`,
      });
      
      setOpen(false);
      form.reset();
      setSelectedFiles([]);
      
      // Trigger a page reload or custom event to refresh the disputes list
      window.dispatchEvent(new CustomEvent("disputeCreated"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create dispute";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dispute</DialogTitle>
          <DialogDescription>
            Create a new pre-litigation dispute record
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Welspun Corp Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disputeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispute Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Arbitration">Arbitration</SelectItem>
                        <SelectItem value="Court">Court</SelectItem>
                        <SelectItem value="Labour">Labour</SelectItem>
                        <SelectItem value="International">International</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value (in Crores)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noticeFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice From</FormLabel>
                    <FormControl>
                      <Input placeholder="Party name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="noticeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="replyDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reply Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibleUser"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Responsible User</FormLabel>
                    <FormControl>
                      <Input placeholder="Adv. Sharma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the dispute..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Documents (Max 50 files, 500MB each)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="documents"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={selectedFiles.length >= 50}
                />
                <label
                  htmlFor="documents"
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload documents
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedFiles.length}/50 files selected
                  </span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground mx-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                  setSelectedFiles([]);
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Creating..." : "Create Dispute"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
