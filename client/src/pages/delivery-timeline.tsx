import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrders } from "@/hooks/use-orders";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Check, Clock, ArrowRight, ExternalLink, Phone, MessageSquare, Package, Truck, Shield, FileText, Star, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { DeliveryTimeline, Order } from "@shared/schema";

interface TimelineStage {
  key: keyof DeliveryTimeline;
  label: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  actionUrl?: string;
  completed: boolean;
}

export default function DeliveryTimelinePage() {
  const { getMostRecentActiveOrder } = useOrders();
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const recentOrder = getMostRecentActiveOrder();
  const currentOrderId = selectedOrderId || recentOrder?.id;
  
  // Always show timeline regardless of order status
  const displayOrderId = currentOrderId || 1;

  const { data: timeline, isLoading } = useQuery({
    queryKey: ["/api/delivery-timeline", displayOrderId],
    enabled: false, // Disable API call for now, show static timeline
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async (updates: Partial<DeliveryTimeline>) => {
      return apiRequest(`/api/delivery-timeline/${displayOrderId}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-timeline"] });
    },
  });

  const createTimelineMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest("/api/delivery-timeline", "POST", { orderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/delivery-timeline"] });
    },
  });

  const getTimelineStages = (timeline: DeliveryTimeline | undefined): TimelineStage[] => [
    {
      key: "orderPlaced",
      label: "Order Placed",
      description: "Your order has been received and confirmed",
      icon: <CheckCircle2 className="w-6 h-6" />,
      completed: timeline?.orderPlaced || false,
    },
    {
      key: "customerSuccessCallBooked",
      label: "Customer Success Call Booked",
      description: "Schedule your onboarding call with our team",
      icon: <Phone className="w-6 h-6" />,
      actionLabel: "Book Call",
      actionUrl: "https://calendly.com/circular-computing",
      completed: timeline?.customerSuccessCallBooked || false,
    },
    {
      key: "rateYourExperience",
      label: "Rate Your Experience",
      description: "Share feedback about your ordering experience",
      icon: <Star className="w-6 h-6" />,
      actionLabel: "Leave Review",
      actionUrl: "/feedback",
      completed: timeline?.rateYourExperience || false,
    },
    {
      key: "customerSuccessIntroCall",
      label: "Customer Success Intro Call",
      description: "Introduction call with your customer success manager",
      icon: <Phone className="w-6 h-6" />,
      completed: timeline?.customerSuccessIntroCall || false,
    },
    {
      key: "orderInProgress",
      label: "Order In Progress",
      description: "Your order is being processed and prepared",
      icon: <Clock className="w-6 h-6" />,
      completed: timeline?.orderInProgress || false,
    },
    {
      key: "orderBeingBuilt",
      label: "Order Being Built",
      description: "Your devices are being remanufactured",
      icon: <Settings className="w-6 h-6" />,
      completed: timeline?.orderBeingBuilt || false,
    },
    {
      key: "qualityChecks",
      label: "Quality Checks",
      description: "Comprehensive quality testing in progress",
      icon: <Shield className="w-6 h-6" />,
      completed: timeline?.qualityChecks || false,
    },
    {
      key: "readyForDelivery",
      label: "Ready for Delivery",
      description: "Your devices are packaged and ready for shipment",
      icon: <Package className="w-6 h-6" />,
      completed: timeline?.readyForDelivery || false,
    },
    {
      key: "orderDelivered",
      label: "Order Delivered",
      description: "Your order has been successfully delivered",
      icon: <Truck className="w-6 h-6" />,
      actionLabel: "Track Package",
      actionUrl: "/orders",
      completed: timeline?.orderDelivered || false,
    },
    {
      key: "rateYourProduct",
      label: "Rate Your Product",
      description: "Share feedback about your remanufactured devices",
      icon: <Star className="w-6 h-6" />,
      actionLabel: "Leave Review",
      actionUrl: "/feedback",
      completed: timeline?.rateYourProduct || false,
    },
    {
      key: "customerSuccessCallBookedPost",
      label: "Post-Delivery Customer Success Call",
      description: "Schedule follow-up call after delivery",
      icon: <Phone className="w-6 h-6" />,
      actionLabel: "Book Call",
      actionUrl: "https://calendly.com/circular-computing",
      completed: timeline?.customerSuccessCallBookedPost || false,
    },
    {
      key: "customerSuccessCheckIn",
      label: "Customer Success Check-in",
      description: "Regular check-in with customer success team",
      icon: <MessageSquare className="w-6 h-6" />,
      completed: timeline?.customerSuccessCheckIn || false,
    },
    {
      key: "orderCompleted",
      label: "Order Completed",
      description: "Your order process is fully completed",
      icon: <CheckCircle2 className="w-6 h-6" />,
      completed: timeline?.orderCompleted || false,
    },
  ];

  const stages = getTimelineStages(timeline as DeliveryTimeline);
  const completedStages = stages.filter(stage => stage.completed).length;
  const progressPercentage = Math.round((completedStages / stages.length) * 100);

  const handleStageAction = async (stage: TimelineStage) => {
    if (stage.actionUrl) {
      if (stage.actionUrl.startsWith("http")) {
        window.open(stage.actionUrl, "_blank");
      } else {
        window.location.href = stage.actionUrl;
      }
      
      // Mark as completed when action is taken
      if (!stage.completed) {
        updateTimelineMutation.mutate({
          [stage.key]: true,
        });
      }
    }
  };



  if (!currentOrderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No active orders found. Place an order to track your delivery timeline.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Delivery Timeline</h1>
        <p className="text-muted-foreground">Track your order progress through our comprehensive delivery process</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#08ABAB]" />
            Order Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completedStages} of {stages.length} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#08ABAB] h-3 rounded-full transition-width duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span className="font-medium text-[#08ABAB]">{progressPercentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Timeline Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Follow your order through our 13-stage delivery process with CRM integration
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stages.map((stage, index) => (
              <div key={stage.key} className="relative">
                {/* Connecting line */}
                {index < stages.length - 1 && (
                  <div 
                    className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"
                    style={{
                      backgroundColor: stage.completed ? "#08ABAB" : "#e5e7eb"
                    }}
                  />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Cog Icon */}
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
                    ${stage.completed 
                      ? 'bg-[#08ABAB] border-[#08ABAB] text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    {stage.completed ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Settings className="w-6 h-6" />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${stage.completed ? 'text-[#08ABAB]' : 'text-gray-900'}`}>
                          {stage.label}
                        </h3>
                        {stage.completed && (
                          <Badge variant="secondary" className="bg-[#08ABAB]/10 text-[#08ABAB] border-[#08ABAB]/20">
                            Completed
                          </Badge>
                        )}
                      </div>
                      
                      {!stage.completed && (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {stage.description}
                    </p>

                    {/* Action Button */}
                    {stage.actionLabel && stage.actionUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageAction(stage)}
                        className="text-[#08ABAB] border-[#08ABAB] hover:bg-[#08ABAB] hover:text-white"
                      >
                        {stage.actionLabel}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CRM Integration Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#08ABAB]" />
            CRM Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${(timeline as any)?.customerSuccessCheckIn ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="font-medium">MS Diagnostics CRM</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {(timeline as any)?.customerSuccessCheckIn ? 'Connected and syncing' : 'Integration in progress'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${(timeline as any)?.orderCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="font-medium">MS Teams Deployment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {(timeline as any)?.orderCompleted ? 'Deployment complete' : 'Deployment in progress'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {completedStages < stages.length && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <ArrowRight className="w-5 h-5 text-[#08ABAB] mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {stages.find(stage => !stage.completed)?.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stages.find(stage => !stage.completed)?.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}