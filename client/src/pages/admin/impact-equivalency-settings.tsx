import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings2, Save, X, Edit2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface ImpactEquivalencySetting {
  id: number;
  equivalencyType: string;
  name: string;
  description: string;
  conversionFactor: string;
  conversionOperation: string;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
}

export function ImpactEquivalencySettings() {
  const { toast } = useToast();
  const [editingSetting, setEditingSetting] = useState<ImpactEquivalencySetting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: settings = [], isLoading } = useQuery<ImpactEquivalencySetting[]>({
    queryKey: ["/api/admin/impact-equivalency-settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ImpactEquivalencySetting> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/admin/impact-equivalency-settings/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/impact-equivalency-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/impact/equivalents"] });
      toast({
        title: "Success",
        description: "Impact equivalency setting updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingSetting(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (setting: ImpactEquivalencySetting) => {
    setEditingSetting({ ...setting });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingSetting) return;
    updateMutation.mutate(editingSetting);
  };

  const handleUpdateField = (field: keyof ImpactEquivalencySetting, value: any) => {
    if (!editingSetting) return;
    setEditingSetting({ ...editingSetting, [field]: value });
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[#08ABAB]" />
          <h1 className="text-3xl font-bold">Impact Equivalency Settings</h1>
        </div>
        <p className="text-neutral-600">
          Configure how carbon savings are converted to relatable terms for customers. These calculations power the "Your Impact in Relatable Terms" section.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equivalency Conversion Factors</CardTitle>
          <CardDescription>
            Adjust the conversion factors to customize how carbon savings (in kg) are translated into everyday equivalents.
            The formula is: Result = Carbon (kg) {'{operation}'} Factor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="border rounded-lg p-4 hover:border-[#08ABAB] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${setting.color}20` }}
                    >
                      <i className={setting.icon} style={{ color: setting.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{setting.name}</h3>
                        {!setting.isActive && (
                          <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-1 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        Carbon (kg) {setting.conversionOperation === 'divide' ? '÷' : '×'} {setting.conversionFactor} = {setting.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(setting)}
                    data-testid={`button-edit-${setting.equivalencyType}`}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Equivalency Setting</DialogTitle>
            <DialogDescription>
              Update the conversion factor and display settings for this equivalency type.
            </DialogDescription>
          </DialogHeader>

          {editingSetting && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={editingSetting.name}
                    onChange={(e) => handleUpdateField('name', e.target.value)}
                    placeholder="e.g., Trees Planted"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingSetting.description}
                    onChange={(e) => handleUpdateField('description', e.target.value)}
                    placeholder="e.g., trees planted"
                    data-testid="input-description"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conversionFactor">Conversion Factor</Label>
                  <Input
                    id="conversionFactor"
                    type="number"
                    step="0.00001"
                    value={editingSetting.conversionFactor}
                    onChange={(e) => handleUpdateField('conversionFactor', e.target.value)}
                    placeholder="e.g., 2.5 or 0.047619"
                    data-testid="input-conversion-factor"
                  />
                  <p className="text-xs text-neutral-500">
                    The number to {editingSetting.conversionOperation === 'divide' ? 'divide' : 'multiply'} carbon (kg) by
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversionOperation">Operation</Label>
                  <Select
                    value={editingSetting.conversionOperation}
                    onValueChange={(value) => handleUpdateField('conversionOperation', value)}
                  >
                    <SelectTrigger id="conversionOperation" data-testid="select-operation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiply">Multiply (×)</SelectItem>
                      <SelectItem value="divide">Divide (÷)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    How to apply the conversion factor
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Formula Preview:</p>
                <p className="text-sm text-neutral-600">
                  Result = Carbon (kg) {editingSetting.conversionOperation === 'divide' ? '÷' : '×'} {editingSetting.conversionFactor}
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  Example: If a user saved 100 kg of carbon, the result would be: {
                    editingSetting.conversionOperation === 'divide' 
                      ? Math.round(100 / parseFloat(editingSetting.conversionFactor || '1'))
                      : Math.round(100 * parseFloat(editingSetting.conversionFactor || '1'))
                  } {editingSetting.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Class</Label>
                  <Input
                    id="icon"
                    value={editingSetting.icon}
                    onChange={(e) => handleUpdateField('icon', e.target.value)}
                    placeholder="e.g., ri-plant-line"
                    data-testid="input-icon"
                  />
                  <p className="text-xs text-neutral-500">
                    Remix Icon class name (browse at <a href="https://remixicon.com" target="_blank" rel="noopener noreferrer" className="underline">remixicon.com</a>)
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center">
                      <i className={editingSetting.icon} style={{ color: editingSetting.color }} />
                    </div>
                    <span className="text-sm text-neutral-600">Icon Preview</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={editingSetting.color}
                      onChange={(e) => handleUpdateField('color', e.target.value)}
                      className="w-20 h-10"
                      data-testid="input-color"
                    />
                    <Input
                      value={editingSetting.color}
                      onChange={(e) => handleUpdateField('color', e.target.value)}
                      placeholder="#08ABAB"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    Hex color code for the card and icon
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={editingSetting.displayOrder}
                    onChange={(e) => handleUpdateField('displayOrder', parseInt(e.target.value))}
                    placeholder="e.g., 1"
                    data-testid="input-display-order"
                  />
                  <p className="text-xs text-neutral-500">
                    Order in which this appears (1 = first)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      id="isActive"
                      checked={editingSetting.isActive}
                      onCheckedChange={(checked) => handleUpdateField('isActive', checked)}
                      data-testid="switch-active"
                    />
                    <span className="text-sm">
                      {editingSetting.isActive ? 'Active (Visible to users)' : 'Inactive (Hidden)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingSetting(null);
                  }}
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
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
