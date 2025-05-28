import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Rma, Order } from "@shared/schema";
import { formatDate } from "@/lib/utils";

const serialNumberSchema = z.object({
  serialNumber: z.string().min(5, "Serial number must be at least 5 characters"),
});

const rmaSchema = z.object({
  orderId: z.coerce.number({
    required_error: "Order is required",
    invalid_type_error: "Order is required",
  }),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  notes: z.string().optional(),
});

type RmaFormValues = z.infer<typeof rmaSchema>;
type SerialNumberFormValues = z.infer<typeof serialNumberSchema>;

export default function RMA() {
  const [isNewRmaDialogOpen, setIsNewRmaDialogOpen] = useState(false);
  const [selectedRma, setSelectedRma] = useState<Rma | null>(null);
  const [isRmaDetailsOpen, setIsRmaDetailsOpen] = useState(false);
  const [isWarrantyCheckDialogOpen, setIsWarrantyCheckDialogOpen] = useState(false);
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: rmas, isLoading } = useQuery<Rma[]>({
    queryKey: ["/api/rma"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const rmaForm = useForm<RmaFormValues>({
    resolver: zodResolver(rmaSchema),
    defaultValues: {
      orderId: 0,
      reason: "",
      notes: "",
    },
  });

  const serialForm = useForm<SerialNumberFormValues>({
    resolver: zodResolver(serialNumberSchema),
    defaultValues: {
      serialNumber: "",
    },
  });

  async function onSerialSubmit(data: SerialNumberFormValues) {
    try {
      setIsSubmitting(true);
      // In a real implementation, we would call an API to fetch warranty info
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate warranty info for demo
      setWarrantyInfo({
        serialNumber: data.serialNumber,
        productName: "Circular ThinkPad T14 Gen 2",
        purchaseDate: "2024-01-15",
        warrantyEnd: "2027-01-15",
        warrantyStatus: Math.random() > 0.3 ? "Active" : "Expired", // Randomly show active or expired for demo
        additionalCoverage: "Extended Warranty with Accidental Damage Protection",
        registrationStatus: "Registered",
      });
      
      setSearchPerformed(true);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to retrieve warranty information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(data: RmaFormValues) {
    try {
      await apiRequest("POST", "/api/rma", data);
      queryClient.invalidateQueries({ queryKey: ["/api/rma"] });
      
      toast({
        title: "RMA Request Submitted",
        description: "Your return request has been submitted successfully after troubleshooting. Our team will contact you shortly.",
      });
      
      rmaForm.reset();
      setIsNewRmaDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your RMA request. Please try again.",
        variant: "destructive",
      });
    }
  }

  const activeRmas = rmas?.filter(rma => 
    rma.status !== "completed" && rma.status !== "rejected"
  ) || [];
  
  const completedRmas = rmas?.filter(rma => 
    rma.status === "completed" || rma.status === "rejected"
  ) || [];

  function getStatusColor(status: string): string {
    switch (status) {
      case "requested":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "received":
        return "bg-indigo-100 text-indigo-800";
      case "processing":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-neutral-100 text-neutral-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  }

  function getStatusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function handleRmaClick(rma: Rma) {
    setSelectedRma(rma);
    setIsRmaDetailsOpen(true);
  }

  // Get eligible orders for RMA (not cancelled or returned)
  const eligibleOrders = orders?.filter(
    order => order.status !== "cancelled" && order.status !== "returned"
  ) || [];

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">RMA Tracking</h1>
          <p className="text-neutral-600">Manage your return merchandise authorizations</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsWarrantyCheckDialogOpen(true)}>
            <i className="ri-add-line mr-2"></i>
            <span>New RMA Request</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                <i className="ri-refresh-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Return Process</h3>
              <p className="text-neutral-600 text-sm mb-4">
                First verify your warranty status, then submit an RMA request for your return.
              </p>
              <Button variant="outline" asChild>
                <a href="https://circularcomputing.com/warranty/uk/" target="_blank" rel="noreferrer">
                  View Return Policy
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <i className="ri-recycle-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Sustainable Returns</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Our circular process ensures that returned laptops are properly remanufactured or recycled.
              </p>
              <Button variant="outline" asChild>
                <a href="https://www.circularcomputing.com/sustainability/" target="_blank" rel="noreferrer">
                  Learn More
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 mb-4">
                <i className="ri-shield-check-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Check Warranty</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Verify your product's warranty status before starting the RMA process.
              </p>
              <Button onClick={() => setIsWarrantyCheckDialogOpen(true)}>
                Check Warranty Status
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <i className="ri-customer-service-2-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Our support team is ready to assist you with your return needs.
              </p>
              <Button variant="outline" asChild>
                <a href="https://circularcomputing.com/contact/" target="_blank" rel="noreferrer">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">Your RMA Requests</h2>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : rmas && rmas.length > 0 ? (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active RMAs ({activeRmas.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed RMAs ({completedRmas.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              {activeRmas.length > 0 ? (
                <div className="space-y-4">
                  {activeRmas.map((rma) => (
                    <Card key={rma.id} className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => handleRmaClick(rma)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">RMA #{rma.rmaNumber}</h3>
                              <Badge className={`ml-3 ${getStatusColor(rma.status)}`}>
                                {getStatusLabel(rma.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600">
                              Order #{orders?.find(o => o.id === rma.orderId)?.orderNumber || rma.orderId}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-neutral-500">
                            Requested on {formatDate(rma.requestDate)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-medium text-neutral-700">No active RMAs</h3>
                  <p className="text-neutral-500 mt-2">You don't have any active return requests at the moment.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed">
              {completedRmas.length > 0 ? (
                <div className="space-y-4">
                  {completedRmas.map((rma) => (
                    <Card key={rma.id} className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => handleRmaClick(rma)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">RMA #{rma.rmaNumber}</h3>
                              <Badge className={`ml-3 ${getStatusColor(rma.status)}`}>
                                {getStatusLabel(rma.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600">
                              Order #{orders?.find(o => o.id === rma.orderId)?.orderNumber || rma.orderId}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-neutral-500">
                            {rma.completionDate 
                              ? `Completed on ${formatDate(rma.completionDate)}`
                              : `Requested on ${formatDate(rma.requestDate)}`
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-medium text-neutral-700">No completed RMAs</h3>
                  <p className="text-neutral-500 mt-2">You don't have any completed return requests yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <i className="ri-inbox-line text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-700">No RMA requests yet</h3>
            <p className="text-neutral-500 mt-2">
              Need to return or exchange a product? Create an RMA request to start the process.
            </p>
            <Button className="mt-4" onClick={() => setIsWarrantyCheckDialogOpen(true)}>
              Create Your First RMA
            </Button>
          </div>
        )}
      </div>

      {/* Warranty Check Dialog */}
      <Dialog open={isWarrantyCheckDialogOpen} onOpenChange={setIsWarrantyCheckDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Warranty Verification</DialogTitle>
            <DialogDescription>
              Before proceeding with an RMA request, please verify your product's warranty status.
            </DialogDescription>
          </DialogHeader>

          {!searchPerformed ? (
            <Form {...serialForm}>
              <form onSubmit={serialForm.handleSubmit(onSerialSubmit)} className="space-y-4">
                <FormField
                  control={serialForm.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="e.g. CC21XG45T" {...field} />
                        </FormControl>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Checking..." : "Check"}
                        </Button>
                      </div>
                      <FormDescription>
                        The serial number can be found on the bottom of your laptop or in the system information.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <>
              {warrantyInfo ? (
                <div className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Warranty Status</h3>
                      <Badge 
                        variant={warrantyInfo.warrantyStatus === "Active" ? "default" : "secondary"} 
                        className={warrantyInfo.warrantyStatus === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                      >
                        {warrantyInfo.warrantyStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500">Product</h4>
                        <p className="text-base">{warrantyInfo.productName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500">Serial Number</h4>
                        <p className="text-base">{warrantyInfo.serialNumber}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500">Purchase Date</h4>
                        <p className="text-base">{new Date(warrantyInfo.purchaseDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500">Warranty End Date</h4>
                        <p className="text-base">{new Date(warrantyInfo.warrantyEnd).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {warrantyInfo.warrantyStatus === "Active" ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">
                            <i className="ri-check-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-green-800">Warranty Active</h4>
                            <p className="text-sm text-green-700 mb-2">
                              Your product is under warranty and eligible for an RMA request.
                            </p>
                            <a 
                              href="https://my-warranty.com/troubleshoot/" 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-sm text-green-700 underline hover:text-green-800"
                            >
                              Try our troubleshooting guide before starting RMA
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 mr-3">
                            <i className="ri-close-line"></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-red-800">Warranty Expired</h4>
                            <p className="text-sm text-red-700 mb-2">
                              Your product's warranty has expired. You may still submit an RMA request, but repair services may incur additional charges.
                            </p>
                            <a 
                              href="https://my-warranty.com/troubleshoot/" 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-sm text-red-700 underline hover:text-red-800"
                            >
                              Try our troubleshooting guide first
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => {
                      setSearchPerformed(false);
                      setWarrantyInfo(null);
                      serialForm.reset();
                    }}>
                      Check Another Product
                    </Button>
                    <Button 
                      onClick={() => {
                        window.open('https://my-warranty.com/troubleshoot/', '_blank');
                        setIsWarrantyCheckDialogOpen(false);
                        setIsNewRmaDialogOpen(true);
                      }}
                    >
                      Start RMA Process
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="py-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <i className="ri-error-warning-line"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Warranty Information Found</h3>
                    <p className="text-neutral-600 text-center mb-4">
                      We couldn't find warranty information for the specified serial number. Please double-check the number and try again.
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchPerformed(false);
                      serialForm.reset();
                    }}>
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New RMA Dialog */}
      <Dialog open={isNewRmaDialogOpen} onOpenChange={setIsNewRmaDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Complete RMA Request</DialogTitle>
            <DialogDescription>
              After reviewing the troubleshooting guide, please provide details for your return or exchange request. Our team will evaluate your request and contact you with further instructions.
            </DialogDescription>
          </DialogHeader>

          <Form {...rmaForm}>
            <form onSubmit={rmaForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={rmaForm.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Order</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order for return" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eligibleOrders.length > 0 ? (
                          eligibleOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id.toString()}>
                              #{order.orderNumber} ({formatDate(order.orderDate)})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No eligible orders found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rmaForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Return</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please explain why you're returning this order"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rmaForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information that might be helpful"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewRmaDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Complete RMA Request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* RMA Details Dialog */}
      <Dialog open={isRmaDetailsOpen} onOpenChange={setIsRmaDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedRma && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center justify-between">
                    <span>RMA #{selectedRma.rmaNumber}</span>
                    <Badge className={getStatusColor(selectedRma.status)}>
                      {getStatusLabel(selectedRma.status)}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Requested on {formatDate(selectedRma.requestDate)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-1">Order</h3>
                  <p>#{orders?.find(o => o.id === selectedRma.orderId)?.orderNumber || selectedRma.orderId}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Reason for Return</h3>
                  <p className="text-neutral-700 whitespace-pre-line">{selectedRma.reason}</p>
                </div>

                {selectedRma.notes && (
                  <div>
                    <h3 className="font-medium mb-1">Additional Notes</h3>
                    <p className="text-neutral-700 whitespace-pre-line">{selectedRma.notes}</p>
                  </div>
                )}

                {/* RMA Status Timeline */}
                <div className="mt-6 py-4 border-t border-neutral-200">
                  <h3 className="font-medium mb-3">RMA Status</h3>

                  <div className="relative">
                    <div className="absolute left-3 top-0 h-full w-0.5 bg-neutral-200"></div>

                    <div className="relative pl-8 pb-6">
                      <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                        <i className="ri-check-line"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">RMA Requested</h4>
                        <p className="text-sm text-neutral-500">
                          {formatDate(selectedRma.requestDate)} at {new Date(selectedRma.requestDate).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {selectedRma.status !== "requested" && (
                      <div className="relative pl-8 pb-6">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">RMA Approved</h4>
                          <p className="text-sm text-neutral-600">
                            Our team has approved your RMA request and provided return instructions.
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedRma.status === "in_transit" || selectedRma.status === "received" || selectedRma.status === "processing" || selectedRma.status === "completed") && (
                      <div className="relative pl-8 pb-6">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">Return In Transit</h4>
                          <p className="text-sm text-neutral-600">
                            Your return is on its way to our facility.
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedRma.status === "received" || selectedRma.status === "processing" || selectedRma.status === "completed") && (
                      <div className="relative pl-8 pb-6">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">Return Received</h4>
                          <p className="text-sm text-neutral-600">
                            We have received your return at our facility.
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedRma.status === "processing" || selectedRma.status === "completed") && (
                      <div className="relative pl-8 pb-6">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">Processing Return</h4>
                          <p className="text-sm text-neutral-600">
                            We are processing your return and preparing any replacement or refund.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRma.status === "completed" && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">RMA Completed</h4>
                          <p className="text-sm text-neutral-600">
                            Your return has been processed and completed.
                          </p>
                          {selectedRma.completionDate && (
                            <p className="text-sm text-neutral-500">
                              {formatDate(selectedRma.completionDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRma.status === "rejected" && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <i className="ri-close-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">RMA Rejected</h4>
                          <p className="text-sm text-neutral-600">
                            Your RMA request has been declined. Please contact customer support for more information.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRmaDetailsOpen(false)}>
                  Close
                </Button>
                <Button asChild>
                  <a href="https://circularcomputing.com/contact/" target="_blank" rel="noreferrer">Contact Support</a>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
