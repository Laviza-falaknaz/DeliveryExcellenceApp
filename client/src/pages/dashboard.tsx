import { useQuery } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  Trophy, Zap, Flame, Package, Sparkles, 
  Search, QrCode, Leaf, ShieldCheck, Target, 
  TrendingUp, Award, ChevronRight, AlertCircle, CheckCircle2,
  Clock, Box, Wrench, ArrowRight, Play
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
  
  const activeRMAs = rmas.filter(r => 
    !['resolved', 'closed', 'completed'].includes(r.rma.status)
  ).slice(0, 3);
  
  const nextLevelXP = userProgress ? (userProgress.level * 1000) : 1000;
  const currentLevelXP = userProgress ? ((userProgress.level - 1) * 1000) : 0;
  const progressToNextLevel = userProgress 
    ? ((userProgress.totalPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 
    : 0;

  const handleWarrantySearch = () => {
    if (warrantySearch.trim()) {
      setLocation(`/warranty?q=${encodeURIComponent(warrantySearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Compact Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-none text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium opacity-90 mb-1">Level</div>
                  <div className="text-2xl font-bold">{userProgress?.level || 1}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-none text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium opacity-90 mb-1">Streak</div>
                  <div className="text-2xl font-bold">{userProgress?.currentStreak || 0}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Flame className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium opacity-90 mb-1">Total XP</div>
                  <div className="text-2xl font-bold">{userProgress?.totalPoints || 0}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-none text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium opacity-90 mb-1">Progress</div>
                  <div className="text-2xl font-bold">{Math.round(progressToNextLevel)}%</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.9 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  Level {userProgress?.level || 1} → Level {(userProgress?.level || 1) + 1}
                </span>
                <span className="text-sm font-semibold text-violet-600">
                  {((userProgress?.totalPoints || 0) - currentLevelXP).toLocaleString()} / {(nextLevelXP - currentLevelXP).toLocaleString()} XP
                </span>
              </div>
              <div className="relative h-3 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - Orders & RMAs (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Orders */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Active Orders</CardTitle>
                      <p className="text-xs text-neutral-500 mt-0.5">Track your in-progress shipments</p>
                    </div>
                  </div>
                  {activeOrders.length > 3 && (
                    <Link href="/orders">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-orders">
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

            {/* Active RMAs */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Warranty Cases</CardTitle>
                      <p className="text-xs text-neutral-500 mt-0.5">Manage your active support requests</p>
                    </div>
                  </div>
                  {activeRMAs.length > 0 && (
                    <Link href="/rma">
                      <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-rmas">
                        View All
                        <ArrowRight className="h-3.5 w-3.5" />
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
                          className="p-5 cursor-pointer transition-colors"
                          data-testid={`rma-card-${rmaItem.rma.rmaNumber}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                                <Wrench className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-semibold text-neutral-900">{rmaItem.rma.rmaNumber}</span>
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100" variant="secondary">
                                    {rmaItem.rma.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-neutral-600">
                                  Opened {new Date(rmaItem.rma.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-neutral-400" />
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-neutral-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400" />
                    <p className="text-sm font-medium">No active cases</p>
                    <p className="text-xs mt-1">All products running smoothly 🎉</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warranty Lookup */}
            <Card className="shadow-sm border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
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

          {/* Right Column - Quick Actions & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/quiz">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white justify-start gap-2 h-11" data-testid="button-play-quiz">
                    <Play className="h-4 w-4" />
                    <span className="flex-1 text-left">Play Sustainability Quiz</span>
                    <Badge className="bg-white/20 hover:bg-white/20 text-white border-0">+100 XP</Badge>
                  </Button>
                </Link>
                <Link href="/warranty">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2 h-11" data-testid="button-check-warranty">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="flex-1 text-left">Check Warranty</span>
                  </Button>
                </Link>
                <Link href="/achievements">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2 h-11" data-testid="button-achievements">
                    <Award className="h-4 w-4" />
                    <span className="flex-1 text-left">View Achievements</span>
                  </Button>
                </Link>
                <Link href="/impact">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2 h-11" data-testid="button-view-impact">
                    <Leaf className="h-4 w-4" />
                    <span className="flex-1 text-left">Track Impact</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Latest Achievement */}
            {userAchievements.length > 0 && (
              <Card className="shadow-sm border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="border-b border-amber-200/50 pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-600" />
                    Latest Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {userAchievements.slice(0, 1).map((userAchievement) => {
                    const achievement = userAchievement.achievement;
                    return (
                      <div key={userAchievement.id} className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <i className={`${achievement.icon} text-2xl text-white`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-neutral-900 mb-1">{achievement.name}</h4>
                            <p className="text-sm text-neutral-600 leading-snug">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                          <span className="text-sm font-medium text-neutral-700">XP Earned</span>
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:bg-gradient-to-r text-white border-0">
                            <Zap className="h-3 w-3 mr-1" />
                            +{achievement.pointsAwarded}
                          </Badge>
                        </div>
                        <Link href="/achievements">
                          <Button variant="outline" className="w-full border-2 border-amber-300 hover:bg-amber-100" data-testid="button-view-all-achievements">
                            View All Achievements
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Impact Summary */}
            <Card className="shadow-sm border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="border-b border-emerald-200/50 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingImpact ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : impact ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-emerald-200">
                      <div>
                        <div className="text-xs text-neutral-600 mb-1">Carbon Saved</div>
                        <div className="text-2xl font-bold text-emerald-600">{impact.carbonSaved}g</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-cyan-200">
                      <div>
                        <div className="text-xs text-neutral-600 mb-1">Families Helped</div>
                        <div className="text-2xl font-bold text-cyan-600">{impact.familiesHelped}</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                        <i className="ri-water-flash-line text-2xl text-cyan-600"></i>
                      </div>
                    </div>
                    <Link href="/impact">
                      <Button variant="outline" className="w-full border-2 border-emerald-300 hover:bg-emerald-100" data-testid="button-view-full-impact-report">
                        View Full Impact Report
                        <TrendingUp className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    <Leaf className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                    <p className="text-xs">No impact data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link href="/support">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2" size="sm" data-testid="button-contact-support">
                    <i className="ri-customer-service-line text-base"></i>
                    Contact Support
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2" size="sm" data-testid="button-learn-earn-xp">
                    <i className="ri-lightbulb-line text-base"></i>
                    Learn & Earn XP
                  </Button>
                </Link>
                <Link href="/impact">
                  <Button variant="outline" className="w-full justify-start gap-2 border-2" size="sm" data-testid="button-track-impact">
                    <Leaf className="h-4 w-4" />
                    Track Your Impact
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
