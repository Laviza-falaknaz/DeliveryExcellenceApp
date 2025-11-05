import { useQuery } from "@tanstack/react-query";
import { useOrders } from "@/hooks/use-orders";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { 
  Trophy, Zap, Flame, Package, Droplets, Sparkles, 
  Search, QrCode, Leaf, ShieldCheck, Target, 
  TrendingUp, Award, ChevronRight, AlertCircle, CheckCircle2,
  Clock, Box, Wrench
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
  
  // Filter active orders (not delivered/completed)
  const activeOrders = orders.filter(o => 
    !['delivered', 'completed', 'cancelled'].includes(o.status)
  );
  
  // Filter active RMAs (not completed/closed)
  const activeRMAs = rmas.filter(r => 
    !['resolved', 'closed', 'completed'].includes(r.rma.status)
  ).slice(0, 3);
  
  // Calculate next level info
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-[1440px] mx-auto p-6 space-y-6">
        
        {/* Journey Hub - Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-[#08ABAB] to-emerald-600 border-none text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Welcome & Progress */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                    </h1>
                    <p className="text-white/90">Your sustainable tech journey at a glance</p>
                  </div>

                  {userProgress && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                            <Trophy className="h-8 w-8" />
                          </div>
                          <div>
                            <div className="text-sm opacity-90">Level</div>
                            <div className="text-2xl font-bold">{userProgress.level}</div>
                          </div>
                        </div>
                        
                        {userProgress.currentStreak > 0 && (
                          <>
                            <Separator orientation="vertical" className="h-12 bg-white/30" />
                            <div className="flex items-center gap-2">
                              <Flame className="h-6 w-6" />
                              <div>
                                <div className="text-sm opacity-90">Streak</div>
                                <div className="text-2xl font-bold">{userProgress.currentStreak} days</div>
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Separator orientation="vertical" className="h-12 bg-white/30" />
                        <div className="flex items-center gap-2">
                          <Zap className="h-6 w-6" />
                          <div>
                            <div className="text-sm opacity-90">Total XP</div>
                            <div className="text-2xl font-bold">{userProgress.totalPoints.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress to Level {userProgress.level + 1}</span>
                          <span>{Math.round(progressToNextLevel)}%</span>
                        </div>
                        <Progress value={progressToNextLevel} className="h-3 bg-white/20" />
                        <div className="text-xs opacity-75">
                          {nextLevelXP - userProgress.totalPoints} XP needed
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold opacity-90 mb-3">Quick Actions</h3>
                  <Link href="/quiz">
                    <Button className="w-full bg-white text-[#08ABAB] hover:bg-white/90 justify-between group">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Sustainability Quiz
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/warranty">
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 justify-between group">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Check Warranty
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/achievements">
                    <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10 justify-between group">
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        View Achievements
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Lifecycle (Orders, RMAs, Warranty) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Orders */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#08ABAB]" />
                    Active Orders
                  </CardTitle>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activeOrders.length > 0 ? (
                  <div className="space-y-3">
                    {activeOrders.slice(0, 3).map((order) => (
                      <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                        <div className="p-4 rounded-lg border border-neutral-200 hover:border-[#08ABAB] hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-[#08ABAB]/10 text-[#08ABAB] border-[#08ABAB]/30">
                                #{order.orderNumber}
                              </Badge>
                              <Badge className={
                                order.status === 'shipped' ? 'bg-blue-500' :
                                order.status === 'processing' ? 'bg-yellow-500' :
                                'bg-neutral-500'
                              }>
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm font-semibold">
                              {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-neutral-600">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            {order.estimatedDelivery && (
                              <span className="flex items-center gap-1">
                                <Box className="h-3 w-3" />
                                Est. {new Date(order.estimatedDelivery).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <p className="text-sm">No active orders</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active RMAs */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    Active Warranty Cases
                  </CardTitle>
                  <Link href="/rma">
                    <Button variant="ghost" size="sm">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {activeRMAs.length > 0 ? (
                  <div className="space-y-3">
                    {activeRMAs.map((rmaItem) => (
                      <Link key={rmaItem.rma.id} href={`/rma/${rmaItem.rma.rmaNumber}`}>
                        <div className="p-4 rounded-lg border border-neutral-200 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                {rmaItem.rma.rmaNumber}
                              </Badge>
                              <Badge className="bg-orange-500">
                                {rmaItem.rma.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-neutral-600">
                            <Clock className="h-3 w-3" />
                            Opened {new Date(rmaItem.rma.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-300" />
                    <p className="text-sm">No active warranty cases</p>
                    <p className="text-xs mt-1">All your products are running smoothly!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warranty Lookup */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  Check Warranty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-neutral-600">
                    Enter your serial number to check warranty status and coverage
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter serial number..."
                      value={warrantySearch}
                      onChange={(e) => setWarrantySearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                      className="flex-1 bg-white"
                    />
                    <Button onClick={handleWarrantySearch} className="bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Link href="/warranty">
                      <Button variant="outline" title="Scan QR Code">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-neutral-600 bg-white/50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium text-neutral-900">Where to find your serial number?</p>
                      <p className="mt-1">Check the label on the back or bottom of your device, or scan the QR code</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Progress & Impact */}
          <div className="space-y-6">
            
            {/* Gamification Hub */}
            {userAchievements.length > 0 && (
              <Card className="border-[#08ABAB]/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#08ABAB]" />
                    Latest Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userAchievements.slice(0, 1).map((userAchievement) => {
                    const achievement = userAchievement.achievement;
                    return (
                      <div key={userAchievement.id} className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center shadow-lg">
                            <i className={`${achievement.icon} text-2xl text-white`}></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-neutral-900">{achievement.name}</h3>
                            <p className="text-sm text-neutral-600 mt-1">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-sm text-neutral-700">XP Earned</span>
                          <Badge className="bg-orange-500 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            +{achievement.pointsAwarded}
                          </Badge>
                        </div>
                        <Link href="/achievements">
                          <Button variant="outline" className="w-full">
                            View All Achievements
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Impact Pulse */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-600" />
                  Impact Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingImpact ? (
                  <Skeleton className="h-32 w-full" />
                ) : impact ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-600">{impact.carbonSaved}g</div>
                      <div className="text-xs text-neutral-600">Carbon Saved</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-cyan-200">
                      <div className="text-2xl font-bold text-cyan-600">{impact.familiesHelped}</div>
                      <div className="text-xs text-neutral-600">Families Helped</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{impact.mineralsSaved}g</div>
                      <div className="text-xs text-neutral-600">Resources Saved</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{impact.treesEquivalent}</div>
                      <div className="text-xs text-neutral-600">Trees Equiv.</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    <Leaf className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
                    <p className="text-xs">No impact data yet</p>
                  </div>
                )}
                <Link href="/impact">
                  <Button variant="outline" className="w-full mt-4">
                    View Full Report
                    <TrendingUp className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Support & Resources */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/support">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <i className="ri-customer-service-line mr-2"></i>
                    Contact Support
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <i className="ri-lightbulb-line mr-2"></i>
                    Learn More
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
