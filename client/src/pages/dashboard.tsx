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
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Trophy, Zap, Flame } from "lucide-react";
import carbonIcon from "@assets/Carbon Icon CC_1757591684851.png";
import mineralsIcon from "@assets/Minerals Saved Icon CC _1757591709661.png";
import resourceIcon from "@assets/Resource Pres Icon CC_1757592358474.png";
import waterIcon from "@assets/CC_Icons_Weight increased-152_1759311452405.png";
import waterDropletsIcon from "@assets/Minerals Saved Icon CC _1759311586728.png";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: userProgress } = useQuery({
    queryKey: ["/api/gamification/user-progress"],
  });
  
  const { data: userAchievements = [] } = useQuery({
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

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-neutral-900 mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-neutral-600">
              Here's your sustainable impact dashboard
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {userProgress && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gradient-to-r from-[#08ABAB] to-[#08ABAB]/80 text-white border-none px-3 py-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  Level {userProgress.level}
                </Badge>
                {userProgress.currentStreak > 0 && (
                  <Badge variant="outline" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none px-3 py-1">
                    <Flame className="h-4 w-4 mr-1" />
                    {userProgress.currentStreak} day streak
                  </Badge>
                )}
              </div>
            )}
            <Button 
              onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
              variant="outline"
              size="sm"
            >
              <i className="ri-phone-line mr-2"></i>
              Contact Us
            </Button>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        {userProgress && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Your XP Progress</span>
              <span className="text-sm font-bold text-[#08ABAB]">{userProgress.totalPoints} XP</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#08ABAB] to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min((userProgress.totalPoints % 1000) / 10, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {orderForNotification && notificationVisible && (
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
      )}

      {/* Environmental Impact Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-poppins text-neutral-900">Your Environmental Impact</h2>
          <span className="text-sm text-neutral-500">Last 7 days trend</span>
        </div>
        {isLoadingImpact ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        ) : impact ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactCard
              title="Carbon Saved"
              value={impact.carbonSaved}
              unit="g"
              icon="ri-plant-line"
              iconImage={carbonIcon}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-100"
              progress={65}
              footnote1={`Equivalent to ${impact.treesEquivalent} trees`}
              trend={impactTrends?.carbon}
              trendColor="#10b981"
            />
            <ImpactCard
              title="Clean Water Provided"
              value={impact.familiesHelped}
              unit="families"
              icon="ri-water-flash-line"
              iconImage={waterIcon}
              iconColor="text-cyan-600"
              iconBgColor="bg-cyan-100"
              progress={78}
              footnote1="1 week supply per family"
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
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <i className="ri-seedling-line text-3xl text-emerald-600"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-700">No impact data available yet</h3>
            <p className="text-neutral-500 mt-2">Your environmental impact will appear once you make your first order.</p>
          </div>
        )}
      </section>

      {/* Achievements Section */}
      {recentAchievements.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-poppins text-neutral-900">Recent Achievements</h2>
            <Link href="/achievements">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement;
              return (
                <div
                  key={userAchievement.id}
                  className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#08ABAB] to-emerald-500 flex items-center justify-center shadow-lg">
                      <i className={`${achievement.icon} text-3xl text-white`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-900 mb-1">{achievement.name}</h3>
                      <p className="text-sm text-neutral-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none">
                          <Zap className="h-3 w-3 mr-1" />
                          +{achievement.pointsAwarded} XP
                        </Badge>
                        <span className="text-neutral-500">
                          Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Orders Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-poppins">Recent Orders</h2>
          <Button variant="outline" asChild>
            <Link href="/orders">View Your Orders</Link>
          </Button>
        </div>

        {isLoadingOrders ? (
          <Skeleton className="h-80 w-full" />
        ) : activeOrder ? (
          <OrderCard order={activeOrder} />
        ) : recentPastOrder ? (
          <OrderCard order={recentPastOrder} isPast={true} />
        ) : (
          <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#08ABAB]/10 text-[#08ABAB] mb-3">
              <i className="ri-inbox-line text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-700">No orders yet</h3>
            <p className="text-neutral-500 mt-2">Your recent orders will appear here once you start ordering.</p>
          </div>
        )}
      </section>

      {/* Charity Water Projects Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-poppins">Your Water Impact</h2>
        </div>
        
        <WaterImpact />
      </section>

      {/* Activity Feed Section */}
      {recentActivities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold font-poppins text-neutral-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-200">
              {recentActivities.slice(0, 5).map((activity) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'order_placed': return 'ri-shopping-cart-line';
                    case 'order_dispatched': return 'ri-truck-line';
                    case 'order_delivered': return 'ri-checkbox-circle-line';
                    case 'achievement_unlocked': return 'ri-trophy-line';
                    case 'level_up': return 'ri-trophy-line';
                    case 'impact_milestone': return 'ri-leaf-line';
                    default: return 'ri-information-line';
                  }
                };
                
                const getActivityColor = (type: string) => {
                  switch (type) {
                    case 'order_placed': return 'bg-blue-100 text-blue-600';
                    case 'order_dispatched': return 'bg-purple-100 text-purple-600';
                    case 'order_delivered': return 'bg-green-100 text-green-600';
                    case 'achievement_unlocked': return 'bg-yellow-100 text-yellow-600';
                    case 'level_up': return 'bg-orange-100 text-orange-600';
                    case 'impact_milestone': return 'bg-emerald-100 text-emerald-600';
                    default: return 'bg-neutral-100 text-neutral-600';
                  }
                };
                
                return (
                  <div key={activity.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getActivityColor(activity.activityType)} flex items-center justify-center`}>
                        <i className={`${getActivityIcon(activity.activityType)} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{activity.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(activity.activityDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {activity.pointsEarned > 0 && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none flex-shrink-0">
                          <Zap className="h-3 w-3 mr-1" />
                          +{activity.pointsEarned} XP
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Case Study Section */}
      <section className="mb-8">
        <CaseStudyBanner />
      </section>

      {/* Support Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-poppins">Support & Resources</h2>
        </div>
        
        <SupportResources />
      </section>
    </div>
  );
}
