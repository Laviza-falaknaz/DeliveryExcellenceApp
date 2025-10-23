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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Trophy, Zap, TrendingUp, Award } from "lucide-react";
import UserProfileCard from "@/components/gamification/user-profile-card";
import AchievementCard from "@/components/gamification/achievement-card";
import ProgressRing from "@/components/gamification/progress-ring";
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
  
  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Gamified Header with User Profile */}
      <div className="mb-6">
        <UserProfileCard 
          userName={user?.name || 'User'}
          userEmail={user?.email || ''}
          level={userProgress?.level || 1}
          currentXP={userProgress?.experiencePoints || 0}
          xpToNextLevel={100}
          currentStreak={userProgress?.currentStreak || 0}
          longestStreak={userProgress?.longestStreak || 0}
        />
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

      {/* Achievements & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#08ABAB]" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map((achievement: any) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    size="small"
                  />
                ))}
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/achievements">View All Achievements</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No achievements unlocked yet</p>
                <p className="text-sm text-neutral-400 mt-1">Start your journey to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#08ABAB]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLog.length > 0 ? (
              <div className="space-y-3">
                {activityLog.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors">
                    <div className="mt-1">
                      <Zap className="h-4 w-4 text-[#08ABAB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-700 font-medium truncate">{activity.description}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        +{activity.pointsEarned} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500">No activity yet</p>
                <p className="text-sm text-neutral-400 mt-1">Your journey starts now!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold font-poppins mb-4 flex items-center gap-2">
          Your Environmental Impact
          {impact && (
            <span className="text-sm font-normal text-neutral-500">
              (Earning you XP!)
            </span>
          )}
        </h2>
        {isLoadingImpact ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : impact ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ImpactCard
              title="Carbon Saved"
              value={impact.carbonSaved}
              unit="g"
              icon="ri-plant-line"
              iconImage={carbonIcon}
              iconColor="text-secondary"
              iconBgColor="bg-secondary/10"
              progress={65}
              footnote1={`Equivalent to ${impact.treesEquivalent} trees`}
            />
            <ImpactCard
              title="Clean Water Provided"
              value={impact.familiesHelped}
              unit="families"
              icon="ri-water-flash-line"
              iconImage={waterIcon}
              iconColor="text-secondary"
              iconBgColor="bg-secondary/10"
              progress={78}
              footnote1="Figure for 1 week supply per family"
            />
            <ImpactCard
              title="Resources Preserved"
              value={impact.mineralsSaved}
              unit="g"
              icon="ri-recycle-line"
              iconImage={resourceIcon}
              iconColor="text-accent"
              iconBgColor="bg-accent/10"
              progress={45}
              footnote1="Including rare earth metals"
            />
            <ImpactCard
              title="Litres of Water Saved"
              value={impact.waterSaved || 0}
              unit="litres"
              icon="ri-drop-line"
              iconImage={waterDropletsIcon}
              iconColor="text-[#08ABAB]"
              iconBgColor="bg-[#08ABAB]/10"
              progress={55}
              footnote1="Water conservation through reuse"
            />
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-neutral-700">No impact data available yet</h3>
            <p className="text-neutral-500 mt-2">Your environmental impact will appear once you make your first order.</p>
          </div>
        )}
      </section>

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
