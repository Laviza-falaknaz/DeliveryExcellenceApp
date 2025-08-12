import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Orders() {
  const { orders, isLoadingOrders, getActiveOrders, getPastOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const activeOrders = getActiveOrders();
  const pastOrders = getPastOrders();

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
            className="bg-white border-neutral-300 text-neutral-900 hover:bg-[#08ABAB] hover:text-white hover:border-[#08ABAB] transition-colors"
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
                    Customer Name ↓
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Order Status ↓
                  </TableHead>
                  <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                    Expected Shipping Date ↓
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
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Skeleton className="h-4 w-32" />
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
                    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                    .map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <TableCell className="py-4 px-6 text-sm text-neutral-700">
                          {formatUKDate(order.orderDate)}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm">
                          <span className="text-primary font-medium cursor-pointer hover:underline">
                            {order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-neutral-700">
                          {order.customerName || 'N/A'}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-sm text-neutral-700">
                          {order.estimatedDeliveryDate ? formatUKDate(order.estimatedDeliveryDate) : 'TBC'}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
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

      {/* New Order Dialog - This would be more complex in a real implementation */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Contact Sales Team</DialogTitle>
            <DialogDescription>
              To place a new order for remanufactured laptops, please contact our sales team. They will guide you through the process and help you select the right products for your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Contact Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Your email" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="Your phone number" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Input id="message" placeholder="Describe your requirements" />
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsOrderDialogOpen(false);
              // In a real app, this would submit the form data
            }}>
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
