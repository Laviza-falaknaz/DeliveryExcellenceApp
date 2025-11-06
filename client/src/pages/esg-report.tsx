import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Users, 
  Zap, 
  Target,
  Droplets,
  Leaf,
  Recycle,
  Heart,
  ChevronRight,
  Crown,
  Sparkles,
  Star,
  Lock
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ESGScoreData {
  totalScore: number;
  breakdown: {
    carbon: number;
    water: number;
    resources: number;
    social: number;
  };
  tierId: number | null;
  tierName: string;
  previousScore?: number;
  scoreChange?: number;
}

interface TierData {
  id: number;
  name: string;
  minScore: number;
  maxScore: number | null;
  colorAccent: string;
  icon: string | null;
  benefits: string[];
  displayOrder: number;
  isActive: boolean;
}

interface AchievementProgress {
  id: number;
  userId: number;
  achievementId: number;
  currentValue: string;
  progressPercent: number;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  achievement: {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string | null;
    category: string;
    thresholdType: string;
    thresholdValue: string;
    rewardPoints: number;
  };
}

interface MilestoneData {
  id: number;
  tierId: number | null;
  title: string;
  description: string;
  icon: string | null;
  requiredScore: number | null;
  orderIndex: number;
  isActive: boolean;
}

interface UserMilestoneEvent {
  id: number;
  userId: number;
  milestoneId: number;
  reachedAt: Date;
  milestone: MilestoneData;
}

interface ESGTarget {
  id: number;
  category: string;
  title: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  company?: string;
  totalScore: number;
  tier: string;
  tierColor: string;
  breakdown: {
    carbon: number;
    water: number;
    resources: number;
    social: number;
  };
}

interface BenchmarkData {
  userScore: number;
  averageScore: number;
  percentile: number;
  rank: number;
  totalUsers: number;
}

