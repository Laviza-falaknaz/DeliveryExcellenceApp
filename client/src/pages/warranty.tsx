import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, HelpCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const serialNumberSchema = z.object({
  serialNumber: z.string().min(5, "Serial number must be at least 5 characters"),
});

const troubleshootingFormSchema = z.object({
  issueType: z.string().min(1, "Please select an issue type"),
  description: z.string().min(10, "Please provide more details about your issue"),
  stepsTaken: z.string().optional(),
});

export default function Warranty() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("warranty");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data for warranty lookup
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);
  
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const serialForm = useForm<z.infer<typeof serialNumberSchema>>({
    resolver: zodResolver(serialNumberSchema),
    defaultValues: {
      serialNumber: "",
    },
  });

  const troubleshootingForm = useForm<z.infer<typeof troubleshootingFormSchema>>({
    resolver: zodResolver(troubleshootingFormSchema),
    defaultValues: {
      issueType: "",
      description: "",
      stepsTaken: "",
    },
  });

  async function onSerialSubmit(data: z.infer<typeof serialNumberSchema>) {
    try {
      setIsSubmitting(true);
      // In a real implementation, we would call an API to fetch warranty info
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate warranty info for demo
      setWarrantyInfo({
        serialNumber: data.serialNumber,
        productName: "Circular ThinkPad T14 Gen 2",
        purchaseDate: "2024-01-15",
        warrantyEnd: "2027-01-15",
        warrantyStatus: "Active",
        additionalCoverage: "Extended Warranty with Accidental Damage Protection",
        registrationStatus: "Registered",
      });
      
      setSearchPerformed(true);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to retrieve warranty information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onTroubleshootingSubmit(data: z.infer<typeof troubleshootingFormSchema>) {
    try {
      setIsSubmitting(true);
      // In a real implementation, we would submit this to an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Troubleshooting Request Submitted",
        description: "Our technical team will review your issue and provide assistance shortly.",
      });
      
      troubleshootingForm.reset();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Common troubleshooting solutions
  const commonSolutions = [
    {
      id: "battery",
      title: "Battery Issues",
      content: "If your laptop battery is not charging or draining quickly, try these steps:\n1. Check power connections and adapter\n2. Restart your laptop\n3. Update power management drivers\n4. Run a battery diagnostic test\n5. For persistent issues, please submit a support ticket"
    },
    {
      id: "performance",
      title: "Performance Issues",
      content: "For slow performance or system lag, try these solutions:\n1. Restart your laptop\n2. Close unnecessary background applications\n3. Check for and install system updates\n4. Scan for malware\n5. Clear temporary files and browser cache\n6. If issues persist, consider a system reset or contact support"
    },
    {
      id: "display",
      title: "Display Problems",
      content: "For screen flickering, distortion, or no display:\n1. Update graphics drivers\n2. Connect to an external monitor to isolate hardware vs software issues\n3. Test in safe mode\n4. Check display resolution settings\n5. For touchscreen issues, calibrate the touch input"
    },
    {
      id: "connectivity",
      title: "Wi-Fi & Connectivity",
      content: "For internet connection issues:\n1. Restart your router and laptop\n2. Forget the network and reconnect\n3. Update network drivers\n4. Check for IP conflicts\n5. Run Windows Network Troubleshooter\n6. Reset network settings if necessary"
    },
    {
      id: "keyboard",
      title: "Keyboard & Touchpad",
      content: "For keyboard or touchpad issues:\n1. Restart the system\n2. Update input device drivers\n3. Check for physical damage or debris\n4. Adjust sensitivity settings\n5. Test with an external input device to isolate hardware issues"
    }
  ];

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold font-poppins text-neutral-900">Warranty & Troubleshooting</h1>
        <p className="text-neutral-600">Check your warranty status and get support for your product</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="warranty">Warranty Information</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting Guide</TabsTrigger>
        </TabsList>
        
        {/* Warranty Information Tab */}
        <TabsContent value="warranty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Check Warranty Status</CardTitle>
              <CardDescription>
                Enter your product's serial number to check its warranty status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...serialForm}>
                <form onSubmit={serialForm.handleSubmit(onSerialSubmit)} className="space-y-4">
                  <FormField
                    control={serialForm.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="e.g. CC21XG45T" {...field} />
                          </FormControl>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Checking..." : "Check"}
                          </Button>
                        </div>
                        <FormDescription>
                          The serial number can be found on the bottom of your laptop or in the system information.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchPerformed && (
            <>
              {warrantyInfo ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold">Warranty Details</CardTitle>
                    <Badge 
                      variant={warrantyInfo.warrantyStatus === "Active" ? "default" : "secondary"} 
                      className={warrantyInfo.warrantyStatus === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {warrantyInfo.warrantyStatus}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Product</h4>
                          <p className="text-base">{warrantyInfo.productName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Serial Number</h4>
                          <p className="text-base">{warrantyInfo.serialNumber}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Purchase Date</h4>
                          <p className="text-base">{new Date(warrantyInfo.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-neutral-500">Warranty End Date</h4>
                          <p className="text-base">{new Date(warrantyInfo.warrantyEnd).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-neutral-500">Additional Coverage</h4>
                        <p className="text-base">{warrantyInfo.additionalCoverage || "None"}</p>
                      </div>
                      
                      <Alert className="bg-primary/5 border-primary/20">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <AlertTitle>Registration Status: {warrantyInfo.registrationStatus}</AlertTitle>
                        <AlertDescription>
                          Your product is fully registered and covered under our warranty policy.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => serialForm.reset()}>
                      Check Another Product
                    </Button>
                    <Button onClick={() => setActiveTab("troubleshooting")}>
                      Troubleshooting Guide
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Warranty Information Found</h3>
                      <p className="text-neutral-600 text-center mb-4">
                        We couldn't find warranty information for the specified serial number. Please double-check the number and try again.
                      </p>
                      <Button variant="outline" onClick={() => serialForm.reset()}>
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Warranty Policy</CardTitle>
              <CardDescription>
                Key information about our warranty coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Standard Warranty</h3>
                <p className="text-neutral-700">
                  All Circular Computing remanufactured laptops come with a 3-year warranty as standard. This covers hardware defects and malfunctions that occur under normal use conditions.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Extended Warranty Options</h3>
                <p className="text-neutral-700">
                  Additional coverage options are available, including accidental damage protection and battery replacement coverage. Contact your account manager to learn more.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">What's Covered</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Hardware defects in materials and workmanship</li>
                  <li>System component failures (motherboard, RAM, storage)</li>
                  <li>Display and graphics issues</li>
                  <li>Keyboard and touchpad functionality</li>
                  <li>Battery defects (within first 12 months)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">What's Not Covered</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Accidental damage (drops, spills) without ADP coverage</li>
                  <li>Normal wear and tear</li>
                  <li>Software issues not related to hardware</li>
                  <li>Unauthorized modifications or repairs</li>
                  <li>Lost or stolen devices</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Troubleshooting Guide Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Common Troubleshooting Solutions</CardTitle>
                  <CardDescription>
                    Find solutions for frequently encountered issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {commonSolutions.map((solution) => (
                      <AccordionItem key={solution.id} value={solution.id}>
                        <AccordionTrigger>{solution.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="whitespace-pre-line text-neutral-700">
                            {solution.content}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Hardware Diagnostic Tools</CardTitle>
                  <CardDescription>
                    Self-diagnostic utilities for your system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <i className="ri-cpu-line text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">System Diagnostics</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Comprehensive hardware tests for CPU, memory, and storage
                          </p>
                          <Button variant="link" className="px-0 h-8">
                            Download Tool
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <i className="ri-battery-2-charge-line text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Battery Health Check</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Test battery capacity and charging functionality
                          </p>
                          <Button variant="link" className="px-0 h-8">
                            Download Tool
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <i className="ri-hard-drive-line text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Storage Analyzer</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Check disk health and identify potential issues
                          </p>
                          <Button variant="link" className="px-0 h-8">
                            Download Tool
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <i className="ri-wifi-line text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Network Diagnostics</h3>
                          <p className="text-sm text-neutral-600 mt-1">
                            Troubleshoot connectivity and network adapter issues
                          </p>
                          <Button variant="link" className="px-0 h-8">
                            Download Tool
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-neutral-500">
                    Note: These diagnostic tools are compatible with all Circular Computing remanufactured laptops.
                  </p>
                </CardFooter>
              </Card>
            </div>
            
            {/* Submit Troubleshooting Request */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Submit your issue for technical assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...troubleshootingForm}>
                    <form onSubmit={troubleshootingForm.handleSubmit(onTroubleshootingSubmit)} className="space-y-4">
                      <FormField
                        control={troubleshootingForm.control}
                        name="issueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an issue type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hardware">Hardware Problem</SelectItem>
                                <SelectItem value="software">Software Problem</SelectItem>
                                <SelectItem value="battery">Battery Issue</SelectItem>
                                <SelectItem value="display">Display Problem</SelectItem>
                                <SelectItem value="connectivity">Connectivity Issue</SelectItem>
                                <SelectItem value="keyboard">Keyboard/Touchpad Problem</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={troubleshootingForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Describe Your Issue</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide details about the problem you're experiencing"
                                className="resize-none"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={troubleshootingForm.control}
                        name="stepsTaken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Steps Already Taken</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What solutions have you already tried?"
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This helps our technicians provide more targeted assistance
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <h3 className="font-medium mb-2">Still Need Help?</h3>
                      <p className="text-neutral-600 mb-4">
                        Contact our technical support team directly for immediate assistance
                      </p>
                      <div className="space-y-2 w-full">
                        <Button variant="outline" className="w-full">
                          <i className="ri-phone-line mr-2"></i>
                          Call Support
                        </Button>
                        <Button variant="outline" className="w-full">
                          <i className="ri-chat-1-line mr-2"></i>
                          Live Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}