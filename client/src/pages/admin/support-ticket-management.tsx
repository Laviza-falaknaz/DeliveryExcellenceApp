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

export function SupportTicketManagement() {
  const { toast } = useToast();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/admin/support-tickets"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/support-tickets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      toast({ title: "Support ticket deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete support ticket", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Ticket Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading support tickets...</p>
        ) : tickets && tickets.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket Number</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: any) => (
                <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                  <TableCell data-testid={`text-ticket-number-${ticket.id}`}>{ticket.ticketNumber}</TableCell>
                  <TableCell data-testid={`text-user-id-${ticket.id}`}>{ticket.userId}</TableCell>
                  <TableCell data-testid={`text-subject-${ticket.id}`}>{ticket.subject}</TableCell>
                  <TableCell data-testid={`text-status-${ticket.id}`}>{ticket.status}</TableCell>
                  <TableCell data-testid={`text-date-${ticket.id}`}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this support ticket?")) {
                          deleteMutation.mutate(ticket.id);
                        }
                      }}
                      data-testid={`button-delete-${ticket.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No support tickets found</p>
        )}
      </CardContent>
    </Card>
  );
}
