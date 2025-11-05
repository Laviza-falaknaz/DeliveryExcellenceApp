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
  Zap, Star, BarChart3, Brain, Gamepad2, AlertCircle
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

  const { data: rmas = [] } = useQuery<RMAWithItems[]>({
    queryKey: ["/api/rma"],
  });
  
  const { impact } = useImpact();
  
  const recentOrders = orders.slice(0, 3);
  const activeRmas = rmas.filter(r => !['completed', 'rejected'].includes(r.rma.status)).slice(0, 3);

  const tierNames = ['Bronze Partner', 'Silver Partner', 'Gold Partner', 'Platinum Partner', 'Diamond Partner'];
  const tierName = tierNames[Math.min(Math.floor((userProgress?.level || 1) / 2), 4)];
  
  const weeklyTarget = 50;
  const weeklyProgress = Math.min((((impact?.carbonSaved || 0) / 1000) % weeklyTarget) / weeklyTarget * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto p-4">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-0.5">Welcome back! Here's your sustainability impact overview</p>
        </div>

        {/* Tier Banner */}
        <Card className="mb-4 overflow-hidden shadow-lg border-0">
          <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-white" />
                  <span className="text-sm font-medium">Tier {userProgress?.level || 1}</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">{tierName}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-base">{userProgress?.totalPoints || 0} Credits</span>
                </div>
                <p className="text-sm text-white/90 mb-2">Welcome to your sustainability dashboard overview.</p>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span>Progress to Gold Partner</span>
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
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-xs text-white/80">Plants Equiv.</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Sustainability Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Sustainability Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4">
                    <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                      <Leaf className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">
                      {((impact?.carbonSaved || 0) / 1000).toFixed(0)} kg
                    </div>
                    <div className="text-sm text-gray-600 mb-1">CO₂ Prevented</div>
                    <div className="text-xs text-green-700 font-medium">
                      +{Math.floor(((impact?.carbonSaved || 0) / 1000) * 0.1)}% this month
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="p-4">
                    <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                      <Droplet className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">
                      {(impact?.waterProvided || 0).toFixed(0)} L
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Water Saved</div>
                    <div className="text-xs text-blue-700 font-medium">
                      +{Math.floor((impact?.waterProvided || 0) * 0.08)}% this month
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
                  <CardContent className="p-4">
                    <div className="bg-amber-100 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                      <Recycle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-0.5">
                      {((impact?.mineralsSaved || 0) / 1000).toFixed(0)} kg
                    </div>
                    <div className="text-sm text-gray-600 mb-1">Materials Saved</div>
                    <div className="text-xs text-amber-700 font-medium">
                      +{Math.floor(((impact?.mineralsSaved || 0) / 1000) * 0.12)}% this month
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interactive Challenges Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-600" />
                Interactive Challenges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Sustainability Quiz */}
                <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Brain className="h-6 w-6 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Sustainability Quiz</h4>
                        <p className="text-sm text-gray-600">Test your eco-knowledge!</p>
                      </div>
                      <Badge className="bg-purple-600 text-white hover:bg-purple-600">
                        <Zap className="h-3 w-3 mr-1" />
                        100 XP
                      </Badge>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">8 Questions • 5 min</div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-gray-700">Unlock achievements & learn sustainability facts</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                      onClick={() => setLocation('/sustainability-quiz')}
                      data-testid="button-start-quiz"
                    >
                      Start Quiz
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Waste Sorting Game */}
                <Card className="shadow-md border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <Recycle className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Waste Sort Challenge</h4>
                        <p className="text-sm text-gray-600">Sort items correctly!</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        <Zap className="h-3 w-3 mr-1" />
                        120 XP
                      </Badge>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">12 Items • 7 min</div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs text-gray-700">Master e-waste recycling & earn rewards</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      onClick={() => setLocation('/waste-sorting-game')}
                      data-testid="button-start-game"
                    >
                      Play Now
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
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
                      <Link key={rma.id} href={`/rma/${rma.id}`}>
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
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs">
                                  {rma.status}
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
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <div 
                          className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          data-testid={`order-${order.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">
                                  {order.orderNumber}
                                </span>
                                <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600">
                                {new Date(order.orderDate).toLocaleDateString()} • {order.currency} {order.totalAmount}
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

            {/* Achievements */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gray-50 pb-3 pt-3">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {userAchievements.slice(0, 4).map((ua) => (
                    <div 
                      key={ua.id} 
                      className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 transition-all cursor-pointer border border-amber-200"
                      data-testid={`achievement-${ua.achievement.id}`}
                    >
                      <div className="text-3xl mb-1">{ua.achievement.icon}</div>
                      <div className="text-xs font-medium text-gray-900 mb-0.5">
                        {ua.achievement.name}
                      </div>
                      <div className="text-xs text-amber-700 font-medium">+{ua.achievement.pointsAwarded}</div>
                    </div>
                  ))}
                  {userAchievements.length === 0 && (
                    <>
                      <div className="text-center p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-3xl mb-1 opacity-30">🏆</div>
                        <div className="text-xs text-gray-500">First Purchase</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-3xl mb-1 opacity-30">🌍</div>
                        <div className="text-xs text-gray-500">Impact Hero</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-3xl mb-1 opacity-30">⭐</div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300">
                        <div className="text-3xl mb-1 opacity-30">🔥</div>
                        <div className="text-xs text-gray-500">Streak</div>
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-gray-300 hover:bg-gray-50 text-sm"
                  onClick={() => setLocation('/achievements')}
                  data-testid="button-view-achievements"
                >
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-4">
            
            {/* Weekly Sustainability Target */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-amber-200 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-amber-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">Weekly Target</h3>
                    <Badge className="bg-amber-600 text-white hover:bg-amber-600 mt-0.5 text-xs">
                      In Progress
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  Save {weeklyTarget} kg CO₂ this week
                </p>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {(((impact?.carbonSaved || 0) / 1000) % weeklyTarget).toFixed(1)} kg / {weeklyTarget} kg
                    </span>
                    <span className="text-xs font-bold text-amber-800">{weeklyProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2 bg-white/50" />
                </div>

                <div className="bg-white/70 rounded-lg p-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-700 flex-shrink-0" />
                  <span className="text-xs text-amber-900 font-medium">
                    Award + Partnership Credit
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gray-50 pb-2 pt-2">
                <CardTitle className="text-base font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm h-9"
                  onClick={() => setLocation('/orders')}
                  data-testid="button-track-order"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Track Order
                </Button>
                
                <Button 
                  className="w-full justify-start bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm h-9"
                  onClick={() => setLocation('/impact')}
                  data-testid="button-view-impact"
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  View Impact
                </Button>

                <div className="pt-2 border-t">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">More Actions</h4>
                  
                  <button 
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs flex items-center gap-2 transition-colors"
                    onClick={() => setLocation('/support')}
                    data-testid="link-support-center"
                  >
                    <ShieldCheck className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Support Center</span>
                  </button>

                  <button 
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs flex items-center gap-2 transition-colors"
                    onClick={() => setLocation('/warranty')}
                    data-testid="link-documents"
                  >
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">Documents</span>
                  </button>

                  <button 
                    className="w-full text-left px-2 py-1.5 rounded-md hover:bg-gray-100 text-xs flex items-center gap-2 transition-colors"
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
            <Card className="shadow-md border-0">
              <CardHeader className="border-b bg-gray-50 pb-2 pt-2">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Actions This Week</span>
                    <span className="text-xl font-bold text-teal-600">3/5</span>
                  </div>
                  <Progress value={60} className="h-2 bg-gray-200" />
                  <p className="text-xs text-gray-500 mt-1">2 days left</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">Track an order</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">View impact report</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                    </div>
                    <span className="text-gray-700">Check metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-50">
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    </div>
                    <span className="text-gray-500">Submit feedback</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs opacity-50">
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    </div>
                    <span className="text-gray-500">Share impact</span>
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
