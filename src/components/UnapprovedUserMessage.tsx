import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UnapprovedUserMessage() {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const checkApproval = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("approved")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking approval status:", error);
        setLoading(false);
        return;
      }

      setIsApproved(data?.approved ?? false);
      setLoading(false);

      if (data?.approved) {
        navigate("/");
        return;
      }

      // Set up realtime subscription to listen for approval changes
      channel = supabase
        .channel(`profile_approval_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Approval status changed:", payload);
            if (payload.new && "approved" in payload.new) {
              const newApproved = (payload.new as { approved: boolean }).approved;
              setIsApproved(newApproved);
              if (newApproved) {
                navigate("/");
              }
            }
          }
        )
        .subscribe();
    };

    void checkApproval();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isApproved === null || isApproved) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <UserCheck className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Account Pending Approval</h2>
              <p className="text-muted-foreground">
                Your account has been created successfully. Please wait for an administrator to approve your access.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                You will be notified once your account is approved and you can start using the application.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="mt-4 w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
