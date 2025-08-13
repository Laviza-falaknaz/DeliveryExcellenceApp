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
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
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
  
  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-neutral-600">
            Here's your latest sustainable impact and order status
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => window.open('https://circularcomputing.com/contact/', '_blank')}
            variant="outline"
            className="bg-white border-neutral-300 text-neutral-900 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors"
          >
            <i className="ri-phone-line mr-2"></i>
            <span>Contact Us</span>
          </Button>
        </div>
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
        <h2 className="text-lg font-semibold font-poppins mb-4">Your Environmental Impact</h2>
        {isLoadingImpact ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : impact ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ImpactCard
              title="Carbon Saved"
              value={impact.carbonSaved}
              unit="g"
              icon="ri-plant-line"
              iconColor="text-success"
              iconBgColor="bg-success/10"
              progress={65}
              footnote1={`Equivalent to ${impact.treesEquivalent} trees`}
              footnote2="+18% vs last month"
            />
            <ImpactCard
              title="Clean Water Provided"
              value={impact.waterProvided}
              unit="litres"
              icon="ri-water-flash-line"
              iconColor="text-secondary"
              iconBgColor="bg-secondary/10"
              progress={78}
              footnote1={`Helping ${impact.familiesHelped} families`}
              footnote2="+23% vs last month"
            />
            <ImpactCard
              title="Core Minerals Saved"
              value={impact.mineralsSaved}
              unit="g"
              icon="ri-recycle-line"
              iconColor="text-accent"
              iconBgColor="bg-accent/10"
              progress={45}
              footnote1="Including rare earth metals"
              footnote2="+8% vs last month"
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
          <Button variant="outline" asChild className="bg-white border hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors">
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
