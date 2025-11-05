import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import OrderJourney from "./order-journey";
import { useState } from "react";
import { Order, OrderItem, DeliveryTimeline, EnvironmentalImpact } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface OrderCardProps {
  order: Order;
  isPast?: boolean;
}

export default function OrderCard({ order, isPast = false }: OrderCardProps) {
  const [expanded, setExpanded] = useState(!isPast);

  const { data: orderItems } = useQuery<OrderItem[]>({
    queryKey: [`/api/orders/${order.id}/items`],
    enabled: expanded,
  });

  const { data: orderUpdates } = useQuery<any[]>({
    queryKey: [`/api/orders/${order.id}/updates`],
    enabled: expanded && order.status !== "completed" && order.status !== "cancelled",
  });

  const { data: timeline } = useQuery<DeliveryTimeline>({
    queryKey: [`/api/orders/${order.id}/timeline`],
    enabled: expanded && !isPast,
  });

  const { data: environmentalImpact } = useQuery<EnvironmentalImpact>({
    queryKey: [`/api/orders/${order.id}/environmental-impact`],
    enabled: expanded,
  });

  const latestUpdate = orderUpdates && orderUpdates.length > 0 ? orderUpdates[0] : null;

  function getStatusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Calculate totals
  const totalQuantity = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalAmount = Number(order.totalAmount) || 0;

  return (
    <Card className="bg-white overflow-hidden border border-neutral-200 mb-4">
      <CardHeader className="px-5 py-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-neutral-500">
              Ordered on {order.orderDate ? formatDate(order.orderDate) : 'N/A'}
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <Badge
              variant="outline"
              className={`${getOrderStatusColor(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
          <div>
            <p className="text-sm text-neutral-600 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-neutral-900">{totalQuantity}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-600 font-medium">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</p>
            {Number(order.savedAmount) > 0 && (
              <p className="text-xs text-emerald-600 font-medium mt-1">
                Saved {formatCurrency(Number(order.savedAmount))} vs new
              </p>
            )}
          </div>
        </div>

        {expanded && orderItems && orderItems.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row md:items-center mb-4 pb-4 border-b border-neutral-100 last:border-0">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-neutral-100 rounded-lg flex items-center justify-center">
                <i className="ri-laptop-line text-2xl text-neutral-400"></i>
              </div>
            )}
            <div className="mt-3 md:mt-0 md:ml-4 flex-1">
              <h4 className="font-medium text-neutral-900">{item.productName}</h4>
              <p className="text-sm text-neutral-500 mt-1">Qty: {item.quantity}</p>
            </div>
            <div className="mt-3 md:mt-0 text-right">
              <p className="font-semibold text-neutral-900">{formatCurrency(Number(item.totalPrice))}</p>
            </div>
          </div>
        ))}

        {!isPast && order.status !== "completed" && order.status !== "cancelled" && latestUpdate && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 flex">
            <div className="mr-3 text-secondary">
              <i className="ri-information-line text-xl"></i>
            </div>
            <div>
              <h4 className="font-medium text-neutral-800">Latest Update</h4>
              <p className="text-sm text-neutral-600">
                {latestUpdate.message}
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                {formatDate(latestUpdate.timestamp)} at{" "}
                {new Date(latestUpdate.timestamp).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button variant="outline" asChild data-testid="button-view-details">
            <Link href={`/orders/${order.id}`}>View Details</Link>
          </Button>
          {isPast ? (
            <Button asChild data-testid="button-reorder">
              <Link href={`/orders/reorder/${order.id}`}>Reorder</Link>
            </Button>
          ) : (
            <Button asChild data-testid="button-track-shipment">
              <Link href={`/orders/${order.id}/journey`}>Track Shipment</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
