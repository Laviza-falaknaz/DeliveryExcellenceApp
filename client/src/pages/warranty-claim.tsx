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
import { Upload, FileText, X, Camera, QrCode, AlertTriangle, Plus, Trash2, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Product schema - updated to make serial numbers conditionally required
const productSchema = z.object({
  productMakeModel: z.string().optional(),
  manufacturerSerialNumber: z.string().optional(),
  inHouseSerialNumber: z.string().optional(),
  faultDescription: z.string().min(10, "Fault description must be at least 10 characters"),
  isAutoFilled: z.boolean().optional().default(false),
  isCrmMiss: z.boolean().optional().default(false),
}).refine((data) => {
  // At least one serial number must be provided
  return (data.manufacturerSerialNumber && data.manufacturerSerialNumber.trim() !== '') || 
         (data.inHouseSerialNumber && data.inHouseSerialNumber.trim() !== '');
}, {
  message: "At least one serial number (Manufacturer or In-house) must be provided",
  path: ["manufacturerSerialNumber"], // Show error on manufacturer field
});

const warrantyClaimSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Phone number should contain only numbers"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  deliveryAddress: z.string().min(10, "Delivery address must be at least 10 characters"),
  recipientContactNumber: z.string().min(10, "Contact number must be at least 10 digits").regex(/^\d+$/, "Contact number should contain only numbers"),
  countryOfPurchase: z.string().min(1, "Country of purchase is required"),
  products: z.array(productSchema).min(1, "At least one product is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the warranty terms and conditions",
  }),
});

type WarrantyClaimFormValues = z.infer<typeof warrantyClaimSchema>;

interface AutofillResponse {
  manufacturerSerialNumber: string;
  inhouseSerialNumber: string;
  ProductDescription: string;
}

