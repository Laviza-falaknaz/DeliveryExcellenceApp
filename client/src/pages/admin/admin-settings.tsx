import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Save, X, Plus, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AVAILABLE_TABS = [
  { id: "users", label: "Users", description: "User account management" },
  { id: "orders", label: "Orders", description: "Order management and tracking" },
  { id: "rmas", label: "RMAs", description: "Return merchandise authorizations" },
  { id: "tickets", label: "Support Tickets", description: "Customer support tickets" },
  { id: "water-projects", label: "Water Projects", description: "Charity water projects" },
  { id: "case-studies", label: "Case Studies", description: "Customer case studies" },
  { id: "gamification", label: "Gamification", description: "Achievement and rewards management" },
  { id: "api-keys", label: "API Keys", description: "API key management" },
  { id: "theme", label: "Theme", description: "Theme and branding settings" },
  { id: "connection", label: "Connection", description: "Database connection settings" },
];

interface AdminSettingsData {
  visibleTabs: string[];
  rmaNotificationEmails: string[];
  newUserAlertEmails: string[];
}

export function AdminSettings() {
  const { toast } = useToast();
  const [newRmaEmail, setNewRmaEmail] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  const { data: settings, isLoading } = useQuery<AdminSettingsData>({
    queryKey: ["/api/admin/settings"],
  });

  const [visibleTabs, setVisibleTabs] = useState<string[]>([]);
  const [rmaEmails, setRmaEmails] = useState<string[]>([]);
  const [userEmails, setUserEmails] = useState<string[]>([]);

  // Synchronize local state when settings load
  useEffect(() => {
    if (settings) {
      setVisibleTabs(settings.visibleTabs || AVAILABLE_TABS.map(t => t.id));
      setRmaEmails(settings.rmaNotificationEmails || []);
      setUserEmails(settings.newUserAlertEmails || []);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: AdminSettingsData) => {
      const response = await apiRequest("POST", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings saved",
        description: "Admin settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleTab = (tabId: string) => {
    setVisibleTabs(prev => 
      prev.includes(tabId) 
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const handleAddRmaEmail = () => {
    if (newRmaEmail && !rmaEmails.includes(newRmaEmail)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newRmaEmail)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
      setRmaEmails([...rmaEmails, newRmaEmail]);
      setNewRmaEmail("");
    }
  };

  const handleAddUserEmail = () => {
    if (newUserEmail && !userEmails.includes(newUserEmail)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserEmail)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
      setUserEmails([...userEmails, newUserEmail]);
      setNewUserEmail("");
    }
  };

  const handleRemoveRmaEmail = (email: string) => {
    setRmaEmails(rmaEmails.filter(e => e !== email));
  };

  const handleRemoveUserEmail = (email: string) => {
    setUserEmails(userEmails.filter(e => e !== email));
  };

  const handleSave = () => {
    saveMutation.mutate({
      visibleTabs,
      rmaNotificationEmails: rmaEmails,
      newUserAlertEmails: userEmails,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="card-admin-settings">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle>Admin Portal Settings</CardTitle>
          </div>
          <CardDescription>
            Configure which tabs are visible in the admin portal and manage notification email addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visible Tabs Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Visible Tabs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select which tabs should be visible in the admin portal
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_TABS.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors"
                  data-testid={`tab-option-${tab.id}`}
                >
                  <Checkbox
                    id={`tab-${tab.id}`}
                    checked={visibleTabs.includes(tab.id)}
                    onCheckedChange={() => handleToggleTab(tab.id)}
                    data-testid={`checkbox-tab-${tab.id}`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`tab-${tab.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {tab.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {tab.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* RMA Notification Emails Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                RMA Request Notifications
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Email addresses that will receive notifications when customers submit RMA requests
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newRmaEmail}
                  onChange={(e) => setNewRmaEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddRmaEmail()}
                  data-testid="input-rma-email"
                />
                <Button
                  onClick={handleAddRmaEmail}
                  disabled={!newRmaEmail}
                  data-testid="button-add-rma-email"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {rmaEmails.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No notification emails configured yet
                  </p>
                ) : (
                  rmaEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-3 bg-accent rounded-lg"
                      data-testid={`rma-email-${email}`}
                    >
                      <span className="text-sm font-medium">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRmaEmail(email)}
                        data-testid={`button-remove-rma-${email}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* New User Alert Emails Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                New User Alerts
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Email addresses that will receive alerts when new users are created (requiring approval)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddUserEmail()}
                  data-testid="input-user-alert-email"
                />
                <Button
                  onClick={handleAddUserEmail}
                  disabled={!newUserEmail}
                  data-testid="button-add-user-alert-email"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {userEmails.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No alert emails configured yet
                  </p>
                ) : (
                  userEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-3 bg-accent rounded-lg"
                      data-testid={`user-alert-email-${email}`}
                    >
                      <span className="text-sm font-medium">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUserEmail(email)}
                        data-testid={`button-remove-user-alert-${email}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-save-settings"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
