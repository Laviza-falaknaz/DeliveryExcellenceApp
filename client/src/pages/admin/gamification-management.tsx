import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Trophy, Target } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function GamificationManagement() {
  const { toast } = useToast();
  const [achievementDialogOpen, setAchievementDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);

  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/gamification/achievements"],
  });

  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ["/api/gamification/milestones"],
  });

  const createAchievementMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/gamification/achievements", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/achievements"] });
      setAchievementDialogOpen(false);
      setEditingAchievement(null);
      toast({ title: "Achievement created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create achievement", variant: "destructive" });
    },
  });

  const updateAchievementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/gamification/achievements/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/achievements"] });
      setAchievementDialogOpen(false);
      setEditingAchievement(null);
      toast({ title: "Achievement updated successfully" });
    },
  });

  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gamification/achievements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/achievements"] });
      toast({ title: "Achievement deleted successfully" });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/gamification/milestones", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/milestones"] });
      setMilestoneDialogOpen(false);
      setEditingMilestone(null);
      toast({ title: "Milestone created successfully" });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PATCH", `/api/gamification/milestones/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/milestones"] });
      setMilestoneDialogOpen(false);
      setEditingMilestone(null);
      toast({ title: "Milestone updated successfully" });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/gamification/milestones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/milestones"] });
      toast({ title: "Milestone deleted successfully" });
    },
  });

  const handleSaveAchievement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      icon: formData.get("icon") as string,
      badgeColor: formData.get("badgeColor") as string,
      points: parseInt(formData.get("points") as string),
      criteria: {
        type: formData.get("criteriaType") as string,
        threshold: parseInt(formData.get("threshold") as string),
      },
      isActive: formData.get("isActive") === "on",
    };

    if (editingAchievement) {
      updateAchievementMutation.mutate({ id: editingAchievement.id, data });
    } else {
      createAchievementMutation.mutate(data);
    }
  };

  const handleSaveMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      metricType: formData.get("metricType") as string,
      targetValue: parseInt(formData.get("targetValue") as string),
      rewardPoints: parseInt(formData.get("rewardPoints") as string),
      icon: formData.get("icon") as string,
      color: formData.get("color") as string,
      isActive: formData.get("isActive") === "on",
    };

    if (editingMilestone) {
      updateMilestoneMutation.mutate({ id: editingMilestone.id, data });
    } else {
      createMilestoneMutation.mutate(data);
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gamification Management</h1>
        <p className="text-neutral-600">Manage achievements, milestones, and rewards</p>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <Target className="h-4 w-4 mr-2" />
            Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Define achievements users can unlock</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingAchievement(null);
                    setAchievementDialogOpen(true);
                  }}
                  data-testid="button-create-achievement"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Achievement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAchievements ? (
                <p>Loading...</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements?.map((achievement: any) => (
                    <Card key={achievement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                            style={{ backgroundColor: achievement.badgeColor }}
                          >
                            <i className={achievement.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-neutral-900">{achievement.name}</h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAchievement(achievement);
                                    setAchievementDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-achievement-${achievement.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteAchievementMutation.mutate(achievement.id)}
                                  data-testid={`button-delete-achievement-${achievement.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">{achievement.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {achievement.category}
                              </Badge>
                              <Badge className="bg-[#08ABAB]">{achievement.points} XP</Badge>
                              <Badge variant={achievement.isActive ? "default" : "secondary"}>
                                {achievement.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>Define environmental impact milestones</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingMilestone(null);
                    setMilestoneDialogOpen(true);
                  }}
                  data-testid="button-create-milestone"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMilestones ? (
                <p>Loading...</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {milestones?.map((milestone: any) => (
                    <Card key={milestone.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0"
                            style={{ backgroundColor: milestone.color }}
                          >
                            <i className={milestone.icon}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-neutral-900">{milestone.name}</h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingMilestone(milestone);
                                    setMilestoneDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-milestone-${milestone.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteMilestoneMutation.mutate(milestone.id)}
                                  data-testid={`button-delete-milestone-${milestone.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-neutral-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{milestone.metricType}</Badge>
                              <Badge>{milestone.targetValue} target</Badge>
                              <Badge className="bg-[#08ABAB]">{milestone.rewardPoints} XP</Badge>
                              <Badge variant={milestone.isActive ? "default" : "secondary"}>
                                {milestone.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievement Dialog */}
      <Dialog open={achievementDialogOpen} onOpenChange={setAchievementDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? "Edit Achievement" : "Create Achievement"}
            </DialogTitle>
            <DialogDescription>
              Define an achievement that users can unlock
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAchievement}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingAchievement?.name}
                  required
                  data-testid="input-achievement-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingAchievement?.description}
                  required
                  data-testid="textarea-achievement-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingAchievement?.category || "environmental"}>
                    <SelectTrigger data-testid="select-achievement-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="milestones">Milestones</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    defaultValue={editingAchievement?.points || 100}
                    required
                    data-testid="input-achievement-points"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (Remix Icon class)</Label>
                  <Input
                    id="icon"
                    name="icon"
                    defaultValue={editingAchievement?.icon || "ri-trophy-line"}
                    placeholder="ri-trophy-line"
                    required
                    data-testid="input-achievement-icon"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="badgeColor">Badge Color (Hex)</Label>
                  <Input
                    id="badgeColor"
                    name="badgeColor"
                    type="color"
                    defaultValue={editingAchievement?.badgeColor || "#08ABAB"}
                    required
                    data-testid="input-achievement-color"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="criteriaType">Criteria Type</Label>
                  <Input
                    id="criteriaType"
                    name="criteriaType"
                    defaultValue={editingAchievement?.criteria?.type || "orders_count"}
                    placeholder="orders_count"
                    required
                    data-testid="input-achievement-criteria-type"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Threshold</Label>
                  <Input
                    id="threshold"
                    name="threshold"
                    type="number"
                    defaultValue={editingAchievement?.criteria?.threshold || 1}
                    required
                    data-testid="input-achievement-threshold"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={editingAchievement?.isActive !== false}
                  data-testid="switch-achievement-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAchievementDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="button-save-achievement">
                {editingAchievement ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? "Edit Milestone" : "Create Milestone"}
            </DialogTitle>
            <DialogDescription>
              Define an environmental impact milestone
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMilestone}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="milestone-name">Name</Label>
                <Input
                  id="milestone-name"
                  name="name"
                  defaultValue={editingMilestone?.name}
                  required
                  data-testid="input-milestone-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="milestone-description">Description</Label>
                <Textarea
                  id="milestone-description"
                  name="description"
                  defaultValue={editingMilestone?.description}
                  required
                  data-testid="textarea-milestone-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="metricType">Metric Type</Label>
                  <Input
                    id="metricType"
                    name="metricType"
                    defaultValue={editingMilestone?.metricType || "carbon_saved"}
                    placeholder="carbon_saved"
                    required
                    data-testid="input-milestone-metric-type"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    name="targetValue"
                    type="number"
                    defaultValue={editingMilestone?.targetValue || 1000}
                    required
                    data-testid="input-milestone-target-value"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="milestone-icon">Icon</Label>
                  <Input
                    id="milestone-icon"
                    name="icon"
                    defaultValue={editingMilestone?.icon || "ri-medal-line"}
                    placeholder="ri-medal-line"
                    required
                    data-testid="input-milestone-icon"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="milestone-color">Color</Label>
                  <Input
                    id="milestone-color"
                    name="color"
                    type="color"
                    defaultValue={editingMilestone?.color || "#08ABAB"}
                    required
                    data-testid="input-milestone-color"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rewardPoints">Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    name="rewardPoints"
                    type="number"
                    defaultValue={editingMilestone?.rewardPoints || 500}
                    required
                    data-testid="input-milestone-reward-points"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="milestone-isActive"
                  name="isActive"
                  defaultChecked={editingMilestone?.isActive !== false}
                  data-testid="switch-milestone-active"
                />
                <Label htmlFor="milestone-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" data-testid="button-save-milestone">
                {editingMilestone ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
