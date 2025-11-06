import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EsgTarget } from "@shared/schema";

export function EsgTargetsManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<EsgTarget | null>(null);
  const [formData, setFormData] = useState({
    category: "environmental",
    title: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    description: "",
    displayOrder: "0",
    isActive: true,
    targetDate: "",
  });

  const { data: targets, isLoading } = useQuery<EsgTarget[]>({
    queryKey: ["/api/admin/esg-targets"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/esg-targets", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/esg-targets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/esg-targets"] });
      toast({ title: "ESG target created successfully" });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create ESG target", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/admin/esg-targets/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/esg-targets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/esg-targets"] });
      toast({ title: "ESG target updated successfully" });
      setEditingTarget(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update ESG target", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/esg-targets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/esg-targets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/esg-targets"] });
      toast({ title: "ESG target deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ESG target", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      category: "environmental",
      title: "",
      targetValue: "",
      currentValue: "",
      unit: "",
      description: "",
      displayOrder: "0",
      isActive: true,
      targetDate: "",
    });
  };

  const handleCreate = () => {
    createMutation.mutate({
      category: formData.category,
      title: formData.title,
      targetValue: formData.targetValue,
      currentValue: formData.currentValue || "0",
      unit: formData.unit,
      description: formData.description || null,
      displayOrder: parseInt(formData.displayOrder) || 0,
      isActive: formData.isActive,
      targetDate: formData.targetDate || null,
    });
  };

  const handleUpdate = () => {
    if (!editingTarget) return;
    updateMutation.mutate({
      id: editingTarget.id,
      data: {
        category: formData.category,
        title: formData.title,
        targetValue: formData.targetValue,
        currentValue: formData.currentValue,
        unit: formData.unit,
        description: formData.description || null,
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive,
        targetDate: formData.targetDate || null,
      },
    });
  };

  const handleEdit = (target: EsgTarget) => {
    setEditingTarget(target);
    setFormData({
      category: target.category,
      title: target.title,
      targetValue: target.targetValue,
      currentValue: target.currentValue,
      unit: target.unit,
      description: target.description || "",
      displayOrder: target.displayOrder.toString(),
      isActive: target.isActive,
      targetDate: target.targetDate ? new Date(target.targetDate).toISOString().split('T')[0] : "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ESG target?")) {
      deleteMutation.mutate(id);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      environmental: "bg-green-500",
      social: "bg-blue-500",
      governance: "bg-purple-500",
    };
    return <Badge className={colors[category as keyof typeof colors] || "bg-gray-500"}>{category}</Badge>;
  };

  const calculateProgress = (current: string, target: string) => {
    const currentNum = parseFloat(current) || 0;
    const targetNum = parseFloat(target) || 1;
    return Math.min(100, Math.round((currentNum / targetNum) * 100));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ESG Targets Management
              </CardTitle>
              <CardDescription>
                Configure sustainability goals displayed in the ESG Report
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-target">
              <Plus className="mr-2 h-4 w-4" />
              Add Target
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading targets...</div>
          ) : targets && targets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((target) => (
                  <TableRow key={target.id} data-testid={`row-target-${target.id}`}>
                    <TableCell>{getCategoryBadge(target.category)}</TableCell>
                    <TableCell className="font-medium">{target.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${calculateProgress(target.currentValue, target.targetValue)}%` }}
                          />
                        </div>
                        <span className="text-sm">{calculateProgress(target.currentValue, target.targetValue)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {target.targetValue} {target.unit}
                    </TableCell>
                    <TableCell>
                      {target.currentValue} {target.unit}
                    </TableCell>
                    <TableCell>
                      {target.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(target)}
                          data-testid={`button-edit-${target.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(target.id)}
                          data-testid={`button-delete-${target.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No ESG targets configured. Click "Add Target" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen || !!editingTarget} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingTarget(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTarget ? "Edit ESG Target" : "Create ESG Target"}</DialogTitle>
            <DialogDescription>
              {editingTarget ? "Update the ESG target details" : "Add a new sustainability goal"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Carbon Reduction Goal"
                data-testid="input-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  placeholder="1000"
                  data-testid="input-target-value"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="500"
                  data-testid="input-current-value"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg CO₂, families, units"
                data-testid="input-unit"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this sustainability goal..."
                data-testid="input-description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  data-testid="input-display-order"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Target Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  data-testid="input-target-date"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
                data-testid="checkbox-is-active"
              />
              <Label htmlFor="isActive">Active (visible to users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTarget(null);
                resetForm();
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={editingTarget ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit"
            >
              {editingTarget ? "Update Target" : "Create Target"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
