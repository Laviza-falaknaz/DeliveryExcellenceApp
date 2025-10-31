import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

// Define types for RMA with items
type RmaItem = {
  id: number;
  rmaId: number;
  serialNumber: string;
  errorDescription: string;
  receivedAtWarehouseOn: Date | null;
  solution: string | null;
  reasonForReturn: string;
  productDetails: string;
  relatedOrder: string | null;
  createdAt: Date | null;
};

type RmaWithItems = {
  rma: {
    id: number;
    userId: number;
    rmaNumber: string;
    email: string;
    status: string;
    createdAt: Date | null;
  };
  items: RmaItem[];
};

export default function RMA() {
  const [selectedRma, setSelectedRma] = useState<RmaWithItems | null>(null);
  const [isRmaDetailsOpen, setIsRmaDetailsOpen] = useState(false);
  const { toast } = useToast();

  const { data: rmas, isLoading, error: rmaError } = useQuery<RmaWithItems[]>({
    queryKey: ["/api/rma"],
  });

  const activeRmas = rmas?.filter(rma => 
    rma.rma.status !== "completed" && rma.rma.status !== "rejected"
  ) || [];
  
  const completedRmas = rmas?.filter(rma => 
    rma.rma.status === "completed" || rma.rma.status === "rejected"
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

  function handleRmaClick(rma: RmaWithItems) {
    setSelectedRma(rma);
    setIsRmaDetailsOpen(true);
  }

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">RMA Tracking</h1>
          <p className="text-neutral-600">Manage your return merchandise authorizations</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
            variant="outline"
          >
            <i className="ri-phone-line mr-2"></i>
            <span>Contact Us</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="icon-circle mb-4">
                <i className="ri-refresh-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Return Process</h3>
              <p className="text-neutral-600 text-sm mb-4">
                First verify your warranty status, then submit an RMA request for your return.
              </p>
              <Button variant="outline"  asChild>
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
              <div className="icon-circle mb-4">
                <i className="ri-shield-check-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create RMA Request</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Start a new RMA request for your device through our warranty claim form.
              </p>
              <Button variant="outline" asChild>
                <Link href="/warranty-claim">
                  Create RMA Request
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="icon-circle mb-4">
                <i className="ri-customer-service-2-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Our support team is ready to assist you with your return needs.
              </p>
              <Button variant="outline"  asChild>
                <a href="https://circularcomputing.com/contact/" target="_blank" rel="noreferrer">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">Start RMA Process</h2>

        {rmaError && (
          <Alert variant="destructive" className="mb-4">
            <i className="ri-error-warning-line h-4 w-4" />
            <AlertTitle>Error Loading RMAs</AlertTitle>
            <AlertDescription>
              Failed to load your RMA requests. Please try refreshing the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}

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
                  {activeRmas.map((rmaData) => (
                    <Card key={rmaData.rma.id} className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => handleRmaClick(rmaData)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">RMA #{rmaData.rma.rmaNumber}</h3>
                              <Badge className={`ml-3 ${getStatusColor(rmaData.rma.status)}`}>
                                {getStatusLabel(rmaData.rma.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              {rmaData.items.length} item{rmaData.items.length !== 1 ? 's' : ''} • Email: {rmaData.rma.email}
                            </p>
                            <div className="space-y-1">
                              {rmaData.items.slice(0, 3).map((item, idx) => (
                                <div key={item.id} className="text-xs bg-neutral-50 px-2 py-1 rounded space-y-0.5">
                                  <div>
                                    <span className="font-medium text-neutral-700">{item.serialNumber}</span> - {item.productDetails}
                                  </div>
                                  {item.errorDescription && (
                                    <div className="text-neutral-500">
                                      Issue: {item.errorDescription.substring(0, 50)}{item.errorDescription.length > 50 ? '...' : ''}
                                    </div>
                                  )}
                                  {item.solution ? (
                                    <div className="text-emerald-600 font-medium">
                                      Solution: {item.solution}
                                    </div>
                                  ) : (
                                    <div className="text-amber-600">
                                      Pending solution
                                    </div>
                                  )}
                                </div>
                              ))}
                              {rmaData.items.length > 3 && (
                                <p className="text-xs text-neutral-500 italic">+{rmaData.items.length - 3} more item{rmaData.items.length - 3 !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 md:ml-4 text-sm text-neutral-500">
                            {rmaData.rma.createdAt && `Created on ${formatDate(rmaData.rma.createdAt)}`}
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
                  {completedRmas.map((rmaData) => (
                    <Card key={rmaData.rma.id} className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => handleRmaClick(rmaData)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">RMA #{rmaData.rma.rmaNumber}</h3>
                              <Badge className={`ml-3 ${getStatusColor(rmaData.rma.status)}`}>
                                {getStatusLabel(rmaData.rma.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              {rmaData.items.length} item{rmaData.items.length !== 1 ? 's' : ''} • Email: {rmaData.rma.email}
                            </p>
                            <div className="space-y-1">
                              {rmaData.items.slice(0, 3).map((item, idx) => (
                                <div key={item.id} className="text-xs text-neutral-600 bg-neutral-50 px-2 py-1 rounded">
                                  <span className="font-medium">{item.serialNumber}</span> - {item.productDetails}
                                  {item.solution && <span className="text-emerald-600"> • Solution: {item.solution}</span>}
                                </div>
                              ))}
                              {rmaData.items.length > 3 && (
                                <p className="text-xs text-neutral-500 italic">+{rmaData.items.length - 3} more item{rmaData.items.length - 3 !== 1 ? 's' : ''}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 md:ml-4 text-sm text-neutral-500">
                            {rmaData.rma.createdAt && `Created on ${formatDate(rmaData.rma.createdAt)}`}
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e0f2f2] text-[#08ABAB] mb-3">
              <i className="ri-inbox-line text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-700"></h3>
            <p className="text-neutral-500 mt-2">
              Need to return or exchange a product? Create an RMA request to start the process.
            </p>
            <Button 
              className="mt-4 bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors" 
              asChild
            >
              <Link href="/warranty-claim">
                Create RMA
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* RMA's in Progress Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">RMA's in Progress</h2>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-neutral-200">
                    <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                      Created On ↓
                    </TableHead>
                    <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                      RMA No. ↓
                    </TableHead>
                    <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                      Topic ↓
                    </TableHead>
                    <TableHead className="text-left font-medium text-neutral-600 py-4 px-6 cursor-pointer hover:text-neutral-900 transition-colors">
                      RMA Status ↓
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index} className="border-b border-neutral-100">
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : rmas && rmas.filter(rma => rma.rma.status !== 'completed' && rma.rma.status !== 'rejected').length > 0 ? (
                    // Display in-progress RMAs
                    rmas.filter(rma => rma.rma.status !== 'completed' && rma.rma.status !== 'rejected')
                      .sort((a, b) => {
                        const aDate = a.rma.createdAt ? new Date(a.rma.createdAt).getTime() : 0;
                        const bDate = b.rma.createdAt ? new Date(b.rma.createdAt).getTime() : 0;
                        return bDate - aDate;
                      })
                      .map((rmaData) => {
                        const topic = rmaData.items.length > 0 ? 
                          `${rmaData.items.length} item(s) - ${rmaData.items[0].errorDescription.substring(0, 40)}...` : 
                          'No items';
                        
                        return (
                          <TableRow 
                            key={rmaData.rma.id} 
                            className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
                            onClick={() => handleRmaClick(rmaData)}
                          >
                            <TableCell className="py-4 px-6 text-sm text-neutral-700">
                              {rmaData.rma.createdAt && new Date(rmaData.rma.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })} {rmaData.rma.createdAt && new Date(rmaData.rma.createdAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-sm">
                              <span className="text-primary font-medium cursor-pointer hover:underline">
                                {rmaData.rma.rmaNumber}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-sm text-neutral-700">
                              {topic}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge className={`text-xs ${getStatusColor(rmaData.rma.status)}`}>
                                {getStatusLabel(rmaData.rma.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e0f2f2] text-[#08ABAB] mb-3">
                            <i className="ri-inbox-line text-2xl"></i>
                          </div>
                          <h3 className="text-lg font-medium text-neutral-700"></h3>
                          <p className="text-neutral-500 mt-1">
                            You don't have any active return requests at the moment.
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
      </div>

      {/* RMA Details Dialog */}
      <Dialog open={isRmaDetailsOpen} onOpenChange={setIsRmaDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedRma && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center justify-between">
                    <span>RMA #{selectedRma.rma.rmaNumber}</span>
                    <Badge className={getStatusColor(selectedRma.rma.status)}>
                      {getStatusLabel(selectedRma.rma.status)}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedRma.rma.createdAt && `Created on ${formatDate(selectedRma.rma.createdAt)}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-neutral-700">{selectedRma.rma.email}</p>
                </div>

                {/* Serial Items */}
                <div>
                  <h3 className="font-medium mb-3">Devices ({selectedRma.items.length})</h3>
                  <div className="space-y-3">
                    {selectedRma.items.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.productDetails}</p>
                              <p className="text-sm text-neutral-600">Serial: {item.serialNumber}</p>
                            </div>
                            {item.solution && (
                              <Badge variant="outline" className="ml-2">
                                {item.solution}
                              </Badge>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-neutral-700">Issue:</p>
                            <p className="text-sm text-neutral-600">{item.errorDescription}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="font-medium text-neutral-700">Reason:</p>
                              <p className="text-neutral-600">{item.reasonForReturn}</p>
                            </div>
                            {item.relatedOrder && (
                              <div>
                                <p className="font-medium text-neutral-700">Related Order:</p>
                                <p className="text-neutral-600">{item.relatedOrder}</p>
                              </div>
                            )}
                          </div>
                          
                          {item.receivedAtWarehouseOn && (
                            <div className="text-sm">
                              <p className="font-medium text-neutral-700">Received:</p>
                              <p className="text-neutral-600">{formatDate(item.receivedAtWarehouseOn)}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

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
                        {selectedRma.rma.createdAt && (
                          <p className="text-sm text-neutral-500">
                            {formatDate(selectedRma.rma.createdAt)} at {new Date(selectedRma.rma.createdAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedRma.rma.status !== "requested" && (
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

                    {(selectedRma.rma.status === "in_transit" || selectedRma.rma.status === "received" || selectedRma.rma.status === "processing" || selectedRma.rma.status === "completed") && (
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

                    {(selectedRma.rma.status === "received" || selectedRma.rma.status === "processing" || selectedRma.rma.status === "completed") && (
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

                    {(selectedRma.rma.status === "processing" || selectedRma.rma.status === "completed") && (
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

                    {selectedRma.rma.status === "completed" && (
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center">
                          <i className="ri-check-line"></i>
                        </div>
                        <div>
                          <h4 className="font-medium">RMA Completed</h4>
                          <p className="text-sm text-neutral-600">
                            Your return has been processed and completed.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedRma.rma.status === "rejected" && (
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
