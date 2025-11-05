import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, Wrench, HelpCircle, Droplets, FileText, Palette, Database, Trophy, Key, Settings } from "lucide-react";
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

export function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

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

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="rmas" data-testid="tab-rmas">
              <Wrench className="mr-2 h-4 w-4" />
              RMAs
            </TabsTrigger>
            <TabsTrigger value="tickets" data-testid="tab-tickets">
              <HelpCircle className="mr-2 h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="water-projects" data-testid="tab-water-projects">
              <Droplets className="mr-2 h-4 w-4" />
              Water Projects
            </TabsTrigger>
            <TabsTrigger value="case-studies" data-testid="tab-case-studies">
              <FileText className="mr-2 h-4 w-4" />
              Case Studies
            </TabsTrigger>
            <TabsTrigger value="gamification" data-testid="tab-gamification">
              <Trophy className="mr-2 h-4 w-4" />
              Gamification
            </TabsTrigger>
            <TabsTrigger value="api-keys" data-testid="tab-api-keys">
              <Key className="mr-2 h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="theme" data-testid="tab-theme">
              <Palette className="mr-2 h-4 w-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="connection" data-testid="tab-connection">
              <Database className="mr-2 h-4 w-4" />
              Connection
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="rmas" className="space-y-4">
            <RMAManagement />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <SupportTicketManagement />
          </TabsContent>

          <TabsContent value="water-projects" className="space-y-4">
            <WaterProjectManagement />
          </TabsContent>

          <TabsContent value="case-studies" className="space-y-4">
            <CaseStudyManagement />
          </TabsContent>

          <TabsContent value="gamification" className="space-y-4">
            <GamificationManagement />
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <ApiKeyManagement />
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <ThemeSettings />
          </TabsContent>

          <TabsContent value="connection" className="space-y-4">
            <ConnectionSettings />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
