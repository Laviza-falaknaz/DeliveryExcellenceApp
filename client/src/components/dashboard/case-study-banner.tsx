import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import caseStudyImage from "@assets/Case Study - Image_1759311266301.jpg";

const industries = [
  "Education",
  "Healthcare",
  "Finance",
  "Technology",
  "Manufacturing",
  "Retail",
  "Government",
  "Non-profit",
  "Other"
];

const employeeCounts = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+"
];

const caseStudySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().optional(),
  industryType: z.string().min(1, "Industry is required"),
  employeeCount: z.coerce.number().int().positive(),
  testimonial: z.string().optional()
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function CaseStudyBanner() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: impact } = useQuery({
    queryKey: ["/api/impact"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const form = useForm<CaseStudyFormValues>({
    resolver: zodResolver(caseStudySchema),
    defaultValues: {
      companyName: user?.company || "",
      contactName: user?.name || "",
      contactEmail: user?.email || "",
      contactPhone: "",
      industryType: "",
      employeeCount: 0,
      testimonial: ""
    }
  });

  async function onSubmit(data: CaseStudyFormValues) {
    try {
      await apiRequest("POST", "/api/case-studies", data);
      
      toast({
        title: "Case Study Request Submitted",
        description: "Thank you for agreeing to share your success story! Our team will be in touch shortly.",
      });
      
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (!impact) return null;

  return (
    <>
      <div className="bg-primary/5 rounded-xl shadow-sm overflow-hidden border border-primary/20 p-5">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Share Your Sustainable Success Story!
            </h3>
            <p className="text-neutral-700">
              Your organization has saved {impact.carbonSaved / 1000} kg of carbon emissions and provided clean water to {impact.familiesHelped * 5} people by choosing remanufactured laptops.
            </p>
            <p className="text-neutral-600 mt-4">
              Would you like to be featured in our case study to inspire other organizations?
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors">
                Join Case Study
              </Button>
              <Button variant="outline" asChild className="bg-[#08ABAB] text-white border-[#08ABAB] hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors">
                <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                  Case Studies
                </a>
              </Button>
            </div>
          </div>
          <div className="mt-6 md:mt-0 md:ml-6 md:w-64">
            <img
              src={caseStudyImage}
              alt="Misty forest landscape representing environmental sustainability"
              className="rounded-lg shadow-sm w-full h-auto"
            />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Join Our Case Study Programme</DialogTitle>
            <DialogDescription>
              Share your sustainable success story to inspire other organizations. Fill out the details below to get started.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
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
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeeCounts.map((size, index) => (
                            <SelectItem key={size} value={(index + 1).toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="testimonial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Testimonial (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your experience with our remanufactured laptops"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
