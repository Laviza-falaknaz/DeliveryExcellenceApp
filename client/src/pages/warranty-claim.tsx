import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

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

  const form = useForm<WarrantyClaimFormValues>({
    resolver: zodResolver(warrantyClaimSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      deliveryAddress: "",
      recipientContactNumber: "",
      countryOfPurchase: "",
      numberOfProducts: 1,
      productMakeModel: "",
      manufacturerSerialNumber: "",
      inHouseSerialNumber: "",
      faultDescription: "",
      consent: false,
    },
  });

  async function onSubmit(data: WarrantyClaimFormValues) {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, we would send this data to the API
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Warranty Claim Submitted",
        description: "Your warranty claim has been submitted successfully. Our team will review it and contact you shortly.",
      });
      
      form.reset();
      setUploadedFile(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to submit your warranty claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
            className="bg-white border-neutral-300 text-neutral-900 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors"
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
                        className="bg-white border-neutral-300 text-neutral-900 hover:bg-primary hover:border-primary hover:text-white transition-colors"
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
                          Consent *
                        </FormLabel>
                        <FormDescription>
                          I agree to the{" "}
                          <a 
                            href="https://circularcomputing.com/warranty/uk/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            UK warranty terms and conditions
                          </a>
                        </FormDescription>
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
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Warranty Claim"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}