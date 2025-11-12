import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORIES = [
  { value: "Setup", color: "#10B981" },
  { value: "Configuration", color: "#3B82F6" },
  { value: "Maintenance", color: "#8B5CF6" },
  { value: "Important", color: "#EF4444" },
  { value: "Verification", color: "#F59E0B" },
  { value: "Care", color: "#06B6D4" },
];

const ICONS = [
  { class: "ri-information-line", label: "Info" },
  { class: "ri-settings-line", label: "Settings" },
  { class: "ri-tools-line", label: "Tools" },
  { class: "ri-alert-line", label: "Alert" },
  { class: "ri-check-line", label: "Check" },
  { class: "ri-lightbulb-line", label: "Lightbulb" },
  { class: "ri-heart-line", label: "Heart" },
  { class: "ri-star-line", label: "Star" },
  { class: "ri-shield-check-line", label: "Shield" },
  { class: "ri-battery-line", label: "Battery" },
  { class: "ri-download-line", label: "Download" },
  { class: "ri-upload-line", label: "Upload" },
  { class: "ri-refresh-line", label: "Refresh" },
  { class: "ri-time-line", label: "Time" },
  { class: "ri-save-line", label: "Save" },
  { class: "ri-folder-line", label: "Folder" },
];

type RemanufacturedTip = {
  id: number;
  title: string;
  content: string;
  icon: string;
  category: string;
  categoryColor: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function RemanufacturedTipsManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<RemanufacturedTip | null>(null);

  const { data: tips, isLoading } = useQuery<RemanufacturedTip[]>({
    queryKey: ["/api/crud/remanufactured-tips"],
  });

  const createMutation = useMutation({
    mutationFn: async (tipData: Partial<RemanufacturedTip>) => {
      return apiRequest("POST", "/api/crud/remanufactured-tips", tipData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crud/remanufactured-tips"] });
      setIsCreateOpen(false);
      toast({ title: "Tip created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create tip", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RemanufacturedTip> }) => {
      return apiRequest("PATCH", `/api/crud/remanufactured-tips/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crud/remanufactured-tips"] });
      setEditingTip(null);
      toast({ title: "Tip updated successfully" });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      const message = error?.message || "Failed to update tip";
      toast({ title: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/crud/remanufactured-tips/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crud/remanufactured-tips"] });
      toast({ title: "Tip deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tip", variant: "destructive" });
    },
  });

  const TipForm = ({ tip }: { tip?: RemanufacturedTip | null }) => {
    const form = useForm({
      defaultValues: {
        title: tip?.title || "",
        content: tip?.content || "",
        icon: tip?.icon || "ri-information-line",
        category: tip?.category || "Setup",
        categoryColor: tip?.categoryColor || "#10B981",
        displayOrder: tip?.displayOrder ?? 0,
        isActive: tip?.isActive ?? true,
      },
    });

    const onSubmit = (data: any) => {
      const tipData = {
        title: data.title,
        content: data.content,
        icon: data.icon,
        category: data.category,
        categoryColor: data.categoryColor,
        displayOrder: parseInt(data.displayOrder),
        isActive: data.isActive,
      };

      if (editingTip) {
        updateMutation.mutate({ id: editingTip.id, data: tipData });
      } else {
        createMutation.mutate(tipData);
      }
    };

    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...form.register("title", { required: true })}
            data-testid="input-title"
          />
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            {...form.register("content", { required: true })}
            data-testid="input-content"
            className="min-h-24"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const categoryData = CATEGORIES.find(c => c.value === value);
                  if (categoryData) {
                    form.setValue("categoryColor", categoryData.color);
                  }
                }}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.value}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label htmlFor="categoryColor">Category Color</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              id="categoryColor"
              {...form.register("categoryColor", { required: true })}
              className="h-10 w-20 rounded border cursor-pointer"
              data-testid="input-color"
            />
            <Input
              {...form.register("categoryColor", { required: true })}
              placeholder="#10B981"
              className="flex-1"
            />
            <div
              className="w-12 h-10 rounded border"
              style={{ backgroundColor: form.watch("categoryColor") || "#10B981" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pick a color or enter a hex code manually
          </p>
        </div>

        <div>
          <Label htmlFor="icon">Icon</Label>
          <Controller
            name="icon"
            control={form.control}
            render={({ field }) => (
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-2 p-3 border rounded bg-gray-50">
                  {ICONS.map((iconData) => (
                    <button
                      key={iconData.class}
                      type="button"
                      onClick={() => field.onChange(iconData.class)}
                      className={`p-2 rounded hover:bg-white transition-colors ${
                        field.value === iconData.class
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
                      title={iconData.label}
                      data-testid={`button-icon-${iconData.class}`}
                    >
                      <i className={`${iconData.class} text-xl`}></i>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Selected:</span>
                  <i className={`${field.value} text-2xl`}></i>
                  <code className="text-xs text-gray-500">{field.value}</code>
                </div>
              </div>
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Click an icon above to select it
          </p>
        </div>

        <div>
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            {...form.register("displayOrder", { required: true, valueAsNumber: true })}
            data-testid="input-order"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower numbers appear first in the carousel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="switch-active"
              />
            )}
          />
          <Label htmlFor="isActive">Active (visible to users)</Label>
        </div>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-submit"
        >
          {editingTip
            ? updateMutation.isPending
              ? "Updating..."
              : "Update Tip"
            : createMutation.isPending
              ? "Creating..."
              : "Create Tip"}
        </Button>
      </form>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Remanufactured Tips Management</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-tip">
                <Plus className="mr-2 h-4 w-4" />
                Create Tip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Tip</DialogTitle>
                <DialogDescription>
                  Add a new remanufactured laptop tip to display on the Remanufactured Explained page
                </DialogDescription>
              </DialogHeader>
              <TipForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading tips...</p>
        ) : tips && tips.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tips.map((tip) => (
                <TableRow key={tip.id} data-testid={`row-tip-${tip.id}`}>
                  <TableCell data-testid={`text-order-${tip.id}`}>
                    {tip.displayOrder}
                  </TableCell>
                  <TableCell data-testid={`text-title-${tip.id}`}>
                    {tip.title}
                  </TableCell>
                  <TableCell data-testid={`text-category-${tip.id}`}>
                    {tip.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: tip.categoryColor }}
                        data-testid={`color-${tip.id}`}
                      />
                      <span className="text-xs text-gray-500">
                        {tip.categoryColor}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        tip.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      data-testid={`status-${tip.id}`}
                    >
                      {tip.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog
                        open={editingTip?.id === tip.id}
                        onOpenChange={(open) => !open && setEditingTip(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTip(tip)}
                            data-testid={`button-edit-${tip.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Tip</DialogTitle>
                            <DialogDescription>
                              Update the tip details
                            </DialogDescription>
                          </DialogHeader>
                          <TipForm tip={editingTip} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this tip?")) {
                            deleteMutation.mutate(tip.id);
                          }
                        }}
                        data-testid={`button-delete-${tip.id}`}
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
          <p className="text-center text-gray-500">No tips found. Create your first tip to get started!</p>
        )}
      </CardContent>
    </Card>
  );
}
