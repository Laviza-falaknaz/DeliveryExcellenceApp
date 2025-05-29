import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import OrderCard from "@/components/dashboard/order-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      
      const matchesStatus = statusFilter === null || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  const filteredActiveOrders = filterOrders(activeOrders);
  const filteredPastOrders = filterOrders(pastOrders);

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Orders</h1>
          <p className="text-neutral-600">
            Track your remanufactured laptop orders and their environmental impact
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsOrderDialogOpen(true)}>
            <i className="ri-add-line mr-2"></i>
            <span>New Order</span>
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

      {isLoadingOrders ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="past">Past Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {filteredActiveOrders.length > 0 ? (
              filteredActiveOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                <h3 className="font-medium text-neutral-700">No active orders found</h3>
                <p className="text-neutral-500 mt-2">
                  {searchTerm || statusFilter 
                    ? "Try changing your search or filter criteria"
                    : "You don't have any active orders at the moment"}
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {filteredPastOrders.length > 0 ? (
              filteredPastOrders.map((order) => (
                <OrderCard key={order.id} order={order} isPast={true} />
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                <h3 className="font-medium text-neutral-700">No past orders found</h3>
                <p className="text-neutral-500 mt-2">
                  {searchTerm || statusFilter 
                    ? "Try changing your search or filter criteria"
                    : "You don't have any completed orders yet"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
            <i className="ri-inbox-line text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-700">No orders yet</h3>
          <p className="text-neutral-500 mt-2">Start by placing your first order to track your sustainable impact.</p>
          <Button className="mt-4" onClick={() => setIsOrderDialogOpen(true)}>
            Place Your First Order
          </Button>
        </div>
      )}

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
