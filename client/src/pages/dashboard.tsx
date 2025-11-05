import { useQuery } from "@tanstack/react-query";
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
  Zap, Star, BarChart3
} from "lucide-react";

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
  
  const { impact } = useImpact();
  
  const recentOrders = orders.slice(0, 3);

  const tierNames = ['Bronze Partner', 'Silver Partner', 'Gold Partner', 'Platinum Partner', 'Diamond Partner'];
  const tierName = tierNames[Math.min(Math.floor((userProgress?.level || 1) / 2), 4)];
  
  // Weekly target calculation
  const weeklyTarget = 50; // kg CO2
  const weeklyProgress = Math.min(((impact?.carbonSaved || 0) % weeklyTarget) / weeklyTarget * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your sustainability impact overview</p>
        </div>

        {/* Tier Banner */}
        <Card className="mb-6 overflow-hidden shadow-sm border border-gray-200">
          <div className="bg-teal-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-medium">Tier {userProgress?.level || 1}</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{tierName}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4" />
                  <span className="text-base">{userProgress?.totalPoints || 0} Credits</span>
                </div>
                <p className="text-sm text-white/90 mb-3">Welcome to your sustainability dashboard overview.</p>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>Progress to Gold Partner</span>
                  <span className="font-medium">{((userProgress?.totalPoints || 0) % 1000) / 10}%</span>
                </div>
                <div className="w-64">
                  <Progress value={((userProgress?.totalPoints || 0) % 1000) / 10} className="h-1.5 bg-white/20" />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="text-center px-4">
                  <div className="text-sm text-white/80 mb-1">Engagement</div>
                  <div className="text-3xl font-bold mb-1">{userProgress?.currentStreak || 0}</div>
                  <div className="text-xs text-white/80">Days Active</div>
                  <Badge className="mt-2 bg-white/20 text-white hover:bg-white/30 border-0">
                    Excellent
                  </Badge>
                </div>

                <div className="text-center px-4">
                  <div className="text-sm text-white/80 mb-1">Environmental Equivalent</div>
                  <div className="text-3xl font-bold mb-1">{(impact?.carbonSaved || 0).toFixed(0)}</div>
                  <div className="text-xs text-white/80">Tons CO₂ Saved</div>
                </div>

                <div className="text-center px-4">
                  <div className="text-sm text-white/80 mb-1">&nbsp;</div>
                  <div className="text-3xl font-bold mb-1">8</div>
                  <div className="text-xs text-white/80">Plants Grown Equiv.</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Weekly Sustainability Target */}
            <Card className="shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Weekly Sustainability Target</h3>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 mt-1">
                      In Progress
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Contribute to saving {weeklyTarget}kg of CO₂ through sustainable procurement
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {((impact?.carbonSaved || 0) % weeklyTarget).toFixed(1)}kg / {weeklyTarget}kg
                    </span>
                    <span className="text-sm font-bold text-gray-900">{weeklyProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-3 bg-gray-200" />
                </div>

                <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">
                      Reward: Recognition Award & Partnership Credit
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setLocation('/impact')}
                    data-testid="button-view-progress"
                  >
                    View Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sustainability Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sustainability Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Leaf className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(impact?.carbonSaved || 0).toFixed(0)} kg
                    </div>
                    <div className="text-sm text-gray-600 mb-2">CO₂ Emissions Prevented</div>
                    <div className="text-xs text-green-600">
                      +{Math.floor((impact?.carbonSaved || 0) * 0.1)}% this month
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Droplet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(impact?.waterProvided || 0).toFixed(0)} L
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Water Resources Saved</div>
                    <div className="text-xs text-blue-600">
                      +{Math.floor((impact?.waterProvided || 0) * 0.08)}% this month
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="bg-yellow-50 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Recycle className="h-6 w-6 text-yellow-700" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {(impact?.mineralsSaved || 0).toFixed(0)} kg
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Raw Materials Preserved</div>
                    <div className="text-xs text-yellow-700">
                      +{Math.floor((impact?.mineralsSaved || 0) * 0.12)}% this month
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Orders */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5" />
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
                  <div className="p-8 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No orders found</p>
                    <Button 
                      variant="link" 
                      className="text-teal-600 mt-2"
                      onClick={() => setLocation('/orders')}
                      data-testid="link-browse-inventory"
                    >
                      Browse Inventory
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentOrders.map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div 
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          data-testid={`order-${order.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-gray-900">
                                  {order.orderNumber}
                                </span>
                                <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(order.orderDate).toLocaleDateString()} • {order.currency} {order.totalAmount}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {userAchievements.slice(0, 4).map((ua) => (
                    <div 
                      key={ua.id} 
                      className="text-center p-4 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200"
                      data-testid={`achievement-${ua.achievement.id}`}
                    >
                      <div className="text-4xl mb-2">{ua.achievement.icon}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {ua.achievement.name}
                      </div>
                      <div className="text-xs text-gray-500">{ua.achievement.pointsAwarded} points</div>
                    </div>
                  ))}
                  {userAchievements.length === 0 && (
                    <>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-4xl mb-2 opacity-30">🏆</div>
                        <div className="text-xs text-gray-500">First Purchase</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-4xl mb-2 opacity-30">🌍</div>
                        <div className="text-xs text-gray-500">Environmental Impact</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-4xl mb-2 opacity-30">⭐</div>
                        <div className="text-xs text-gray-500">Engagement Excellence</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-4xl mb-2 opacity-30">🔥</div>
                        <div className="text-xs text-gray-500">Water Champion</div>
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-gray-300 hover:bg-gray-50"
                  onClick={() => setLocation('/achievements')}
                  data-testid="button-view-achievements"
                >
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button 
                  className="w-full justify-start bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => setLocation('/orders')}
                  data-testid="button-track-order"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
                
                <Button 
                  className="w-full justify-start bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => setLocation('/impact')}
                  data-testid="button-view-impact"
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  View Impact
                </Button>

                <div className="pt-2 border-t mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">More Actions</h4>
                  
                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                    onClick={() => setLocation('/support')}
                    data-testid="link-support-center"
                  >
                    <ShieldCheck className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Support Center</span>
                  </button>

                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                    onClick={() => setLocation('/warranty')}
                    data-testid="link-documents"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Documents</span>
                  </button>

                  <button 
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 transition-colors"
                    onClick={() => setLocation('/support')}
                    data-testid="link-messages"
                  >
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Messages</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Actions This Week</span>
                    <span className="text-2xl font-bold text-teal-600">3/5</span>
                  </div>
                  <Progress value={60} className="h-2 bg-gray-200" />
                  <p className="text-xs text-gray-500 mt-2">2 days left</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">Track an order</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">View impact report</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">Check sustainability metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                    <span className="text-gray-500">Submit feedback</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-50">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                    <span className="text-gray-500">Share impact on social</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
