import { useQuery } from "@tanstack/react-query";
import { useOrders } from "@/hooks/use-orders";
import { useImpact } from "@/hooks/use-impact";
import ImpactCard from "@/components/dashboard/impact-card";
import OrderCard from "@/components/dashboard/order-card";
import WaterImpact from "@/components/dashboard/water-impact";
import CaseStudyBanner from "@/components/dashboard/case-study-banner";
import SupportResources from "@/components/dashboard/support-resources";
import NotificationBanner from "@/components/dashboard/notification-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Trophy, Zap, Flame, Package, Droplets, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import carbonIcon from "@assets/Carbon Icon CC_1757591684851.png";
import mineralsIcon from "@assets/Minerals Saved Icon CC _1757591709661.png";
import resourceIcon from "@assets/Resource Pres Icon CC_1757592358474.png";
import waterIcon from "@assets/CC_Icons_Weight increased-152_1759311452405.png";
import waterDropletsIcon from "@assets/Minerals Saved Icon CC _1759311586728.png";

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

export default function Dashboard() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ["/api/gamification/user-progress"],
  });
  
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ["/api/gamification/user-achievements"],
  });
  
  const { data: activityLog = [] } = useQuery({
    queryKey: ["/api/gamification/activity-log"],
  });
  
  const { getMostRecentActiveOrder, getPastOrders, isLoadingOrders } = useOrders();
  const { impact, isLoadingImpact } = useImpact();
  
  const [notificationVisible, setNotificationVisible] = useState(true);
  
  // Check if there's an active order to display in notification
  const activeOrder = getMostRecentActiveOrder();
  const pastOrders = getPastOrders();
  const recentPastOrder = pastOrders.length > 0 ? pastOrders[0] : null;

  // Used for notification banner
  const orderForNotification = activeOrder || recentPastOrder;
  
  // Get recent unlocked achievements (top 3)
  const recentAchievements = userAchievements.slice(0, 3);
  
  // Get recent activities
  const recentActivities = activityLog;
  
  // Generate deterministic trend data for impact cards (memoized to prevent re-renders)
  const impactTrends = useMemo(() => {
    if (!impact) return null;
    
    const generateTrend = (baseValue: number, seed: number) => {
      // Deterministic pseudo-random based on seed
      const seededRandom = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      
      return Array.from({ length: 7 }, (_, i) => 
        baseValue * (0.7 + seededRandom(seed + i) * 0.6)
      );
    };

    return {
      carbon: generateTrend(impact.carbonSaved, 1),
      water: generateTrend(impact.familiesHelped, 2),
      minerals: generateTrend(impact.mineralsSaved, 3),
      waterSaved: generateTrend(impact.waterSaved || 0, 4)
    };
  }, [impact]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="py-4 px-4 md:px-6 max-w-[1600px] mx-auto">
      {/* Compact Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-sm text-neutral-600">Track your sustainability journey</p>
          </div>
          <div className="flex items-center gap-2">
            {userProgress && (
              <>
                <Badge className="bg-gradient-to-r from-[#08ABAB] to-emerald-500 text-white border-none">
                  <Trophy className="h-3 w-3 mr-1" />
                  Lvl {userProgress.level}
                </Badge>
                {userProgress.currentStreak > 0 && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none">
                    <Flame className="h-3 w-3 mr-1" />
                    {userProgress.currentStreak}d
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Compact XP Bar */}
        {userProgress && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="mt-3 bg-white rounded-full p-1.5 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-xs font-medium text-neutral-600">XP Progress</span>
              <span className="text-xs font-bold text-[#08ABAB]">{userProgress.totalPoints} XP</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userProgress.totalPoints % 1000) / 10, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#08ABAB] to-emerald-500"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {orderForNotification && notificationVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NotificationBanner
            message={
              activeOrder
                ? `Your order #${activeOrder.orderNumber} is being ${activeOrder.status.replace('_', ' ')}!`
                : `Your order #${recentPastOrder?.orderNumber} has been completed!`
            }
            subText={
              activeOrder && activeOrder.estimatedDelivery
                ? `Estimated delivery: ${new Date(activeOrder.estimatedDelivery).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}`
                : "Thank you for your purchase!"
            }
            isVisible={notificationVisible}
            onClose={() => setNotificationVisible(false)}
          />
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4"
      >
        {/* Left Column - Impact Cards (2 columns on large screens) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Environmental Impact
            </h2>
            <Badge variant="outline" className="text-xs">Last 7 days</Badge>
          </div>
          
          {isLoadingImpact ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : impact ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ImpactCard
                title="Carbon Saved"
                value={impact.carbonSaved}
                unit="g"
                icon="ri-plant-line"
                iconImage={carbonIcon}
                iconColor="text-emerald-600"
                iconBgColor="bg-emerald-100"
                progress={65}
                footnote1={`${impact.treesEquivalent} trees`}
                trend={impactTrends?.carbon}
                trendColor="#10b981"
              />
              <ImpactCard
                title="Water Provided"
                value={impact.familiesHelped}
                unit="families"
                icon="ri-water-flash-line"
                iconImage={waterIcon}
                iconColor="text-cyan-600"
                iconBgColor="bg-cyan-100"
                progress={78}
                footnote1="1 week supply"
                trend={impactTrends?.water}
                trendColor="#06b6d4"
              />
              <ImpactCard
                title="Resources Preserved"
                value={impact.mineralsSaved}
                unit="g"
                icon="ri-recycle-line"
                iconImage={resourceIcon}
                iconColor="text-orange-600"
                iconBgColor="bg-orange-100"
                progress={45}
                footnote1="Rare earth metals"
                trend={impactTrends?.minerals}
                trendColor="#ea580c"
              />
              <ImpactCard
                title="Water Saved"
                value={impact.waterSaved || 0}
                unit="litres"
                icon="ri-drop-line"
                iconImage={waterDropletsIcon}
                iconColor="text-blue-600"
                iconBgColor="bg-blue-100"
                progress={55}
                footnote1="Through reuse"
                trend={impactTrends?.waterSaved}
                trendColor="#2563eb"
              />
            </div>
          ) : (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
                <i className="ri-seedling-line text-2xl text-emerald-600"></i>
              </div>
              <h3 className="text-sm font-medium text-neutral-700">No impact data yet</h3>
              <p className="text-xs text-neutral-500 mt-1">Start your journey by placing an order</p>
            </div>
          )}
        </motion.div>

        {/* Right Column - Quick Actions & Achievements */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Sustainability Quiz Card */}
          <Link href="/quiz">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:border-purple-400 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                      <i className="ri-gamepad-line text-2xl text-white"></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-neutral-900">Quiz Challenge</h3>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-none text-xs px-1.5 py-0">
                        New
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">
                      Test your sustainability knowledge
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <i className="ri-question-line text-purple-600"></i>
                        8 questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-orange-500" />
                        <span className="font-bold text-orange-600">100 XP</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <Card className="border-neutral-200">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#08ABAB]" />
                    Recent Achievements
                  </h3>
                  <Link href="/achievements">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {recentAchievements.slice(0, 2).map((userAchievement) => {
                  const achievement = userAchievement.achievement;
                  return (
                    <div
                      key={userAchievement.id}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center shadow-sm">
                          <i className={`${achievement.icon} text-lg text-white`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">{achievement.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-orange-500 text-white border-none text-xs px-1.5 py-0">
                              <Zap className="h-2.5 w-2.5 mr-0.5" />
                              +{achievement.pointsAwarded}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Second Row - Orders & Water Impact */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4"
      >
        {/* Orders */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#08ABAB]" />
              Recent Orders
            </h2>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                View All
              </Button>
            </Link>
          </div>
          {isLoadingOrders ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : activeOrder ? (
            <OrderCard order={activeOrder} />
          ) : recentPastOrder ? (
            <OrderCard order={recentPastOrder} isPast={true} />
          ) : (
            <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#08ABAB]/10 mb-3">
                <Package className="h-6 w-6 text-[#08ABAB]" />
              </div>
              <h3 className="text-sm font-medium text-neutral-700">No orders yet</h3>
              <p className="text-xs text-neutral-500 mt-1">Your recent orders will appear here</p>
            </div>
          )}
        </motion.div>

        {/* Water Impact */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-cyan-600" />
              Water Impact
            </h2>
          </div>
          <WaterImpact />
        </motion.div>
      </motion.div>

      {/* Third Row - Case Study & Support */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <motion.div variants={itemVariants}>
          <CaseStudyBanner />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SupportResources />
        </motion.div>
      </motion.div>
    </div>
  );
}
