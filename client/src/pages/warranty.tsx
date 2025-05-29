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

  // Common troubleshooting solutions based on my-warranty.com/knowledge-base/
  const commonSolutions = [
    {
      id: "battery",
      title: "Battery Issues",
      content: "If your Circular Computing laptop battery is not charging or draining quickly, try these steps:\n\n1. Check power connections and adapter\n2. Ensure the AC adapter is properly connected to both the laptop and power outlet\n3. Verify the charging light indicator is on when plugged in\n4. Restart your laptop with the adapter connected\n5. Update power management drivers from the manufacturer's website\n6. Run the Battery Health Diagnostic tool (accessible via BIOS on most models)\n7. If battery shows <80% capacity after 12 months, you may qualify for a replacement under warranty\n8. For persistent issues, visit my-warranty.com/troubleshoot/ for advanced diagnostics"
    },
    {
      id: "performance",
      title: "Performance Issues",
      content: "For slow performance or system lag on your remanufactured laptop:\n\n1. Restart your laptop to clear temporary memory issues\n2. Check Task Manager (Ctrl+Shift+Esc) to identify resource-intensive processes\n3. Ensure you have at least 20% free storage space on your drive\n4. Update your operating system and all drivers\n5. Scan for malware using the pre-installed security solution\n6. Clear temporary files using Disk Cleanup utility\n7. Consider upgrading RAM or storage if consistently facing performance issues\n8. Our remanufactured laptops support component upgrades without voiding warranty\n9. Visit my-warranty.com/performance for model-specific optimization guides"
    },
    {
      id: "display",
      title: "Display Problems",
      content: "For screen flickering, distortion, or no display on your Circular Computing laptop:\n\n1. Update graphics drivers from the original manufacturer's website\n2. Test with an external monitor to determine if the issue is with the screen or graphics card\n3. Run hardware diagnostics (F12 at startup on most models)\n4. For LED displays, check for loose cable connections (if comfortable opening the case)\n5. Adjust brightness and display settings in Control Panel\n6. For ghost images or burn-in on LCD screens, use a pixel repair utility\n7. Our remanufactured screens undergo 3-stage testing and are covered under full warranty\n8. If issues persist after basic troubleshooting, you may qualify for free repair service"
    },
    {
      id: "connectivity",
      title: "Wi-Fi & Connectivity",
      content: "For internet connection issues on your sustainable laptop:\n\n1. Ensure Wi-Fi is enabled (check physical switch or function key)\n2. Restart your router and laptop\n3. Forget the network and reconnect with correct credentials\n4. Update wireless drivers from the original manufacturer's website\n5. Run the Network Troubleshooter (Settings > Network & Internet > Status > Network Troubleshooter)\n6. Reset the TCP/IP stack using Command Prompt as Administrator: 'netsh winsock reset' and 'netsh int ip reset'\n7. If Bluetooth connectivity issues occur, update chipset drivers\n8. Our remanufactured laptops feature upgraded Wi-Fi cards in most models\n9. For persistent connectivity issues, visit my-warranty.com/network-solutions"
    },
    {
      id: "keyboard",
      title: "Keyboard & Touchpad",
      content: "For keyboard or touchpad issues on your Circular Computing device:\n\n1. Restart the system to reset input devices\n2. Update input device drivers from original manufacturer's site\n3. Check for debris or damage - our keyboards are thoroughly sanitized and tested\n4. Use compressed air to remove dust from between keys\n5. Adjust sensitivity settings in Control Panel > Mouse or Touchpad settings\n6. Test with an external keyboard/mouse to isolate hardware vs software issues\n7. For backlight issues, check function key combinations (usually Fn+F5 or similar)\n8. All our remanufactured keyboards undergo double-stroke testing and are covered by warranty\n9. For key replacement kits, visit my-warranty.com/keyboard-support"
    },
    {
      id: "software",
      title: "Operating System & Software",
      content: "For software issues on your sustainable remanufactured laptop:\n\n1. Ensure all updates are installed for your operating system\n2. Check for software conflicts in Event Viewer\n3. Test in Safe Mode to determine if issues are software or hardware related\n4. Use System Restore to return to a previous working state\n5. Our laptops come with a clean OS install and minimal bloatware\n6. For driver issues, always use manufacturer-approved drivers\n7. If experiencing blue screens, note the error code and visit my-warranty.com/bsod-solutions\n8. Software support is available for the first 90 days after purchase\n9. Consider refreshing your OS using the built-in reset options if persistent issues occur"
    },
    {
      id: "cooling",
      title: "Overheating & Cooling",
      content: "If your Circular Computing laptop is running hot or shutting down due to temperature:\n\n1. Ensure vents are clean and not blocked when using the laptop\n2. Use on hard surfaces rather than soft surfaces like beds or couches\n3. Check that internal fans are running properly (listen for unusual noises)\n4. All our remanufactured laptops undergo thermal paste replacement and cooling system cleaning\n5. Update BIOS and chipset drivers from the manufacturer's website\n6. Use a laptop cooling pad for extended high-performance usage\n7. Check CPU usage in Task Manager for runaway processes causing heat\n8. Our thermal optimization process ensures optimal performance within safe temperature ranges\n9. For persistent heating issues, you may qualify for a cooling system inspection under warranty"
    },
    {
      id: "audio",
      title: "Audio & Microphone Issues",
      content: "For sound or microphone problems on your sustainable laptop:\n\n1. Check volume controls and ensure the device is not muted\n2. Update audio drivers from the original manufacturer's website\n3. Test with headphones to isolate speaker issues\n4. Run the Windows Audio Troubleshooter\n5. Check Device Manager for yellow exclamation marks on audio devices\n6. Test microphone levels in Sound Control Panel\n7. For conferencing issues, test in different applications to isolate the problem\n8. Our remanufacturing process includes thorough testing of all audio components\n9. For model-specific audio enhancements, visit my-warranty.com/audio-solutions"
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
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            variant="outline"
                            className="bg-white border-neutral-300 text-neutral-900 hover:bg-primary hover:border-primary hover:text-white transition-all duration-200"
                          >
                            {isSubmitting ? "Checking..." : "Check Warranty Status"}
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
                <h3 className="font-medium">Circular Computing Comprehensive Warranty</h3>
                <p className="text-neutral-700">
                  All Circular Computing remanufactured laptops come with a comprehensive 3-year warranty as standard - longer than many new devices. This industry-leading coverage reflects our confidence in the quality of our carbon-neutral remanufacturing process.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Extended Warranty & Protection Plans</h3>
                <p className="text-neutral-700">
                  Enhance your coverage with our premium protection options:
                </p>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Accidental Damage Protection (covers drops, spills, and electrical surges)</li>
                  <li>Extended Battery Coverage (extends battery warranty to full 36 months)</li>
                  <li>Next Business Day Replacement Service</li>
                  <li>Premium Support with dedicated technical advisor</li>
                  <li>International Coverage Option for global organizations</li>
                </ul>
                <p className="text-neutral-700 mt-2">
                  Contact your account manager or visit <a href="https://circularcomputing.com/warranty/" target="_blank" rel="noreferrer" className="text-primary hover:underline">circularcomputing.com/warranty/</a> to learn more.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">What's Covered Under Standard Warranty</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Hardware defects in materials and workmanship</li>
                  <li>System component failures (motherboard, RAM, storage)</li>
                  <li>Display and graphics issues (including backlight and LCD)</li>
                  <li>Keyboard and touchpad functionality</li>
                  <li>Battery defects and performance issues (within first 12 months)</li>
                  <li>Power adapters and included peripherals</li>
                  <li>Pre-installed operating system recovery</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">What's Not Covered</h3>
                <ul className="list-disc list-inside text-neutral-700 space-y-1">
                  <li>Accidental damage (drops, spills) without ADP coverage</li>
                  <li>Normal wear and tear beyond expected usage</li>
                  <li>Cosmetic damage that doesn't affect functionality</li>
                  <li>Software issues not related to hardware</li>
                  <li>Third-party software or applications</li>
                  <li>Unauthorized modifications or repairs</li>
                  <li>Lost or stolen devices</li>
                  <li>Damage from improper use or environment (extreme temperatures, dust, etc.)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Our Sustainability Commitment</h3>
                <p className="text-neutral-700">
                  As part of our sustainability commitment, we offer free recycling of your old devices when you return a product under warranty. All returned units are either repaired for reuse or responsibly recycled following WEEE standards, ensuring zero e-waste to landfill.
                </p>
              </div>
              
              <Alert className="mt-4 bg-secondary/5 border-secondary/20">
                <HelpCircle className="h-4 w-4 text-secondary" />
                <AlertTitle>Warranty Verification</AlertTitle>
                <AlertDescription>
                  For complete warranty details specific to your product model and purchase date, use the serial number lookup tool above. All warranty services must be initiated through our authorized service process.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Troubleshooting Guide Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Tools</CardTitle>
              <CardDescription>
                Use these built-in diagnostic tools to identify hardware issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-primary/5">
                  <h3 className="font-medium text-lg mb-2">Hardware Diagnostic Utility</h3>
                  <p className="text-neutral-700 mb-3">
                    Our comprehensive hardware test suite can identify issues with all major components.
                  </p>
                  <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-3">
                    <li>Access at boot by pressing F12 on most models</li>
                    <li>Select "Diagnostics" from the boot menu</li>
                    <li>Run "Quick Test" for basic diagnostics</li>
                    <li>Run "Full System Test" for comprehensive testing</li>
                    <li>Note any error codes for support reference</li>
                  </ul>
                  <a href="https://my-warranty.com/diagnostics/" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm flex items-center">
                    <span>View detailed instructions</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                </div>
                
                <div className="border rounded-lg p-4 bg-secondary/5">
                  <h3 className="font-medium text-lg mb-2">Battery Health Analysis</h3>
                  <p className="text-neutral-700 mb-3">
                    Check your battery's health and performance with our specialized tool.
                  </p>
                  <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-3">
                    <li>Access via BIOS (F2 at startup on most models)</li>
                    <li>Navigate to "Power Management" or "Battery Information"</li>
                    <li>View current capacity compared to design capacity</li>
                    <li>Batteries at less than 80% capacity within warranty period may qualify for replacement</li>
                  </ul>
                  <a href="https://my-warranty.com/kb/battery-capacity-how-its-tested/" target="_blank" rel="noreferrer" className="text-secondary hover:underline text-sm flex items-center">
                    <span>Check battery health status</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-1"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  <div>
                    <AlertTitle className="text-blue-700">Remote Diagnostic Service</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      Our technical support team can perform remote diagnostics for complex issues. Contact us through our support portal for assistance.
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </CardContent>
          </Card>
          
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
            
            {/* Knowledge Base Resources and Troubleshooting Request */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base Resources</CardTitle>
                  <CardDescription>
                    Explore our technical documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border">
                    <div className="flex p-4">
                      <div className="mr-4 flex-shrink-0 self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Official Manuals</h4>
                        <p className="text-sm text-neutral-600 mb-2">Access detailed guides for your specific model</p>
                        <a href="https://my-warranty.com/manuals/" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center">
                          <span>Browse manuals</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </a>
                      </div>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex p-4">
                      <div className="mr-4 flex-shrink-0 self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-medium">FAQs</h4>
                        <p className="text-sm text-neutral-600 mb-2">Find answers to commonly asked questions</p>
                        <a href="https://my-warranty.com/faqs/" target="_blank" rel="noreferrer" className="text-sm text-secondary hover:underline inline-flex items-center">
                          <span>View FAQs</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </a>
                      </div>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex p-4">
                      <div className="mr-4 flex-shrink-0 self-start">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Video Tutorials</h4>
                        <p className="text-sm text-neutral-600 mb-2">Step-by-step video guides for common procedures</p>
                        <a href="https://my-warranty.com/videos/" target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline inline-flex items-center">
                          <span>Watch tutorials</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      Driver Downloads
                    </h4>
                    <p className="text-sm text-neutral-600 my-2">
                      Our remanufactured laptops use original manufacturer drivers for optimal performance. Access the latest updates for your specific model.
                    </p>
                    <a href="https://my-warranty.com/drivers/" target="_blank" rel="noreferrer" className="text-sm text-secondary hover:underline inline-flex items-center">
                      <span>Download drivers</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>
                  </div>
                </CardContent>
              </Card>
              
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