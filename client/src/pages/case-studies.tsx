import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatDate } from "@/lib/utils";
import { CaseStudy } from "@shared/schema";

// Import case study images
import wwfImage from "@assets/WWF.png";
import royalMintImage from "@assets/The Royal Mint .png";
import ambulanceImage from "@assets/East of England Ambulance Service .png";
import chichesterImage from "@assets/Chichester High School.png";
import pensionsImage from "@assets/The Pensions Authority .png";
import barkingImage from "@assets/London Borough of Barking and Dagenham .png";
import mentalWellbeingImage from "@assets/Together For Mental Wellbeing .png";
import googleFormulaEImage from "@assets/Goolge and Formula E Hackathon.png";
import kentImage from "@assets/Kent County Council .png";
import kingsCollegeImage from "@assets/Kings College Hospital Foundation.png";
import balfourBeattyImage from "@assets/Balfour Beatty.png";

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
  testimonial: z.string().optional(),
  shareStory: z.boolean().default(false)
});

type CaseStudyFormValues = z.infer<typeof caseStudySchema>;

export default function CaseStudies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();

  // Check for share parameter in URL to auto-open the form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('share') === 'true') {
      setIsDialogOpen(true);
    }
  }, [location]);

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
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* WWF Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={wwfImage}
                alt="WWF panda in natural habitat"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>WWF</CardTitle>
              <CardDescription>Environmental Conservation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                WWF chose remanufactured technology to align with their mission of environmental conservation and sustainable practices.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/wwf/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Royal Mint Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={royalMintImage}
                alt="Royal Mint craftsman working with precious metals"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Royal Mint</CardTitle>
              <CardDescription>Government & Financial Services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                The Royal Mint implemented remanufactured technology solutions as part of their commitment to sustainable operations.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/royal-mint/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* East England Ambulance Service Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={ambulanceImage}
                alt="East England Ambulance Service emergency response operator"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>East England Ambulance Service</CardTitle>
              <CardDescription>Healthcare & Emergency Services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                East England Ambulance Service adopted remanufactured technology to support their critical healthcare operations whilst reducing environmental impact.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/east-england-ambulance-service/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Chichester High School Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={chichesterImage}
                alt="Students learning with technology at Chichester High School"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Chichester High School</CardTitle>
              <CardDescription>Education</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Chichester High School integrated remanufactured laptops to provide students with quality technology whilst teaching sustainability.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/chichester-high-school/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* The Pensions Authority Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={pensionsImage}
                alt="The Pensions Authority building"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>The Pensions Authority</CardTitle>
              <CardDescription>Government & Public Services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                The Pensions Authority chose remanufactured technology as part of their sustainable procurement strategy.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/the-pensions-authority/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* London Borough of Barking and Dagenham Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={barkingImage}
                alt="London Borough of Barking and Dagenham Travelodge building"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>London Borough of Barking and Dagenham</CardTitle>
              <CardDescription>Local Government</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                London Borough of Barking and Dagenham implemented remanufactured technology solutions to support their environmental goals.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/london-borough-of-barking-and-dagenham/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Together for Mental Wellbeing Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={mentalWellbeingImage}
                alt="Together for Mental Wellbeing team at community event"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Together for Mental Wellbeing</CardTitle>
              <CardDescription>Mental Health & Charity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Together for Mental Wellbeing chose remanufactured laptops to support their mission whilst reducing costs and environmental impact.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/together-for-mental-wellbeing/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Google Cloud and Formula E Hackathon Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={googleFormulaEImage}
                alt="Google Cloud and Formula E Hackathon participants at work"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Google Cloud and Formula E Hackathon</CardTitle>
              <CardDescription>Technology & Innovation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Google Cloud and Formula E Hackathon showcased sustainable technology practices by using remanufactured equipment for their innovation event.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/google-cloud-and-formula-e-hackathon/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Kent County Council Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={kentImage}
                alt="Kent County Council Sessions House building"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Kent County Council</CardTitle>
              <CardDescription>Local Government</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Kent County Council adopted remanufactured technology as part of their sustainable procurement strategy and commitment to environmental responsibility.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/kent-county_council/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Kings College Hospital Foundation Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={kingsCollegeImage}
                alt="Kings College Hospital Foundation healthcare professional"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Kings College Hospital Foundation</CardTitle>
              <CardDescription>Healthcare Foundation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Kings College Hospital Foundation integrated remanufactured technology to support their healthcare mission whilst reducing environmental impact.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/kings-college-hospital-foundation/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>

          {/* Balfour Beatty Case Study */}
          <Card>
            <div className="h-48 overflow-hidden">
              <img
                src={balfourBeattyImage}
                alt="Balfour Beatty engineer working on telecommunications infrastructure"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Balfour Beatty</CardTitle>
              <CardDescription>Construction & Infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 mb-4">
                Balfour Beatty chose remanufactured technology solutions to align with their sustainability goals and reduce environmental impact across their operations.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white hover:bg-teal-600 hover:text-white transition-colors" asChild>
                <a href="https://circularcomputing.com/case-studies/balfour-beatty/" target="_blank" rel="noreferrer">
                  Read Full Case Study
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Case Study Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Impact Story</DialogTitle>
            <DialogDescription>
              Tell us about your organisation's sustainability journey with remanufactured technology. Your story could inspire others to make a positive environmental impact.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="organisationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organisation Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your organisation name" {...field} />
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
                    <FormLabel>Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@organisation.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Sector *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="nonprofit">Non-profit</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfDevices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Devices Deployed *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 500" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impactStory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Impact Story *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your experience with remanufactured technology. What motivated your decision? What impact have you seen? How has it supported your sustainability goals?"
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Share details about your sustainability goals, environmental impact, cost savings, or any other benefits you've experienced.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challengesOvercome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges Overcome</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Were there any initial concerns or challenges? How were they addressed?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keyBenefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Benefits Achieved</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What have been the main benefits? (e.g., cost savings, environmental impact, performance, reliability)"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="futureGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Future Sustainability Goals</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What are your organisation's future sustainability plans or goals?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information you'd like to share?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I'd like to share our story - please get in touch
                      </FormLabel>
                      <FormDescription>
                        We may contact you to feature your story on our website and in our marketing materials.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-white hover:bg-teal-600 hover:text-white transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Case Study"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