export default function WarrantyClaim() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileUploadMode, setIsFileUploadMode] = useState(false); // Track if products loaded from sheet
  const [uploadedProductCount, setUploadedProductCount] = useState(0); // Number of products from sheet
  const [isScanning, setIsScanning] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string>("");
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [emailChangeDecision, setEmailChangeDecision] = useState<'track' | 'new' | null>(null);
  const [pendingSubmitData, setPendingSubmitData] = useState<WarrantyClaimFormValues | null>(null);
  const [autofillLoadingStates, setAutofillLoadingStates] = useState<Record<number, boolean>>({});
  const [crmMissProducts, setCrmMissProducts] = useState<Set<number>>(new Set());
  
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

  // Fetch serial lookup settings
  const { data: serialLookupSettings } = useQuery<{
    settingValue: {
      powerAutomateSerialLookupUrl?: string;
    };
  }>({
    queryKey: ["/api/settings/serial_lookup"],
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
      products: [{
        productMakeModel: "",
        manufacturerSerialNumber: "",
        inHouseSerialNumber: "",
        faultDescription: "",
        isAutoFilled: false,
        isCrmMiss: false,
      }],
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
      // Map basket data to products array
      const products = basketData.map(device => ({
        productMakeModel: device.productName || "",
        manufacturerSerialNumber: device.manufacturerSerialNumber || "",
        inHouseSerialNumber: device.inhouseSerialNumber || "",
        faultDescription: "",
        isAutoFilled: false,
        isCrmMiss: false,
      }));
      
      form.setValue('products', products);
      
      // Trigger autofill for each product with a delay to avoid rate limiting
      const triggerAutofills = async () => {
        for (let i = 0; i < products.length; i++) {
          if (products[i].manufacturerSerialNumber || products[i].inHouseSerialNumber) {
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, i * 1000)); // 1 second delay between each request
            await handleAutofill(i);
          }
        }
      };
      
      triggerAutofills();
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
  
  const [currentScanningIndex, setCurrentScanningIndex] = useState<number>(0);
  
  const startScanner = async (productIndex: number) => {
    if (!codeReader.current || !videoRef.current) return;
    
    try {
      setIsScanning(true);
      setScannerError(null);
      setCurrentScanningIndex(productIndex);
      
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
            form.setValue(`products.${productIndex}.manufacturerSerialNumber`, serialNumber);
            stopScanner();
            setIsScannerOpen(false);
            toast({
              title: "Serial Number Scanned",
              description: `Serial number captured: ${serialNumber}`,
            });
            // Trigger autofill after scanning
            handleAutofill(productIndex);
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

  // Autofill functionality
  const handleAutofill = async (productIndex: number) => {
    const product = form.getValues(`products.${productIndex}`);
    const lookupUrl = serialLookupSettings?.settingValue?.powerAutomateSerialLookupUrl;

    if (!lookupUrl) {
      toast({
        title: "Configuration Error",
        description: "Serial lookup API URL is not configured. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one serial number is provided
    if (!product.manufacturerSerialNumber && !product.inHouseSerialNumber) {
      toast({
        title: "Missing Serial Number",
        description: "Please enter at least one serial number to lookup product information.",
        variant: "destructive",
      });
      return;
    }

    setAutofillLoadingStates(prev => ({ ...prev, [productIndex]: true }));

    try {
      const payload = {
        manufacturerSerialNumber: product.manufacturerSerialNumber || "not required",
        inhouseSerialNumber: product.inHouseSerialNumber || "not required",
      };

      const response = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to lookup serial number');
      }

      const data: AutofillResponse = await response.json();

      // Check if product was found
      if (!data.ProductDescription || data.ProductDescription === "") {
        // CRM miss - mark as such and allow manual entry
        setCrmMissProducts(prev => new Set(prev).add(productIndex));
        form.setValue(`products.${productIndex}.isCrmMiss`, true);
        
        toast({
          title: "Product Not Found in CRM",
          description: "This unit is not present in our system. You can still continue by manually entering the product details.",
          variant: "destructive",
        });
      } else {
        // Success - populate fields
        if (data.manufacturerSerialNumber && !product.manufacturerSerialNumber) {
          form.setValue(`products.${productIndex}.manufacturerSerialNumber`, data.manufacturerSerialNumber);
        }
        if (data.inhouseSerialNumber && !product.inHouseSerialNumber) {
          form.setValue(`products.${productIndex}.inHouseSerialNumber`, data.inhouseSerialNumber);
        }
        if (data.ProductDescription) {
          form.setValue(`products.${productIndex}.productMakeModel`, data.ProductDescription);
        }
        
        form.setValue(`products.${productIndex}.isAutoFilled`, true);
        form.setValue(`products.${productIndex}.isCrmMiss`, false);
        setCrmMissProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productIndex);
          return newSet;
        });

        toast({
          title: "Product Information Retrieved",
          description: "Product details have been automatically filled.",
        });
      }
    } catch (error) {
      console.error('Autofill error:', error);
      toast({
        title: "Lookup Failed",
        description: "Unable to retrieve product information. Please enter details manually.",
        variant: "destructive",
      });
      
      // Mark as CRM miss on error
      setCrmMissProducts(prev => new Set(prev).add(productIndex));
      form.setValue(`products.${productIndex}.isCrmMiss`, true);
    } finally {
      setAutofillLoadingStates(prev => ({ ...prev, [productIndex]: false }));
    }
  };

  // Handle Enter key for autofill
  const handleSerialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, productIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAutofill(productIndex);
    }
  };

  // Handle Excel upload and parsing
  const handleExcelUpload = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Empty File",
          description: "The uploaded Excel file contains no data.",
          variant: "destructive",
        });
        return;
      }

      // Map Excel columns to product fields
      const products = jsonData.map((row: any) => ({
        manufacturerSerialNumber: row['Manufacturer Serial'] || row['ManufacturerSerial'] || row['Manufacturer Serial Number'] || "",
        inHouseSerialNumber: row['Inhouse Serial'] || row['InhouseSerial'] || row['In-house Serial Number'] || "",
        productMakeModel: row['Product'] || row['ProductDescription'] || row['Product Make and Model'] || "",
        faultDescription: row['Fault'] || row['FaultDescription'] || row['Issue'] || "",
        isAutoFilled: false,
        isCrmMiss: false,
      }));

      form.setValue('products', products);
      
      // Enable file upload mode and set product count
      setIsFileUploadMode(true);
      setUploadedProductCount(products.length);

      toast({
        title: "Excel Data Loaded",
        description: `${products.length} product(s) detected in your sheet.`,
      });

      // Trigger autofill for each product with a delay to avoid rate limiting
      for (let i = 0; i < products.length; i++) {
        if (products[i].manufacturerSerialNumber || products[i].inHouseSerialNumber) {
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, i * 1000)); // 1 second delay between each request
          await handleAutofill(i);
        }
      }
    } catch (error) {
      console.error('Excel parsing error:', error);
      toast({
        title: "Excel Parsing Failed",
        description: "Unable to parse the Excel file. Please check the file format.",
        variant: "destructive",
      });
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
        // Process Excel file for autofill
        handleExcelUpload(file);
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
    setIsFileUploadMode(false);
    setUploadedProductCount(0);
  };

  const switchToManualEntry = () => {
    // Clear uploaded file and reset to manual mode
    setUploadedFile(null);
    setIsFileUploadMode(false);
    setUploadedProductCount(0);
    // Reset products to single empty product
    form.setValue('products', [{
      productMakeModel: "",
      manufacturerSerialNumber: "",
      inHouseSerialNumber: "",
      faultDescription: "",
      isAutoFilled: false,
      isCrmMiss: false,
    }]);
    toast({
      title: "Switched to Manual Entry",
      description: "You can now add products manually.",
    });
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

      // Submit RMA request (creates request log, not actual RMA)
      const response: any = await apiRequest("POST", "/api/rmas", rmaData);
      
      toast({
        title: "Request Submitted Successfully",
        description: response?.message || "Your warranty claim request has been submitted. You'll be notified once it's reviewed.",
      });
      
      form.reset();
      setUploadedFile(null);
      setEmailChangeDecision(null);
      setPendingSubmitData(null);
      setCrmMissProducts(new Set());
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to submit your warranty claim request. Please try again.",
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

              {/* File Upload - Placed before products for Excel import - Hide when in file upload mode */}
              {!isFileUploadMode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-neutral-900">Upload Product List (Optional)</h3>
                  <p className="text-sm text-neutral-600">Upload an Excel file with product details to auto-populate the form. The file should include columns for Manufacturer Serial, Inhouse Serial, Product Description, and Fault Description.</p>
                  
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
                          <p className="text-xs text-neutral-500">Products will be automatically populated and looked up in the system</p>
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
              )}

              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900">Products</h3>
                
                {/* Show file upload summary or manual entry */}
                {isFileUploadMode ? (
                  <Card className="p-6 bg-green-50 border-green-200">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-900">
                              {uploadedProductCount} product{uploadedProductCount !== 1 ? 's' : ''} detected in your sheet
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              Product details loaded from uploaded file and will be included in your request.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={switchToManualEntry}
                        className="w-full border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Products Manually Instead
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {form.watch('products').map((product, index) => (
                  <Card key={index} className={`p-4 ${crmMissProducts.has(index) ? 'border-amber-500 border-2' : ''}`}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                          Product {index + 1}
                          {product.isAutoFilled && !product.isCrmMiss && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Auto-filled
                            </span>
                          )}
                          {product.isCrmMiss && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                              <AlertCircle className="h-3 w-3" />
                              Not in CRM
                            </span>
                          )}
                        </h4>
                        {form.watch('products').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentProducts = form.getValues('products');
                              form.setValue('products', currentProducts.filter((_, i) => i !== index));
                              // Update CRM miss tracking
                              setCrmMissProducts(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(index);
                                return newSet;
                              });
                            }}
                            data-testid={`button-remove-product-${index}`}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {crmMissProducts.has(index) && (
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-amber-800">
                            This product was not found in our CRM system. You can still continue by manually entering the product details.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`products.${index}.manufacturerSerialNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manufacturer's Serial Number</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. SN12345678" 
                                    {...field} 
                                    data-testid={`input-manufacturer-serial-${index}`}
                                    onKeyDown={(e) => handleSerialKeyDown(e, index)}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => {
                                    setCurrentScanningIndex(index);
                                    setIsScannerOpen(true);
                                  }}
                                  data-testid={`button-scan-qr-${index}`}
                                >
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => handleAutofill(index)}
                                  disabled={autofillLoadingStates[index]}
                                  data-testid={`button-search-manufacturer-${index}`}
                                >
                                  {autofillLoadingStates[index] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`products.${index}.inHouseSerialNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>In-house Serial Number</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. 1HP840G7I516256W11" 
                                    {...field} 
                                    data-testid={`input-inhouse-serial-${index}`}
                                    onKeyDown={(e) => handleSerialKeyDown(e, index)}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => handleAutofill(index)}
                                  disabled={autofillLoadingStates[index]}
                                  data-testid={`button-search-inhouse-${index}`}
                                >
                                  {autofillLoadingStates[index] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Search className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`products.${index}.productMakeModel`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Product Make and Model
                              {!product.isCrmMiss && <span className="text-red-500 ml-1">*</span>}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. HP 840 G7" 
                                {...field} 
                                data-testid={`input-product-model-${index}`}
                                disabled={autofillLoadingStates[index]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`products.${index}.faultDescription`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description of Fault *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe the issue you are experiencing with this device in detail..."
                                className="min-h-[80px]"
                                {...field}
                                data-testid={`textarea-fault-description-${index}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}

                {/* Add Product Button - Moved below product cards */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentProducts = form.getValues('products');
                    form.setValue('products', [...currentProducts, {
                      productMakeModel: "",
                      manufacturerSerialNumber: "",
                      inHouseSerialNumber: "",
                      faultDescription: "",
                      isAutoFilled: false,
                      isCrmMiss: false,
                    }]);
                  }}
                  data-testid="button-add-product"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
                  </>
                )}

                {/* QR Scanner Dialog */}
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
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
                          <Button onClick={() => startScanner(currentScanningIndex)}>
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
