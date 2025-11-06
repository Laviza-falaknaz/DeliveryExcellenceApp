import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Send, XCircle, PackageOpen, PackageX, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function RMAManagement() {
  const { toast } = useToast();
  const [editingRma, setEditingRma] = useState<any>(null);
  const [viewingRma, setViewingRma] = useState<any>(null);
  const [viewingRequest, setViewingRequest] = useState<any>(null);

  const { data: rmas, isLoading: isLoadingRmas } = useQuery({
    queryKey: ["/api/admin/rmas"],
  });

  const { data: rmaRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/admin/rma-requests"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const toggleRmaActiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/rmas/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rmas"] });
      toast({ 
        title: variables.status === "completed" ? "RMA activated" : "RMA deactivated",
      });
    },
    onError: () => {
      toast({ title: "Failed to update RMA status", variant: "destructive" });
    },
  });

  const updateRmaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PATCH", `/api/admin/rmas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rmas"] });
      setEditingRma(null);
      toast({ title: "RMA updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update RMA", variant: "destructive" });
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/admin/rma-requests/${id}`, { status: "declined" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rma-requests"] });
      toast({ 
        title: "Request Declined",
        description: "RMA request has been declined"
      });
    },
    onError: () => {
      toast({ title: "Failed to decline request", variant: "destructive" });
    },
  });

  const resendRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      // TODO: Implement actual email sending
      return apiRequest("POST", `/api/admin/rma-requests/${id}/resend`, {});
    },
    onSuccess: () => {
      toast({ 
        title: "Email Sent",
        description: "RMA request details have been emailed to the configured addresses"
      });
    },
    onError: () => {
      toast({ title: "Failed to send email", variant: "destructive" });
    },
  });

  const handleUserChange = (userId: number) => {
    if (!editingRma) return;
    
    updateRmaMutation.mutate({
      id: editingRma.id,
      data: { userId },
    });
  };

  const handleDeclineRequest = (requestId: number) => {
    if (confirm("Are you sure you want to decline this RMA request?")) {
      declineRequestMutation.mutate(requestId);
    }
  };

  const handleResendRequest = (requestId: number) => {
    if (confirm("Send RMA request details to configured notification emails?")) {
      resendRequestMutation.mutate(requestId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RMA Management</CardTitle>
        <CardDescription>Manage active RMAs and pending requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active-rmas" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active-rmas" data-testid="tab-active-rmas">
              Active RMAs ({rmas?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending-requests" data-testid="tab-pending-requests">
              Pending Requests ({rmaRequests?.filter((r: any) => r.status === 'submitted').length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-rmas" className="mt-4">
            {isLoadingRmas ? (
              <p>Loading RMAs...</p>
            ) : rmas && rmas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RMA Number</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rmas.map((rma: any) => {
                    const rmaUser = users?.find((u: any) => u.id === rma.userId);
                    const isActive = rma.status !== "rejected" && rma.status !== "completed";
                    return (
                      <TableRow key={rma.id} data-testid={`row-rma-${rma.id}`}>
                        <TableCell data-testid={`text-rma-number-${rma.id}`}>
                          {rma.rmaNumber}
                        </TableCell>
                        <TableCell data-testid={`text-user-${rma.id}`}>
                          {rmaUser?.name || `User #${rma.userId}`}
                        </TableCell>
                        <TableCell data-testid={`text-email-${rma.id}`}>
                          {rma.email}
                        </TableCell>
                        <TableCell data-testid={`text-status-${rma.id}`}>
                          <Badge variant="outline">
                            {rma.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${rma.id}`}>
                          {new Date(rma.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-testid={`text-active-${rma.id}`}>
                          <Badge variant={isActive ? "default" : "destructive"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View RMA details"
                              onClick={() => setViewingRma(rma)}
                              data-testid={`button-view-${rma.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={isActive ? "Deactivate RMA" : "Activate RMA"}
                              onClick={() => toggleRmaActiveMutation.mutate({ 
                                id: rma.id, 
                                status: isActive ? "completed" : "approved" 
                              })}
                              disabled={toggleRmaActiveMutation.isPending}
                              data-testid={`button-toggle-active-${rma.id}`}
                            >
                              {isActive ? 
                                <PackageX className="h-4 w-4 text-red-600" /> : 
                                <PackageOpen className="h-4 w-4 text-green-600" />
                              }
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRma(rma)}
                              data-testid={`button-switch-user-${rma.id}`}
                            >
                              Switch User
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">No active RMAs found</p>
            )}
          </TabsContent>

          <TabsContent value="pending-requests" className="mt-4">
            {isLoadingRequests ? (
              <p>Loading RMA requests...</p>
            ) : rmaRequests && rmaRequests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Number</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rmaRequests.map((request: any) => (
                    <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                      <TableCell data-testid={`text-request-number-${request.id}`}>
                        {request.requestNumber}
                      </TableCell>
                      <TableCell data-testid={`text-name-${request.id}`}>
                        {request.fullName}
                      </TableCell>
                      <TableCell data-testid={`text-company-${request.id}`}>
                        {request.companyName}
                      </TableCell>
                      <TableCell data-testid={`text-email-${request.id}`}>
                        {request.email}
                      </TableCell>
                      <TableCell data-testid={`text-product-${request.id}`}>
                        {request.productMakeModel}
                      </TableCell>
                      <TableCell data-testid={`text-status-${request.id}`}>
                        <Badge variant={request.status === "submitted" ? "outline" : request.status === "approved" ? "default" : "destructive"}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-date-${request.id}`}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View request details"
                            onClick={() => setViewingRequest(request)}
                            data-testid={`button-view-request-${request.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Resend via email"
                            onClick={() => handleResendRequest(request.id)}
                            disabled={resendRequestMutation.isPending}
                            data-testid={`button-resend-${request.id}`}
                          >
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                          {request.status === "submitted" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Decline request"
                              onClick={() => handleDeclineRequest(request.id)}
                              disabled={declineRequestMutation.isPending}
                              data-testid={`button-decline-request-${request.id}`}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">No RMA requests found</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {editingRma && (
        <Dialog open={!!editingRma} onOpenChange={() => setEditingRma(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Switch User for RMA {editingRma.rmaNumber}</DialogTitle>
              <DialogDescription>
                Select a new user to assign this RMA to
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-select">User</Label>
                <Select
                  defaultValue={editingRma.userId.toString()}
                  onValueChange={(value) => handleUserChange(parseInt(value))}
                >
                  <SelectTrigger id="user-select" data-testid="select-new-user">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {viewingRma && (
        <Dialog open={!!viewingRma} onOpenChange={() => setViewingRma(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>RMA Details - {viewingRma.rmaNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">User</Label>
                  <p className="text-sm">
                    {users?.find((u: any) => u.id === viewingRma.userId)?.name || `User #${viewingRma.userId}`}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="text-sm">{viewingRma.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <p className="text-sm">{viewingRma.status.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Created</Label>
                  <p className="text-sm">{new Date(viewingRma.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {viewingRequest && (
        <Dialog open={!!viewingRequest} onOpenChange={() => setViewingRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>RMA Request Details - {viewingRequest.requestNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Full Name</Label>
                  <p className="text-sm">{viewingRequest.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Company</Label>
                  <p className="text-sm">{viewingRequest.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="text-sm">{viewingRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Phone</Label>
                  <p className="text-sm">{viewingRequest.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Address</Label>
                  <p className="text-sm">{viewingRequest.address}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Delivery Address</Label>
                  <p className="text-sm">{viewingRequest.deliveryAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Product Make/Model</Label>
                  <p className="text-sm">{viewingRequest.productMakeModel}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Number of Products</Label>
                  <p className="text-sm">{viewingRequest.numberOfProducts}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Manufacturer Serial</Label>
                  <p className="text-sm">{viewingRequest.manufacturerSerialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">In-House Serial</Label>
                  <p className="text-sm">{viewingRequest.inHouseSerialNumber}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Fault Description</Label>
                  <p className="text-sm">{viewingRequest.faultDescription}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <p className="text-sm">{viewingRequest.status.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Submitted</Label>
                  <p className="text-sm">{new Date(viewingRequest.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
