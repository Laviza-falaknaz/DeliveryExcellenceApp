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

export function CaseStudyManagement() {
  const { toast } = useToast();

  const { data: caseStudies, isLoading } = useQuery({
    queryKey: ["/api/case-studies"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      toast({ title: "Case study deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete case study", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Study Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading case studies...</p>
        ) : caseStudies && caseStudies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseStudies.map((study: any) => (
                <TableRow key={study.id} data-testid={`row-case-study-${study.id}`}>
                  <TableCell data-testid={`text-company-${study.id}`}>{study.companyName}</TableCell>
                  <TableCell data-testid={`text-contact-${study.id}`}>{study.contactName}</TableCell>
                  <TableCell data-testid={`text-email-${study.id}`}>{study.contactEmail}</TableCell>
                  <TableCell data-testid={`text-industry-${study.id}`}>{study.industryType}</TableCell>
                  <TableCell data-testid={`text-approved-${study.id}`}>{study.approved ? "Yes" : "No"}</TableCell>
                  <TableCell data-testid={`text-featured-${study.id}`}>{study.featured ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this case study?")) {
                          deleteMutation.mutate(study.id);
                        }
                      }}
                      data-testid={`button-delete-${study.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No case studies found</p>
        )}
      </CardContent>
    </Card>
  );
}
