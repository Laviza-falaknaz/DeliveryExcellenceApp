import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type KeyPerformanceInsight = {
  id: number;
  metricKey: string;
  metricName: string;
  metricValue: string;
  metricUnit: string | null;
  metricCategory: string;
  displayOrder: number;
  isActive: boolean;
  description: string | null;
  updatedAt: Date | null;
  createdAt: Date | null;
};

type InsightFormData = Omit<KeyPerformanceInsight, "id" | "createdAt" | "updatedAt">;

const DEFAULT_FORM_DATA: InsightFormData = {
  metricKey: "",
  metricName: "",
  metricValue: "",
  metricUnit: null,
  metricCategory: "environmental",
  displayOrder: 0,
  isActive: true,
  description: null,
};

export function KeyPerformanceInsightsManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<KeyPerformanceInsight | null>(null);
  const [formData, setFormData] = useState<InsightFormData>(DEFAULT_FORM_DATA);

  const { data: insights, isLoading } = useQuery<KeyPerformanceInsight[]>({
    queryKey: ["/api/admin/key-insights"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsightFormData) => {
      const response = await apiRequest("POST", "/api/admin/key-insights", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/key-insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/key-insights"] });
      toast({
        title: "Success",
        description: "Key insight created successfully",
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create key insight",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<KeyPerformanceInsight> }) => {
      const response = await apiRequest("PUT", `/api/admin/key-insights/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/key-insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/key-insights"] });
      toast({
        title: "Success",
        description: "Key insight updated successfully",
      });
      handleCloseDialog();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update key insight",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/key-insights/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/key-insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/key-insights"] });
      toast({
        title: "Success",
        description: "Key insight deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete key insight",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (insight?: KeyPerformanceInsight) => {
    if (insight) {
      setEditingInsight(insight);
      setFormData({
        metricKey: insight.metricKey,
        metricName: insight.metricName,
        metricValue: insight.metricValue,
        metricUnit: insight.metricUnit,
        metricCategory: insight.metricCategory,
        displayOrder: insight.displayOrder,
        isActive: insight.isActive,
        description: insight.description,
      });
    } else {
      setEditingInsight(null);
      setFormData(DEFAULT_FORM_DATA);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInsight(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInsight) {
      updateMutation.mutate({ id: editingInsight.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this key insight?")) {
      deleteMutation.mutate(id);
    }
  };

  const sortedInsights = insights?.sort((a, b) => a.displayOrder - b.displayOrder) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Key Performance Insights</CardTitle>
            <CardDescription>
              Manage admin-controlled metrics displayed in the ESG report
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-create-insight">
            <Plus className="h-4 w-4 mr-2" />
            Add Insight
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading...</div>
        ) : sortedInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No key insights configured. Click "Add Insight" to create one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInsights.map((insight) => (
                <TableRow key={insight.id} data-testid={`insight-${insight.id}`}>
                  <TableCell>{insight.displayOrder}</TableCell>
                  <TableCell>{insight.metricName}</TableCell>
                  <TableCell>
                    {insight.metricValue} {insight.metricUnit || ""}
                  </TableCell>
                  <TableCell className="capitalize">{insight.metricCategory}</TableCell>
                  <TableCell>
                    <span className={insight.isActive ? "text-green-600" : "text-gray-400"}>
                      {insight.isActive ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(insight)}
                        data-testid={`button-edit-${insight.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(insight.id)}
                        data-testid={`button-delete-${insight.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInsight ? "Edit Key Insight" : "Create Key Insight"}
            </DialogTitle>
            <DialogDescription>
              Configure a metric that will be displayed in the ESG report
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metricKey">Metric Key</Label>
                  <Input
                    id="metricKey"
                    value={formData.metricKey}
                    onChange={(e) => setFormData({ ...formData, metricKey: e.target.value })}
                    placeholder="e.g., remanufactured_units"
                    required
                    data-testid="input-metric-key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metricName">Display Name</Label>
                  <Input
                    id="metricName"
                    value={formData.metricName}
                    onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                    placeholder="e.g., Remanufactured Units Deployed"
                    required
                    data-testid="input-metric-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metricValue">Value</Label>
                  <Input
                    id="metricValue"
                    value={formData.metricValue}
                    onChange={(e) => setFormData({ ...formData, metricValue: e.target.value })}
                    placeholder="e.g., 1,234"
                    required
                    data-testid="input-metric-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metricUnit">Unit (Optional)</Label>
                  <Input
                    id="metricUnit"
                    value={formData.metricUnit || ""}
                    onChange={(e) => setFormData({ ...formData, metricUnit: e.target.value || null })}
                    placeholder="e.g., units, kg, %"
                    data-testid="input-metric-unit"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metricCategory">Category</Label>
                  <Select
                    value={formData.metricCategory}
                    onValueChange={(value) => setFormData({ ...formData, metricCategory: value })}
                  >
                    <SelectTrigger data-testid="select-metric-category">
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
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    required
                    data-testid="input-display-order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  placeholder="Help text or tooltip description"
                  data-testid="input-description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                  data-testid="checkbox-is-active"
                />
                <Label htmlFor="isActive">Active (display in ESG report)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-insight"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
