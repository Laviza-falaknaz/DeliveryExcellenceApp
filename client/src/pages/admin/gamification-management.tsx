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
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      icon: formData.get("icon") as string,
      thresholdType: formData.get("thresholdType") as string,
      thresholdValue: formData.get("thresholdValue") as string,
      rewardPoints: parseInt(formData.get("rewardPoints") as string),
      shareCopy: formData.get("shareCopy") as string || null,
      displayOrder: parseInt(formData.get("displayOrder") as string) || 0,
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
                  {(achievements as any[])?.map((achievement: any) => (
                    <Card key={achievement.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 bg-[#08ABAB]"
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
                              <Badge className="bg-[#08ABAB]">{achievement.rewardPoints} XP</Badge>
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
                  {(milestones as any[])?.map((milestone: any) => (
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
                <Label htmlFor="code">Code (unique identifier)</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={editingAchievement?.code}
                  placeholder="bronze_impact"
                  required
                  readOnly={!!editingAchievement}
                  className={editingAchievement ? "bg-neutral-100 cursor-not-allowed" : ""}
                  data-testid="input-achievement-code"
                />
                {editingAchievement && (
                  <p className="text-sm text-neutral-500">Code cannot be changed after creation</p>
                )}
              </div>
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
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rewardPoints">Reward Points</Label>
                  <Input
                    id="rewardPoints"
                    name="rewardPoints"
                    type="number"
                    defaultValue={editingAchievement?.rewardPoints || 100}
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
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    defaultValue={editingAchievement?.displayOrder || 0}
                    required
                    data-testid="input-achievement-display-order"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="thresholdType">Threshold Type</Label>
                  <Select name="thresholdType" defaultValue={editingAchievement?.thresholdType || "carbon_saved"}>
                    <SelectTrigger data-testid="select-achievement-threshold-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carbon_saved">Carbon Saved (grams)</SelectItem>
                      <SelectItem value="families_helped">Families Helped</SelectItem>
                      <SelectItem value="minerals_saved">Minerals Saved (grams)</SelectItem>
                      <SelectItem value="orders_count">Orders Count</SelectItem>
                      <SelectItem value="esg_score">ESG Score</SelectItem>
                      <SelectItem value="impact_shared">Impact Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="thresholdValue">Threshold Value</Label>
                  <Input
                    id="thresholdValue"
                    name="thresholdValue"
                    type="number"
                    defaultValue={editingAchievement?.thresholdValue || "1000"}
                    required
                    data-testid="input-achievement-threshold"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shareCopy">Share Copy (optional)</Label>
                <Input
                  id="shareCopy"
                  name="shareCopy"
                  defaultValue={editingAchievement?.shareCopy || ""}
                  placeholder="I just unlocked an achievement!"
                  data-testid="input-achievement-share-copy"
                />
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
