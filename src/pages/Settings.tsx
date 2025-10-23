import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, User } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: "",
  });

  const [alertSettings, setAlertSettings] = useState({
    email_alerts: true,
    whatsapp_alerts: false,
    whatsapp_number: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAlertSettings();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "",
      });
    }
  };

  const loadAlertSettings = async () => {
    const { data, error } = await supabase
      .from("alert_settings")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setAlertSettings({
        email_alerts: data.email_alerts,
        whatsapp_alerts: data.whatsapp_alerts,
        whatsapp_number: data.whatsapp_number || "",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlertSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("alert_settings")
        .update({
          email_alerts: alertSettings.email_alerts,
          whatsapp_alerts: alertSettings.whatsapp_alerts,
          whatsapp_number: alertSettings.whatsapp_number,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Change Avatar"}
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max 5MB - JPG, PNG, WebP, GIF
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Alert Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailAlerts">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="emailAlerts"
              checked={alertSettings.email_alerts}
              onCheckedChange={(checked) =>
                setAlertSettings({ ...alertSettings, email_alerts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="whatsappAlerts">WhatsApp Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via WhatsApp
              </p>
            </div>
            <Switch
              id="whatsappAlerts"
              checked={alertSettings.whatsapp_alerts}
              onCheckedChange={(checked) =>
                setAlertSettings({ ...alertSettings, whatsapp_alerts: checked })
              }
            />
          </div>

          {alertSettings.whatsapp_alerts && (
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                placeholder="+1234567890"
                value={alertSettings.whatsapp_number}
                onChange={(e) =>
                  setAlertSettings({
                    ...alertSettings,
                    whatsapp_number: e.target.value,
                  })
                }
              />
            </div>
          )}

          <Button onClick={handleSaveAlertSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Alert Settings"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
