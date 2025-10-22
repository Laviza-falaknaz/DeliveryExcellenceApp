import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function ThemeSettings() {
  const { toast } = useToast();
  
  const { data: themeSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/theme"],
  });

  const [formData, setFormData] = useState({
    primaryColor: "#0D9488",
    secondaryColor: "#14B8A6",
    accentColor: "#2DD4BF",
    backgroundColor: "#FFFFFF",
    headingFont: "Inter",
    bodyFont: "Inter",
    logoUrl: "",
    companyName: "Circular Computing"
  });

  useEffect(() => {
    if (themeSettings) {
      setFormData(themeSettings);
    }
  }, [themeSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/admin/theme", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/theme"] });
      toast({
        title: "Theme settings saved",
        description: "Your theme preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save theme settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading theme settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Customize the appearance of your customer portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      className="h-10 w-20"
                      data-testid="input-primary-color"
                    />
                    <Input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => handleChange("primaryColor", e.target.value)}
                      placeholder="#0D9488"
                      className="flex-1"
                      data-testid="input-primary-color-text"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      className="h-10 w-20"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      type="text"
                      value={formData.secondaryColor}
                      onChange={(e) => handleChange("secondaryColor", e.target.value)}
                      placeholder="#14B8A6"
                      className="flex-1"
                      data-testid="input-secondary-color-text"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleChange("accentColor", e.target.value)}
                      className="h-10 w-20"
                      data-testid="input-accent-color"
                    />
                    <Input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => handleChange("accentColor", e.target.value)}
                      placeholder="#2DD4BF"
                      className="flex-1"
                      data-testid="input-accent-color-text"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => handleChange("backgroundColor", e.target.value)}
                      className="h-10 w-20"
                      data-testid="input-bg-color"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => handleChange("backgroundColor", e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                      data-testid="input-bg-color-text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Typography</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headingFont">Heading Font</Label>
                  <Input
                    id="headingFont"
                    value={formData.headingFont}
                    onChange={(e) => handleChange("headingFont", e.target.value)}
                    placeholder="e.g., Inter, Roboto"
                    data-testid="input-heading-font"
                  />
                </div>

                <div>
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Input
                    id="bodyFont"
                    value={formData.bodyFont}
                    onChange={(e) => handleChange("bodyFont", e.target.value)}
                    placeholder="e.g., Inter, Roboto"
                    data-testid="input-body-font"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Branding</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="Circular Computing"
                    data-testid="input-company-name"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-theme">
              {saveMutation.isPending ? "Saving..." : "Save Theme Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This is how your theme will look to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white p-6 space-y-4" style={{
            fontFamily: formData.bodyFont,
            backgroundColor: formData.backgroundColor
          }}>
            <h2 className="text-2xl font-bold" style={{ fontFamily: formData.headingFont }}>
              Welcome to Your Dashboard
            </h2>
            <p>
              This is a preview of how your customized theme will appear to your customers.
            </p>
            <div className="flex gap-2">
              <Button style={{ backgroundColor: formData.primaryColor }}>
                Primary Button
              </Button>
              <Button variant="outline">Secondary Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
