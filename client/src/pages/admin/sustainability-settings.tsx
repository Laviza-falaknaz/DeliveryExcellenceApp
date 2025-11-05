import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Leaf, Save, Info, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SustainabilityMetrics {
  carbonReductionPerLaptop: number;
  resourcePreservationPerLaptop: number;
  waterSavedPerLaptop: number;
  eWasteReductionPercentage: number;
  familiesHelpedPerLaptop: number;
  treesEquivalentPerLaptop: number;
}

export function SustainabilitySettings() {
  const { toast } = useToast();

  const { data: metrics, isLoading } = useQuery<SustainabilityMetrics>({
    queryKey: ["/api/admin/sustainability-metrics"],
  });

  const [formData, setFormData] = useState<SustainabilityMetrics>({
    carbonReductionPerLaptop: 316000,
    resourcePreservationPerLaptop: 1200000,
    waterSavedPerLaptop: 190000,
    eWasteReductionPercentage: 0,
    familiesHelpedPerLaptop: 1,
    treesEquivalentPerLaptop: 3,
  });

  useEffect(() => {
    if (metrics) {
      setFormData(metrics);
    }
  }, [metrics]);

  const saveMutation = useMutation({
    mutationFn: async (data: SustainabilityMetrics) => {
      const response = await apiRequest("PUT", "/api/admin/sustainability-metrics", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sustainability-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/impact"] });
      
      const recalcInfo = data?.recalculated 
        ? ` ${data.recalculated.updated} existing orders have been recalculated with the new metrics.`
        : '';
      
      toast({
        title: "Settings saved",
        description: `Sustainability metrics have been updated successfully.${recalcInfo}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof SustainabilityMetrics, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" data-testid="sustainability-settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-teal-600" />
            Sustainability Metrics
          </h1>
          <p className="text-gray-600 mt-2">
            Configure per-laptop environmental impact metrics. These values will be automatically calculated based on order quantities.
          </p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How it works:</p>
              <p>
                When orders are created or updated, the system automatically calculates environmental impact by multiplying
                these per-laptop metrics by the total quantity of laptops in the order. The calculated impact is then displayed
                to customers on their dashboard and impact page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Per Laptop Metrics
          </CardTitle>
          <CardDescription>
            Set the environmental impact values for each remanufactured laptop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="carbon">Carbon Reduction (grams)</Label>
              <Input
                id="carbon"
                type="number"
                value={formData.carbonReductionPerLaptop}
                onChange={(e) => handleChange("carbonReductionPerLaptop", e.target.value)}
                placeholder="e.g., 316000 (316 KG)"
                data-testid="input-carbon"
              />
              <p className="text-xs text-gray-500">
                Current: {(formData.carbonReductionPerLaptop / 1000).toFixed(0)} KG per laptop
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resources">Resource Preservation (grams)</Label>
              <Input
                id="resources"
                type="number"
                value={formData.resourcePreservationPerLaptop}
                onChange={(e) => handleChange("resourcePreservationPerLaptop", e.target.value)}
                placeholder="e.g., 1200000 (1200 KG)"
                data-testid="input-resources"
              />
              <p className="text-xs text-gray-500">
                Current: {(formData.resourcePreservationPerLaptop / 1000).toFixed(0)} KG per laptop
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="water">Water Saved (liters)</Label>
              <Input
                id="water"
                type="number"
                value={formData.waterSavedPerLaptop}
                onChange={(e) => handleChange("waterSavedPerLaptop", e.target.value)}
                placeholder="e.g., 190000"
                data-testid="input-water"
              />
              <p className="text-xs text-gray-500">
                Current: {formData.waterSavedPerLaptop.toLocaleString()} liters per laptop
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ewaste">E-Waste Reduction (%)</Label>
              <Input
                id="ewaste"
                type="number"
                value={formData.eWasteReductionPercentage}
                onChange={(e) => handleChange("eWasteReductionPercentage", e.target.value)}
                placeholder="e.g., 0"
                min="0"
                max="100"
                data-testid="input-ewaste"
              />
              <p className="text-xs text-gray-500">
                Current: {formData.eWasteReductionPercentage}%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="families">Families Helped</Label>
              <Input
                id="families"
                type="number"
                value={formData.familiesHelpedPerLaptop}
                onChange={(e) => handleChange("familiesHelpedPerLaptop", e.target.value)}
                placeholder="e.g., 1"
                data-testid="input-families"
              />
              <p className="text-xs text-gray-500">
                Current: {formData.familiesHelpedPerLaptop} {formData.familiesHelpedPerLaptop === 1 ? 'family' : 'families'} per laptop
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trees">Trees Equivalent</Label>
              <Input
                id="trees"
                type="number"
                value={formData.treesEquivalentPerLaptop}
                onChange={(e) => handleChange("treesEquivalentPerLaptop", e.target.value)}
                placeholder="e.g., 3"
                data-testid="input-trees"
              />
              <p className="text-xs text-gray-500">
                Current: {formData.treesEquivalentPerLaptop} {formData.treesEquivalentPerLaptop === 1 ? 'tree' : 'trees'} per laptop
              </p>
            </div>
          </div>

          <Separator />

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-medium text-teal-900 mb-2">Example Calculation</h4>
            <p className="text-sm text-teal-800">
              If a customer orders <strong>10 laptops</strong>, their total environmental impact will be:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-teal-800">
              <li>• Carbon Reduction: {((formData.carbonReductionPerLaptop * 10) / 1000).toFixed(0)} KG</li>
              <li>• Resources Preserved: {((formData.resourcePreservationPerLaptop * 10) / 1000).toFixed(0)} KG</li>
              <li>• Water Saved: {(formData.waterSavedPerLaptop * 10).toLocaleString()} liters</li>
              <li>• Families Helped: {formData.familiesHelpedPerLaptop * 10}</li>
              <li>• Trees Equivalent: {formData.treesEquivalentPerLaptop * 10}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
