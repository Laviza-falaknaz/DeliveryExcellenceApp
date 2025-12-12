import { useQuery, useMutation } from "@tanstack/react-query";
import { useImpact } from "@/hooks/use-impact";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Package, ShieldCheck, Target, Award, 
  TrendingUp, Droplet, Leaf, Recycle, Users, 
  ChevronRight, FileText, MessageSquare, Clock,
  Zap, Star, BarChart3, Brain, Gamepad2, AlertCircle, Truck, Rocket,
  RotateCcw, HelpCircle, Book, BookOpen, Phone, Play, Share2, ExternalLink
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRmaStatusColor, getOrderStatusColor } from "@/lib/utils";
import charityWaterLogo from "@assets/cw_long_white.png";
import charityWaterBg from "@assets/image_1765522883941.png";
import caseStudyBg from "@assets/Case Study - Image_1759311266301.jpg";

type RemanufacturedTip = {
  id: number;
  title: string;
  content: string;
  icon: string;
  category: string;
  categoryColor: string;
  displayOrder: number;
  isActive: boolean;
};

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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showRocket, setShowRocket] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
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
  
  const { data: tips = [], isLoading: tipsLoading } = useQuery<RemanufacturedTip[]>({
    queryKey: ["/api/remanufactured-tips"],
  });
  
  const { impact } = useImpact();

  const nextTip = () => {
    if (tips.length > 0) {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }
  };

  const prevTip = () => {
    if (tips.length > 0) {
      setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
    }
  };

  const podcastVideo = {
    id: "u7IOWNV2zFU",
    title: "The Remanufacturing Process",
    thumbnailUrl: `https://img.youtube.com/vi/u7IOWNV2zFU/mqdefault.jpg`
  };
  
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

        {/* Sustainability Metrics - Full Width */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#08ABAB]" />
            Sustainability Metrics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Total Carbon Saved - Teal with gradient */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[#06989a] via-[#0BC5C5] to-[#08ABAB] text-white overflow-hidden relative">
              <div className="absolute top-1 right-1 opacity-15">
                <Leaf className="h-14 w-14 text-white" />
              </div>
              <CardContent className="p-3 relative z-10">
                <div className="text-xs font-medium text-white/90 mb-1">Total Carbon Saved</div>
                <div className="text-xl font-bold mb-1">
                  {formatNumber(Math.round((impact?.carbonSaved || 0) / 1000))} kg
                </div>
                <div className="text-[10px] text-white/80">
                  Equivalent to planting {formatNumber(Math.round((impact?.carbonSaved || 0) / 21))} trees
                </div>
              </CardContent>
            </Card>

            {/* Clean Water Provided - Navy with gradient */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[#243d4d] via-[#3d6580] to-[#305269] text-white overflow-hidden relative">
              <div className="absolute top-1 right-1 opacity-15">
                <Users className="h-14 w-14 text-white" />
              </div>
              <CardContent className="p-3 relative z-10">
                <div className="text-xs font-medium text-white/90 mb-1">Clean Water Provided</div>
                <div className="text-xl font-bold mb-1">
                  {formatNumber(impact?.familiesHelped || 0)}
                </div>
                <div className="text-[10px] text-white/80">
                  families helped
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">
                  {formatNumber(Math.round((impact?.familiesHelped || 0) * 1.2))}M litres volume
                </div>
              </CardContent>
            </Card>

            {/* Resource Preservation - Gold with gradient */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[#e88a0c] via-[#FFB347] to-[#FF9E1C] text-white overflow-hidden relative">
              <div className="absolute top-1 right-1 opacity-15">
                <Recycle className="h-14 w-14 text-white" />
              </div>
              <CardContent className="p-3 relative z-10">
                <div className="text-xs font-medium text-white/90 mb-1">Resource Preservation</div>
                <div className="text-xl font-bold mb-1">
                  {formatNumber(Math.round((impact?.mineralsSaved || 0) / 1000))} kg
                </div>
                <div className="text-[10px] text-white/80">
                  Mining impact reduced
                </div>
              </CardContent>
            </Card>

            {/* Water Saved - Purple with gradient */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-[#4d264d] via-[#7a4d7a] to-[#663366] text-white overflow-hidden relative">
              <div className="absolute top-1 right-1 opacity-15">
                <Droplet className="h-14 w-14 text-white" />
              </div>
              <CardContent className="p-3 relative z-10">
                <div className="text-xs font-medium text-white/90 mb-1">Water Saved</div>
                <div className="text-xl font-bold mb-1">
                  {formatNumber(Math.round((impact?.waterSaved || 0) / 1000000))}M litres
                </div>
                <div className="text-[10px] text-white/80">
                  Water conservation via reuse
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Grid - 75/25 Split to match sustainability cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Left Column - 75% width (3 of 4 columns) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Tips for Setting Up Remanufactured Laptops */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gradient-to-r from-teal-50 to-cyan-50 pb-3 pt-3">
                <CardTitle className="text-base font-semibold text-gray-900">Tips for Setting Up Remanufactured Laptops</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Quick tips if you're new to the world of remanufactured laptops
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="relative">
                  {/* Carousel Container */}
                  <div className="overflow-hidden rounded-lg">
                    {tipsLoading ? (
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center py-6">
                          <p className="text-gray-500">Loading tips...</p>
                        </div>
                      </div>
                    ) : tips.length === 0 ? (
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center py-6">
                          <p className="text-gray-500">No tips available at the moment.</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${currentTip * 100}%)` }}
                      >
                        {tips.map((tip) => {
                          const color = tip.categoryColor || "#08ABAB";
                          return (
                          <div key={tip.id} className="w-full flex-shrink-0">
                            <div 
                              className="bg-gradient-to-br p-4 rounded-lg border"
                              style={{ 
                                backgroundColor: `${color}0D`,
                                borderColor: `${color}33`
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                >
                                  <i className={`${tip.icon} text-lg`}></i>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-base text-neutral-900">{tip.title}</h4>
                                    <span 
                                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                                      style={{ 
                                        backgroundColor: `${color}33`,
                                        color: color
                                      }}
                                    >
                                      {tip.category}
                                    </span>
                                  </div>
                                  <p className="text-neutral-700 text-sm leading-relaxed">{tip.content}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation Controls */}
                  {!tipsLoading && tips.length > 0 && (
                  <div className="flex items-center justify-between mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevTip}
                      className="flex items-center space-x-1 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors h-7 text-xs"
                    >
                      <i className="ri-arrow-left-line"></i>
                      <span>Previous</span>
                    </Button>
                    
                    {/* Dots Indicator */}
                    <div className="flex space-x-1.5">
                      {tips.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTip(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentTip 
                              ? 'bg-[#08ABAB]' 
                              : 'bg-neutral-300 hover:bg-neutral-400'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextTip}
                      className="flex items-center space-x-1 bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors h-7 text-xs"
                    >
                      <span>Next</span>
                      <i className="ri-arrow-right-line"></i>
                    </Button>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>

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

            {/* Active RMA Items */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 pb-3 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Recent RMA Requests
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
                {activeRmas.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <RotateCcw className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No active RMA requests</p>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 25% width (1 of 4 columns, matches sustainability card width) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Charity Water Card */}
            <Card 
              className="shadow-md border-0 overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              onClick={() => setLocation('/water-projects')}
              data-testid="card-charity-water"
            >
              <div 
                className="relative h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${charityWaterBg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <p className="text-[#08ABAB] text-base font-bold mb-3">We are supporting</p>
                  <img src={charityWaterLogo} alt="charity: water" className="h-10 object-contain" />
                  <p className="text-white/90 text-sm mt-3 text-center">Click to see your water impact</p>
                </div>
              </div>
            </Card>

            {/* Case Studies Card */}
            <Card 
              className="shadow-md border-0 overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              onClick={() => setLocation('/case-studies')}
              data-testid="card-case-studies"
            >
              <div 
                className="relative h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${caseStudyBg})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Book className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Case Studies</h4>
                      <p className="text-white/80 text-sm">See how others are making an impact</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Podcast Card */}
            <Card 
              className="shadow-md border-0 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              onClick={() => {
                setLocation('/remanufactured');
                setTimeout(() => {
                  const podcastSection = document.getElementById('podcasts');
                  if (podcastSection) {
                    podcastSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              data-testid="card-podcast"
            >
              <div className="relative h-48">
                <img 
                  src={podcastVideo.thumbnailUrl} 
                  alt={podcastVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-4">
                  <div className="flex justify-center items-center flex-1">
                    <div className="h-14 w-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all">
                      <Play className="h-7 w-7 text-[#08ABAB] ml-1" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Sustainable IT Podcast</h4>
                    <p className="text-white/80 text-sm">Watch our latest conversations</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Social Sharing Section */}
            <Card className="shadow-md border-0 overflow-hidden">
              <CardHeader className="pb-3 pt-4 bg-gradient-to-r from-gray-50 to-slate-50">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#08ABAB] flex items-center justify-center">
                    <Share2 className="h-4 w-4 text-white" />
                  </div>
                  Share Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="w-full h-10 flex items-center rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    onClick={() => {
                      setLocation('/impact');
                      setTimeout(() => {
                        const shareSection = document.getElementById('share-section');
                        if (shareSection) {
                          shareSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    data-testid="button-share-facebook"
                  >
                    <div className="h-full w-10 bg-[#3b5998] flex items-center justify-center">
                      <i className="ri-facebook-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1 h-full bg-[#4267B2] flex items-center justify-center text-[14px] text-left">
                      <span className="text-white font-medium text-[13px] text-left">Facebook</span>
                    </div>
                  </button>
                  <button 
                    className="w-full h-10 flex items-center rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    onClick={() => {
                      setLocation('/impact');
                      setTimeout(() => {
                        const shareSection = document.getElementById('share-section');
                        if (shareSection) {
                          shareSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    data-testid="button-share-twitter"
                  >
                    <div className="h-full w-10 bg-[#1a8cd8] flex items-center justify-center">
                      <i className="ri-twitter-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1 h-full bg-[#1DA1F2] flex items-center justify-center text-[14px] text-left">
                      <span className="text-white font-medium text-[13px] text-left">Twitter</span>
                    </div>
                  </button>
                  <button 
                    className="w-full h-10 flex items-center rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    onClick={() => {
                      setLocation('/impact');
                      setTimeout(() => {
                        const shareSection = document.getElementById('share-section');
                        if (shareSection) {
                          shareSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    data-testid="button-share-linkedin"
                  >
                    <div className="h-full w-10 bg-[#005885] flex items-center justify-center">
                      <i className="ri-linkedin-fill text-white text-lg"></i>
                    </div>
                    <div className="flex-1 h-full bg-[#0077B5] flex items-center justify-center text-[14px] text-left">
                      <span className="text-white font-medium text-[13px] text-left">LinkedIn</span>
                    </div>
                  </button>
                  <button 
                    className="w-full h-10 flex items-center rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    onClick={() => {
                      setLocation('/impact');
                      setTimeout(() => {
                        const shareSection = document.getElementById('share-section');
                        if (shareSection) {
                          shareSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    data-testid="button-share-instagram"
                  >
                    <div className="h-full w-10 bg-gradient-to-br from-[#833AB4] via-[#C13584] to-[#E1306C] flex items-center justify-center">
                      <i className="ri-instagram-line text-white text-lg"></i>
                    </div>
                    <div className="flex-1 h-full bg-gradient-to-r from-[#E1306C] via-[#FD1D1D] to-[#F77737] flex items-center justify-center text-[14px] text-left">
                      <span className="text-white font-medium text-[13px] text-left">Instagram</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
