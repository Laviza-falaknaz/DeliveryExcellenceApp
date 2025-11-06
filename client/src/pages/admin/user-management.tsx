import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, UserCheck, UserX, Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export function UserManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsCreateOpen(false);
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: variables.isActive ? "User activated" : "User deactivated",
        description: variables.isActive 
          ? "User can now access the system"
          : "User can no longer access the system"
      });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ id, isAdmin }: { id: number; isAdmin: boolean }) => {
      return apiRequest(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ 
        title: variables.isAdmin ? "Admin privileges granted" : "Admin privileges revoked",
      });
    },
    onError: () => {
      toast({ title: "Failed to update admin status", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phoneNumber: formData.get("phoneNumber") || null,
      isAdmin: formData.get("isAdmin") === "on",
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: userData });
    } else {
      createMutation.mutate(userData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-user">
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" required data-testid="input-username" />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required data-testid="input-password" />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required data-testid="input-name" />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" required data-testid="input-company" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required data-testid="input-email" />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" data-testid="input-phone" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isAdmin" name="isAdmin" data-testid="checkbox-admin" />
                  <Label htmlFor="isAdmin">Admin User</Label>
                </div>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: any) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell data-testid={`text-user-id-${user.id}`}>{user.id}</TableCell>
                  <TableCell data-testid={`text-username-${user.id}`}>{user.username}</TableCell>
                  <TableCell data-testid={`text-name-${user.id}`}>{user.name}</TableCell>
                  <TableCell data-testid={`text-email-${user.id}`}>{user.email}</TableCell>
                  <TableCell data-testid={`text-company-${user.id}`}>{user.company}</TableCell>
                  <TableCell data-testid={`text-status-${user.id}`}>
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-role-${user.id}`}>
                    <Badge variant={user.isAdmin ? "secondary" : "outline"}>
                      {user.isAdmin ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title={user.isActive ? "Deactivate user" : "Activate user"}
                        onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                        disabled={toggleActiveMutation.isPending}
                        data-testid={`button-toggle-active-${user.id}`}
                      >
                        {user.isActive ? <UserX className="h-4 w-4 text-red-600" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={user.isAdmin ? "Revoke admin" : "Grant admin"}
                        onClick={() => toggleAdminMutation.mutate({ id: user.id, isAdmin: !user.isAdmin })}
                        disabled={toggleAdminMutation.isPending}
                        data-testid={`button-toggle-admin-${user.id}`}
                      >
                        {user.isAdmin ? <ShieldOff className="h-4 w-4 text-orange-600" /> : <Shield className="h-4 w-4 text-blue-600" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit user"
                        onClick={() => setEditingUser(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  name="username"
                  defaultValue={editingUser.username}
                  required
                  data-testid="input-edit-username"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  data-testid="input-edit-password"
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingUser.name}
                  required
                  data-testid="input-edit-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-company">Company</Label>
                <Input
                  id="edit-company"
                  name="company"
                  defaultValue={editingUser.company}
                  required
                  data-testid="input-edit-company"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={editingUser.email}
                  required
                  data-testid="input-edit-email"
                />
              </div>
              <div>
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  defaultValue={editingUser.phoneNumber || ""}
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isAdmin"
                  name="isAdmin"
                  defaultChecked={editingUser.isAdmin}
                  data-testid="checkbox-edit-admin"
                />
                <Label htmlFor="edit-isAdmin">Admin User</Label>
              </div>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-update">
                {updateMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
