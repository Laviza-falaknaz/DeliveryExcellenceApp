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
  Trophy, Zap, Flame, Package, Droplets, Sparkles, 
  Search, QrCode, Leaf, ShieldCheck, Target, 
  TrendingUp, Award, ChevronRight, AlertCircle, CheckCircle2,
  Clock, Box, Wrench, Star, Rocket, Gift
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
        
        {/* Journey Hub Hero - With Advanced Animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-none text-white overflow-hidden relative shadow-2xl">
            
            {/* Animated Background Orbs */}
            <motion.div 
              className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transform: "translate(40%, -40%)" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-2xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 20, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transform: "translate(-30%, 30%)" }}
            />
            
            <CardContent className="p-6 md:p-8 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Left: Welcome & Level */}
                <div className="space-y-4 flex-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
                    </h1>
                    <p className="text-white/90 text-sm md:text-base">
                      Keep up the great work on your sustainability journey
                    </p>
                  </motion.div>
                  
                  {/* Level & XP - Animated */}
                  <motion.div 
                    className="flex items-center gap-4 flex-wrap"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30 shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">Level {userProgress?.level || 1}</div>
                        <div className="text-xs text-white/80">Eco Champion</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30 shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Flame className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <div className="text-2xl font-bold">{userProgress?.currentStreak || 0} Days</div>
                        <div className="text-xs text-white/80">Current Streak</div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30 shadow-lg"
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{userProgress?.totalPoints || 0} XP</div>
                        <div className="text-xs text-white/80">Total Points</div>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* XP Progress Bar - Animated */}
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-white/90">Progress to Level {(userProgress?.level || 1) + 1}</span>
                      <span className="text-white font-semibold">{Math.round(progressToNextLevel)}%</span>
                    </div>
                    <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressToNextLevel}%` }}
                        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/30"
                          animate={{
                            x: ["-100%", "100%"]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="text-xs text-white/70">
                      {((userProgress?.totalPoints || 0) - currentLevelXP).toLocaleString()} / {(nextLevelXP - currentLevelXP).toLocaleString()} XP
                    </div>
                  </motion.div>
                </div>
                
                {/* Right: Quick Actions */}
                <motion.div 
                  className="grid grid-cols-2 md:flex md:flex-col gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/quiz">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full md:w-48 bg-white/90 hover:bg-white text-purple-700 font-semibold shadow-xl border-2 border-white/50 backdrop-blur-sm" data-testid="button-play-quiz">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Play Quiz
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/warranty">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full md:w-48 bg-white/20 hover:bg-white/30 text-white font-semibold border-2 border-white/50 backdrop-blur-sm shadow-xl" data-testid="button-check-warranty">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Check Warranty
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/achievements">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full md:w-48 bg-white/20 hover:bg-white/30 text-white font-semibold border-2 border-white/50 backdrop-blur-sm shadow-xl" data-testid="button-achievements">
                        <Award className="h-4 w-4 mr-2" />
                        Achievements
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/impact">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Button className="w-full md:w-48 bg-white/20 hover:bg-white/30 text-white font-semibold border-2 border-white/50 backdrop-blur-sm shadow-xl" data-testid="button-view-impact">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Impact
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Main Content Grid - Animated */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          
          {/* Left Column - Orders & RMAs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Orders - Animated Cards */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-[#08ABAB]/20 shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-[#08ABAB]/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Package className="h-5 w-5 text-white" />
                      </motion.div>
                      Active Orders
                      {activeOrders.length > 0 && (
                        <Badge className="bg-[#08ABAB] hover:bg-[#08ABAB]/90">
                          {activeOrders.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <Link href="/orders">
                      <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Button variant="ghost" size="sm" className="text-[#08ABAB] hover:text-[#08ABAB] hover:bg-[#08ABAB]/10" data-testid="button-view-all-orders">
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {activeOrders.length > 0 ? (
                      <div className="space-y-3">
                        {activeOrders.slice(0, 3).map((order, index) => (
                          <Link key={order.id} href={`/orders/${order.orderNumber}`}>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ 
                                scale: 1.02, 
                                boxShadow: "0 20px 40px rgba(8, 171, 171, 0.15)",
                                borderColor: "rgb(8, 171, 171)"
                              }}
                              className="p-5 rounded-xl border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50/50 cursor-pointer transition-all duration-300"
                              data-testid={`order-card-${order.orderNumber}`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <motion.div 
                                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#08ABAB]/10 to-emerald-500/10 flex items-center justify-center border-2 border-[#08ABAB]/20"
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <Box className="h-5 w-5 text-[#08ABAB]" />
                                  </motion.div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="bg-[#08ABAB]/10 text-[#08ABAB] border-[#08ABAB]/30 font-semibold">
                                        #{order.orderNumber}
                                      </Badge>
                                      <Badge className={
                                        order.status === 'shipped' ? 'bg-blue-500 hover:bg-blue-600' :
                                        order.status === 'processing' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                        'bg-neutral-500 hover:bg-neutral-600'
                                      }>
                                        <Clock className="h-3 w-3 mr-1" />
                                        {order.status.replace('_', ' ').toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-neutral-600">
                                      Ordered {new Date(order.orderDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-neutral-900">
                                    {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                                  </div>
                                  {order.estimatedDelivery && (
                                    <div className="text-xs text-neutral-500">
                                      Arrives {new Date(order.estimatedDelivery).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <motion.div 
                                className="flex items-center justify-end text-[#08ABAB] text-sm font-medium"
                                whileHover={{ x: 5 }}
                              >
                                Track Order <ChevronRight className="h-4 w-4 ml-1" />
                              </motion.div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Package className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                        </motion.div>
                        <p className="text-neutral-600 font-medium">No active orders</p>
                        <p className="text-sm text-neutral-500 mt-1">Your orders will appear here</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active RMAs - Animated */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-orange-200 shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <motion.div 
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Wrench className="h-5 w-5 text-white" />
                      </motion.div>
                      Warranty Cases
                      {activeRMAs.length > 0 && (
                        <Badge className="bg-orange-500 hover:bg-orange-600">
                          {activeRMAs.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <Link href="/rma">
                      <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-600 hover:bg-orange-50" data-testid="button-view-all-rmas">
                          View All
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {activeRMAs.length > 0 ? (
                      <div className="space-y-3">
                        {activeRMAs.map((rmaItem, index) => (
                          <Link key={rmaItem.rma.id} href={`/rma/${rmaItem.rma.rmaNumber}`}>
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ 
                                scale: 1.02,
                                boxShadow: "0 20px 40px rgba(249, 115, 22, 0.15)",
                                borderColor: "rgb(249, 115, 22)"
                              }}
                              className="p-5 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50/30 cursor-pointer transition-all duration-300"
                              data-testid={`rma-card-${rmaItem.rma.rmaNumber}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center border-2 border-orange-300"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                  >
                                    <Wrench className="h-5 w-5 text-orange-600" />
                                  </motion.div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 font-semibold">
                                        {rmaItem.rma.rmaNumber}
                                      </Badge>
                                      <Badge className="bg-orange-500 hover:bg-orange-600">
                                        {rmaItem.rma.status.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-neutral-600">
                                      Opened {new Date(rmaItem.rma.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <motion.div whileHover={{ x: 5 }}>
                                  <ChevronRight className="h-5 w-5 text-orange-500" />
                                </motion.div>
                              </div>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <motion.div 
                        className="text-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
                        </motion.div>
                        <p className="text-neutral-600 font-medium">No active warranty cases</p>
                        <p className="text-sm text-neutral-500 mt-1">All your products are running smoothly! 🎉</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Warranty Lookup - Interactive */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <motion.div 
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                      animate={{ 
                        boxShadow: [
                          "0 0 20px rgba(59, 130, 246, 0.5)",
                          "0 0 40px rgba(59, 130, 246, 0.7)",
                          "0 0 20px rgba(59, 130, 246, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </motion.div>
                    Check Warranty Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-neutral-700">
                    Enter your serial number to instantly check warranty coverage
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter serial number..."
                      value={warrantySearch}
                      onChange={(e) => setWarrantySearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
                      className="flex-1 bg-white border-2 border-blue-200 focus:border-blue-400 transition-colors"
                      data-testid="input-warranty-search"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        onClick={handleWarrantySearch}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg"
                        data-testid="button-warranty-search"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <Link href="/warranty">
                      <motion.div whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-neutral-600 bg-white/70 p-3 rounded-lg border border-blue-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-neutral-900">Where to find your serial number?</p>
                      <p className="mt-1">Check the label on the back or bottom of your device, or scan the QR code on the packaging</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Gamification & Impact */}
          <div className="space-y-6">
            
            {/* Latest Achievement - Animated Badge */}
            {userAchievements.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-2 border-amber-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardHeader className="bg-gradient-to-r from-amber-100/50 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Trophy className="h-5 w-5 text-amber-600" />
                      </motion.div>
                      Latest Achievement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {userAchievements.slice(0, 1).map((userAchievement) => {
                      const achievement = userAchievement.achievement;
                      return (
                        <motion.div 
                          key={userAchievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-4">
                            <motion.div 
                              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-2xl relative"
                              animate={{ 
                                boxShadow: [
                                  "0 0 30px rgba(251, 191, 36, 0.5)",
                                  "0 0 50px rgba(251, 191, 36, 0.8)",
                                  "0 0 30px rgba(251, 191, 36, 0.5)"
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <i className={`${achievement.icon} text-3xl text-white`}></i>
                              <motion.div
                                className="absolute inset-0 rounded-2xl bg-white/20"
                                animate={{ opacity: [0, 0.3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </motion.div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-neutral-900 mb-1">{achievement.name}</h3>
                              <p className="text-sm text-neutral-600 leading-relaxed">{achievement.description}</p>
                            </div>
                          </div>
                          <motion.div 
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl border-2 border-orange-300"
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-sm font-semibold text-neutral-800">XP Earned</span>
                            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-base px-4 py-1 shadow-lg">
                              <Zap className="h-4 w-4 mr-1" />
                              +{achievement.pointsAwarded}
                            </Badge>
                          </motion.div>
                          <Link href="/achievements">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button variant="outline" className="w-full border-2 border-amber-300 hover:bg-amber-100 hover:border-amber-400 font-semibold" data-testid="button-view-all-achievements">
                                View All Achievements
                                <Trophy className="h-4 w-4 ml-2" />
                              </Button>
                            </motion.div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Impact Pulse - Animated Grid */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-emerald-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="bg-gradient-to-r from-emerald-100/50 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Leaf className="h-5 w-5 text-emerald-600" />
                    </motion.div>
                    Impact Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingImpact ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : impact ? (
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div 
                        className="bg-white rounded-xl p-4 border-2 border-emerald-200 shadow-sm cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)",
                          borderColor: "rgb(16, 185, 129)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          {impact.carbonSaved}g
                        </motion.div>
                        <div className="text-xs text-neutral-600 mt-1">Carbon Saved</div>
                      </motion.div>
                      <motion.div 
                        className="bg-white rounded-xl p-4 border-2 border-cyan-200 shadow-sm cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(6, 182, 212, 0.2)",
                          borderColor: "rgb(6, 182, 212)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                        >
                          {impact.familiesHelped}
                        </motion.div>
                        <div className="text-xs text-neutral-600 mt-1">Families Helped</div>
                      </motion.div>
                      <motion.div 
                        className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(234, 88, 12, 0.2)",
                          borderColor: "rgb(234, 88, 12)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4, type: "spring" }}
                        >
                          {impact.mineralsSaved}g
                        </motion.div>
                        <div className="text-xs text-neutral-600 mt-1">Resources Saved</div>
                      </motion.div>
                      <motion.div 
                        className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-sm cursor-pointer"
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 30px rgba(37, 99, 235, 0.2)",
                          borderColor: "rgb(37, 99, 235)"
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <motion.div 
                          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                        >
                          {impact.treesEquivalent}
                        </motion.div>
                        <div className="text-xs text-neutral-600 mt-1">Trees Equiv.</div>
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Leaf className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
                      </motion.div>
                      <p className="text-xs text-neutral-500">No impact data yet</p>
                    </motion.div>
                  )}
                  <Link href="/impact">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full mt-4 border-2 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 font-semibold" data-testid="button-view-full-impact-report">
                        View Full Report
                        <TrendingUp className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Support & Resources - Interactive */}
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </motion.div>
                    Quick Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/support">
                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full justify-start border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100" size="sm" data-testid="button-contact-support">
                        <i className="ri-customer-service-line mr-2 text-lg"></i>
                        Contact Support
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/quiz">
                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full justify-start border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100" size="sm" data-testid="button-learn-earn-xp">
                        <i className="ri-lightbulb-line mr-2 text-lg"></i>
                        Learn & Earn XP
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/impact">
                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full justify-start border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-100" size="sm" data-testid="button-track-impact">
                        <Leaf className="h-4 w-4 mr-2" />
                        Track Your Impact
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
