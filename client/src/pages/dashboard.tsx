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
  Clock, Box, Wrench, ArrowRight, Play, Recycle,
  Leaf, Star, BarChart3, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LivingEcosystem } from "@/components/dashboard/living-ecosystem";

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
  const [showPanel, setShowPanel] = useState<string | null>(null);
  
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

  const handleWarrantySearch = () => {
    if (warrantySearch.trim()) {
      setLocation(`/warranty?q=${encodeURIComponent(warrantySearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
      
      {/* Welcome Message with Fade In */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-light text-white/90 mb-2 flex items-center gap-3 justify-center">
          <motion.span
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 0.5, delay: 1 }}
            className="inline-block"
          >
            🌿
          </motion.span>
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-emerald-100 text-lg font-light"
        >
          Your forest is thriving!
        </motion.p>
      </motion.div>

      {/* Main Ecosystem Container */}
      <div className="max-w-[1400px] mx-auto p-6 pt-32">
        
        {/* Living Ecosystem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <LivingEcosystem
            level={userProgress?.level || 1}
            xp={userProgress?.totalPoints || 0}
            streak={userProgress?.currentStreak || 0}
            achievements={userAchievements.length}
            carbonSaved={impact?.carbonSaved || 0}
            waterProvided={impact?.waterProvided || 0}
            familiesHelped={impact?.familiesHelped || 0}
            onTreeClick={() => setShowPanel('progress')}
            onFlowerClick={() => setLocation('/achievements')}
            onButterflyClick={() => setShowPanel('streak')}
            onImpactClick={() => setLocation('/impact')}
          />
        </motion.div>

        {/* Floating Glassmorphic Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Warranty Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">Warranty Lookup</h3>
                    <p className="text-xs text-emerald-100">Instant serial check</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Serial number..."
                    value={warrantySearch}
                    onChange={(e) => setWarrantySearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                    className="flex-1 h-11 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                    data-testid="input-warranty-search"
                  />
                  <Button 
                    onClick={handleWarrantySearch}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-11"
                    data-testid="button-warranty-search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Link href="/warranty">
                    <Button variant="outline" className="border-white/30 hover:bg-white/20 text-white h-11 w-11 p-0">
                      <QrCode className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Learning Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">Learn & Earn</h3>
                    <p className="text-xs text-emerald-100">Grow your knowledge</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/quiz" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs h-10" data-testid="button-quiz-quick">
                      <Target className="h-3.5 w-3.5 mr-2" />
                      Quiz
                      <Badge className="ml-2 bg-white/20 text-white border-0 text-xs">+100</Badge>
                    </Button>
                  </Link>
                  <Link href="/sorting-game" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs h-10" data-testid="button-game-quick">
                      <Recycle className="h-3.5 w-3.5 mr-2" />
                      Game
                      <Badge className="ml-2 bg-white/20 text-white border-0 text-xs">+120</Badge>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Active Orders</h3>
                      <p className="text-xs text-emerald-100">{activeOrders.length} in progress</p>
                    </div>
                  </div>
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8" data-testid="button-view-all-orders">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeOrders.length > 0 ? (
                    activeOrders.slice(0, 2).map((order) => (
                      <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                        <motion.div
                          whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.1)" }}
                          className="p-3 rounded-lg cursor-pointer"
                          data-testid={`order-card-${order.orderNumber}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Box className="h-4 w-4 text-emerald-300" />
                              <span className="font-semibold text-sm text-white">#{order.orderNumber}</span>
                              <Badge className="bg-blue-500/30 text-blue-100 hover:bg-blue-500/30 text-xs">
                                {order.status}
                              </Badge>
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/50" />
                          </div>
                        </motion.div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6 text-emerald-100 text-sm">
                      No active orders
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">Your Progress</h3>
                    <p className="text-xs text-emerald-100">Level {userProgress?.level || 1}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-emerald-300" />
                      <span className="text-sm text-white">Total XP</span>
                    </div>
                    <span className="text-lg font-bold text-white">{userProgress?.totalPoints || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-300" />
                      <span className="text-sm text-white">Streak</span>
                    </div>
                    <span className="text-lg font-bold text-white">{userProgress?.currentStreak || 0} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-300" />
                      <span className="text-sm text-white">Achievements</span>
                    </div>
                    <span className="text-lg font-bold text-white">{userAchievements.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">Achievements</h3>
                      <p className="text-xs text-emerald-100">{userAchievements.length} unlocked</p>
                    </div>
                  </div>
                  <Link href="/achievements">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-8" data-testid="button-view-all-achievements">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {userAchievements.slice(0, 6).map((ua) => (
                    <motion.div
                      key={ua.id}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="text-3xl cursor-pointer"
                      title={ua.achievement.name}
                    >
                      {ua.achievement.icon}
                    </motion.div>
                  ))}
                  {userAchievements.length === 0 && (
                    <p className="text-emerald-100 text-sm">Start completing goals to unlock achievements!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Impact Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <Link href="/impact">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:bg-white/15 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Leaf className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">Impact Report</h3>
                      <p className="text-xs text-emerald-100">Your contribution</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-100">CO₂ Saved</span>
                      <span className="text-base font-bold text-green-300">{impact?.carbonSaved || 0} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-100">Water Provided</span>
                      <span className="text-base font-bold text-blue-300">{impact?.waterProvided || 0} L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-100">Families Helped</span>
                      <span className="text-base font-bold text-purple-300">{impact?.familiesHelped || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Action Buttons - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-8 right-8 flex flex-col gap-3 z-30"
      >
        <Link href="/orders">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center shadow-2xl"
            data-testid="button-floating-orders"
          >
            <Package className="h-6 w-6 text-white" />
          </motion.button>
        </Link>
        <Link href="/impact">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl"
            data-testid="button-floating-impact"
          >
            <BarChart3 className="h-6 w-6 text-white" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Interactive Panel Overlays */}
      <AnimatePresence>
        {showPanel === 'progress' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-6"
            onClick={() => setShowPanel(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Level {userProgress?.level || 1}</h2>
                <p className="text-neutral-600 mb-6">You're growing strong!</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Total XP</span>
                    <span className="text-2xl font-bold text-violet-600">{userProgress?.totalPoints || 0}</span>
                  </div>
                  <Progress value={50} className="h-3" />
                  <p className="text-xs text-neutral-500">Keep completing goals to level up!</p>
                </div>
                <Button onClick={() => setShowPanel(null)} className="mt-6 w-full">
                  Continue Growing
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPanel === 'streak' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-6"
            onClick={() => setShowPanel(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Flame className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">{userProgress?.currentStreak || 0} Day Streak</h2>
                <p className="text-neutral-600 mb-6">You're on fire! 🔥</p>
                <div className="flex justify-center gap-2 mb-6">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg ${
                        i < (userProgress?.currentStreak || 0) 
                          ? 'bg-gradient-to-br from-orange-400 to-red-500' 
                          : 'bg-neutral-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 mb-4">Come back tomorrow to keep it going!</p>
                <Button onClick={() => setShowPanel(null)} className="w-full">
                  Keep the Streak Alive
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
