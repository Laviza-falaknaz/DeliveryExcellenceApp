import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderItem, InsertOrder, InsertOrderItem } from "@shared/schema";

export function useOrders() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { toast } = useToast();

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  async function createOrder(orderData: Omit<InsertOrder, "userId">) {
    try {
      setIsCreatingOrder(true);
      const order = await apiRequest("POST", "/api/orders", orderData);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order Created",
        description: `Order #${orderData.orderNumber} has been created successfully.`,
      });
      return order;
    } catch (error) {
      console.error("Create order error:", error);
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  }

  async function createOrderItem(orderId: number, itemData: Omit<InsertOrderItem, "orderId">) {
    try {
      const item = await apiRequest("POST", `/api/orders/${orderId}/items`, itemData);
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/items`] });
      return item;
    } catch (error) {
      console.error("Create order item error:", error);
      toast({
        title: "Error",
        description: "Failed to create order item. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }

  async function getOrderItems(orderId: number) {
    try {
      const items = await apiRequest("GET", `/api/orders/${orderId}/items`);
      return items;
    } catch (error) {
      console.error("Get order items error:", error);
      return [];
    }
  }

  async function getOrderUpdates(orderId: number) {
    try {
      const updates = await apiRequest("GET", `/api/orders/${orderId}/updates`);
      return updates;
    } catch (error) {
      console.error("Get order updates error:", error);
      return [];
    }
  }

  // Function to get active orders (in process orders, not completed or cancelled)
  function getActiveOrders() {
    if (!orders) return [];
    return orders.filter(
      (order) => 
        order.status !== "completed" && 
        order.status !== "cancelled" && 
        order.status !== "returned"
    ).sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
  }

  // Function to get past orders (completed, cancelled, or returned)
  function getPastOrders() {
    if (!orders) return [];
    return orders.filter(
      (order) => 
        order.status === "completed" || 
        order.status === "cancelled" || 
        order.status === "returned"
    ).sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime());
  }

  // Get most recent active order
  function getMostRecentActiveOrder() {
    const activeOrders = getActiveOrders();
    return activeOrders.length > 0 ? activeOrders[0] : null;
  }

  return {
    orders,
    isLoadingOrders,
    isCreatingOrder,
    createOrder,
    createOrderItem,
    getOrderItems,
    getOrderUpdates,
    getActiveOrders,
    getPastOrders,
    getMostRecentActiveOrder,
  };
}
