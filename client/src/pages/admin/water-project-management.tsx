import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function WaterProjectManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/water-projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest("/api/admin/water-projects", {
        method: "POST",
        body: JSON.stringify(projectData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-projects"] });
      setIsCreateOpen(false);
      toast({ title: "Water project created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create water project", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/water-projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-projects"] });
      setEditingProject(null);
      toast({ title: "Water project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update water project", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/water-projects/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-projects"] });
      toast({ title: "Water project deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete water project", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get("name"),
      location: formData.get("location"),
      description: formData.get("description"),
      peopleImpacted: parseInt(formData.get("peopleImpacted") as string),
      waterProvided: parseInt(formData.get("waterProvided") as string),
      imageUrl: formData.get("imageUrl"),
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: projectData });
    } else {
      createMutation.mutate(projectData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Water Project Management</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-project">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Water Project</DialogTitle>
                <DialogDescription>
                  Add a new water project to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" required data-testid="input-name" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required data-testid="input-location" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required data-testid="input-description" />
                </div>
                <div>
                  <Label htmlFor="peopleImpacted">People Impacted</Label>
                  <Input id="peopleImpacted" name="peopleImpacted" type="number" required data-testid="input-people" />
                </div>
                <div>
                  <Label htmlFor="waterProvided">Water Provided (liters)</Label>
                  <Input id="waterProvided" name="waterProvided" type="number" required data-testid="input-water" />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" required data-testid="input-image" />
                </div>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading water projects...</p>
        ) : projects && projects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>People Impacted</TableHead>
                <TableHead>Water Provided (L)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project: any) => (
                <TableRow key={project.id} data-testid={`row-project-${project.id}`}>
                  <TableCell data-testid={`text-name-${project.id}`}>{project.name}</TableCell>
                  <TableCell data-testid={`text-location-${project.id}`}>{project.location}</TableCell>
                  <TableCell data-testid={`text-people-${project.id}`}>{project.peopleImpacted}</TableCell>
                  <TableCell data-testid={`text-water-${project.id}`}>{project.waterProvided.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                        data-testid={`button-edit-${project.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this water project?")) {
                            deleteMutation.mutate(project.id);
                          }
                        }}
                        data-testid={`button-delete-${project.id}`}
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
          <p className="text-center text-gray-500">No water projects found</p>
        )}
      </CardContent>
    </Card>
  );
}
