import { useQuery } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  Trophy, Package, ShieldCheck, Target, 
  TrendingUp, Award, Box, Wrench, Leaf, BarChart3, Zap, CheckCircle2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EcoSphere } from "@/components/dashboard/eco-sphere";
import { DynamicBackground } from "@/components/dashboard/dynamic-background";
import { OrbitalPanel } from "@/components/dashboard/orbital-panel";
import { WelcomeMessage } from "@/components/dashboard/welcome-message";
import { EcoChallenge } from "@/components/dashboard/eco-challenge";

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
  const [showProgressModal, setShowProgressModal] = useState(false);
  
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

  // Calculate overall progress for background gradient (0-100)
  const overallProgress = Math.min(
    ((impact?.carbonSaved || 0) / 10) + ((userProgress?.level || 1) * 5), 
    100
  );

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-300 bg-yellow-400/20 border-yellow-400/30',
    processing: 'text-blue-300 bg-blue-400/20 border-blue-400/30',
    shipped: 'text-cyan-300 bg-cyan-400/20 border-cyan-400/30',
    delivered: 'text-emerald-300 bg-emerald-400/20 border-emerald-400/30',
    approved: 'text-emerald-300 bg-emerald-400/20 border-emerald-400/30',
    in_progress: 'text-blue-300 bg-blue-400/20 border-blue-400/30'
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      
      {/* Dynamic Gradient Background */}
      <DynamicBackground progress={overallProgress} />

      {/* Welcome Message */}
      <WelcomeMessage 
        userName={user?.name?.split(' ')[0] || 'there'} 
        totalImpact={impact?.carbonSaved || 0}
      />

      {/* Central Eco-Sphere */}
      <div className="absolute inset-0 flex items-center justify-center">
        <EcoSphere
          level={userProgress?.level || 1}
          xp={userProgress?.totalPoints || 0}
          streak={userProgress?.currentStreak || 0}
          achievements={userAchievements.length}
          carbonSaved={impact?.carbonSaved || 0}
          waterProvided={impact?.waterProvided || 0}
          familiesHelped={impact?.familiesHelped || 0}
          onSphereClick={() => setShowProgressModal(true)}
        />
      </div>

      {/* Orbital Panel: Active Orders - Top Left */}
      {activeOrders.length > 0 && (
        <OrbitalPanel 
          title="Active Orders" 
          icon={Package} 
          position="top-left"
          accentColor="emerald"
        >
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activeOrders.slice(0, 3).map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <motion.div
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                  whileHover={{ x: 5 }}
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/90 font-medium text-sm">
                        {order.orderNumber}
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        {order.status}
                      </p>
                    </div>
                    <Badge className={statusColors[order.status] || 'text-white/70 bg-white/10'}>
                      {order.status}
                    </Badge>
                  </div>
                </motion.div>
              </Link>
            ))}
            {activeOrders.length > 3 && (
              <Button 
                variant="ghost" 
                className="w-full text-emerald-300 hover:text-emerald-200 hover:bg-emerald-400/10"
                onClick={() => setLocation('/orders')}
                data-testid="button-view-all-orders"
              >
                View All Orders ({activeOrders.length})
              </Button>
            )}
          </div>
        </OrbitalPanel>
      )}

      {/* Orbital Panel: Impact Metrics - Top Right */}
      <OrbitalPanel 
        title="Your Impact" 
        icon={Leaf} 
        position="top-right"
        accentColor="cyan"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Carbon Saved</span>
            <span className="text-emerald-300 font-semibold">
              {(impact?.carbonSaved || 0).toLocaleString()} kg
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Water Provided</span>
            <span className="text-cyan-300 font-semibold">
              {(impact?.waterProvided || 0).toLocaleString()} L
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Families Helped</span>
            <span className="text-amber-300 font-semibold">
              {impact?.familiesHelped || 0}
            </span>
          </div>
          <Button 
            className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30"
            onClick={() => setLocation('/impact')}
            data-testid="button-view-impact"
          >
            View Full Impact Report
          </Button>
        </div>
      </OrbitalPanel>

      {/* Orbital Panel: Achievements - Bottom Left */}
      <OrbitalPanel 
        title="Achievements" 
        icon={Trophy} 
        position="bottom-left"
        accentColor="gold"
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {userAchievements.slice(0, 3).map((ua) => (
            <motion.div
              key={ua.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              data-testid={`achievement-${ua.achievement.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{ua.achievement.icon}</div>
                <div className="flex-1">
                  <p className="text-white/90 font-medium text-sm">
                    {ua.achievement.name}
                  </p>
                  <p className="text-amber-300 text-xs">
                    +{ua.achievement.pointsAwarded} XP
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          <Button 
            variant="ghost" 
            className="w-full text-amber-300 hover:text-amber-200 hover:bg-amber-400/10"
            onClick={() => setLocation('/achievements')}
            data-testid="button-view-achievements"
          >
            View All Achievements
          </Button>
        </div>
      </OrbitalPanel>

      {/* Orbital Panel: Warranty Search - Bottom Right */}
      <OrbitalPanel 
        title="Warranty Check" 
        icon={ShieldCheck} 
        position="bottom-right"
        accentColor="teal"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter serial number..."
              value={warrantySearch}
              onChange={(e) => setWarrantySearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWarrantySearch()}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-teal-400/50"
              data-testid="input-warranty-search"
            />
            <Button 
              onClick={handleWarrantySearch}
              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30"
              data-testid="button-search-warranty"
            >
              <ShieldCheck className="h-4 w-4" />
            </Button>
          </div>
          
          {activeRMAs.length > 0 && (
            <div className="mt-4">
              <p className="text-white/60 text-xs mb-2">Active RMAs:</p>
              {activeRMAs.map((rma) => (
                <Link key={rma.rma.id} href={`/rma/${rma.rma.id}`}>
                  <motion.div
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer mb-2"
                    whileHover={{ x: 5 }}
                    data-testid={`rma-${rma.rma.id}`}
                  >
                    <p className="text-white/90 text-sm">{rma.rma.rmaNumber}</p>
                    <p className="text-white/60 text-xs">{rma.rma.status}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </OrbitalPanel>

      {/* Orbital Panel: Progress Stats - Left */}
      <OrbitalPanel 
        title="Your Progress" 
        icon={TrendingUp} 
        position="left"
        accentColor="emerald"
        expandable={false}
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Level {userProgress?.level || 1}</span>
              <span className="text-emerald-300 text-sm font-semibold">
                {((userProgress?.totalPoints || 0) % 1000)} / 1000 XP
              </span>
            </div>
            <Progress 
              value={((userProgress?.totalPoints || 0) % 1000) / 10} 
              className="h-2 bg-white/10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="text-white/90">
              {userProgress?.currentStreak || 0} day streak
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-white/90">
              {userAchievements.length} achievements
            </span>
          </div>
        </div>
      </OrbitalPanel>

      {/* Orbital Panel: Quick Actions - Right */}
      <OrbitalPanel 
        title="Quick Actions" 
        icon={Target} 
        position="right"
        accentColor="teal"
        expandable={false}
      >
        <div className="space-y-2">
          <Button
            className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10"
            onClick={() => setLocation('/orders')}
            data-testid="button-track-order"
          >
            <Package className="h-4 w-4 mr-2" />
            Track Order
          </Button>
          
          <Button
            className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10"
            onClick={() => setLocation('/rma')}
            data-testid="button-start-return"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Start Return
          </Button>
          
          <Button
            className="w-full justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10"
            onClick={() => setLocation('/impact')}
            data-testid="button-sustainability"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Sustainability
          </Button>
        </div>
      </OrbitalPanel>

      {/* Daily Eco Challenge */}
      <EcoChallenge userName={user?.name?.split(' ')[0] || 'there'} />

      {/* Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowProgressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Your Progress</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/80">Level</span>
                    <span className="text-3xl font-bold text-emerald-300">
                      {userProgress?.level || 1}
                    </span>
                  </div>
                  <Progress 
                    value={((userProgress?.totalPoints || 0) % 1000) / 10} 
                    className="h-3 bg-white/10"
                  />
                  <p className="text-white/60 text-sm mt-2">
                    {((userProgress?.totalPoints || 0) % 1000)} / 1000 XP to next level
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Zap className="h-6 w-6 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {userProgress?.currentStreak || 0}
                    </p>
                    <p className="text-white/60 text-sm">Day Streak</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Trophy className="h-6 w-6 text-amber-400 mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {userAchievements.length}
                    </p>
                    <p className="text-white/60 text-sm">Achievements</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                  onClick={() => setShowProgressModal(false)}
                  data-testid="button-close-progress"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
