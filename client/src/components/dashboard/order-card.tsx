import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getOrderStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import OrderTracking from "./order-tracking";
import { useState } from "react";
import { Order, OrderItem } from "@shared/schema";
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

  const { data: orderUpdates } = useQuery({
    queryKey: [`/api/orders/${order.id}/updates`],
    enabled: expanded && order.status !== "completed" && order.status !== "cancelled",
  });

  const latestUpdate = orderUpdates && orderUpdates.length > 0 ? orderUpdates[0] : null;

  function getStatusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <Card className="bg-white overflow-hidden border border-neutral-200 mb-4">
      <CardHeader className="px-5 py-4 border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-900">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-neutral-500">
              Ordered on {formatDate(order.orderDate)}
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
        {expanded && orderItems && orderItems.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row md:items-center mb-4">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center">
                <i className="ri-laptop-line text-3xl text-neutral-400"></i>
              </div>
            )}
            <div className="mt-4 md:mt-0 md:ml-4">
              <h4 className="font-medium">{item.productName}</h4>
              <p className="text-sm text-neutral-600">{item.productDescription}</p>
              <p className="text-sm text-neutral-500 mt-1">
                Quantity: {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-auto text-right">
              <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
              {order.savedAmount > 0 && (
                <p className="text-sm text-success">
                  Saved {formatCurrency(order.savedAmount)} vs new
                </p>
              )}
            </div>
          </div>
        ))}

        {!isPast && order.status !== "completed" && order.status !== "cancelled" && (
          <>
            <OrderTracking status={order.status} />

            {latestUpdate && (
              <div className="mt-10 bg-blue-50 rounded-lg p-4 flex">
                <div className="mr-4 text-secondary">
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
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-end space-x-3">
          {isPast ? (
            <>
              <Button variant="outline" asChild>
                <Link href={`/orders/${order.id}`}>View Details</Link>
              </Button>
              <Button asChild>
                <Link href={`/orders/reorder/${order.id}`}>Reorder</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/support/new?orderRef={order.id}">Contact Support</Link>
              </Button>
              <Button asChild>
                <Link href={`/orders/${order.id}`}>Track Shipment</Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
