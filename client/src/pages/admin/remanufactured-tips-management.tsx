import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
      return apiRequest("/api/crud/remanufactured-tips", {
        method: "POST",
        body: JSON.stringify(tipData),
      });
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
      return apiRequest(`/api/crud/remanufactured-tips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crud/remanufactured-tips"] });
      setEditingTip(null);
      toast({ title: "Tip updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update tip", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/crud/remanufactured-tips/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crud/remanufactured-tips"] });
      toast({ title: "Tip deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete tip", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tipData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      icon: formData.get("icon") as string,
      category: formData.get("category") as string,
      categoryColor: formData.get("categoryColor") as string,
      displayOrder: parseInt(formData.get("displayOrder") as string),
      isActive: formData.get("isActive") === "true",
    };

    if (editingTip) {
      updateMutation.mutate({ id: editingTip.id, data: tipData });
    } else {
      createMutation.mutate(tipData);
    }
  };

  const TipForm = ({ tip }: { tip?: RemanufacturedTip | null }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={tip?.title}
          data-testid="input-title"
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          required
          defaultValue={tip?.content}
          data-testid="input-content"
          className="min-h-24"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          required
          defaultValue={tip?.category}
          placeholder="e.g., Setup, Configuration, Maintenance"
          data-testid="input-category"
        />
      </div>
      <div>
        <Label htmlFor="categoryColor">Category Color (Hex)</Label>
        <div className="flex gap-2">
          <Input
            id="categoryColor"
            name="categoryColor"
            required
            defaultValue={tip?.categoryColor || "#08ABAB"}
            placeholder="#08ABAB"
            data-testid="input-color"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
          <div
            className="w-12 h-10 rounded border"
            style={{ backgroundColor: tip?.categoryColor || "#08ABAB" }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter a hex color code (e.g., #08ABAB for teal)
        </p>
      </div>
      <div>
        <Label htmlFor="icon">Icon (Remix Icon Class)</Label>
        <Input
          id="icon"
          name="icon"
          required
          defaultValue={tip?.icon || "ri-information-line"}
          placeholder="ri-information-line"
          data-testid="input-icon"
        />
        <p className="text-xs text-gray-500 mt-1">
          Browse icons at{" "}
          <a
            href="https://remixicon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            remixicon.com
          </a>
        </p>
      </div>
      <div>
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          name="displayOrder"
          type="number"
          required
          defaultValue={tip?.displayOrder ?? 0}
          data-testid="input-order"
        />
        <p className="text-xs text-gray-500 mt-1">
          Lower numbers appear first in the carousel
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={tip?.isActive ?? true}
          value="true"
          data-testid="switch-active"
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
