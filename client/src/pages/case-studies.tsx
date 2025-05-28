import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { CaseStudy } from "@shared/schema";

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

export default function CaseStudies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: caseStudies, isLoading } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies"],
  });

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

  // Check if the user has already submitted a case study
  const hasSubmitted = caseStudies && caseStudies.length > 0;

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Case Studies</h1>
          <p className="text-neutral-600">Share your sustainable success story with the world</p>
        </div>
        <div className="mt-4 md:mt-0">
          {!hasSubmitted && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <i className="ri-add-line mr-2"></i>
              <span>Join Case Study Program</span>
            </Button>
          )}
        </div>
      </div>

      {/* Case Study Information */}
      <section className="mb-8">
        <Card className="bg-primary/5 border border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 md:pr-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Why Share Your Sustainability Story?</h2>
                <p className="text-neutral-700 mb-4">
                  By sharing your experience with Circular Computing's remanufactured laptops, you can help inspire other organizations to make sustainable IT choices. Your case study will showcase the positive environmental and social impact of your decision.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 mr-3">
                      <i className="ri-check-line"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Showcase Your Environmental Leadership</h3>
                      <p className="text-sm text-neutral-600">Demonstrate your organization's commitment to sustainability and responsible business practices.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 mr-3">
                      <i className="ri-check-line"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Inspire Others</h3>
                      <p className="text-sm text-neutral-600">Help other organizations see the benefits of sustainable IT procurement and remanufactured technology.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 mr-3">
                      <i className="ri-check-line"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Gain Recognition</h3>
                      <p className="text-sm text-neutral-600">Be featured on our website, marketing materials, and industry publications as a sustainability champion.</p>
                    </div>
                  </div>
                </div>
                {!hasSubmitted && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Join Case Study Program
                  </Button>
                )}
              </div>
              <div className="md:w-1/3 mt-6 md:mt-0">
                <img
                  src="https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                  alt="Business meeting discussing sustainability impact"
                  className="rounded-lg shadow-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Your Case Study Status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">Your Case Study Status</h2>
        
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : hasSubmitted ? (
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <span>Case Study Submission</span>
                  <Badge className={caseStudies[0].approved ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {caseStudies[0].approved ? "Approved" : "Under Review"}
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Submitted on {formatDate(caseStudies[0].createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Company</h3>
                  <p>{caseStudies[0].companyName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Industry</h3>
                  <p>{caseStudies[0].industryType}</p>
                </div>
                {caseStudies[0].testimonial && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Your Testimonial</h3>
                    <p className="text-neutral-700 whitespace-pre-line">{caseStudies[0].testimonial}</p>
                  </div>
                )}
                {caseStudies[0].approved ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 mr-3">
                        <i className="ri-check-line"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">Case Study Approved</h3>
                        <p className="text-sm text-green-700">
                          Your case study has been approved! Our team will contact you soon to discuss next steps and gather additional information.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                        <i className="ri-information-line"></i>
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800">Case Study Under Review</h3>
                        <p className="text-sm text-blue-700">
                          Thank you for your submission! Our team is currently reviewing your information and will contact you shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {caseStudies[0].featured && (
              <CardFooter>
                <div className="w-full p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent mr-3">
                      <i className="ri-star-line"></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-accent">Featured Case Study</h3>
                      <p className="text-sm text-neutral-700">
                        Congratulations! Your case study has been selected as a featured story on our website and marketing materials.
                      </p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <i className="ri-file-text-line text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">No Case Study Submitted Yet</h3>
              <p className="text-neutral-600 mb-6">
                Share your sustainability journey and inspire others to make environmentally responsible choices.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Submit Your Case Study
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Featured Case Studies */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4">Featured Case Studies</h2>
        
        <Tabs defaultValue="education">
          <TabsList className="mb-4">
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="corporate">Corporate</TabsTrigger>
            <TabsTrigger value="government">Government</TabsTrigger>
          </TabsList>
          
          <TabsContent value="education">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="University campus with sustainable technology"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Oxford University</CardTitle>
                  <CardDescription>Higher Education</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    Oxford University deployed 2,500 remanufactured laptops across their campus, saving over 750,000 kg of carbon emissions and providing clean water to 12,500 people in developing countries.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">750,000 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">12,500 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">£625,000</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="School classroom with students using laptops"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Brighton College</CardTitle>
                  <CardDescription>K-12 Education</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    Brighton College replaced 1,200 computers with remanufactured models, reducing their carbon footprint while educating students about sustainability and global water scarcity issues.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">379,200 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">6,000 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">£300,000</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="corporate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="Corporate office with sustainable technology"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Deloitte UK</CardTitle>
                  <CardDescription>Professional Services</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    Deloitte UK implemented a sustainable IT policy and deployed 5,000 remanufactured laptops, aligning with their carbon reduction goals and corporate social responsibility initiatives.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">1.58 million kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">25,000 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">£1.25 million</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="Eco-friendly office space"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Patagonia Europe</CardTitle>
                  <CardDescription>Retail & Apparel</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    Patagonia extended their environmental commitment to IT equipment by choosing remanufactured laptops for all European offices, reducing e-waste and supporting clean water initiatives.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">284,400 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">4,500 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">€225,000</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="government">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="Government office building"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Bristol City Council</CardTitle>
                  <CardDescription>Local Government</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    Bristol City Council deployed 3,000 remanufactured laptops as part of their carbon neutrality goal, setting an example for sustainable procurement in the public sector.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">948,000 kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">15,000 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">£750,000</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <div className="h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
                    alt="Government sustainable technology initiative"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>NHS Scotland</CardTitle>
                  <CardDescription>Healthcare</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 mb-4">
                    NHS Scotland implemented a sustainable IT strategy with 8,000 remanufactured laptops, significantly reducing both their environmental impact and technology costs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Carbon Saved:</span>
                      <span className="font-medium">2.53 million kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Water Impact:</span>
                      <span className="font-medium">40,000 people helped</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Cost Savings:</span>
                      <span className="font-medium">£2 million</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://www.circularcomputing.com/case-studies/" target="_blank" rel="noreferrer">
                      Read Full Case Study
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>



      {/* Case Study Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Join Our Case Study Program</DialogTitle>
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
    </div>
  );
}
