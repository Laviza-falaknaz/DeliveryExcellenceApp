import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Camera, QrCode, AlertTriangle } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const warrantyClaimSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Phone number should contain only numbers"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  deliveryAddress: z.string().min(10, "Delivery address must be at least 10 characters"),
  recipientContactNumber: z.string().min(10, "Contact number must be at least 10 digits").regex(/^\d+$/, "Contact number should contain only numbers"),
  countryOfPurchase: z.string().min(1, "Country of purchase is required"),
  numberOfProducts: z.coerce.number().min(1, "Number of products must be at least 1"),
  productMakeModel: z.string().min(1, "Product make and model is required"),
  manufacturerSerialNumber: z.string().min(1, "Manufacturer serial number is required"),
  inHouseSerialNumber: z.string().min(1, "In-house serial number is required"),
  faultDescription: z.string().min(10, "Fault description must be at least 10 characters"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the warranty terms and conditions",
  }),
});

type WarrantyClaimFormValues = z.infer<typeof warrantyClaimSchema>;

export default function WarrantyClaim() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>("");
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [emailChangeDecision, setEmailChangeDecision] = useState<'track' | 'new' | null>(null);
  const [pendingSubmitData, setPendingSubmitData] = useState<WarrantyClaimFormValues | null>(null);
  
  // Fetch current user data
  const { data: currentUser } = useQuery<{
    id: number;
    name: string;
    email: string;
    company: string;
    phoneNumber?: string;
  }>({
    queryKey: ["/api/auth/me"],
  });
  
  // Parse basket data from URL params
  const [basketData, setBasketData] = useState<any[]>([]);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const basketParam = urlParams.get('basket');
    
    if (basketParam) {
      try {
        const parsedBasket = JSON.parse(basketParam);
        setBasketData(parsedBasket);
        
        // Show toast notification about transferred devices
        toast({
          title: "Devices Transferred from RMA Basket",
          description: `${parsedBasket.length} device(s) have been added to your RMA request form.`,
        });
        
        // Clean up URL to remove basket param
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
      } catch (error) {
        console.error('Error parsing basket data:', error);
      }
    }
  }, [toast]);
  
  // Scanner refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const form = useForm<WarrantyClaimFormValues>({
    resolver: zodResolver(warrantyClaimSchema),
    defaultValues: {
      fullName: currentUser?.name || "",
      companyName: currentUser?.company || "",
      email: currentUser?.email || "",
      phone: currentUser?.phoneNumber || "",
      address: "",
      deliveryAddress: "",
      recipientContactNumber: currentUser?.phoneNumber || "",
      countryOfPurchase: "",
      numberOfProducts: 1,
      productMakeModel: "",
      manufacturerSerialNumber: "",
      inHouseSerialNumber: "",
      faultDescription: "",
      consent: false,
    },
  });
  
  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      form.setValue('fullName', currentUser.name || "");
      form.setValue('companyName', currentUser.company || "");
      form.setValue('email', currentUser.email || "");
      form.setValue('phone', currentUser.phoneNumber || "");
      form.setValue('recipientContactNumber', currentUser.phoneNumber || "");
      setOriginalEmail(currentUser.email || "");
    }
  }, [currentUser, form]);
  
  // Update form when basket data is available
  useEffect(() => {
    if (basketData.length > 0) {
      // Set number of products
      form.setValue('numberOfProducts', basketData.length);
      
      // Set manufacturer serial number - all serial numbers separated by commas
      const serialNumbers = basketData
        .map(device => device.serialNumber)
        .filter(Boolean)
        .join(', ');
      
      if (serialNumbers) {
        form.setValue('manufacturerSerialNumber', serialNumbers);
      }
      
      // Set product make/model (first device for now)
      if (basketData[0]?.productName) {
        form.setValue('productMakeModel', basketData[0].productName);
      }
      
      // If multiple devices, add them to fault description for reference
      if (basketData.length > 1) {
        const deviceList = basketData.map((device, index) => 
          `Device ${index + 1}: ${device.productName} (SN: ${device.serialNumber})`
        ).join('\n');
        
        form.setValue('faultDescription', 
          `Multiple devices from RMA basket:\n${deviceList}\n\nFault description: `
        );
      }
    }
  }, [basketData, form]);
  
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
      
      codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          const scannedText = result.getText();
          let serialNumber = scannedText;
          
          // Handle URLs with serial parameters
          if (scannedText.startsWith('http')) {
            try {
              const url = new URL(scannedText);
              const serialFromUrl = url.searchParams.get('serial') || url.searchParams.get('sn');
              if (serialFromUrl) {
                serialNumber = serialFromUrl;
              }
            } catch (e) {
              // Use original text if URL parsing fails
            }
          }
          
          // Handle JSON with serial data
          if (scannedText.startsWith('{')) {
            try {
              const parsed = JSON.parse(scannedText);
              if (parsed.serial || parsed.serialNumber || parsed.sn) {
                serialNumber = parsed.serial || parsed.serialNumber || parsed.sn;
              }
            } catch (e) {
              // Use original text if JSON parsing fails
            }
          }
          
          // Validate serial number format
          if (/^[A-Za-z0-9]{5,}$/.test(serialNumber)) {
            form.setValue('manufacturerSerialNumber', serialNumber);
            stopScanner();
            setIsScannerOpen(false);
            toast({
              title: "Serial Number Scanned",
              description: `Serial number captured: ${serialNumber}`,
            });
          } else {
            toast({
              title: "Invalid Code",
              description: "Please scan a valid QR code containing a serial number",
              variant: "destructive",
            });
          }
        }
        
        if (error && !(error instanceof NotFoundException)) {
          console.warn('Scanner error:', error);
        }
      });
    } catch (error) {
      setScannerError('Unable to access camera. Please ensure camera permissions are granted.');
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
    }
    setIsScanning(false);
  };
  
  const handleScannerClose = () => {
    stopScanner();
    setIsScannerOpen(false);
    setScannerError(null);
  };

  async function onSubmit(data: WarrantyClaimFormValues) {
    // Check if email has been changed
    if (data.email !== originalEmail && originalEmail) {
      setPendingSubmitData(data);
      setShowEmailChangeDialog(true);
      return;
    }

    // If email hasn't changed or decision has been made, proceed with submission
    await submitRMA(data);
  }

  async function submitRMA(data: WarrantyClaimFormValues) {
    try {
      setIsSubmitting(true);
      
      const rmaData = {
        ...data,
        userId: currentUser?.id,
        emailChanged: data.email !== originalEmail,
        trackWithCurrentUser: emailChangeDecision === 'track' || data.email === originalEmail,
        fileAttachment: uploadedFile ? {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type: uploadedFile.type
        } : null
      };

      // Submit RMA request
      await apiRequest("POST", "/api/rmas", rmaData);
      
      toast({
        title: "RMA Request Submitted",
        description: emailChangeDecision === 'new' 
          ? "Your RMA request has been submitted. A new account will be created once approved by management."
          : "Your RMA request has been submitted successfully. Our team will review it and contact you shortly.",
      });
      
      form.reset();
      setUploadedFile(null);
      setEmailChangeDecision(null);
      setPendingSubmitData(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to submit your RMA request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEmailChangeDecision = (decision: 'track' | 'new') => {
    setEmailChangeDecision(decision);
    setShowEmailChangeDialog(false);
    
    if (pendingSubmitData) {
      submitRMA(pendingSubmitData);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is CSV or Excel
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (allowedTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadedFile(file);
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or Excel file only.",
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">New RMA Request</h1>
          <p className="text-neutral-600">Submit a warranty claim for your Circular Computing product</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/warranty/uk/', '_blank')}
            variant="outline"
            className="bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
          >
            <i className="ri-file-text-line mr-2"></i>
            <span>View Warranty Terms</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RMA Request Details</CardTitle>
          <CardDescription>
            Please fill out all required fields to submit your RMA request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABC Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="e.g. test@circularcomputing.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 07706303810" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Address Information</h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing/Collection Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. 123 Main Street, London, SW1A 1AA" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. 456 Office Street, Manchester, M1 1AA" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="recipientContactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipient's Contact Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 07706303810" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="countryOfPurchase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country of Purchase *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. United Kingdom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Product Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numberOfProducts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Products *</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productMakeModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Make and Model *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. HP 840 G7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="manufacturerSerialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer's Serial Number *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="e.g. SN12345678" {...field} />
                          </FormControl>
                          <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Scan Serial Number</DialogTitle>
                                <DialogDescription>
                                  Position the QR code or barcode within the camera view to scan the serial number
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                {!isScanning ? (
                                  <div className="text-center py-6">
                                    <Camera className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                                    <p className="text-neutral-600 mb-4">Ready to scan</p>
                                    <Button onClick={startScanner}>
                                      Start Scanner
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <video 
                                      ref={videoRef}
                                      className="w-full h-64 bg-black rounded-lg"
                                      autoPlay
                                      muted
                                      playsInline
                                    />
                                    <div className="absolute inset-0 border-2 border-teal-500 rounded-lg pointer-events-none">
                                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-white rounded-lg"></div>
                                    </div>
                                  </div>
                                )}
                                
                                {scannerError && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">{scannerError}</p>
                                  </div>
                                )}
                                
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={handleScannerClose}>
                                    {isScanning ? 'Stop & Close' : 'Close'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inHouseSerialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>In-house Serial Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 5CG041295L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inHouseSerialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>In-house Serial Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1HP840G7I516256W11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="faultDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Fault *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe the issue you are experiencing with your device in detail..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Additional Documentation</h3>
                
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                  {uploadedFile ? (
                    <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-primary mr-2" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                        <span className="text-xs text-neutral-500 ml-2">
                          ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-900">Upload CSV or Excel spreadsheet</p>
                        <p className="text-xs text-neutral-500">Optional: Upload additional product information or documentation</p>
                      </div>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="consent"
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
                          I understand the warranty terms and conditions *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Warranty Claim"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Email Change Confirmation Dialog */}
      <AlertDialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Email Address Changed
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You've changed your email address from <strong>{originalEmail}</strong> to <strong>{pendingSubmitData?.email}</strong>.
              </p>
              <p>
                Would you still like to track this RMA under your current account?
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li><strong>Yes</strong> - RMA will be linked to your current account ({originalEmail})</li>
                <li><strong>No</strong> - A new account will be created for {pendingSubmitData?.email} (requires management approval)</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowEmailChangeDialog(false);
              setPendingSubmitData(null);
              setEmailChangeDecision(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleEmailChangeDecision('new')}
              data-testid="button-create-new-account"
            >
              Create New Account
            </Button>
            <AlertDialogAction
              onClick={() => handleEmailChangeDecision('track')}
              data-testid="button-track-current"
              className="bg-primary hover:bg-primary/90"
            >
              Track with Current Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}