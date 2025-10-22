import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function RMAManagement() {
  const { toast } = useToast();

  const { data: rmas, isLoading } = useQuery({
    queryKey: ["/api/admin/rmas"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/rmas/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rmas"] });
      toast({ title: "RMA deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete RMA", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>RMA Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading RMAs...</p>
        ) : rmas && rmas.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RMA Number</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rmas.map((rma: any) => (
                <TableRow key={rma.id} data-testid={`row-rma-${rma.id}`}>
                  <TableCell data-testid={`text-rma-number-${rma.id}`}>{rma.rmaNumber}</TableCell>
                  <TableCell data-testid={`text-user-id-${rma.id}`}>{rma.userId}</TableCell>
                  <TableCell data-testid={`text-order-id-${rma.id}`}>{rma.orderId}</TableCell>
                  <TableCell data-testid={`text-status-${rma.id}`}>{rma.status}</TableCell>
                  <TableCell data-testid={`text-reason-${rma.id}`}>{rma.reason}</TableCell>
                  <TableCell data-testid={`text-date-${rma.id}`}>
                    {new Date(rma.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this RMA?")) {
                          deleteMutation.mutate(rma.id);
                        }
                      }}
                      data-testid={`button-delete-${rma.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No RMAs found</p>
        )}
      </CardContent>
    </Card>
  );
}
