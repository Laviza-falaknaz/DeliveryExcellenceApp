import { useQuery, useMutation } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Package, ShieldCheck, Target, Award, 
  TrendingUp, Droplet, Leaf, Recycle, Users, 
  ChevronRight, FileText, MessageSquare, Clock,
  Zap, Star, BarChart3, Brain, Gamepad2, AlertCircle, Truck, Rocket,
  RotateCcw, HelpCircle, Book, BookOpen, Phone
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRmaStatusColor, getOrderStatusColor } from "@/lib/utils";

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

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
  points: number;
  badgeColor: string;
}

interface AchievementProgress {
  id: number;
  userId: number;
  achievementId: number;
  currentValue: string;
  progressPercent: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  achievement: Achievement;
}

interface RMA {
  id: number;
  rmaNumber: string;
  status: string;
  createdAt: string;
  email: string;
}

interface RMAWithItems {
  rma: RMA;
  items: any[];
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

// Helper function to map icon names to emojis
const getAchievementEmoji = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    'ri-shopping-cart-line': '🛒',
    'ri-leaf-line': '🌿',
    'ri-water-flash-line': '💧',
    'ri-shopping-bag-3-line': '🛍️',
    'ri-share-line': '📤',
    'ri-customer-service-2-line': '🎧',
    'ri-fire-line': '🔥',
    'ri-plant-line': '🌱',
    'ri-recycle-line': '♻️',
    'ri-flag-line': '🚩',
  };
  return iconMap[iconName] || '🏆';
};

