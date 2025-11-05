import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Order, OrderItem, OrderUpdate, DeliveryTimeline } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Download, FileText, Package, Hash, FileCheck, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/currency";
import { EnvironmentalImpact } from "@shared/schema";

export default function Orders() {
  const { orders, isLoadingOrders, getActiveOrders, getPastOrders } = useOrders();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [attachmentFilter, setAttachmentFilter] = useState<string>("all");

  const activeOrders = getActiveOrders();
  const pastOrders = getPastOrders();

  // Fetch order items for selected order
  const { data: orderItems = [], isLoading: isLoadingItems } = useQuery<OrderItem[]>({
    queryKey: [`/api/orders/${selectedOrder?.id}/items`],
    enabled: !!selectedOrder && isOrderDetailsOpen,
  });

  // Fetch order updates for timeline
  const { data: orderUpdates = [], isLoading: isLoadingUpdates } = useQuery<OrderUpdate[]>({
    queryKey: [`/api/orders/${selectedOrder?.id}/updates`],
    enabled: !!selectedOrder && isOrderDetailsOpen,
  });

  // Fetch delivery timeline for animated timeline
  const { data: deliveryTimeline, isLoading: isLoadingTimeline } = useQuery<DeliveryTimeline>({
    queryKey: [`/api/orders/${selectedOrder?.id}/timeline`],
    enabled: !!selectedOrder && isOrderDetailsOpen,
  });

  // Fetch environmental impact for the order
  const { data: environmentalImpact } = useQuery<EnvironmentalImpact>({
    queryKey: [`/api/orders/${selectedOrder?.id}/environmental-impact`],
    enabled: !!selectedOrder && isOrderDetailsOpen,
  });

  // Filter orders based on search term and status
  function filterOrders(ordersList: Order[]) {
    return ordersList.filter(order => {
      const matchesSearch = searchTerm === "" || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === null || statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  const filteredActiveOrders = filterOrders(activeOrders);
  const filteredPastOrders = filterOrders(pastOrders);

  // Format date to UK format DD/MM/YY
  function formatUKDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

  // Get status color based on order status
  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "in_production":
        return "bg-orange-100 text-orange-800";
      case "quality_check":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-neutral-100 text-neutral-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  }

  // Format status label
  function getStatusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Open order details dialog
  function handleViewOrderDetails(order: Order) {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  }

  // Calculate total paid from order items
  function calculateOrderTotal() {
    return orderItems.reduce((sum, item) => sum + parseFloat(item.totalPrice || "0"), 0);
  }

  // Mock attachments data (in real app, this would come from API)
  const attachments = [
    { id: 1, type: "invoice", name: "Invoice.pdf", url: "#" },
    { id: 2, type: "packing_list", name: "Packing List.pdf", url: "#" },
    { id: 3, type: "hashcodes", name: "Hashcodes.txt", url: "#" },
    { id: 4, type: "credit_note", name: "Credit Note.pdf", url: "#" },
  ];

  const filteredAttachments = attachmentFilter === "all" 
    ? attachments 
    : attachments.filter(a => a.type === attachmentFilter);

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Your Orders</h1>
          <p className="text-neutral-600">
            Track your remanufactured laptop orders and their environmental impact
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
            variant="outline"
            className="bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
          >
            <i className="ri-phone-line mr-2"></i>
            <span>Contact Us</span>
          </Button>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-neutral-200 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="w-full md:w-1/3">
          <Label htmlFor="search" className="sr-only">Search Orders</Label>
          <Input 
            id="search"
            type="text" 
            placeholder="Search by order number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/3">
          <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
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
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm("");
            setStatusFilter(null);
          }}
          className="w-full md:w-auto"
        >
          Clear Filters
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-neutral-200">
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Order Date ↓
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Order Number ↓
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Order Status ↓
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6">
                    Currency
                  </TableHead>
                  <TableHead className="text-right font-medium text-neutral-600 py-4 px-6">
                    Total Amount
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Expected Shipping Date ↓
                  </TableHead>
                  <TableHead className="text-center font-medium text-neutral-600 py-4 px-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOrders ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-b border-neutral-100">
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : orders && orders.length > 0 ? (
                  // Display orders
                  orders
                    .filter(order => {
                      const matchesSearch = searchTerm === "" || 
                        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === null || statusFilter === "all" || order.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .sort((a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime())
                    .map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                      >
                        <TableCell className="py-4 px-6 text-sm text-neutral-700">
                          {order.orderDate ? formatUKDate(order.orderDate) : 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm">
                          <span className="text-primary font-medium cursor-pointer hover:underline">
                            {order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm font-medium text-neutral-700">
                          {order.currency || 'GBP'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm font-semibold text-right text-neutral-900">
                          {formatPrice(order.totalAmount, order.currency)}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-neutral-700">
                          {order.estimatedDelivery ? formatUKDate(order.estimatedDelivery) : 'TBC'}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-[#08ABAB] hover:text-white transition-colors"
                            onClick={() => handleViewOrderDetails(order)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e0f2f2] text-[#08ABAB] mb-3">
                          <i className="ri-inbox-line text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-neutral-700">No orders yet</h3>
                        <p className="text-neutral-500 mt-1">
                          Start by placing your first order to track your sustainable impact.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedOrder?.orderNumber}</DialogTitle>
                <DialogDescription className="mt-1">
                  {selectedOrder?.orderDate && `Ordered on ${formatUKDate(selectedOrder.orderDate)}`}
                </DialogDescription>
              </div>
              {selectedOrder && (
                <Badge className={`${getStatusColor(selectedOrder.status)} text-sm px-3 py-1`}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
              {/* Left Column - Customer Details & Attachments */}
              <div className="lg:col-span-1 space-y-6">
                {/* Customer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-neutral-500">Dispatch Date</Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedOrder?.orderDate ? formatUKDate(selectedOrder.orderDate) : 'TBC'}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-xs text-neutral-500">Shipping Address</Label>
                      {selectedOrder?.shippingAddress ? (
                        <div className="text-sm mt-1">
                          <p>{selectedOrder.shippingAddress.street}</p>
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                          <p>{selectedOrder.shippingAddress.zipCode}</p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-400 mt-1">Not available</p>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-xs text-neutral-500">Delivery Tracking Code</Label>
                      <p className="text-sm font-medium mt-1">
                        {selectedOrder?.trackingNumber || 'Not available yet'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Attachments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={attachmentFilter} onValueChange={setAttachmentFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter attachments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Attachments</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="packing_list">Packing List</SelectItem>
                        <SelectItem value="hashcodes">Hashcodes</SelectItem>
                        <SelectItem value="credit_note">Credit Note</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="space-y-2">
                      {filteredAttachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {attachment.type === 'invoice' && <FileText className="h-4 w-4 text-blue-600" />}
                            {attachment.type === 'packing_list' && <Package className="h-4 w-4 text-green-600" />}
                            {attachment.type === 'hashcodes' && <Hash className="h-4 w-4 text-purple-600" />}
                            {attachment.type === 'credit_note' && <FileCheck className="h-4 w-4 text-orange-600" />}
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Order Details & Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Products */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingItems ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : orderItems.length > 0 ? (
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orderItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{item.productName}</p>
                                    <p className="text-xs text-neutral-500">{item.productDescription}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">x{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatPrice(item.unitPrice, selectedOrder?.currency)}</TableCell>
                                <TableCell className="text-right font-medium">{formatPrice(item.totalPrice, selectedOrder?.currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatPrice(calculateOrderTotal(), selectedOrder?.currency)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium text-lg">
                            <span>Total Paid by Customer</span>
                            <span>{selectedOrder ? formatPrice(selectedOrder.totalAmount, selectedOrder.currency) : formatPrice(0)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm">Payment Status</span>
                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-neutral-500 text-center py-4">No items found</p>
                    )}
                  </CardContent>
                </Card>

                {/* Delivery Journey Link */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 space-y-4">
                      <p className="text-neutral-600">
                        Track your order's sustainable journey with our interactive timeline
                      </p>
                      <Button
                        onClick={() => {
                          setIsOrderDetailsOpen(false);
                          setLocation(`/orders/${selectedOrder?.id}/journey`);
                        }}
                        className="w-full"
                        data-testid="button-view-journey"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View Full Journey Timeline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
