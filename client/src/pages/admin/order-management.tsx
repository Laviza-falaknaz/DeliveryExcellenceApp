import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PackageOpen, PackageX, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function OrderManagement() {
  const { toast } = useToast();
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/admin/orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setEditingOrder(null);
      toast({ title: "Order updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/orders/${id}`, { isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ 
        title: variables.isActive ? "Order activated" : "Order deactivated",
      });
    },
    onError: () => {
      toast({ title: "Failed to update order status", variant: "destructive" });
    },
  });

  const handleUserChange = (userId: number) => {
    if (!editingOrder) return;
    
    updateOrderMutation.mutate({
      id: editingOrder.id,
      data: { userId },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
        <CardDescription>View and manage all customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading orders...</p>
        ) : orders && orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => {
                const orderUser = users?.find((u: any) => u.id === order.userId);
                return (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell data-testid={`text-order-number-${order.id}`}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell data-testid={`text-user-${order.id}`}>
                      {orderUser?.name || `User #${order.userId}`}
                    </TableCell>
                    <TableCell data-testid={`text-status-${order.id}`}>
                      <Badge variant="outline">
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-amount-${order.id}`}>
                      {order.totalAmount}
                    </TableCell>
                    <TableCell data-testid={`text-currency-${order.id}`}>
                      {order.currency}
                    </TableCell>
                    <TableCell data-testid={`text-date-${order.id}`}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell data-testid={`text-active-${order.id}`}>
                      <Badge variant={order.isActive ? "default" : "destructive"}>
                        {order.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View order details"
                          onClick={() => setViewingOrder(order)}
                          data-testid={`button-view-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={order.isActive ? "Deactivate order" : "Activate order"}
                          onClick={() => toggleActiveMutation.mutate({ id: order.id, isActive: !order.isActive })}
                          disabled={toggleActiveMutation.isPending}
                          data-testid={`button-toggle-active-${order.id}`}
                        >
                          {order.isActive ? 
                            <PackageX className="h-4 w-4 text-red-600" /> : 
                            <PackageOpen className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOrder(order)}
                          data-testid={`button-switch-user-${order.id}`}
                        >
                          Switch User
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No orders found</p>
        )}
      </CardContent>

      {editingOrder && (
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Switch User for Order {editingOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Select a new user to assign this order to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">User</Label>
                <Select
                  defaultValue={editingOrder.userId.toString()}
                  onValueChange={(value) => handleUserChange(parseInt(value))}
                >
                  <SelectTrigger id="user-select" data-testid="select-new-user">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {viewingOrder && (
        <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - {viewingOrder.orderNumber}</DialogTitle>
              <DialogDescription>
                Complete order information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">User</Label>
                  <p className="text-sm">
                    {users?.find((u: any) => u.id === viewingOrder.userId)?.name || `User #${viewingOrder.userId}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <p className="text-sm">{viewingOrder.status.replace(/_/g, " ").toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Total Amount</Label>
                  <p className="text-sm">{viewingOrder.currency} {viewingOrder.totalAmount}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Order Date</Label>
                  <p className="text-sm">{new Date(viewingOrder.orderDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Tracking Number</Label>
                  <p className="text-sm">{viewingOrder.trackingNumber || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Active Status</Label>
                  <p className="text-sm">{viewingOrder.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
              {viewingOrder.shippingAddress && (
                <div>
                  <Label className="text-sm font-semibold">Shipping Address</Label>
                  <p className="text-sm">
                    {viewingOrder.shippingAddress.street}, {viewingOrder.shippingAddress.city}, 
                    {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.zipCode}, 
                    {viewingOrder.shippingAddress.country}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
