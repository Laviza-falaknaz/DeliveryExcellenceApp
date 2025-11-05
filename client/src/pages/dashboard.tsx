import { useQuery } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  Trophy, Zap, Flame, Package, 
  Search, QrCode, ShieldCheck, Target, 
  TrendingUp, Award, ChevronRight, CheckCircle2,
  Clock, Box, Wrench, ArrowRight, Play, Recycle, Droplet,
  Leaf, Star, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-neutral-600 text-lg">
                Here's your sustainability journey overview
              </p>
            </div>
            <Link href="/achievements">
              <Button variant="outline" className="gap-2" data-testid="button-view-achievements">
                <Award className="h-4 w-4" />
                Achievements
              </Button>
            </Link>
          </div>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-violet-100 bg-gradient-to-br from-violet-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-0.5">Level</p>
                    <p className="text-3xl font-bold text-neutral-900">{userProgress?.level || 1}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round(progressToNextLevel)}%</span>
                  </div>
                  <Progress value={progressToNextLevel} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <Flame className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-0.5">Streak</p>
                    <p className="text-3xl font-bold text-neutral-900">{userProgress?.currentStreak || 0}</p>
                    <p className="text-xs text-neutral-500">days active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-0.5">Total XP</p>
                    <p className="text-3xl font-bold text-neutral-900">{userProgress?.totalPoints || 0}</p>
                    <p className="text-xs text-neutral-500">{((userProgress?.totalPoints || 0) - currentLevelXP).toLocaleString()} / {(nextLevelXP - currentLevelXP).toLocaleString()} to next</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Star className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-0.5">Achievements</p>
                    <p className="text-3xl font-bold text-neutral-900">{userAchievements.length}</p>
                    <p className="text-xs text-neutral-500">unlocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Orders & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Learning */}
            <Card className="border-2 border-violet-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-violet-600" />
                  Interactive Learning
                </CardTitle>
                <p className="text-sm text-neutral-600">Earn XP and learn about sustainability</p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/quiz">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-500 to-purple-600 text-white cursor-pointer" data-testid="card-quiz">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Target className="h-6 w-6" />
                          </div>
                          <Badge className="bg-white/30 hover:bg-white/30 text-white border-0">+100 XP</Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Sustainability Quiz</h3>
                        <p className="text-sm text-violet-100">Test your knowledge on circular computing</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>

                <Link href="/sorting-game">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-500 to-teal-600 text-white cursor-pointer" data-testid="card-sorting-game">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Recycle className="h-6 w-6" />
                          </div>
                          <Badge className="bg-white/30 hover:bg-white/30 text-white border-0">+120 XP</Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">Waste Sorting Game</h3>
                        <p className="text-sm text-emerald-100">Learn proper e-waste categorization</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>

            {/* Active Orders */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Active Orders</CardTitle>
                      <p className="text-sm text-neutral-500 mt-0.5">Track your in-progress shipments</p>
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
                          whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                          className="p-5 cursor-pointer transition-colors"
                          data-testid={`order-card-${order.orderNumber}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#08ABAB]/10 to-emerald-100 flex items-center justify-center flex-shrink-0">
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
                            <div className="text-right flex-shrink-0">
                              <div className="text-base font-bold text-neutral-900">
                                {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                              </div>
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

            {/* Warranty Lookup */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">Check Warranty Status</h3>
                    <p className="text-sm text-neutral-600">Enter your serial number for instant warranty lookup</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Serial number..."
                    value={warrantySearch}
                    onChange={(e) => setWarrantySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                    className="flex-1 border-2 border-blue-200 focus:border-blue-400"
                    data-testid="input-warranty-search"
                  />
                  <Button 
                    onClick={handleWarrantySearch}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6"
                    data-testid="button-warranty-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Link href="/warranty">
                    <Button variant="outline" className="border-2 border-blue-200 hover:bg-blue-50">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Achievements */}
          <div className="space-y-6">
            
            {/* Environmental Impact */}
            <Card className="border-2 border-emerald-100">
              <CardHeader className="border-b bg-gradient-to-br from-emerald-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Link href="/impact">
                  <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-neutral-600">CO₂ Saved</p>
                          <p className="text-2xl font-bold text-neutral-900">{impact?.carbonSaved || 0} kg</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-600">Water Provided</p>
                      <p className="text-2xl font-bold text-neutral-900">{impact?.waterProvided || 0} L</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">
                    Helping {impact?.familiesHelped || 0} families access clean water
                  </p>
                </div>

                <Link href="/impact">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-view-full-impact">
                    <BarChart3 className="h-4 w-4" />
                    View Full Impact Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-2 border-yellow-100">
              <CardHeader className="border-b bg-gradient-to-br from-yellow-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Recent Achievements
                  </CardTitle>
                  {recentAchievements.length > 0 && (
                    <Link href="/achievements">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-achievements">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentAchievements.length > 0 ? (
                  <div className="divide-y">
                    {recentAchievements.map((userAchievement) => (
                      <div key={userAchievement.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{userAchievement.achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-neutral-900 mb-0.5">
                              {userAchievement.achievement.name}
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              {userAchievement.achievement.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                +{userAchievement.achievement.pointsAwarded} XP
                              </Badge>
                              <span className="text-xs text-neutral-500">
                                {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-sm font-medium">No achievements yet</p>
                    <p className="text-xs mt-1">Complete activities to earn your first achievement!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active RMAs */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <CardTitle>Warranty Cases</CardTitle>
                  </div>
                  {activeRMAs.length > 0 && (
                    <Link href="/rma">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-rmas">
                        View All
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeRMAs.length > 0 ? (
                  <div className="divide-y">
                    {activeRMAs.map((rmaItem) => (
                      <Link key={rmaItem.rma.id} href={`/rma/${rmaItem.rma.rmaNumber}`}>
                        <motion.div
                          whileHover={{ backgroundColor: "rgb(255, 247, 237)" }}
                          className="p-4 cursor-pointer transition-colors"
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
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-400" />
                    <p className="text-sm font-medium">No active cases</p>
                    <p className="text-xs mt-1">All systems running smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
