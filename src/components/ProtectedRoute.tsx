import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [approvalChecked, setApprovalChecked] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is approved
    if (!loading && user && !approvalChecked) {
      let channel: ReturnType<typeof supabase.channel> | null = null;

      const checkApproval = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("approved")
          .eq("id", user.id)
          .single();
          
        if (!error && data && !data.approved) {
          navigate('/pending-approval');
          setApprovalChecked(true);
          
          // Set up realtime listener for approval changes
          channel = supabase
            .channel(`protected_route_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${user.id}`,
              },
              (payload) => {
                console.log("User approval changed:", payload);
                if (payload.new && "approved" in payload.new) {
                  const newApproved = (payload.new as { approved: boolean }).approved;
                  if (newApproved) {
                    // User was approved, navigate to home
                    navigate('/');
                  }
                }
              }
            )
            .subscribe();
        } else {
          setApprovalChecked(true);
        }
      };
      
      void checkApproval();

      return () => {
        if (channel) {
          void supabase.removeChannel(channel);
        }
      };
    }
  }, [user, loading, navigate, approvalChecked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
