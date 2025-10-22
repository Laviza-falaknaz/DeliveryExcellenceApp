import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Palette } from "lucide-react";

export function ThemeSettings() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Theme settings updated",
      description: "Your theme preferences have been saved successfully.",
    });
  };

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
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue="#0D9488"
                      className="h-10 w-20"
                      data-testid="input-primary-color"
                    />
                    <Input
                      type="text"
                      defaultValue="#0D9488"
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
                      name="secondaryColor"
                      type="color"
                      defaultValue="#14B8A6"
                      className="h-10 w-20"
                      data-testid="input-secondary-color"
                    />
                    <Input
                      type="text"
                      defaultValue="#14B8A6"
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
                      name="accentColor"
                      type="color"
                      defaultValue="#2DD4BF"
                      className="h-10 w-20"
                      data-testid="input-accent-color"
                    />
                    <Input
                      type="text"
                      defaultValue="#2DD4BF"
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
                      name="backgroundColor"
                      type="color"
                      defaultValue="#FFFFFF"
                      className="h-10 w-20"
                      data-testid="input-bg-color"
                    />
                    <Input
                      type="text"
                      defaultValue="#FFFFFF"
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
                    name="headingFont"
                    defaultValue="Inter"
                    placeholder="e.g., Inter, Roboto"
                    data-testid="input-heading-font"
                  />
                </div>

                <div>
                  <Label htmlFor="bodyFont">Body Font</Label>
                  <Input
                    id="bodyFont"
                    name="bodyFont"
                    defaultValue="Inter"
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
                    name="logoUrl"
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue="Circular Computing"
                    data-testid="input-company-name"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" data-testid="button-save-theme">
              Save Theme Settings
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
          <div className="rounded-lg border bg-white p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h2>
            <p className="text-gray-600">
              This is a preview of how your customized theme will appear to your customers.
            </p>
            <div className="flex gap-2">
              <Button className="bg-[#0D9488] hover:bg-[#0D9488]/90">Primary Button</Button>
              <Button variant="outline">Secondary Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
