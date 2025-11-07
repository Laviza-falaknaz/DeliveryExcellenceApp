import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings2, Save, X, Edit2, Leaf } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface EsgMeasurementParameter {
  id: number;
  parameterKey: string;
  parameterName: string;
  parameterValue: string;
  unit: string;
  category: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export function EsgParameters() {
  const { toast } = useToast();
  const [editingParameter, setEditingParameter] = useState<EsgMeasurementParameter | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: parameters = [], isLoading } = useQuery<EsgMeasurementParameter[]>({
    queryKey: ["/api/admin/esg-parameters"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EsgMeasurementParameter> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/esg-parameters/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/esg-parameters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/impact"] });
      queryClient.invalidateQueries({ queryKey: ["/api/impact/equivalents"] });
      toast({
        title: "Success",
        description: "ESG measurement parameter updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingParameter(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update parameter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (parameter: EsgMeasurementParameter) => {
    setEditingParameter({ ...parameter });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingParameter) return;
    updateMutation.mutate(editingParameter);
  };

  const handleUpdateField = (field: keyof EsgMeasurementParameter, value: any) => {
    if (!editingParameter) return;
    setEditingParameter({ ...editingParameter, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  const parametersByCategory = parameters.reduce((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, EsgMeasurementParameter[]>);

  const categoryTitles: Record<string, string> = {
    environmental: 'Environmental Parameters',
    social: 'Social Impact Parameters',
    governance: 'Governance Parameters',
  };

  const categoryDescriptions: Record<string, string> = {
    environmental: 'Configure the environmental impact metrics per laptop',
    social: 'Configure the social impact metrics per laptop',
    governance: 'Configure the governance and compliance metrics per laptop',
  };

  const sortedCategories = Object.keys(parametersByCategory).sort();

  const renderParameterCard = (param: EsgMeasurementParameter) => (
    <div
      key={param.id}
      className="border rounded-lg p-4 hover:border-[#08ABAB] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{param.parameterName}</h3>
            {!param.isActive && (
              <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-600 mb-1">
            <span className="font-medium text-[#08ABAB]">{param.parameterValue} {param.unit}</span> per laptop
          </p>
          {param.description && (
            <p className="text-xs text-neutral-500">{param.description}</p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(param)}
          data-testid={`button-edit-${param.parameterKey}`}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-6 w-6 text-[#08ABAB]" />
          <h1 className="text-3xl font-bold">ESG Measurement Parameters</h1>
        </div>
        <p className="text-neutral-600">
          Configure the base values used to calculate environmental, social, and governance impact for each remanufactured laptop sold. These parameters determine the carbon saved, water provided, and other sustainability metrics.
        </p>
      </div>

      <div className="space-y-6">
        {sortedCategories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>
                {categoryTitles[category] || `${category.charAt(0).toUpperCase() + category.slice(1)} Parameters`}
              </CardTitle>
              <CardDescription>
                {categoryDescriptions[category] || `Configure the ${category} impact metrics per laptop`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parametersByCategory[category].map(renderParameterCard)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit ESG Parameter</DialogTitle>
            <DialogDescription>
              Update the measurement value and settings for this ESG parameter.
            </DialogDescription>
          </DialogHeader>

          {editingParameter && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="parameterName">Parameter Name</Label>
                <Input
                  id="parameterName"
                  value={editingParameter.parameterName}
                  onChange={(e) => handleUpdateField('parameterName', e.target.value)}
                  placeholder="e.g., Carbon Saved per Laptop"
                  data-testid="input-parameter-name"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parameterValue">Value</Label>
                  <Input
                    id="parameterValue"
                    type="number"
                    step="0.01"
                    value={editingParameter.parameterValue}
                    onChange={(e) => handleUpdateField('parameterValue', e.target.value)}
                    placeholder="e.g., 316"
                    data-testid="input-parameter-value"
                  />
                  <p className="text-xs text-neutral-500">
                    The numeric value of this parameter
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={editingParameter.unit}
                    onChange={(e) => handleUpdateField('unit', e.target.value)}
                    placeholder="e.g., kg, liters, grams"
                    data-testid="input-unit"
                  />
                  <p className="text-xs text-neutral-500">
                    The unit of measurement
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingParameter.description || ''}
                  onChange={(e) => handleUpdateField('description', e.target.value)}
                  placeholder="Explain what this parameter represents..."
                  rows={3}
                  data-testid="textarea-description"
                />
                <p className="text-xs text-neutral-500">
                  Help text explaining what this parameter represents
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingParameter.category}
                    onValueChange={(value) => handleUpdateField('category', value)}
                  >
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={editingParameter.displayOrder}
                    onChange={(e) => handleUpdateField('displayOrder', parseInt(e.target.value))}
                    data-testid="input-display-order"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-xs text-neutral-500">
                    Enable or disable this parameter in calculations
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={editingParameter.isActive}
                  onCheckedChange={(checked) => handleUpdateField('isActive', checked)}
                  data-testid="switch-is-active"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium mb-1 text-blue-900">Impact on Calculations:</p>
                <p className="text-xs text-blue-700">
                  Changing this parameter will affect all future impact calculations. Existing impact records will not be retroactively updated.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EsgParameters;
