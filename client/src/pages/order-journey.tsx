import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import OrderJourney from "@/components/dashboard/order-journey";
import { EnvironmentalImpact, Order, DeliveryTimeline } from "@shared/schema";

export default function OrderJourneyPage() {
  const [, params] = useRoute("/orders/:id/journey");
  const [, setLocation] = useLocation();
  const orderId = params?.id ? parseInt(params.id) : null;

  const { data: order, isLoading: orderLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  const { data: deliveryTimeline } = useQuery<DeliveryTimeline>({
    queryKey: [`/api/orders/${orderId}/timeline`],
    enabled: !!orderId,
  });

  const { data: environmentalImpact } = useQuery<EnvironmentalImpact>({
    queryKey: [`/api/orders/${orderId}/environmental-impact`],
    enabled: !!orderId,
  });

  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order journey...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Order Not Found</h1>
          <Button onClick={() => setLocation("/orders")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-emerald-50/30 to-teal-50/30">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/orders")}
                data-testid="button-back-to-orders"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <div className="h-8 w-px bg-neutral-200" />
              <div>
                <h1 className="text-xl font-bold text-neutral-900">
                  Order Journey: {order.orderNumber}
                </h1>
                <p className="text-sm text-neutral-600">
                  Track your sustainable delivery progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {deliveryTimeline ? (
          <OrderJourney 
            timeline={deliveryTimeline} 
            environmentalImpact={environmentalImpact ? {
              carbonSaved: environmentalImpact.carbonSaved,
              waterProvided: environmentalImpact.waterProvided,
              mineralsSaved: environmentalImpact.mineralsSaved,
            } : undefined}
          />
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-neutral-200">
            <p className="text-neutral-600 mb-4">
              No delivery timeline available for this order yet.
            </p>
            <p className="text-sm text-neutral-500">
              Timeline information will appear once your order enters the fulfillment process.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
