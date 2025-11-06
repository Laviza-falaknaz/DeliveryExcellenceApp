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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function OrderManagement() {
  const { toast } = useToast();
  const [editingOrder, setEditingOrder] = useState<any>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
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

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: newStatus },
    });
  };

  const handleUserChange = (userId: number) => {
    if (!editingOrder) return;
    
    updateOrderMutation.mutate({
      id: editingOrder.id,
      data: { userId },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "default";
      case "shipped":
        return "secondary";
      case "processing":
      case "in_production":
      case "quality_check":
        return "outline";
      case "cancelled":
      case "returned":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Management</CardTitle>
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
                      <Badge variant={getStatusColor(order.status)}>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[160px]" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="in_production">In Production</SelectItem>
                            <SelectItem value="quality_check">Quality Check</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
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
    </Card>
  );
}
