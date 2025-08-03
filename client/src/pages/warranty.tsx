import { useState, useRef, useEffect } from "react";
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
import { AlertCircle, CheckCircle, HelpCircle, Search, Camera, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

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
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  
  // Mock data for warranty lookup
  const [warrantyInfo, setWarrantyInfo] = useState<any>(null);
  
  // Scanner refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  
  // Initialize scanner
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);
  
  const startScanner = async () => {
    if (!codeReader.current || !videoRef.current) return;
    
    try {
      setIsScanning(true);
      setScannerError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      videoRef.current.srcObject = stream;
      
      codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const scannedText = result.getText();
          // Validate if it looks like a serial number (alphanumeric)
          if (/^[A-Za-z0-9]{5,}$/.test(scannedText)) {
            serialForm.setValue('serialNumber', scannedText);
            stopScanner();
            toast({
              title: "Serial Number Scanned",
              description: `Successfully scanned: ${scannedText}`,
            });
          }
        }
        
        if (error && !(error instanceof NotFoundException)) {
          console.warn('Scanner error:', error);
        }
      });
      
    } catch (error) {
      console.error('Failed to start scanner:', error);
      setScannerError('Failed to access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };
  
  const stopScanner = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setScannerError(null);
  };
  
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Warranty & Troubleshooting</h1>
          <p className="text-neutral-600">Check your warranty status and get support for your product</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
            variant="outline"
            className="bg-white border-neutral-300 text-neutral-900 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors"
          >
            <i className="ri-phone-line mr-2"></i>
            <span>Contact Us</span>
          </Button>
        </div>
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
                            type="button"
                            onClick={isScanning ? stopScanner : startScanner}
                            variant="outline"
                            className="bg-white border-neutral-300 text-neutral-900 hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 shrink-0"
                          >
                            {isScanning ? (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                Stop Scanner
                              </>
                            ) : (
                              <>
                                <Camera className="w-4 h-4 mr-2" />
                                Scan Serial
                              </>
                            )}
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            variant="outline"
                            className="bg-white border-neutral-300 text-neutral-900 hover:bg-primary hover:border-primary hover:text-white transition-all duration-200 shrink-0"
                          >
                            {isSubmitting ? "Checking..." : "Check Status"}
                          </Button>
                        </div>
                        <FormDescription>
                          You can scan the serial number from your laptop's label or enter it manually. The serial number is usually found on the bottom of your device.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
              
              {/* Scanner Display */}
              {isScanning && (
                <div className="mt-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-32 border-2 border-primary bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">Position serial number here</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 mt-2 text-center">
                    Position your device's serial number label within the highlighted area
                  </p>
                </div>
              )}
              
              {/* Scanner Error */}
              {scannerError && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Scanner Error</AlertTitle>
                  <AlertDescription>{scannerError}</AlertDescription>
                </Alert>
              )}
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
                  <h3 className="font-medium text-lg mb-2">Official Manuals</h3>
                  <p className="text-neutral-700 mb-3">
                    Access comprehensive documentation and user guides for your remanufactured laptop from the original manufacturers.
                  </p>
                  <ul className="list-disc list-inside text-neutral-700 space-y-1 mb-3">
                    <li>Dell laptops: Complete service manuals and troubleshooting guides</li>
                    <li>Lenovo laptops: Official documentation and support resources</li>
                    <li>HP laptops: Comprehensive user manuals and technical specifications</li>
                    <li>Model-specific guides for optimal performance and maintenance</li>
                    <li>Installation and setup instructions for all components</li>
                  </ul>
                  <a href="https://my-warranty.com/kbtopic/manuals-downloads/" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm flex items-center">
                    <span>Browse official manuals</span>
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
            </CardContent>
          </Card>
          
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
          
          <Card>
                <CardHeader>
                  <CardTitle>OEM Diagnostic Tools</CardTitle>
                  <CardDescription>
                    Official diagnostic software from original equipment manufacturers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        </div>
                        <div>
                          <h3 className="font-medium">Lenovo Vantage</h3>
                          <p className="text-sm text-neutral-600 mt-1 mb-3">
                            Comprehensive system management and diagnostic tool for Lenovo devices
                          </p>
                          <a href="https://www.lenovo.com/us/en/software/vantage?msockid=360b390aad6b67251ad52acbac8f66c9" target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline inline-flex items-center">
                            <span>Download Lenovo Vantage</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        </div>
                        <div>
                          <h3 className="font-medium">HP Support Assistant</h3>
                          <p className="text-sm text-neutral-600 mt-1 mb-3">
                            Built-in troubleshooting and maintenance tool for HP laptops
                          </p>
                          <a href="https://support.hp.com/us-en/help/hp-support-assistant" target="_blank" rel="noreferrer" className="text-sm text-green-600 hover:underline inline-flex items-center">
                            <span>Get HP Support Assistant</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        </div>
                        <div>
                          <h3 className="font-medium">Dell SupportAssist</h3>
                          <p className="text-sm text-neutral-600 mt-1 mb-3">
                            Automated support technology for proactive system maintenance
                          </p>
                          <a href="https://www.dell.com/support/contents/en-uk/category/product-support/self-support-knowledgebase/software-and-downloads/support-assist?msockid=360b390aad6b67251ad52acbac8f66c9" target="_blank" rel="noreferrer" className="text-sm text-blue-800 hover:underline inline-flex items-center">
                            <span>Download SupportAssist</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
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
                      <Button variant="outline" className="w-full" asChild>
                        <a href="https://my-warranty.com/troubleshoot/" target="_blank" rel="noreferrer">
                          <i className="ri-tools-line mr-2"></i>
                          Start RMA
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}