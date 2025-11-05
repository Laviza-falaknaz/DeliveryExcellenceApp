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
  Leaf, Star, BarChart3, Sparkles, Users
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-[1600px] mx-auto p-4 space-y-4">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-block text-xl"
              >
                👋
              </motion.span>
            </h1>
            <p className="text-sm text-neutral-600 mt-0.5">Track your journey, earn rewards, and make an impact</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* Left Sidebar - Stats & Quick Actions */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Compact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-600">Level</p>
                        <p className="text-2xl font-bold text-neutral-900">{userProgress?.level || 1}</p>
                        <Progress value={progressToNextLevel} className="h-1.5 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                        <Flame className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-600">Streak</p>
                        <p className="text-2xl font-bold text-neutral-900">{userProgress?.currentStreak || 0}</p>
                        <p className="text-xs text-orange-600 font-medium">days</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-600">Total XP</p>
                        <p className="text-2xl font-bold text-neutral-900">{userProgress?.totalPoints || 0}</p>
                        <p className="text-xs text-emerald-600 font-medium">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-600">Achievements</p>
                        <p className="text-2xl font-bold text-neutral-900">{userAchievements.length}</p>
                        <p className="text-xs text-yellow-600 font-medium">unlocked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="p-4 pb-3 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Link href="/quiz">
                  <Button className="w-full justify-start gap-2 h-10 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white" data-testid="button-quiz-quick">
                    <Play className="h-4 w-4" />
                    <span className="flex-1 text-left text-sm">Sustainability Quiz</span>
                    <Badge className="bg-white/20 text-white border-0 text-xs">+100 XP</Badge>
                  </Button>
                </Link>
                <Link href="/sorting-game">
                  <Button className="w-full justify-start gap-2 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white" data-testid="button-game-quick">
                    <Recycle className="h-4 w-4" />
                    <span className="flex-1 text-left text-sm">Waste Sorting Game</span>
                    <Badge className="bg-white/20 text-white border-0 text-xs">+120 XP</Badge>
                  </Button>
                </Link>
                <Link href="/achievements">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10 border-2" data-testid="button-achievements-quick">
                    <Award className="h-4 w-4" />
                    <span className="flex-1 text-left text-sm">View Achievements</span>
                  </Button>
                </Link>
                <Link href="/impact">
                  <Button variant="outline" className="w-full justify-start gap-2 h-10 border-2" data-testid="button-impact-quick">
                    <Leaf className="h-4 w-4" />
                    <span className="flex-1 text-left text-sm">Impact Report</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Environmental Impact Summary */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="p-4 pb-3 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600">CO₂ Saved</p>
                    <p className="text-xl font-bold text-neutral-900">{impact?.carbonSaved || 0} <span className="text-sm font-normal">kg</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Droplet className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-neutral-600">Water Provided</p>
                    <p className="text-xl font-bold text-neutral-900">{impact?.waterProvided || 0} <span className="text-sm font-normal">L</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-100 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-900"><span className="font-bold">{impact?.familiesHelped || 0}</span> families helped</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            
            {/* Warranty Search - Most Accessed Feature */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900">Check Warranty Status</h3>
                    <p className="text-sm text-neutral-600">Enter serial number for instant lookup</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Serial number..."
                    value={warrantySearch}
                    onChange={(e) => setWarrantySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                    className="flex-1 h-11 border-2 border-blue-200 focus:border-blue-400 text-base"
                    data-testid="input-warranty-search"
                  />
                  <Button 
                    onClick={handleWarrantySearch}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-11 px-5"
                    data-testid="button-warranty-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Link href="/warranty">
                    <Button variant="outline" className="border-2 border-blue-200 hover:bg-blue-50 h-11 w-11 p-0">
                      <QrCode className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card className="border-2 border-neutral-200">
              <CardHeader className="p-4 border-b bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Active Orders</CardTitle>
                      <p className="text-xs text-neutral-600 mt-0.5">{activeOrders.length} in progress</p>
                    </div>
                  </div>
                  {activeOrders.length > 2 && (
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="gap-1 h-8" data-testid="button-view-all-orders">
                        View All
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeOrders.length > 0 ? (
                  <div className="divide-y">
                    {activeOrders.slice(0, 2).map((order) => (
                      <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                        <motion.div
                          whileHover={{ backgroundColor: "rgb(249, 250, 251)", x: 4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="p-4 cursor-pointer"
                          data-testid={`order-card-${order.orderNumber}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#08ABAB]/10 to-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Box className="h-5 w-5 text-[#08ABAB]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-neutral-900">#{order.orderNumber}</span>
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
                            <div className="flex items-center gap-2">
                              <div className="text-right flex-shrink-0">
                                <div className="text-sm font-bold text-neutral-900">
                                  {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-neutral-400" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-sm font-medium">No active orders</p>
                    <p className="text-xs mt-1">Your orders will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interactive Learning Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/quiz">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => setHoveredCard('quiz')}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-500 to-purple-600 text-white cursor-pointer overflow-hidden relative h-full" data-testid="card-quiz">
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
                    <CardContent className="p-5 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Target className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/30 hover:bg-white/30 text-white border-0 font-bold text-xs">+100 XP</Badge>
                      </div>
                      <h3 className="font-bold text-lg mb-1">Sustainability Quiz</h3>
                      <p className="text-xs text-violet-100 mb-3">Test your knowledge</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~5 min</span>
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
                  <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-500 to-teal-600 text-white cursor-pointer overflow-hidden relative h-full" data-testid="card-sorting-game">
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
                    <CardContent className="p-5 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Recycle className="h-6 w-6" />
                        </div>
                        <Badge className="bg-white/30 hover:bg-white/30 text-white border-0 font-bold text-xs">+120 XP</Badge>
                      </div>
                      <h3 className="font-bold text-lg mb-1">Waste Sorting Game</h3>
                      <p className="text-xs text-emerald-100 mb-3">Learn e-waste sorting</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        <span>~7 min</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Right Column - Achievements & Support */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Recent Achievements */}
            <Card className="border-2 border-yellow-200">
              <CardHeader className="p-4 pb-3 border-b bg-gradient-to-br from-yellow-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                  {recentAchievements.length > 0 && (
                    <Link href="/achievements">
                      <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs px-2" data-testid="button-view-all-achievements">
                        All
                        <ArrowRight className="h-3 w-3" />
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
                        className="p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="text-2xl flex-shrink-0">{userAchievement.achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-neutral-900 mb-0.5">
                              {userAchievement.achievement.name}
                            </div>
                            <p className="text-xs text-neutral-600 mb-1.5 line-clamp-2">
                              {userAchievement.achievement.description}
                            </p>
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs">
                              +{userAchievement.achievement.pointsAwarded} XP
                            </Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Award className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                    <p className="text-xs font-medium">No achievements yet</p>
                    <p className="text-xs mt-1 text-neutral-400">Start completing goals!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active RMAs */}
            {activeRMAs.length > 0 && (
              <Card className="border-2 border-orange-200">
                <CardHeader className="p-4 pb-3 border-b bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-orange-600" />
                      Warranty Cases
                    </CardTitle>
                    <Link href="/rma">
                      <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs px-2" data-testid="button-view-all-rmas">
                        All
                        <ArrowRight className="h-3 w-3" />
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
                          className="p-3 cursor-pointer"
                          data-testid={`rma-card-${rmaItem.rma.rmaNumber}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <Wrench className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-semibold text-xs text-neutral-900">{rmaItem.rma.rmaNumber}</span>
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs py-0" variant="secondary">
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

            {/* All Orders Link */}
            <Link href="/orders">
              <Button variant="outline" className="w-full gap-2 h-10 border-2" data-testid="button-all-orders">
                <Package className="h-4 w-4" />
                <span className="flex-1 text-left text-sm">View All Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Full Impact Report */}
            <Link href="/impact">
              <Button variant="outline" className="w-full gap-2 h-10 border-2 border-emerald-200 hover:bg-emerald-50" data-testid="button-full-impact">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span className="flex-1 text-left text-sm">Full Impact Report</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
