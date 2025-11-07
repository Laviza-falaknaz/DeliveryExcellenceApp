import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  Lock,
  Footprints,
  User
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

interface KeyPerformanceInsight {
  id: number;
  metricKey: string;
  metricName: string;
  metricValue: string;
  metricUnit: string | null;
  metricCategory: string;
  displayOrder: number;
  isActive: boolean;
  description: string | null;
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

  const { data: keyInsights } = useQuery<KeyPerformanceInsight[]>({
    queryKey: ["/api/key-insights"],
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

  // Calculate which journey milestones have been reached based on score
  const reachedMilestoneIds = milestones?.filter((m: any) => 
    (scoreData?.totalScore || 0) >= m.requiredScore
  ).map((m: any) => m.id) || [];
  const sortedMilestones = milestones?.sort((a: any, b: any) => a.orderIndex - b.orderIndex) || [];

  // Auto-trigger score calculation once when achievements are empty (initializes progress tracking)
  const hasTriggeredCalculation = useRef(false);
  useEffect(() => {
    if (
      !hasTriggeredCalculation.current &&
      !calculateScoreMutation.isPending && 
      achievements !== undefined && 
      achievements.length === 0
    ) {
      hasTriggeredCalculation.current = true;
      calculateScoreMutation.mutate();
    }
  }, [achievements, calculateScoreMutation]);

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

  // Group insights by category
  const environmentalInsights = keyInsights?.filter(i => i.metricCategory === 'environmental') || [];
  const socialInsights = keyInsights?.filter(i => i.metricCategory === 'social') || [];
  const governanceInsights = keyInsights?.filter(i => i.metricCategory === 'governance') || [];

  // Group targets by category
  const environmentalTargets = esgTargets?.filter(t => t.category === 'environmental') || [];
  const socialTargets = esgTargets?.filter(t => t.category === 'social') || [];
  const governanceTargets = esgTargets?.filter(t => t.category === 'governance') || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* ESG Report Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="page-title">
              ESG Performance Report
            </h1>
            <p className="text-muted-foreground text-lg">
              Environmental, Social & Governance Impact Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            {scoreData && (
              <Badge 
                className="text-lg px-4 py-2 font-semibold"
                style={{ 
                  backgroundColor: currentTier?.colorAccent || '#08ABAB',
                  borderColor: currentTier?.colorAccent || '#08ABAB'
                }}
                data-testid="tier-badge"
              >
                <Crown className="w-5 h-5 mr-2" />
                {scoreData.tierName} Tier
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* ESG Goals & Targets Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            ESG Goals & Targets
          </CardTitle>
          <CardDescription>
            Track progress towards organizational sustainability objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="environmental" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="environmental" data-testid="tab-environmental-goals">
                <Leaf className="w-4 h-4 mr-2" />
                Environmental
              </TabsTrigger>
              <TabsTrigger value="social" data-testid="tab-social-goals">
                <Users className="w-4 h-4 mr-2" />
                Social
              </TabsTrigger>
              <TabsTrigger value="governance" data-testid="tab-governance-goals">
                <Award className="w-4 h-4 mr-2" />
                Governance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="environmental" className="space-y-4 mt-6">
              {environmentalTargets.length > 0 ? (
                environmentalTargets.map((target) => {
                  const currentValue = parseFloat(target.currentValue);
                  const targetValue = parseFloat(target.targetValue);
                  const progress = Math.min((currentValue / targetValue) * 100, 100);
                  
                  return (
                    <div key={target.id} className="space-y-2" data-testid={`goal-environmental-${target.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{target.title}</h4>
                          {target.description && (
                            <p className="text-sm text-muted-foreground">{target.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-lg">
                            {currentValue.toLocaleString()} / {targetValue.toLocaleString()} {target.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% achieved</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-8">No environmental targets set</p>
              )}
            </TabsContent>

            <TabsContent value="social" className="space-y-4 mt-6">
              {socialTargets.length > 0 ? (
                socialTargets.map((target) => {
                  const currentValue = parseFloat(target.currentValue);
                  const targetValue = parseFloat(target.targetValue);
                  const progress = Math.min((currentValue / targetValue) * 100, 100);
                  
                  return (
                    <div key={target.id} className="space-y-2" data-testid={`goal-social-${target.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{target.title}</h4>
                          {target.description && (
                            <p className="text-sm text-muted-foreground">{target.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-lg">
                            {currentValue.toLocaleString()} / {targetValue.toLocaleString()} {target.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% achieved</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-8">No social targets set</p>
              )}
            </TabsContent>

            <TabsContent value="governance" className="space-y-4 mt-6">
              {governanceTargets.length > 0 ? (
                governanceTargets.map((target) => {
                  const currentValue = parseFloat(target.currentValue);
                  const targetValue = parseFloat(target.targetValue);
                  const progress = Math.min((currentValue / targetValue) * 100, 100);
                  
                  return (
                    <div key={target.id} className="space-y-2" data-testid={`goal-governance-${target.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{target.title}</h4>
                          {target.description && (
                            <p className="text-sm text-muted-foreground">{target.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-lg">
                            {currentValue.toLocaleString()} / {targetValue.toLocaleString()} {target.unit}
                          </p>
                          <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% achieved</p>
                        </div>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-8">No governance targets set</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Key Performance Metrics Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>
            Critical metrics tracking organizational ESG performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Environmental KPIs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Environmental</h3>
              </div>
              {environmentalInsights.length > 0 ? (
                environmentalInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    data-testid={`kpi-environmental-${insight.metricKey}`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">{insight.metricName}</p>
                    <p className="text-2xl font-bold">
                      {insight.metricValue}
                      {insight.metricUnit && <span className="text-lg ml-1">{insight.metricUnit}</span>}
                    </p>
                    {insight.description && (
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No environmental metrics available</p>
              )}
            </div>

            {/* Social KPIs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Social</h3>
              </div>
              {socialInsights.length > 0 ? (
                socialInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    data-testid={`kpi-social-${insight.metricKey}`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">{insight.metricName}</p>
                    <p className="text-2xl font-bold">
                      {insight.metricValue}
                      {insight.metricUnit && <span className="text-lg ml-1">{insight.metricUnit}</span>}
                    </p>
                    {insight.description && (
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No social metrics available</p>
              )}
            </div>

            {/* Governance KPIs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Governance</h3>
              </div>
              {governanceInsights.length > 0 ? (
                governanceInsights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    data-testid={`kpi-governance-${insight.metricKey}`}
                  >
                    <p className="text-sm text-muted-foreground mb-1">{insight.metricName}</p>
                    <p className="text-2xl font-bold">
                      {insight.metricValue}
                      {insight.metricUnit && <span className="text-lg ml-1">{insight.metricUnit}</span>}
                    </p>
                    {insight.description && (
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No governance metrics available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Impact & Gamification Tabs */}
      <Tabs defaultValue="impact" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="impact" data-testid="tab-impact">
            <Leaf className="w-4 h-4 mr-2" />
            Impact Breakdown
          </TabsTrigger>
          <TabsTrigger value="achievements" data-testid="tab-achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="milestones" data-testid="tab-milestones">
            <Target className="w-4 h-4 mr-2" />
            Milestones
          </TabsTrigger>
        </TabsList>

        {/* Impact Breakdown Tab */}
        <TabsContent value="impact" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environmental & Social Impact Score</CardTitle>
                  <CardDescription>
                    Detailed breakdown of sustainability contributions across four key pillars
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => calculateScoreMutation.mutate()}
                  disabled={calculateScoreMutation.isPending}
                  data-testid="button-refresh-score"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {calculateScoreMutation.isPending ? "Calculating..." : "Refresh Score"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Score Dial */}
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
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

                {/* Score Breakdown Cards */}
                <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold">Carbon</h4>
                    </div>
                    <p className="text-3xl font-bold">{scoreData?.breakdown?.carbon || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((impact?.carbonSaved ?? 0) / 1000).toFixed(2)} kg saved
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold">Water</h4>
                    </div>
                    <p className="text-3xl font-bold">{scoreData?.breakdown?.water || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(impact?.waterProvided ?? 0).toLocaleString()} L provided
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Recycle className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold">Resources</h4>
                    </div>
                    <p className="text-3xl font-bold">{scoreData?.breakdown?.resources || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {((impact?.mineralsSaved ?? 0) / 1000).toFixed(2)} kg minerals
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      <h4 className="font-semibold">Social</h4>
                    </div>
                    <p className="text-3xl font-bold">{scoreData?.breakdown?.social || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {impact?.familiesHelped ?? 0} families helped
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab - Enhanced with Framer Motion */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Achievement Showcase
                </CardTitle>
                <CardDescription>
                  {unlockedAchievements.length} of {achievements?.length || 0} achievements unlocked
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Star className="w-4 h-4 text-yellow-500" />
                    </motion.div>
                    Unlocked Achievements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAchievements.map((achievement: any, index: number) => {
                      const achData = achievement?.achievement;
                      if (!achData) return null;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          data-testid={`achievement-unlocked-${achData.code}`}
                        >
                          <Card className="border-primary/50 bg-gradient-to-br from-primary/10 to-background relative overflow-hidden cursor-pointer">
                            {/* Sparkle Effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                              initial={{ x: '-100%' }}
                              animate={{ x: '200%' }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                            />
                            <CardContent className="pt-6 relative z-10">
                              <div className="flex items-start gap-3">
                                <motion.div 
                                  className="p-2 rounded-lg bg-primary/20"
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 3, repeat: Infinity }}
                                >
                                  <Award className="w-6 h-6 text-primary" />
                                </motion.div>
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1 text-primary">{achData.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {achData.description}
                                  </p>
                                  <Badge variant="default" className="text-xs">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    +{achData.rewardPoints} points
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    In Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAchievements.slice(0, 6).map((achievement: any, index: number) => {
                      const achData = achievement?.achievement;
                      if (!achData) return null;
                      const progress = achievement.progressPercent ?? 0;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          data-testid={`achievement-locked-${achData.code}`}
                        >
                          <Card className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-3">
                                <motion.div 
                                  className="p-2 rounded-lg bg-muted"
                                  animate={progress > 50 ? { scale: [1, 1.1, 1] } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Lock className="w-6 h-6 text-muted-foreground" />
                                </motion.div>
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{achData.name}</h4>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {achData.description}
                                  </p>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                                  >
                                    <Progress value={progress} className="h-2 mb-2" />
                                  </motion.div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {progress}% complete
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Empty State */}
              {achievements && achievements.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your Journey Begins!</h3>
                  <p className="text-muted-foreground">
                    Start making sustainable choices to unlock achievements and earn rewards.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey/Milestones Tab - Gamified Road Map */}
        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-primary" />
                  Your Sustainability Journey
                </CardTitle>
                <CardDescription>
                  Progress through milestones on your path to sustainability excellence
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Horizontal Journey Path */}
              <div className="relative">
                {sortedMilestones.map((milestone: any, index: number) => {
                  const isReached = reachedMilestoneIds.includes(milestone.id);
                  const isNext = !isReached && !sortedMilestones.slice(0, index).some((m: any) => !reachedMilestoneIds.includes(m.id));
                  const lastReachedIndex = sortedMilestones.findIndex((m: any, i: number) => 
                    i > 0 && !reachedMilestoneIds.includes(m.id)
                  ) - 1;
                  const isCurrentPosition = index === Math.max(0, lastReachedIndex);
                  
                  return (
                    <motion.div
                      key={milestone.id}
                      className="relative mb-12 last:mb-0"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.5 }}
                      data-testid={`milestone-${milestone.id}`}
                    >
                      {/* Connecting Line */}
                      {index < sortedMilestones.length - 1 && (
                        <div className="absolute left-12 top-20 bottom-0 w-1 bg-gradient-to-b from-primary/30 to-border -z-10" />
                      )}

                      {/* Milestone Card */}
                      <motion.div
                        className="flex items-start gap-6"
                        whileHover={{ x: 8 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Milestone Marker */}
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className={cn(
                              "w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold relative z-10",
                              "border-4 transition-all duration-300",
                              isReached
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/50"
                                : isNext
                                ? "bg-primary/20 border-primary text-primary animate-pulse"
                                : "bg-muted border-muted-foreground/30 text-muted-foreground"
                            )}
                            whileHover={{ scale: 1.1, rotate: isReached ? 0 : 5 }}
                          >
                            {isReached ? (
                              <Zap className="w-12 h-12" />
                            ) : (
                              <span className="text-3xl">{index + 1}</span>
                            )}
                          </motion.div>

                          {/* Character at current position */}
                          {isCurrentPosition && (
                            <motion.div
                              className="absolute -right-6 top-0 text-5xl"
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                            >
                              <motion.div
                                animate={{ 
                                  y: [-8, 0, -8],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                  repeat: Infinity, 
                                  duration: 2,
                                  ease: "easeInOut"
                                }}
                              >
                                🏃
                              </motion.div>
                            </motion.div>
                          )}
                        </div>

                        {/* Milestone Content */}
                        <motion.div
                          className={cn(
                            "flex-1 p-6 rounded-xl border-2 transition-all duration-300",
                            isReached
                              ? "bg-primary/5 border-primary/30 shadow-md"
                              : isNext
                              ? "bg-primary/5 border-primary/50 shadow-sm"
                              : "bg-card border-border"
                          )}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                          }}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h3 className={cn(
                                "text-xl font-bold mb-2",
                                isReached && "text-primary"
                              )}>
                                {milestone.title}
                              </h3>
                              <p className="text-muted-foreground">
                                {milestone.description}
                              </p>
                            </div>
                            
                            {isReached && (
                              <motion.div
                                className="flex-shrink-0"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.15 + 0.3, type: "spring" }}
                              >
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Star className="w-6 h-6 text-primary fill-primary" />
                                </div>
                              </motion.div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 flex-wrap">
                            {milestone.requiredScore !== null && (
                              <Badge 
                                variant={isReached ? "default" : "secondary"}
                                className="text-sm px-3 py-1"
                              >
                                {isReached ? (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Completed
                                  </>
                                ) : (
                                  <>
                                    <Target className="w-4 h-4 mr-1" />
                                    {milestone.requiredScore} points required
                                  </>
                                )}
                              </Badge>
                            )}

                            {isNext && (
                              <motion.div
                                className="text-sm font-medium text-primary flex items-center gap-2"
                                animate={{ opacity: [1, 0.6, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              >
                                <ChevronRight className="w-4 h-4" />
                                Next milestone
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty State */}
              {sortedMilestones.length === 0 && (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Footprints className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your Journey Awaits!</h3>
                  <p className="text-muted-foreground">
                    Complete actions to unlock milestones and track your progress.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