interface Tip {
  id: number;
  title: string;
  content: string;
  category: string;
  categoryColor: string;
  icon: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRocket, setShowRocket] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: tips = [], isLoading: tipsLoading } = useQuery<Tip[]>({
    queryKey: ["/api/remanufacturing-tips"],
  });
  
  const nextTip = () => setCurrentTip((prev) => (prev + 1) % (tips.length || 1));
  const prevTip = () => setCurrentTip((prev) => (prev - 1 + (tips.length || 1)) % (tips.length || 1));
  
  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ["/api/gamification/user-progress"],
  });
  
  const { data: allAchievements = [] } = useQuery<AchievementProgress[]>({
    queryKey: ["/api/gamification/achievements"],
  });

  const userAchievements = allAchievements.filter(a => a.isUnlocked);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: rmas = [] } = useQuery<RMAWithItems[]>({
    queryKey: ["/api/rma"],
  });
  
  const { impact } = useImpact();
  
  const recentOrders = orders.slice(0, 3);
  const activeRmas = rmas.filter(r => !['completed', 'rejected'].includes(r.rma.status)).slice(0, 3);

  const tierNames = ['Bronze Partner', 'Silver Partner', 'Gold Partner', 'Platinum Partner', 'Diamond Partner'];
  const tierName = tierNames[Math.min(Math.floor((userProgress?.level || 1) / 2), 4)];

  // Mutation to recalculate environmental impact
  const recalculateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/impact/recalculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to recalculate");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "🚀 Impact Recalculated!",
        description: `Updated ${data.updated} orders successfully!`,
      });
      // Invalidate all relevant queries to refresh data with refetch
      queryClient.invalidateQueries({ queryKey: ["/api/environmental-impact"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/impact"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/impact/trends"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/impact/equivalents"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/impact/by-order"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-progress"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/achievements"], refetchType: "all" });
      
      // Force refetch after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error: any) => {
      console.error("Recalculation error:", error);
      toast({
        title: "Error",
        description: "Failed to recalculate impact. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShootRocket = () => {
    setShowRocket(true);
    recalculateMutation.mutate();
    setTimeout(() => setShowRocket(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto p-4">
        
        {/* Rocket Animation with Fire Trail */}
        <AnimatePresence>
          {showRocket && (
            <>
              {/* Rocket */}
              <motion.div
                initial={{ x: -100, y: window.innerHeight / 2 }}
                animate={{ 
                  x: window.innerWidth + 100, 
                  y: 100,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 1.5,
                  ease: [0.43, 0.13, 0.23, 0.96]
                }}
                className="fixed z-50 pointer-events-none"
                style={{ fontSize: '80px', transform: 'rotate(-45deg)' }}
              >
                🚀
              </motion.div>
              
              {/* Fire Trail - Multiple particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: -100, 
                    y: window.innerHeight / 2,
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{ 
                    x: window.innerWidth + 100, 
                    y: 100,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{ 
                    duration: 1.5,
                    ease: [0.43, 0.13, 0.23, 0.96],
                    delay: i * 0.05
                  }}
                  className="fixed z-40 pointer-events-none"
                  style={{ 
                    fontSize: `${60 - i * 3}px`,
                    left: `${-20 - i * 15}px`
                  }}
                >
                  {i % 3 === 0 ? '🔥' : i % 3 === 1 ? '💨' : '✨'}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0] || 'User'}</h1>
        </div>

        {/* Tier Banner - Hidden */}
        {false && (
        <Card className="mb-4 overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-white" />
                  <span className="text-sm font-medium">Tier {userProgress?.level || 1}</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{tierName}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4" />
                  <span className="text-base">{userProgress?.totalPoints || 0} Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>Progress to {tierNames[Math.min(Math.floor((userProgress?.level || 1) / 2) + 1, 4)]}</span>
                  <span className="font-medium">{((userProgress?.totalPoints || 0) % 1000) / 10}%</span>
                </div>
                <div className="w-64">
                  <Progress value={((userProgress?.totalPoints || 0) % 1000) / 10} className="h-2 bg-white/20" />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center px-3 bg-white/10 rounded-lg py-2">
                  <div className="text-xs text-white/80 mb-0.5">Engagement</div>
                  <div className="text-2xl font-bold">{userProgress?.currentStreak || 0}</div>
                  <div className="text-xs text-white/80">Days Active</div>
                </div>

                <div className="text-center px-3 bg-white/10 rounded-lg py-2">
                  <div className="text-xs text-white/80 mb-0.5">CO₂ Saved</div>
                  <div className="text-2xl font-bold">{((impact?.carbonSaved || 0) / 1000).toFixed(0)}</div>
                  <div className="text-xs text-white/80">KG Total</div>
                </div>

                <div className="text-center px-3 bg-white/10 rounded-lg py-2">
                  <div className="text-xs text-white/80 mb-0.5">Impact</div>
                  <div className="text-2xl font-bold">{impact?.treesEquivalent || 0}</div>
                  <div className="text-xs text-white/80">Trees Equiv.</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Sustainability Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#08ABAB]" />
                Sustainability Metrics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Total Carbon Saved - Teal */}
                <Card className="shadow-md border-0 bg-[#08ABAB] text-white overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-end mb-1">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Leaf className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-white/80 mb-1">Total Carbon Saved</div>
                    <div className="text-xl font-bold mb-1">
                      {formatNumber(Math.round((impact?.carbonSaved || 0) / 1000))} kg
                    </div>
                    <div className="text-[10px] text-white/70">
                      Equivalent to planting {formatNumber(Math.round((impact?.carbonSaved || 0) / 21))} trees
                    </div>
                  </CardContent>
                </Card>

                {/* Clean Water Provided - Navy */}
                <Card className="shadow-md border-0 bg-[#305269] text-white overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-end mb-1">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-white/80 mb-1">Clean Water Provided</div>
                    <div className="text-xl font-bold mb-1">
                      {formatNumber(impact?.familiesHelped || 0)}
                    </div>
                    <div className="text-[10px] text-white/70">
                      families helped
                    </div>
                    <div className="text-[10px] text-white/60 mt-0.5">
                      {formatNumber(Math.round((impact?.familiesHelped || 0) * 1.2))}M litres volume
                    </div>
                  </CardContent>
                </Card>

                {/* Resource Preservation - Gold */}
                <Card className="shadow-md border-0 bg-[#FF9E1C] text-white overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-end mb-1">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Recycle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-white/80 mb-1">Resource Preservation</div>
                    <div className="text-xl font-bold mb-1">
                      {formatNumber(Math.round((impact?.mineralsSaved || 0) / 1000))} kg
                    </div>
                    <div className="text-[10px] text-white/70">
                      Mining impact reduced
                    </div>
                  </CardContent>
                </Card>

                {/* Water Saved - Purple */}
                <Card className="shadow-md border-0 bg-[#663366] text-white overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex justify-end mb-1">
                      <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <Droplet className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="text-xs font-medium text-white/80 mb-1">Water Saved</div>
                    <div className="text-xl font-bold mb-1">
                      {formatNumber(Math.round((impact?.waterSaved || 0) / 1000000))}M litres
                    </div>
                    <div className="text-[10px] text-white/70">
                      Water conservation via reuse
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Active RMA Items */}
            {activeRmas.length > 0 && (
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 pb-3 pt-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Active RMA Requests
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                      onClick={() => setLocation('/rma')}
                      data-testid="button-view-all-rmas"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {activeRmas.map(({ rma }) => (
                      <Link key={rma.id} href={`/rma`}>
                        <div 
                          className="p-3 hover:bg-orange-50/50 transition-colors cursor-pointer"
                          data-testid={`rma-${rma.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {rma.rmaNumber}
                                </span>
                                <Badge className={`${getRmaStatusColor(rma.status)} text-xs`}>
                                  {rma.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(rma.createdAt).toLocaleDateString()} • {rma.email}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Setup Tips Carousel */}
            {!tipsLoading && tips.length > 0 && (
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-cyan-50 pb-2 pt-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#08ABAB]" />
                      Setup Tips
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#08ABAB] hover:text-[#08ABAB]/80 hover:bg-teal-50"
                      onClick={() => setLocation('/remanufactured')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="relative overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${currentTip * 100}%)` }}
                    >
                      {tips.map((tip) => {
                        const color = tip.categoryColor || "#08ABAB";
                        return (
                          <div key={tip.id} className="w-full flex-shrink-0">
                            <div 
                              className="p-3 rounded-lg border"
                              style={{ 
                                backgroundColor: `${color}0D`,
                                borderColor: `${color}33`
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div 
                                  className="h-9 w-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                >
                                  <i className={`${tip.icon} text-base`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm text-gray-900 truncate">{tip.title}</h4>
                                    <span 
                                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                                      style={{ 
                                        backgroundColor: `${color}33`,
                                        color: color
                                      }}
                                    >
                                      {tip.category}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2">{tip.content}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {tips.length > 1 && (
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevTip}
                        className="h-7 text-xs text-gray-600 hover:text-[#08ABAB]"
                      >
                        <ChevronRight className="h-3 w-3 rotate-180 mr-1" />
                        Prev
                      </Button>
                      <div className="flex gap-1">
                        {tips.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTip(index)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              index === currentTip ? 'bg-[#08ABAB]' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTip}
                        className="h-7 text-xs text-gray-600 hover:text-[#08ABAB]"
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Orders */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gray-50 pb-3 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-teal-600" />
                    Recent Orders
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                    onClick={() => setLocation('/orders')}
                    data-testid="button-view-all-orders"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentOrders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No orders found</p>
                    <Button 
                      variant="link" 
                      className="text-teal-600 mt-1 text-sm"
                      onClick={() => setLocation('/orders')}
                      data-testid="link-browse-inventory"
                    >
                      Browse Inventory
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                        data-testid={`order-${order.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 cursor-pointer" onClick={() => setLocation('/orders')}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {order.orderNumber}
                              </span>
                              <Badge className={`${getOrderStatusColor(order.status)} text-xs`}>
                                {order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString()} • {order.currency} {order.totalAmount}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/orders/${order.id}/journey`);
                            }}
                            data-testid={`button-track-order-${order.id}`}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Track
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4">
            
            {/* Quick Actions */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gray-50 pb-2 pt-2">
                <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/orders')}
                  data-testid="button-track-order"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/rma')}
                  data-testid="button-create-rma"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Create RMA
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/impact')}
                  data-testid="button-view-impact"
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  View Impact
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/support')}
                  data-testid="button-troubleshooting"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Troubleshooting
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/impact?tab=remanufacturing')}
                  data-testid="button-about-remanufacturing"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  About Remanufacturing
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/impact?tab=case-studies')}
                  data-testid="button-case-studies"
                >
                  <Book className="h-4 w-4 mr-2" />
                  Case Studies
                </Button>

                <Button 
                  className="w-full justify-start bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white text-sm h-9 shadow-sm"
                  onClick={() => setLocation('/support')}
                  data-testid="button-contact"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
