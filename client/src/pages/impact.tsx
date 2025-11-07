import { useImpact } from "@/hooks/use-impact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatEnvironmentalImpact } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, TrendingUp, Sparkles } from "lucide-react";
import { ProgressRing } from "@/components/gamification/progress-ring";
import { Confetti } from "@/components/gamification/confetti";
import carbonIcon from "@assets/Carbon Icon CC_1757609284710.png";
import waterIcon from "@assets/CC_Icons_Weight increased-152_1759311452405.png";
import waterDropletsIcon from "@assets/Minerals Saved Icon CC _1759311586728.png";
import resourceIcon from "@assets/Resource Pres Icon CC_1757609329084.png";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { Link } from "wouter";
import { Copy, Share2 } from "lucide-react";

const COLORS = ["#08ABAB", "#4caf50", "#03a9f4", "#ffa726", "#f44336"];

export default function Impact() {
  const { impact, isLoadingImpact } = useImpact();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });
  
  const { data: achievements = [] } = useQuery<any[]>({
    queryKey: ["/api/gamification/achievements"],
  });
  
  // Filter for impact level achievements
  const impactAchievements = achievements.filter((a: any) => 
    ['bronze_impact', 'silver_impact', 'gold_impact', 'water_provider'].includes(a.code)
  ).sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  // Fetch real data from API
  const { data: rawMonthlyData = [], isLoading: isLoadingTrends } = useQuery<any[]>({
    queryKey: ["/api/impact/trends"],
  });

  // Normalize data for better visualization (scales all metrics to 0-100 range)
  const monthlyData = rawMonthlyData.map((item: any) => {
    const maxCarbon = Math.max(...rawMonthlyData.map((d: any) => d.carbon));
    const maxWater = Math.max(...rawMonthlyData.map((d: any) => d.water));
    const maxMinerals = Math.max(...rawMonthlyData.map((d: any) => d.minerals));

    return {
      name: item.name,
      // Store actual values for tooltip
      carbonActual: item.carbon,
      waterActual: item.water,
      mineralsActual: item.minerals,
      // Normalized values for chart display (0-100 scale)
      carbon: maxCarbon > 0 ? (item.carbon / maxCarbon) * 100 : 0,
      water: maxWater > 0 ? (item.water / maxWater) * 100 : 0,
      minerals: maxMinerals > 0 ? (item.minerals / maxMinerals) * 100 : 0,
    };
  });

  const { data: impactEquivalents = [], isLoading: isLoadingEquivalents } = useQuery<any[]>({
    queryKey: ["/api/impact/equivalents"],
  });

  const { data: impactByOrder = [], isLoading: isLoadingByOrder } = useQuery<any[]>({
    queryKey: ["/api/impact/by-order"],
  });

  // Create personalized social media content
  const generateSocialContent = (platform: string) => {
    const data = impact || {
      carbonSaved: 316,
      waterProvided: 2500,
      mineralsSaved: 580,
      treesEquivalent: 12,
      familiesHelped: 8
    };

    const baseContent = {
      linkedin: `🌱 Proud to share our sustainability journey with @CircularComputing! 
      
Our commitment to remanufactured IT has achieved:
✅ ${data.carbonSaved}kg CO₂ saved from the atmosphere
💧 ${data.waterProvided}L clean water provided to communities in need
🌍 ${data.mineralsSaved}g precious minerals conserved
🌳 Equivalent to planting ${data.treesEquivalent} trees
👥 Supporting ${data.familiesHelped} families with clean water access

By choosing remanufactured technology, we've diverted valuable IT equipment from unnecessary landfill waste while delivering the same performance as new devices.

#SustainableIT #CircularEconomy #ClimateAction #ESG #TechForGood #CircularComputing`,

      x: `🌱 Making a real impact with @CircularComputing remanufactured IT!

📊 Our sustainability wins:
• ${data.carbonSaved}kg CO₂ saved ✅
• ${data.waterProvided}L clean water provided 💧  
• ${data.mineralsSaved}g minerals conserved 🌍
• ${data.treesEquivalent} trees equivalent planted 🌳

Keeping tech out of landfill while supporting communities! #SustainableIT #CircularEconomy`,

      instagram: `🌱✨ Sustainability wins with Circular Computing! 

Our remanufactured IT journey has achieved:
🌍 ${data.carbonSaved}kg CO₂ saved
💧 ${data.waterProvided}L clean water for communities  
⚡ ${data.mineralsSaved}g precious minerals conserved
🌳 Like planting ${data.treesEquivalent} trees!

Choosing remanufactured means high performance + low environmental impact. We're keeping valuable technology out of landfill while supporting families with clean water access through @charitywater partnerships.

#SustainableIT #CircularEconomy #TechForGood #ClimateAction #ESG #Sustainability #RemanufacturedTech`,

      facebook: `🌱 Excited to share our sustainability achievements with Circular Computing!

Our organization has made a real environmental impact by choosing remanufactured IT equipment:

🌍 Environmental Impact:
• ${data.carbonSaved}kg of CO₂ saved from the atmosphere
• ${data.mineralsSaved}g of precious minerals conserved  
• Equivalent to planting ${data.treesEquivalent} trees
• Diverted technology from unnecessary landfill waste

💧 Community Impact:
• ${data.waterProvided}L of clean water provided to communities in need
• Supporting ${data.familiesHelped} families with sustainable water access

By choosing remanufactured laptops, we get the same performance as new devices while making a positive difference for both our planet and communities worldwide. 

Learn more about sustainable IT solutions: circularcomputing.com

#SustainableIT #CircularEconomy #ClimateAction #ESG #TechForGood`
    };

    return baseContent[platform as keyof typeof baseContent];
  };

  const shareContent = (platform: string, content: string) => {
    const encodedContent = encodeURIComponent(content);
    const url = encodeURIComponent('https://circularcomputing.com');
    
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${encodedContent}`,
      x: `https://twitter.com/intent/tweet?text=${encodedContent}&url=${url}`,
      instagram: content, // Instagram doesn't have direct URL sharing - return content for copying
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedContent}`
    };

    if (platform === 'instagram') {
      // Copy to clipboard for Instagram
      navigator.clipboard.writeText(content);
      toast({
        title: "Content Copied!",
        description: "Instagram post content copied to clipboard. Open Instagram to share!"
      });
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard!",
      description: "Social media content copied successfully."
    });
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">
            Your Impact
          </h1>
          <p className="text-neutral-600">
            Track the positive impact of your remanufactured laptop purchases
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          {user?.isAdmin && (
            <Button 
              variant="outline"
            >
              <i className="ri-download-line mr-2"></i>
              <span>Download Report</span>
            </Button>
          )}
          <Button 
            variant="outline"
            asChild
          >
            <Link href="/water-projects">View Water Projects</Link>
          </Button>
        </div>
      </div>

      {showConfetti && <Confetti active={showConfetti} />}
      
      {/* Milestone Progress Overview */}
      {impactAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-[#08ABAB]/20 bg-gradient-to-br from-[#08ABAB]/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#08ABAB]" />
                Impact Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {impactAchievements.map((achievement: any) => {
                  // Calculate progress based on achievement type
                  let currentValue = 0;
                  let targetValue = parseFloat(achievement.thresholdValue);
                  
                  if (achievement.thresholdType === 'carbon_saved') {
                    currentValue = impact?.carbonSaved || 0;
                  } else if (achievement.thresholdType === 'families_helped') {
                    currentValue = (impact?.familiesHelped || 0) * 1; // Already in correct unit
                    // For families, convert to grams for display consistency with threshold
                    targetValue = parseFloat(achievement.thresholdValue);
                  }
                  
                  const progress = impact ? 
                    Math.min(100, (currentValue / targetValue) * 100) : 0;
                  const isCompleted = progress >= 100;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (isCompleted) {
                          setShowConfetti(true);
                          setTimeout(() => setShowConfetti(false), 3000);
                        }
                      }}
                    >
                      <ProgressRing
                        progress={progress}
                        size={100}
                        strokeWidth={8}
                        color={isCompleted ? "#08ABAB" : "#d1d5db"}
                      />
                      <div className="mt-3 flex items-center justify-center">
                        <i className={`${achievement.icon} text-2xl text-[#08ABAB]`}></i>
                      </div>
                      <h4 className="text-sm font-medium mt-2 text-center">{achievement.name}</h4>
                      <p className="text-xs text-neutral-500 text-center mt-1">
                        {achievement.thresholdType === 'carbon_saved' 
                          ? formatEnvironmentalImpact(targetValue, "g")
                          : `${targetValue} families`}
                      </p>
                      {isCompleted && (
                        <div className="flex items-center gap-1 mt-2 text-[#08ABAB]">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-xs font-medium">Achieved!</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Impact Summary Cards */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {isLoadingImpact ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : impact ? (
          <>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
              <Card className="border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">
                        Total Carbon Saved
                      </h3>
                      <p className="text-3xl font-bold mt-1">
                        {formatEnvironmentalImpact(impact.carbonSaved, "g")}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <img src={carbonIcon} alt="Carbon Icon" className="w-7 h-7" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progress to 1 tonne</span>
                      <span>
                        {Math.round((impact.carbonSaved / 1000000) * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={(impact.carbonSaved / 1000000) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="mt-4 text-sm flex items-center text-[#08ABAB]">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>
                      Equivalent to planting {impact.treesEquivalent} trees
                    </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
              <Card className="border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500">
                        Clean Water Provided
                      </h3>
                    <p className="text-3xl font-bold mt-1">
                      {impact.familiesHelped}
                    </p>
                    <p className="text-xs text-neutral-400">families helped</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <img src={waterIcon} alt="Water Icon" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Water volume</span>
                    <span>{formatEnvironmentalImpact(impact.waterProvided, "litres")}</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (impact.waterProvided / 10000) * 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="mt-4 text-sm flex items-center text-[#08ABAB]">
                  <i className="ri-group-line mr-1"></i>
                  <span>1 week supply per family</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
              <Card className="border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-neutral-500">
                        Resource Preservation
                      </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.mineralsSaved, "g")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <img src={resourceIcon} alt="Resource Icon" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress to 10 kg</span>
                    <span>{Math.min(100, Math.round((impact.mineralsSaved / 10000) * 100))}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (impact.mineralsSaved / 10000) * 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="mt-4 text-sm flex items-center text-[#08ABAB]">
                  <i className="ri-earth-line mr-1"></i>
                  <span>Mining impact reduced</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }} className="h-full">
              <Card className="border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all h-full">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-neutral-500">
                        Water Saved
                      </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.waterSaved || 0, "litres")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <img src={waterDropletsIcon} alt="Water Icon" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress to 1M litres</span>
                    <span>{Math.min(100, Math.round(((impact.waterSaved || 0) / 1000000) * 100))}%</span>
                  </div>
                  <Progress 
                    value={Math.min(100, ((impact.waterSaved || 0) / 1000000) * 100)} 
                    className="h-2" 
                  />
                </div>
                <div className="mt-4 text-sm flex items-center text-[#08ABAB]">
                  <i className="ri-recycle-line mr-1"></i>
                  <span>Water conservation via reuse</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </>
        ) : (
          <div className="md:col-span-4 p-8 text-center bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-neutral-700">
              No impact data available yet
            </h3>
            <p className="text-neutral-500 mt-2">
              Your environmental impact will appear once you make your first
              order.
            </p>
          </div>
        )}
      </section>

      {/* Impact Trends Charts */}
      <section className="mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-[#08ABAB]" />
            <h2 className="text-2xl font-bold">Your Environmental Impact Journey</h2>
          </div>
          <p className="text-sm text-neutral-500">
            Cumulative impact growth over the last 6 months
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carbon Saved Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <img src={carbonIcon} alt="Carbon" className="w-5 h-5" />
                  </div>
                  Carbon Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTrends ? (
                  <Skeleton className="h-64 w-full" />
                ) : rawMonthlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rawMonthlyData}>
                        <defs>
                          <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #4caf50',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, 'Carbon Saved']}
                        />
                        <Area
                          type="monotone"
                          dataKey="carbon"
                          stroke="#4caf50"
                          fillOpacity={1}
                          fill="url(#colorCarbon)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-neutral-400">
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Provided Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <img src={waterIcon} alt="Water" className="w-5 h-5" />
                  </div>
                  Water Provided
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTrends ? (
                  <Skeleton className="h-64 w-full" />
                ) : rawMonthlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rawMonthlyData}>
                        <defs>
                          <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#03a9f4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#03a9f4" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #03a9f4',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: any) => [`${Number(value).toLocaleString()} L`, 'Water Provided']}
                        />
                        <Area
                          type="monotone"
                          dataKey="water"
                          stroke="#03a9f4"
                          fillOpacity={1}
                          fill="url(#colorWater)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-neutral-400">
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resources Preserved Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <img src={resourceIcon} alt="Resources" className="w-5 h-5" />
                  </div>
                  Resources Preserved
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTrends ? (
                  <Skeleton className="h-64 w-full" />
                ) : rawMonthlyData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rawMonthlyData}>
                        <defs>
                          <linearGradient id="colorMinerals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffa726" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ffa726" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ffa726',
                            borderRadius: '8px',
                            fontSize: 12
                          }}
                          formatter={(value: any) => [`${(Number(value) / 1000).toLocaleString()} kg`, 'Resources Preserved']}
                        />
                        <Area
                          type="monotone"
                          dataKey="minerals"
                          stroke="#ffa726"
                          fillOpacity={1}
                          fill="url(#colorMinerals)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-neutral-400">
                    <p className="text-sm">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Impact Visualizations */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-[#08ABAB]/20 h-full">
            <CardHeader>
              <CardTitle>Your Impact in Relatable Terms</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                See your carbon savings in everyday comparisons
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingEquivalents ? (
                <Skeleton className="h-80 w-full" />
              ) : impactEquivalents.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {impactEquivalents.map((equivalent, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                      style={{ 
                        borderColor: equivalent.color,
                        backgroundColor: `${equivalent.color}10`
                      }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <i 
                          className={`${equivalent.icon} text-3xl mb-2`}
                          style={{ color: equivalent.color }}
                        ></i>
                        <p className="text-2xl font-bold" style={{ color: equivalent.color }}>
                          {equivalent.value}
                        </p>
                        <p className="text-xs font-medium text-neutral-700 mt-1">
                          {equivalent.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {equivalent.description.replace(`${equivalent.value} `, '')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-neutral-500">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Make your first order to see impact equivalents!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-[#08ABAB]/20 h-full">
            <CardHeader>
              <CardTitle>Impact by Order</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                See which orders made the biggest environmental difference
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingByOrder ? (
                <Skeleton className="h-80 w-full" />
              ) : impactByOrder.length > 0 ? (
                <div className="space-y-3">
                  {impactByOrder.slice(0, 4).map((order, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-3 rounded-lg bg-gradient-to-r from-[#08ABAB]/5 to-transparent border border-[#08ABAB]/20 hover:border-[#08ABAB]/40 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">Order {order.orderNumber}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#08ABAB]">#{index + 1}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="font-semibold text-green-700">{order.carbonSaved.toFixed(1)} kg</p>
                          <p className="text-green-600">Carbon</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="font-semibold text-blue-700">{order.waterProvided}L</p>
                          <p className="text-blue-600">Water</p>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="font-semibold text-orange-700">{order.mineralsSaved.toFixed(1)} kg</p>
                          <p className="text-orange-600">Minerals</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-neutral-500">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Make your first order to see impact by order!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Sustainability Story */}
      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 md:pr-6">
                <h3 className="text-xl font-semibold mb-4">
                  The Importance of Laptop Remanufacturing
                </h3>
                <p className="text-neutral-700 mb-4">
                  When you choose a remanufactured laptop from Circular
                  Computing, you're making a significant positive impact on the
                  environment. Each remanufactured laptop saves:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2 text-neutral-700">
                  <li>
                    <span className="font-medium">Carbon emissions:</span> Up to
                    316 kg of CO₂ compared to manufacturing a new device
                  </li>
                  <li>
                    <span className="font-medium">Raw materials:</span> Conserves
                    precious metals and minerals including gold, silver, copper,
                    and rare earth elements
                  </li>
                  <li>
                    <span className="font-medium">Water:</span> Approximately
                    190,000 litres of water used in new laptop production
                  </li>
                  <li>
                    <span className="font-medium">E-waste:</span> Prevents
                    electronic waste from ending up in landfills
                  </li>
                </ul>
                <p className="text-neutral-700">
                  Through our partnership with charity: water, each laptop also
                  helps provide clean water to communities in need, multiplying
                  your positive impact.
                </p>
              </div>
              <div className="md:w-1/3 mt-4 md:mt-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 1,
                    ease: "easeOut"
                  }}
                  className="relative w-72 h-72"
                >
                  <img
                    src="/attached_assets/placing_it_into_the_circular_economy_header-1.png"
                    alt="Circular Computing circular economy diagram showing Deploy, Use, Remanufacture, and Computers lifecycle"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Share My Success Section */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-teal-600" />
              Share My Success
            </CardTitle>
            <p className="text-neutral-600">
              Showcase your sustainability achievements and inspire others to make environmentally conscious IT choices.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* LinkedIn */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#0077B5] rounded flex items-center justify-center">
                  <i className="ri-linkedin-fill text-white text-lg"></i>
                </div>
                <h4 className="font-semibold">LinkedIn</h4>
              </div>
              <div className="bg-neutral-50 rounded p-3 mb-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {generateSocialContent('linkedin')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => shareContent('linkedin', generateSocialContent('linkedin'))}
                  className="bg-[#0077B5] hover:bg-[#005885] text-white"
                >
                  Share on LinkedIn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateSocialContent('linkedin'))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* X (Twitter) */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <i className="ri-twitter-x-line text-white text-lg"></i>
                </div>
                <h4 className="font-semibold">X (Twitter)</h4>
              </div>
              <div className="bg-neutral-50 rounded p-3 mb-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {generateSocialContent('x')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => shareContent('x', generateSocialContent('x'))}
                  className="bg-black hover:bg-neutral-800 text-white"
                >
                  Share on X
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateSocialContent('x'))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Instagram */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded flex items-center justify-center">
                  <i className="ri-instagram-line text-white text-lg"></i>
                </div>
                <h4 className="font-semibold">Instagram</h4>
              </div>
              <div className="bg-neutral-50 rounded p-3 mb-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {generateSocialContent('instagram')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => shareContent('instagram', generateSocialContent('instagram'))}
                  className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                >
                  Copy for Instagram
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateSocialContent('instagram'))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Facebook */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-[#1877F2] rounded flex items-center justify-center">
                  <i className="ri-facebook-fill text-white text-lg"></i>
                </div>
                <h4 className="font-semibold">Facebook</h4>
              </div>
              <div className="bg-neutral-50 rounded p-3 mb-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {generateSocialContent('facebook')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => shareContent('facebook', generateSocialContent('facebook'))}
                  className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
                >
                  Share on Facebook
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generateSocialContent('facebook'))}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <img src="/attached_assets/CC_Logo_Teal.png" alt="Circular Computing" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-teal-900 mb-1">Circular Computing Branding</h4>
                  <p className="text-sm text-teal-800">
                    All social content includes Circular Computing branding and mentions to help spread awareness about sustainable IT solutions. 
                    Feel free to customize the content while keeping our partnership attribution.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section>
        <div className="bg-primary/5 rounded-xl shadow-sm overflow-hidden border border-primary/20 p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Share Your Sustainability Journey
              </h3>
              <p className="text-neutral-700 mb-4">
                Your organization's commitment to sustainable IT is making a real
                difference. Become part of our case study programme to inspire
                other organizations and showcase your environmental leadership.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline"
                  asChild
                >
                  <Link href="/case-studies?share=true">Join Case Study Programme</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/case-studies">Explore Case Studies</Link>
                </Button>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
              <img
                src="/attached_assets/CC.png"
                alt="Circular Computing remanufactured laptop"
                className="rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