interface ImpactData {
  carbonSaved: number;
  waterProvided: number;
  mineralsSaved: number;
  familiesHelped: number;
  treesEquivalent: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function ESGReport() {
  const { toast } = useToast();

  const { data: user } = useQuery<UserData>({
    queryKey: ["/api/auth/me"],
  });

  const { data: scoreData, isLoading: isScoreLoading } = useQuery<ESGScoreData>({
    queryKey: ["/api/gamification/score"],
  });

  const { data: tiers } = useQuery<TierData[]>({
    queryKey: ["/api/gamification/tiers"],
  });

  const { data: achievements } = useQuery<AchievementProgress[]>({
    queryKey: ["/api/gamification/achievements"],
  });

  const { data: milestones } = useQuery<MilestoneData[]>({
    queryKey: ["/api/gamification/all-milestones"],
  });

  const { data: userMilestones } = useQuery<UserMilestoneEvent[]>({
    queryKey: ["/api/gamification/milestones"],
  });

  const { data: leaderboardData } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
  });

  const { data: benchmarkData } = useQuery<BenchmarkData>({
    queryKey: ["/api/gamification/benchmark"],
  });

  const { data: esgTargets } = useQuery<ESGTarget[]>({
    queryKey: ["/api/esg-targets"],
  });

  const { data: impact } = useQuery<ImpactData>({
    queryKey: ["/api/impact"],
  });

  const calculateScoreMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gamification/calculate-score", {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to calculate score");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/score"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/milestones"] });
      toast({
        title: "Score Updated",
        description: "Your ESG score has been recalculated successfully."
      });
    }
  });

  const currentTier = tiers?.find((t: any) => t.name === scoreData?.tierName);
  const nextTier = tiers?.find((t: any) => 
    t.minScore > (scoreData?.totalScore || 0)
  );

  const progressToNextTier = nextTier 
    ? Math.round(((scoreData?.totalScore || 0) / nextTier.minScore) * 100)
    : 100;

  const unlockedAchievements = achievements?.filter((a: any) => a.isUnlocked) || [];
  const lockedAchievements = achievements?.filter((a: any) => !a.isUnlocked) || [];

  const reachedMilestoneIds = userMilestones?.map((m: any) => m.milestoneId) || [];
  const sortedMilestones = milestones?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];

  if (isScoreLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your impact journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Hero Section - Tier Badge & Score */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8 md:p-12 mb-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <Badge 
                className="text-lg px-4 py-2 font-semibold"
                style={{ 
                  backgroundColor: currentTier?.colorAccent || '#08ABAB',
                  borderColor: currentTier?.colorAccent || '#08ABAB'
                }}
                data-testid="tier-badge"
              >
                <Crown className="w-5 h-5 mr-2" />
                {scoreData?.tierName || 'Explorer'}
              </Badge>
              {scoreData?.scoreChange && scoreData.scoreChange > 0 && (
                <Badge variant="secondary" className="gap-1" data-testid="score-change">
                  <TrendingUp className="w-4 h-4" />
                  +{scoreData.scoreChange}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-2" data-testid="user-name">
              Welcome back, {user?.name?.split(' ')[0] || 'Champion'}!
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your environmental impact is making a real difference
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button 
                onClick={() => calculateScoreMutation.mutate()}
                disabled={calculateScoreMutation.isPending}
                data-testid="button-refresh-score"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {calculateScoreMutation.isPending ? "Calculating..." : "Refresh Score"}
              </Button>
            </div>
          </div>

          {/* Score Dial */}
          <div className="relative">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={currentTier?.colorAccent || '#08ABAB'}
                  strokeWidth="8"
                  strokeDasharray={`${progressToNextTier * 2.83} 283`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${currentTier?.colorAccent || '#08ABAB'}40)`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-bold" data-testid="total-score">{scoreData?.totalScore || 0}</p>
                <p className="text-sm text-muted-foreground">ESG Score</p>
              </div>
            </div>
            {nextTier && (
              <p className="text-center mt-4 text-sm text-muted-foreground">
                {nextTier.minScore - (scoreData?.totalScore || 0)} points to {nextTier.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="impact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid" data-testid="tabs-navigation">
          <TabsTrigger value="impact" data-testid="tab-impact">
            <Target className="w-4 h-4 mr-2" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="journey" data-testid="tab-journey">
            <Award className="w-4 h-4 mr-2" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Users className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Impact Pillars Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Environmental Impact
              </CardTitle>
              <CardDescription>
                Track your progress across key sustainability pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carbon Pillar */}
                <div className="space-y-3" data-testid="pillar-carbon">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Carbon Saved</h3>
                        <p className="text-2xl font-bold" data-testid="value-carbon">
                          {((impact?.carbonSaved ?? 0) / 1000).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-semibold text-green-600" data-testid="score-carbon">
                        {scoreData?.breakdown?.carbon || 0}
                      </p>
                    </div>
                  </div>
                  {esgTargets?.find((t: any) => t.category === 'environmental' && t.title.toLowerCase().includes('carbon')) && (
                    <Progress 
                      value={Math.min(((impact?.carbonSaved ?? 0) / parseFloat(esgTargets.find((t: any) => t.category === 'environmental' && t.title.toLowerCase().includes('carbon'))?.targetValue || '1')) * 100, 100)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Water Pillar */}
                <div className="space-y-3" data-testid="pillar-water">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Droplets className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Families Helped</h3>
                        <p className="text-2xl font-bold" data-testid="value-families">
                          {impact?.familiesHelped ?? 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-semibold text-blue-600" data-testid="score-water">
                        {scoreData?.breakdown?.water || 0}
                      </p>
                    </div>
                  </div>
                  {esgTargets?.find((t: any) => t.category === 'social') && (
                    <Progress 
                      value={Math.min(((impact?.familiesHelped ?? 0) / parseFloat(esgTargets.find((t: any) => t.category === 'social')?.targetValue || '1')) * 100, 100)} 
                      className="h-2"
                    />
                  )}
                </div>

                {/* Resources Pillar */}
                <div className="space-y-3" data-testid="pillar-resources">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Recycle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Minerals Saved</h3>
                        <p className="text-2xl font-bold" data-testid="value-minerals">
                          {((impact?.mineralsSaved ?? 0) / 1000).toFixed(2)} kg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-semibold text-purple-600" data-testid="score-resources">
                        {scoreData?.breakdown?.resources || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Pillar */}
                <div className="space-y-3" data-testid="pillar-social">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-500/10">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Social Impact</h3>
                        <p className="text-2xl font-bold" data-testid="value-water-provided">
                          {(impact?.waterProvided ?? 0).toLocaleString()} L
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-lg font-semibold text-pink-600" data-testid="score-social">
                        {scoreData?.breakdown?.social || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Achievement Showcase
              </CardTitle>
              <CardDescription>
                {unlockedAchievements.length} of {achievements?.length || 0} achievements unlocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Unlocked
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAchievements.map((achievement: any) => (
                      <Card 
                        key={achievement.id} 
                        className="border-primary/50 bg-gradient-to-br from-primary/5 to-background"
                        data-testid={`achievement-unlocked-${achievement.achievement.code}`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Award className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{achievement.achievement.name}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {achievement.achievement.description}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                +{achievement.achievement.rewardPoints} points
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    In Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAchievements.slice(0, 6).map((achievement: any) => (
                      <Card 
                        key={achievement.id} 
                        className="opacity-75"
                        data-testid={`achievement-locked-${achievement.achievement.code}`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{achievement.achievement.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {achievement.achievement.description}
                              </p>
                              <Progress value={achievement.progressPercent} className="h-2 mb-2" />
                              <p className="text-xs text-muted-foreground">
                                {achievement.progressPercent}% complete
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey/Milestones Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Your Sustainability Journey
              </CardTitle>
              <CardDescription>
                Track your progress through key milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8">
                {sortedMilestones.map((milestone: any, index: number) => {
                  const isReached = reachedMilestoneIds.includes(milestone.id);
                  const isNext = !isReached && !sortedMilestones.slice(0, index).some((m: any) => !reachedMilestoneIds.includes(m.id));
                  
                  return (
                    <div 
                      key={milestone.id} 
                      className="flex gap-4 relative"
                      data-testid={`milestone-${milestone.id}`}
                    >
                      {index < sortedMilestones.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                      )}
                      
                      <div className={cn(
                        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0",
                        isReached 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : isNext 
                          ? "bg-background border-primary text-primary animate-pulse"
                          : "bg-muted border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {isReached ? (
                          <Zap className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-semibold">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-8">
                        <h4 className={cn(
                          "font-semibold mb-1",
                          isReached && "text-primary"
                        )}>
                          {milestone.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                        {milestone.requiredScore && (
                          <Badge variant={isReached ? "default" : "secondary"} className="text-xs">
                            {isReached ? "Completed" : `${milestone.requiredScore} points required`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Benchmark Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <p className="text-5xl font-bold text-primary" data-testid="user-rank">
                    #{benchmarkData?.rank || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    out of {benchmarkData?.totalUsers || 0} users
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Your Score</span>
                    <span className="font-semibold" data-testid="benchmark-user-score">
                      {benchmarkData?.userScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Score</span>
                    <span className="font-semibold" data-testid="benchmark-average">
                      {benchmarkData?.averageScore || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Percentile</span>
                    <Badge variant="secondary" data-testid="benchmark-percentile">
                      Top {100 - (benchmarkData?.percentile || 0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>
                  Top sustainability champions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData?.map((entry: any, index: number) => (
                    <div 
                      key={entry.userId}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border",
                        entry.userId === user?.id && "bg-primary/5 border-primary/50"
                      )}
                      data-testid={`leaderboard-rank-${entry.rank}`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : entry.rank}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold">{entry.name}</p>
                        <Badge 
                          variant="secondary" 
                          className="text-xs mt-1"
                          style={{ 
                            backgroundColor: `${entry.tierColor}20`,
                            borderColor: entry.tierColor
                          }}
                        >
                          {entry.tier}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.totalScore}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
