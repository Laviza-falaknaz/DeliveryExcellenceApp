import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { SupportTicket } from "@shared/schema";
import { formatDate } from "@/lib/utils";

const supportTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  orderId: z.coerce.number().optional(),
});

type SupportTicketFormValues = z.infer<typeof supportTicketSchema>;

export default function Support() {
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [isTicketDetailsOpen, setIsTicketDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const { toast } = useToast();

  const { data: tickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const form = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      orderId: undefined,
    },
  });

  async function onSubmit(data: SupportTicketFormValues) {
    try {
      await apiRequest("POST", "/api/support-tickets", data);
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      
      toast({
        title: "Support Ticket Created",
        description: "Your ticket has been submitted successfully. Our team will respond shortly.",
      });
      
      form.reset();
      setIsNewTicketDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem creating your support ticket. Please try again.",
        variant: "destructive",
      });
    }
  }

  const openTickets = tickets?.filter(ticket => ticket.status !== "closed" && ticket.status !== "resolved") || [];
  const closedTickets = tickets?.filter(ticket => ticket.status === "closed" || ticket.status === "resolved") || [];

  function getStatusColor(status: string): string {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-neutral-100 text-neutral-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  }

  function getStatusLabel(status: string): string {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function handleTicketClick(ticket: SupportTicket) {
    setSelectedTicket(ticket);
    setIsTicketDetailsOpen(true);
  }

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Support</h1>
          <p className="text-neutral-600">Get assistance with your remanufactured laptops</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => setIsNewTicketDialogOpen(true)}>
            <i className="ri-add-line mr-2"></i>
            <span>New Support Ticket</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <i className="ri-customer-service-2-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Need help with setup or having technical issues with your laptop?
              </p>
              <Button variant="outline" onClick={() => setIsNewTicketDialogOpen(true)}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
                <i className="ri-questionnaire-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">FAQ & Knowledge Base</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Browse our knowledge base for answers to common questions.
              </p>
              <Button variant="outline" asChild>
                <a href="https://www.circularcomputing.com/faqs/" target="_blank" rel="noreferrer">
                  View FAQs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
                <i className="ri-refresh-line text-2xl"></i>
              </div>
              <h3 className="font-semibold text-lg mb-2">Returns & RMA</h3>
              <p className="text-neutral-600 text-sm mb-4">
                Need to return or replace a product? Start the RMA process.
              </p>
              <Button variant="outline" asChild>
                <a href="/rma/new">Start RMA Process</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">Your Support Tickets</h2>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : tickets && tickets.length > 0 ? (
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Active Tickets ({openTickets.length})</TabsTrigger>
              <TabsTrigger value="closed">Closed Tickets ({closedTickets.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open">
              {openTickets.length > 0 ? (
                <div className="space-y-4">
                  {openTickets.map((ticket) => (
                    <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleTicketClick(ticket)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <Badge className={`ml-3 ${getStatusColor(ticket.status)}`}>
                                {getStatusLabel(ticket.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 line-clamp-1">
                              {ticket.description}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-neutral-500">
                            Ticket #{ticket.ticketNumber} • {formatDate(ticket.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
                    <i className="ri-inbox-line text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700">No active tickets</h3>
                  <p className="text-neutral-500 mt-2">You don't have any active support tickets at the moment.</p>
                  <Button className="mt-4" onClick={() => setIsNewTicketDialogOpen(true)}>
                    Create New Ticket
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="closed">
              {closedTickets.length > 0 ? (
                <div className="space-y-4">
                  {closedTickets.map((ticket) => (
                    <Card key={ticket.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => handleTicketClick(ticket)}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="font-medium">{ticket.subject}</h3>
                              <Badge className={`ml-3 ${getStatusColor(ticket.status)}`}>
                                {getStatusLabel(ticket.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 line-clamp-1">
                              {ticket.description}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-neutral-500">
                            Ticket #{ticket.ticketNumber} • {formatDate(ticket.createdAt)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
                  <h3 className="text-lg font-medium text-neutral-700">No closed tickets</h3>
                  <p className="text-neutral-500 mt-2">You don't have any closed support tickets yet.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mb-3">
              <i className="ri-inbox-line text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-700">No support tickets yet</h3>
            <p className="text-neutral-500 mt-2">
              Need help with your remanufactured laptops? Create a support ticket and our team will assist you.
            </p>
            <Button className="mt-4" onClick={() => setIsNewTicketDialogOpen(true)}>
              Create Your First Ticket
            </Button>
          </div>
        )}
      </div>

      {/* New Support Ticket Dialog */}
      <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Please provide details about your issue or question. Our support team will respond as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Briefly describe your issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Order (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No related order</SelectItem>
                        {orders?.map((order) => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            #{order.orderNumber} ({formatDate(order.orderDate)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide as much detail as possible about your issue"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewTicketDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={isTicketDetailsOpen} onOpenChange={setIsTicketDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>
                  <div className="flex items-center justify-between">
                    <span>Ticket #{selectedTicket.ticketNumber}</span>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {getStatusLabel(selectedTicket.status)}
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Created on {formatDate(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-1">Subject</h3>
                  <p>{selectedTicket.subject}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-neutral-700 whitespace-pre-line">{selectedTicket.description}</p>
                </div>

                {selectedTicket.orderId && (
                  <div>
                    <h3 className="font-medium mb-1">Related Order</h3>
                    <p className="text-primary">
                      Order #{orders?.find(o => o.id === selectedTicket.orderId)?.orderNumber || selectedTicket.orderId}
                    </p>
                  </div>
                )}

                {/* In a real app, we would show ticket comments/replies here */}
                <div className="mt-6 py-4 border-t border-neutral-200">
                  <h3 className="font-medium mb-3">Support Team Response</h3>
                  {selectedTicket.status === "open" ? (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <p className="text-neutral-600 text-sm">
                        Our support team will respond to your ticket shortly. Thank you for your patience.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                          <i className="ri-customer-service-2-line"></i>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">Support Team</p>
                            <span className="text-xs text-neutral-500 ml-2">
                              {formatDate(selectedTicket.updatedAt)}
                            </span>
                          </div>
                          <p className="text-neutral-700 mt-1">
                            Thank you for reaching out. We're looking into your issue and will get back to you as soon as possible.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTicketDetailsOpen(false)}>
                  Close
                </Button>
                {selectedTicket.status !== "closed" && (
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    Close Ticket
                  </Button>
                )}
                {selectedTicket.status === "open" && (
                  <Button>Reply</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
