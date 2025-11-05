import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, Wrench, HelpCircle, Droplets, FileText, Palette, Database, Trophy, Key, Settings, Leaf } from "lucide-react";
import { UserManagement } from "./admin/user-management";
import { OrderManagement } from "./admin/order-management";
import { RMAManagement } from "./admin/rma-management";
import { SupportTicketManagement } from "./admin/support-ticket-management";
import { WaterProjectManagement } from "./admin/water-project-management";
import { CaseStudyManagement } from "./admin/case-study-management";
import { ThemeSettings } from "./admin/theme-settings";
import { ConnectionSettings } from "./admin/connection-settings";
import GamificationManagement from "./admin/gamification-management";
import { ApiKeyManagement } from "./admin/api-key-management";
import { AdminSettings } from "./admin/admin-settings";
import { SustainabilitySettings } from "./admin/sustainability-settings";

interface AdminSettingsData {
  visibleTabs: string[];
  rmaNotificationEmails: string[];
  newUserAlertEmails: string[];
}

const ALL_TABS = [
  { id: "users", label: "Users", icon: Users, component: UserManagement },
  { id: "orders", label: "Orders", icon: ShoppingCart, component: OrderManagement },
  { id: "rmas", label: "RMAs", icon: Wrench, component: RMAManagement },
  { id: "tickets", label: "Tickets", icon: HelpCircle, component: SupportTicketManagement },
  { id: "water-projects", label: "Water Projects", icon: Droplets, component: WaterProjectManagement },
  { id: "case-studies", label: "Case Studies", icon: FileText, component: CaseStudyManagement },
  { id: "gamification", label: "Gamification", icon: Trophy, component: GamificationManagement },
  { id: "api-keys", label: "API Keys", icon: Key, component: ApiKeyManagement },
  { id: "sustainability", label: "Sustainability", icon: Leaf, component: SustainabilitySettings },
  { id: "theme", label: "Theme", icon: Palette, component: ThemeSettings },
  { id: "connection", label: "Connection", icon: Database, component: ConnectionSettings },
];

export function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: adminSettings } = useQuery<AdminSettingsData>({
    queryKey: ["/api/admin/settings"],
  });

  // Filter tabs based on settings, default to showing all if not configured
  const visibleTabs = adminSettings?.visibleTabs || ALL_TABS.map(t => t.id);
  const filteredTabs = ALL_TABS.filter(tab => visibleTabs.includes(tab.id));
  
  // Calculate grid columns based on number of visible tabs + settings tab
  const totalTabs = filteredTabs.length + 1; // +1 for Settings tab
  const gridCols = Math.min(totalTabs, 11); // Max 11 columns

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, orders, and system settings
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card data-testid="card-total-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-users-count">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-orders">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-orders-count">{stats?.totalOrders || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-rmas">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active RMAs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-rmas-count">{stats?.activeRMAs || 0}</div>
            </CardContent>
          </Card>

          <Card data-testid="card-open-tickets">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-tickets-count">{stats?.openTickets || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={filteredTabs[0]?.id || "settings"} className="space-y-4">
          <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} data-testid={`tab-${tab.id}`}>
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {filteredTabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <Component />
              </TabsContent>
            );
          })}

          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
