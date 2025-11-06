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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Send, XCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export function RMAManagement() {
  const { toast } = useToast();
  const [editingRma, setEditingRma] = useState<any>(null);

  const { data: rmas, isLoading: isLoadingRmas } = useQuery({
    queryKey: ["/api/admin/rmas"],
  });

  const { data: rmaRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/admin/rma-requests"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const updateRmaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/rmas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
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

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/rma-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rma-requests"] });
      toast({ title: "RMA request updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update RMA request", variant: "destructive" });
    },
  });

  const resendRmaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/rmas/${id}/resend`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({ 
        title: "RMA Resent",
        description: "RMA notification has been resent successfully"
      });
    },
    onError: () => {
      toast({ title: "Failed to resend RMA", variant: "destructive" });
    },
  });

  const declineRmaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/rmas/${id}/decline`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rmas"] });
      toast({ 
        title: "RMA Declined",
        description: "RMA request has been declined"
      });
    },
    onError: () => {
      toast({ title: "Failed to decline RMA", variant: "destructive" });
    },
  });

  const handleRmaStatusChange = (rmaId: number, newStatus: string) => {
    updateRmaMutation.mutate({
      id: rmaId,
      data: { status: newStatus },
    });
  };

  const handleRequestStatusChange = (requestId: number, newStatus: string) => {
    updateRequestMutation.mutate({
      id: requestId,
      data: { status: newStatus },
    });
  };

  const handleUserChange = (userId: number) => {
    if (!editingRma) return;
    
    updateRmaMutation.mutate({
      id: editingRma.id,
      data: { userId },
    });
  };

  const handleResend = (rmaId: number) => {
    if (confirm("Are you sure you want to resend this RMA notification?")) {
      resendRmaMutation.mutate(rmaId);
    }
  };

  const handleDecline = (rmaId: number) => {
    if (confirm("Are you sure you want to decline this RMA request?")) {
      declineRmaMutation.mutate(rmaId);
    }
  };

  const getRmaStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "approved":
      case "in_transit":
      case "received":
        return "secondary";
      case "requested":
      case "processing":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "submitted":
        return "outline";
      case "declined":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RMA Management</CardTitle>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rmas.map((rma: any) => {
                    const rmaUser = users?.find((u: any) => u.id === rma.userId);
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
                          <Badge variant={getRmaStatusColor(rma.status)}>
                            {rma.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${rma.id}`}>
                          {new Date(rma.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <Select
                              value={rma.status}
                              onValueChange={(value) => handleRmaStatusChange(rma.id, value)}
                            >
                              <SelectTrigger className="w-[140px]" data-testid={`select-status-${rma.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="requested">Requested</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRma(rma)}
                              data-testid={`button-switch-user-${rma.id}`}
                            >
                              Switch User
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Resend RMA notification"
                              onClick={() => handleResend(rma.id)}
                              disabled={resendRmaMutation.isPending}
                              data-testid={`button-resend-${rma.id}`}
                            >
                              <Send className="h-4 w-4 text-blue-600" />
                            </Button>
                            {rma.status !== "rejected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Decline RMA request"
                                onClick={() => handleDecline(rma.id)}
                                disabled={declineRmaMutation.isPending}
                                data-testid={`button-decline-${rma.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
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
                        <Badge variant={getRequestStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-date-${request.id}`}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {request.status === "submitted" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Approve request"
                                onClick={() => handleRequestStatusChange(request.id, "approved")}
                                disabled={updateRequestMutation.isPending}
                                data-testid={`button-approve-${request.id}`}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Decline request"
                                onClick={() => handleRequestStatusChange(request.id, "declined")}
                                disabled={updateRequestMutation.isPending}
                                data-testid={`button-decline-request-${request.id}`}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {request.status !== "submitted" && (
                            <span className="text-sm text-gray-500">
                              {request.status === "approved" ? "Approved" : "Declined"}
                            </span>
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
    </Card>
  );
}
