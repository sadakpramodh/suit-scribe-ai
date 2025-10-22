import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
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
});

type DisputeFormValues = z.infer<typeof disputeSchema>;

export default function NewDisputeDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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

  const onSubmit = (data: DisputeFormValues) => {
    console.log("New dispute:", data);
    toast({
      title: "Dispute Created",
      description: "The new dispute has been added successfully.",
    });
    setOpen(false);
    form.reset();
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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Dispute</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
