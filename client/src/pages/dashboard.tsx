import { useQuery } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { 
  Trophy, Zap, Flame, Package, 
  Search, QrCode, ShieldCheck, Target, 
  TrendingUp, Award, ChevronRight, CheckCircle2,
  Clock, Box, Wrench, ArrowRight, Play, Recycle, Droplet,
  Leaf, Star, BarChart3, Sparkles, Users, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
}

interface UserProgress {
  level: number;
  totalPoints: number;
  currentStreak: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
}

interface UserAchievement {
  id: number;
  achievement: Achievement;
  unlockedAt: string;
}

interface RMA {
  id: number;
  rmaNumber: string;
  status: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  orderDate: string;
  estimatedDelivery?: string;
}

const CircularProgress = ({ value, size = 120, strokeWidth = 8, label, sublabel }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-neutral-200"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-neutral-900">{label}</span>
        {sublabel && <span className="text-xs text-neutral-600">{sublabel}</span>}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [warrantySearch, setWarrantySearch] = useState("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ["/api/gamification/user-progress"],
  });
  
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/gamification/user-achievements"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: rmas = [] } = useQuery<{ rma: RMA }[]>({
    queryKey: ["/api/rma"],
  });
  
  const { impact, isLoadingImpact } = useImpact();
  
  const activeOrders = orders.filter(o => 
    !['delivered', 'completed', 'cancelled'].includes(o.status)
  );
  
  const completedOrders = orders.filter(o => 
    ['delivered', 'completed'].includes(o.status)
  );
  
  const activeRMAs = rmas.filter(r => 
    !['resolved', 'closed', 'completed'].includes(r.rma.status)
  ).slice(0, 3);
  
  const nextLevelXP = userProgress ? (userProgress.level * 1000) : 1000;
  const currentLevelXP = userProgress ? ((userProgress.level - 1) * 1000) : 0;
  const progressToNextLevel = userProgress 
    ? ((userProgress.totalPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 
    : 0;

  const recentAchievements = userAchievements.slice(0, 3);

  const handleWarrantySearch = () => {
    if (warrantySearch.trim()) {
      setLocation(`/warranty?q=${encodeURIComponent(warrantySearch.trim())}`);
    }
  };

  const dailyGoals = [
    { id: 'quiz', name: 'Complete Daily Quiz', xp: 100, completed: false, icon: Target },
    { id: 'game', name: 'Play Sorting Game', xp: 120, completed: false, icon: Recycle },
    { id: 'order', name: 'Track an Order', xp: 50, completed: activeOrders.length > 0, icon: Package },
  ];

  const completedGoals = dailyGoals.filter(g => g.completed).length;
  const goalProgress = (completedGoals / dailyGoals.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2 flex items-center gap-3">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-block"
                >
                  👋
                </motion.span>
              </h1>
              <p className="text-neutral-600 text-lg">
                Track your journey, earn rewards, and make an impact
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/impact">
                <Button variant="outline" className="gap-2" data-testid="button-view-impact-header">
                  <Globe className="h-4 w-4" />
                  My Impact
                </Button>
              </Link>
              <Link href="/achievements">
                <Button className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700" data-testid="button-view-achievements-header">
                  <Award className="h-4 w-4" />
                  Achievements
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Overview with Circular Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Level Progress */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-violet-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/40 to-transparent rounded-full blur-2xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">Level</p>
                      <p className="text-3xl font-bold text-neutral-900">{userProgress?.level || 1}</p>
                      <p className="text-xs text-violet-600 font-medium mt-1">{Math.round(progressToNextLevel)}% to next</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2.5" />
                  <p className="text-xs text-neutral-500 mt-2">
                    {((userProgress?.totalPoints || 0) - currentLevelXP).toLocaleString()} / {(nextLevelXP - currentLevelXP).toLocaleString()} XP
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streak */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-transparent rounded-full blur-2xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">Current Streak</p>
                      <p className="text-3xl font-bold text-neutral-900">{userProgress?.currentStreak || 0}</p>
                      <p className="text-xs text-orange-600 font-medium mt-1">days in a row</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Flame className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full ${
                          i < (userProgress?.currentStreak || 0) 
                            ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                            : 'bg-neutral-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Keep it going!</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Total XP */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/40 to-transparent rounded-full blur-2xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">Total XP</p>
                      <p className="text-3xl font-bold text-neutral-900">{userProgress?.totalPoints || 0}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">experience points</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs text-neutral-600">
                      Rank: <span className="font-semibold text-emerald-600">Active Contributor</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-yellow-50/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/40 to-transparent rounded-full blur-2xl" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-600 mb-1">Achievements</p>
                      <p className="text-3xl font-bold text-neutral-900">{userAchievements.length}</p>
                      <p className="text-xs text-yellow-600 font-medium mt-1">unlocked</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {recentAchievements.slice(0, 5).map((achievement, i) => (
                      <div key={i} className="text-2xl">{achievement.achievement.icon}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Daily Goals */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Daily Goals
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {completedGoals}/{dailyGoals.length} Complete
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-neutral-600 mt-0.5">Complete goals to earn bonus XP</p>
                  </div>
                </div>
                <CircularProgress 
                  value={goalProgress} 
                  size={80} 
                  strokeWidth={6} 
                  label={`${completedGoals}/${dailyGoals.length}`}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dailyGoals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <motion.div
                      key={goal.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        goal.completed
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                          : 'bg-white border-neutral-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          goal.completed ? 'bg-green-500' : 'bg-neutral-100'
                        }`}>
                          {goal.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          ) : (
                            <Icon className="h-5 w-5 text-neutral-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold mb-1 ${goal.completed ? 'text-green-700' : 'text-neutral-900'}`}>
                            {goal.name}
                          </p>
                          <Badge className={goal.completed ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                            {goal.completed ? '✓ ' : ''}+{goal.xp} XP
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Interactive Actions & Orders */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Learning */}
            <Card className="border-2 border-violet-100">
              <CardHeader className="border-b bg-gradient-to-r from-violet-50/50 to-purple-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Interactive Learning</CardTitle>
                    <p className="text-sm text-neutral-600 mt-0.5">Earn XP while learning about sustainability</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/quiz">
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredCard('quiz')}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-500 to-purple-600 text-white cursor-pointer overflow-hidden relative" data-testid="card-quiz">
                        <AnimatePresence>
                          {hoveredCard === 'quiz' && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 2, opacity: 0.1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full"
                              style={{ transform: 'translate(-50%, -50%)' }}
                            />
                          )}
                        </AnimatePresence>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Target className="h-7 w-7" />
                            </div>
                            <Badge className="bg-white/30 hover:bg-white/30 text-white border-0 font-bold">+100 XP</Badge>
                          </div>
                          <h3 className="font-bold text-xl mb-2">Sustainability Quiz</h3>
                          <p className="text-sm text-violet-100">Test your knowledge on circular computing and environmental impact</p>
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>~5 minutes</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>

                  <Link href="/sorting-game">
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onHoverStart={() => setHoveredCard('game')}
                      onHoverEnd={() => setHoveredCard(null)}
                    >
                      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-500 to-teal-600 text-white cursor-pointer overflow-hidden relative" data-testid="card-sorting-game">
                        <AnimatePresence>
                          {hoveredCard === 'game' && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 2, opacity: 0.1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full"
                              style={{ transform: 'translate(-50%, -50%)' }}
                            />
                          )}
                        </AnimatePresence>
                        <CardContent className="p-6 relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Recycle className="h-7 w-7" />
                            </div>
                            <Badge className="bg-white/30 hover:bg-white/30 text-white border-0 font-bold">+120 XP</Badge>
                          </div>
                          <h3 className="font-bold text-xl mb-2">Waste Sorting Game</h3>
                          <p className="text-sm text-emerald-100">Learn proper e-waste categorization through interactive gameplay</p>
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>~7 minutes</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="border-2 border-neutral-200">
              <CardHeader className="border-b bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Active Orders</CardTitle>
                      <p className="text-sm text-neutral-600 mt-0.5">{activeOrders.length} in progress</p>
                    </div>
                  </div>
                  {activeOrders.length > 3 && (
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-orders">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeOrders.length > 0 ? (
                  <div className="divide-y">
                    {activeOrders.slice(0, 3).map((order) => (
                      <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                        <motion.div
                          whileHover={{ backgroundColor: "rgb(249, 250, 251)", x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="p-5 cursor-pointer"
                          data-testid={`order-card-${order.orderNumber}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#08ABAB]/10 to-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Box className="h-5 w-5 text-[#08ABAB]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-semibold text-neutral-900">#{order.orderNumber}</span>
                                  <Badge 
                                    className={
                                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                      'bg-neutral-100 text-neutral-700 hover:bg-neutral-100'
                                    }
                                    variant="secondary"
                                  >
                                    {order.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-neutral-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(order.orderDate).toLocaleDateString()}
                                  </span>
                                  {order.estimatedDelivery && (
                                    <span className="text-emerald-600 font-medium">
                                      Arrives {new Date(order.estimatedDelivery).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right flex-shrink-0">
                                <div className="text-base font-bold text-neutral-900">
                                  {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-neutral-400" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-neutral-500">
                    <Package className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                    <p className="text-base font-medium">No active orders</p>
                    <p className="text-sm mt-2">Your orders will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warranty Lookup */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900 mb-1">Check Warranty Status</h3>
                    <p className="text-sm text-neutral-600">Enter your serial number for instant warranty lookup</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Serial number..."
                    value={warrantySearch}
                    onChange={(e) => setWarrantySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                    className="flex-1 h-12 border-2 border-blue-200 focus:border-blue-400"
                    data-testid="input-warranty-search"
                  />
                  <Button 
                    onClick={handleWarrantySearch}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 px-6"
                    data-testid="button-warranty-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Link href="/warranty">
                    <Button variant="outline" className="border-2 border-blue-200 hover:bg-blue-50 h-12 w-12 p-0">
                      <QrCode className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Impact & Achievements */}
          <div className="space-y-6">
            
            {/* Environmental Impact */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="border-b bg-gradient-to-br from-emerald-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Your Impact
                </CardTitle>
                <p className="text-sm text-neutral-600 mt-1">Making a difference together</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/impact">
                  <motion.div 
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="cursor-pointer"
                  >
                    <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-600 mb-1">CO₂ Saved</p>
                          <p className="text-3xl font-bold text-neutral-900">{impact?.carbonSaved || 0}</p>
                          <p className="text-sm text-neutral-600">kilograms</p>
                        </div>
                      </div>
                      <Progress value={75} className="h-2 mb-2" />
                      <p className="text-xs text-neutral-600">Equivalent to planting 5 trees</p>
                    </div>
                  </motion.div>
                </Link>

                <motion.div whileHover={{ scale: 1.03, y: -2 }}>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Droplet className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-600 mb-1">Water Provided</p>
                        <p className="text-3xl font-bold text-neutral-900">{impact?.waterProvided || 0}</p>
                        <p className="text-sm text-neutral-600">liters</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-neutral-700">
                        <span className="font-bold text-blue-600">{impact?.familiesHelped || 0} families</span> helped
                      </p>
                    </div>
                  </div>
                </motion.div>

                <Separator />

                <Link href="/impact">
                  <Button variant="outline" className="w-full gap-2 h-11 border-2" data-testid="button-view-full-impact">
                    <BarChart3 className="h-4 w-4" />
                    View Full Impact Report
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-2 border-yellow-200">
              <CardHeader className="border-b bg-gradient-to-br from-yellow-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-600" />
                      Recent Achievements
                    </CardTitle>
                    <p className="text-sm text-neutral-600 mt-1">{userAchievements.length} total unlocked</p>
                  </div>
                  {recentAchievements.length > 0 && (
                    <Link href="/achievements">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-achievements">
                        All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentAchievements.length > 0 ? (
                  <div className="divide-y">
                    {recentAchievements.map((userAchievement, index) => (
                      <motion.div 
                        key={userAchievement.id} 
                        className="p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{userAchievement.achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-neutral-900 mb-1">
                              {userAchievement.achievement.name}
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                +{userAchievement.achievement.pointsAwarded} XP
                              </Badge>
                              <span className="text-xs text-neutral-500">
                                {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-sm font-medium">No achievements yet</p>
                    <p className="text-xs mt-1">Start completing goals!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active RMAs */}
            {activeRMAs.length > 0 && (
              <Card className="border-2 border-orange-200">
                <CardHeader className="border-b bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-600" />
                      <CardTitle>Warranty Cases</CardTitle>
                    </div>
                    <Link href="/rma">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-rmas">
                        All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {activeRMAs.map((rmaItem) => (
                      <Link key={rmaItem.rma.id} href={`/rma/${rmaItem.rma.rmaNumber}`}>
                        <motion.div
                          whileHover={{ backgroundColor: "rgb(255, 247, 237)", x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="p-4 cursor-pointer"
                          data-testid={`rma-card-${rmaItem.rma.rmaNumber}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Wrench className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-neutral-900">{rmaItem.rma.rmaNumber}</span>
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs" variant="secondary">
                                    {rmaItem.rma.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-neutral-600">
                                  {new Date(rmaItem.rma.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
