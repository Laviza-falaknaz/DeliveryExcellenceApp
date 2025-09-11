import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Share, 
  Download, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Mail,
  Copy,
  CheckCircle,
  BarChart4,
  Leaf,
  Users,
  Droplets
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatEnvironmentalImpact } from "@/lib/utils";
import carbonIcon from "@assets/Carbon Icon CC_1757609663969.png";

export default function ESGReport() {
  const { toast } = useToast();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeShareOption, setActiveShareOption] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch user impact data
  const { data: impact, isLoading: isImpactLoading } = useQuery({
    queryKey: ["/api/impact"],
  });

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  // Get the current date for the report generation timestamp
  const reportDate = new Date();
  
  // Generate time periods for historical view
  const currentYear = reportDate.getFullYear();
  const currentMonth = reportDate.getMonth();
  const periods = [
    { label: "Current Quarter", startDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1) },
    { label: "Year to Date", startDate: new Date(currentYear, 0, 1) },
    { label: "Last 12 Months", startDate: new Date(currentYear, currentMonth - 11, 1) },
    { label: "All Time", startDate: new Date(currentYear - 5, 0, 1) }
  ];

  // Handle share link copy
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/impact?company=${encodeURIComponent(user?.company || '')}&id=${user?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setActiveShareOption("copy");
    toast({
      title: "Link Copied!",
      description: "Share link has been copied to your clipboard",
    });
    
    // Reset the active state after 2 seconds
    setTimeout(() => {
      setActiveShareOption(null);
    }, 2000);
  };

  // Handle social media sharing
  const handleShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/share/impact?company=${encodeURIComponent(user?.company || '')}&id=${user?.id}`;
    const shareTitle = `${user?.company}'s Environmental Impact with Circular Computing`;
    const shareText = `Check out how ${user?.company} is making a positive impact on the environment through sustainable IT practices with Circular Computing.`;
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
    }
    
    setActiveShareOption(platform);
    
    // Open the share link in a new window
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
    
    // Reset the active state after 2 seconds
    setTimeout(() => {
      setActiveShareOption(null);
    }, 2000);
  };

  // Mock data for ESG trends and goals
  const esgGoals = [
    { 
      category: "Environmental", 
      goals: [
        { id: 1, title: "Total Carbon Saved", target: "30% by 2025", progress: 65, description: "Reducing carbon emissions through sustainable technology choices" },
        { id: 2, title: "E-waste Diversion", target: "10,000 kg by 2025", progress: 48, description: "Diverting e-waste from landfills through circular economy practices" },
        { id: 3, title: "Water Conservation", target: "Provide clean water to 500 people", progress: 72, description: "Supporting charity: water projects through sustainable IT purchases" }
      ]
    },
    { 
      category: "Social", 
      goals: [
        { id: 4, title: "Digital Inclusion", target: "Bridge digital divide for 200 students", progress: 55, description: "Providing refurbished technology to underserved communities" },
        { id: 5, title: "Supply Chain Ethics", target: "100% ethical supply chain verification", progress: 80, description: "Ensuring fair labor practices throughout our technology supply chain" }
      ]
    },
    { 
      category: "Governance", 
      goals: [
        { id: 6, title: "Sustainability Reporting", target: "Quarterly ESG reports", progress: 100, description: "Regular transparent reporting on environmental and social impact" },
        { id: 7, title: "Responsible Procurement", target: "75% sustainable vendors", progress: 60, description: "Prioritizing vendors with strong sustainability credentials" }
      ]
    }
  ];
  
  // Shareable impact cards based on user's impact data
  const getShareableCards = () => {
    if (!impact || isImpactLoading) return [];
    
    return [
      {
        id: "carbon",
        title: "Total Carbon Saved",
        value: impact.totalImpact?.carbonSaved || 0,
        unit: "kg CO₂e",
        icon: <img src={carbonIcon} alt="Carbon Icon" className="w-6 h-6" />,
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        id: "water",
        title: "Clean Water Impact",
        value: impact.totalImpact?.familiesHelped || 0,
        unit: "people helped",
        icon: <Droplets className="h-6 w-6" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        id: "minerals",
        title: "Raw Materials Saved",
        value: impact.totalImpact?.mineralsSaved || 0,
        unit: "kg",
        icon: <BarChart4 className="h-6 w-6" />,
        color: "text-amber-600",
        bgColor: "bg-amber-100"
      }
    ];
  };

  const shareableCards = getShareableCards();

  // If still loading data
  if (isImpactLoading || isUserLoading) {
    return (
      <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-6">
          <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
          <div className="h-5 w-96 bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-neutral-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-neutral-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">Sustainability ESG Report</h1>
          <p className="text-neutral-600">
            Track your organization's environmental and social governance metrics
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </Button>
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-white border-neutral-300 text-neutral-900 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors">
                <Share className="h-4 w-4" />
                <span>Share Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Impact</DialogTitle>
                <DialogDescription>
                  Showcase your organization's sustainability achievements with your team and network
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="text-sm font-medium mb-3">Choose what to share:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {shareableCards.map(card => (
                    <div key={card.id} className="flex items-center p-3 border rounded-lg">
                      <div className={`h-10 w-10 rounded-full ${card.bgColor} flex items-center justify-center ${card.color} mr-3`}>
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{card.title}</h4>
                        <p className="text-sm text-neutral-600">
                          {formatEnvironmentalImpact(card.value, card.unit)}
                        </p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" defaultChecked />
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <h3 className="text-sm font-medium mb-3">Share via:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-20 gap-2"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className={`h-5 w-5 ${activeShareOption === 'twitter' ? 'text-primary' : 'text-neutral-600'}`} />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-20 gap-2"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className={`h-5 w-5 ${activeShareOption === 'linkedin' ? 'text-primary' : 'text-neutral-600'}`} />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-20 gap-2"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className={`h-5 w-5 ${activeShareOption === 'facebook' ? 'text-primary' : 'text-neutral-600'}`} />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-20 gap-2"
                    onClick={() => handleShare('email')}
                  >
                    <Mail className={`h-5 w-5 ${activeShareOption === 'email' ? 'text-primary' : 'text-neutral-600'}`} />
                    <span className="text-xs">Email</span>
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="truncate flex-1 text-sm">
                    {`${window.location.origin}/share/impact?company=${encodeURIComponent(user?.company || '')}&id=${user?.id}`}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopyLink}
                    className="ml-2"
                  >
                    {activeShareOption === 'copy' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={() => setShareDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <img src={carbonIcon} alt="Carbon Icon" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Total Carbon Saved</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatEnvironmentalImpact(impact.totalImpact?.carbonSaved || 0, "kg CO₂e")}
                </h3>
                <p className="text-xs text-green-600 mt-1">
                  Equivalent to {Math.round((impact.totalImpact?.treesEquivalent || 0) * 100) / 100} trees planted
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Water Impact</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatEnvironmentalImpact(impact.totalImpact?.waterProvided || 0, "litres")}
                </h3>
                <p className="text-xs text-blue-600 mt-1">
                  Providing clean water to {impact.totalImpact?.familiesHelped || 0} people
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                <BarChart4 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Raw Materials Saved</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatEnvironmentalImpact(impact.totalImpact?.mineralsSaved || 0, "kg")}
                </h3>
                <p className="text-xs text-amber-600 mt-1">
                  Through remanufactured technology adoption
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content Tabs */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>ESG Performance Report</CardTitle>
              <CardDescription>
                {user?.company} • Generated on {formatDate(reportDate)}
              </CardDescription>
            </div>
            <Badge variant="outline" className="mt-2 md:mt-0">
              Report ID: ESG-{user?.id}-{reportDate.getFullYear()}{(reportDate.getMonth() + 1).toString().padStart(2, '0')}
            </Badge>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardContent className="pb-0">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">ESG Goals</TabsTrigger>
              <TabsTrigger value="history">Historical View</TabsTrigger>
            </TabsList>
          </CardContent>

          <TabsContent value="overview" className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
                  <p className="text-neutral-700 mb-4">
                    {user?.company} has demonstrated a significant commitment to environmental sustainability through the adoption of remanufactured technology solutions from Circular Computing. This report outlines the quantifiable environmental benefits achieved, as well as social and governance initiatives.
                  </p>
                  <p className="text-neutral-700 mb-4">
                    By extending the lifecycle of IT equipment through remanufacturing, {user?.company} has contributed to the circular economy, reduced carbon emissions, conserved natural resources, and supported clean water initiatives in communities facing water scarcity.
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Key Performance Highlights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <p className="text-sm text-neutral-600">Remanufactured Units Deployed</p>
                        <h4 className="text-xl font-semibold mt-1">{impact.productCount || 0} units</h4>
                      </div>
                      <div className="border rounded-md p-4">
                        <p className="text-sm text-neutral-600">E-Waste Diverted</p>
                        <h4 className="text-xl font-semibold mt-1">{Math.round(((impact.productCount || 0) * 2.5) * 10) / 10} kg</h4>
                      </div>
                      <div className="border rounded-md p-4">
                        <p className="text-sm text-neutral-600">Average Carbon Footprint Reduction</p>
                        <h4 className="text-xl font-semibold mt-1">
                          {impact.productCount ? Math.round((impact.totalImpact?.carbonSaved || 0) / impact.productCount) : 0} kg CO₂e per device
                        </h4>
                      </div>
                      <div className="border rounded-md p-4">
                        <p className="text-sm text-neutral-600">Social Impact Score</p>
                        <h4 className="text-xl font-semibold mt-1">
                          {Math.round((impact.totalImpact?.familiesHelped || 0) / 10) * 10 + 20}/100
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">UN SDG Alignment</h3>
                  <div className="border rounded-md p-4 space-y-3">
                    <div>
                      <div className="flex items-center">
                        <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-12.jpg" alt="SDG 12" className="h-10 w-10 mr-2" />
                        <h4 className="font-semibold">SDG 12</h4>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1">Responsible Consumption and Production</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-13.jpg" alt="SDG 13" className="h-10 w-10 mr-2" />
                        <h4 className="font-semibold">SDG 13</h4>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1">Climate Action</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-06.jpg" alt="SDG 6" className="h-10 w-10 mr-2" />
                        <h4 className="font-semibold">SDG 6</h4>
                      </div>
                      <p className="text-sm text-neutral-700 mt-1">Clean Water and Sanitation</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 border rounded-md p-4">
                    <h4 className="font-semibold mb-2">TCO Certified</h4>
                    <p className="text-sm text-neutral-700">
                      All deployed Circular Computing products meet TCO Certified criteria for social and environmental responsibility.
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Environmental Impact Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Total Carbon Saved</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Manufacturing Emissions Avoided</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.carbonSaved || 0) * 0.7, "kg CO₂e")}
                          </span>
                        </div>
                        <Progress value={70} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Transport Emissions Reduced</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.carbonSaved || 0) * 0.15, "kg CO₂e")}
                          </span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Landfill Avoidance</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.carbonSaved || 0) * 0.15, "kg CO₂e")}
                          </span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Resource Conservation</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Metals</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.mineralsSaved || 0) * 0.55, "kg")}
                          </span>
                        </div>
                        <Progress value={55} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Plastics</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.mineralsSaved || 0) * 0.30, "kg")}
                          </span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Rare Earth Elements</span>
                          <span className="text-sm font-medium">
                            {formatEnvironmentalImpact((impact.totalImpact?.mineralsSaved || 0) * 0.15, "kg")}
                          </span>
                        </div>
                        <Progress value={15} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Social Impact Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-md p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">Clean Water Access</h4>
                        <p className="text-sm text-neutral-700 mt-1">
                          Through partnership with charity: water, your organization has helped provide clean water access to {impact.totalImpact?.familiesHelped || 0} people in water-stressed regions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <i className="ri-building-4-line text-xl"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Ethical Supply Chain</h4>
                        <p className="text-sm text-neutral-700 mt-1">
                          By choosing Circular Computing, you've supported a supply chain with fair labor practices, ethical sourcing, and verified working conditions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Environmental, Social & Governance Goals</h3>
                <p className="text-neutral-700 mb-6">
                  Track progress towards your organization's sustainability objectives. These goals reflect industry best practices and align with global sustainability frameworks.
                </p>
                
                {esgGoals.map((category) => (
                  <div key={category.category} className="mb-8">
                    <h4 className="text-md font-semibold mb-4">{category.category} Goals</h4>
                    <div className="space-y-5">
                      {category.goals.map((goal) => (
                        <div key={goal.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <div>
                              <h5 className="font-medium">{goal.title}</h5>
                              <p className="text-sm text-neutral-600">Target: {goal.target}</p>
                            </div>
                            <Badge className="mt-2 md:mt-0" variant={goal.progress >= 75 ? "default" : "outline"}>
                              {goal.progress}% Complete
                            </Badge>
                          </div>
                          
                          <Progress value={goal.progress} className="h-2 mb-3" />
                          
                          <p className="text-sm text-neutral-700">
                            {goal.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Sustainability Roadmap</h3>
                <div className="relative pl-6 border-l-2 border-dashed border-neutral-200 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Phase 1: Baseline & Assessment</h4>
                      <p className="text-neutral-600 text-sm mt-1">
                        Complete initial environmental impact assessment and establish baseline metrics
                      </p>
                      <Badge variant="outline" className="mt-2">Completed</Badge>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                      <i className="ri-arrow-right-line text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Phase 2: Implementation & Optimization</h4>
                      <p className="text-neutral-600 text-sm mt-1">
                        Deploy sustainable IT policy across organization and optimize resource usage
                      </p>
                      <Badge variant="outline" className="mt-2">In Progress - 65%</Badge>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                      <i className="ri-bar-chart-line text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Phase 3: Advanced Reporting & Integration</h4>
                      <p className="text-neutral-600 text-sm mt-1">
                        Integrate ESG metrics into corporate reporting and stakeholder communications
                      </p>
                      <Badge variant="outline" className="mt-2">Upcoming - Q3 2025</Badge>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                      <i className="ri-global-line text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Phase 4: Leadership & Advocacy</h4>
                      <p className="text-neutral-600 text-sm mt-1">
                        Establish position as industry sustainability leader and advocate for circular economy principles
                      </p>
                      <Badge variant="outline" className="mt-2">Planned - 2026</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Historical Performance</h3>
                <p className="text-neutral-700 mb-4">
                  Track your organization's sustainability progress over time across key environmental metrics.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {periods.map((period) => (
                    <Badge key={period.label} variant="outline" className="cursor-pointer">
                      {period.label}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Carbon Footprint Reduction</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-neutral-100 rounded-md flex items-center justify-center">
                        <p className="text-neutral-500">Carbon reduction trend chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Water Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-neutral-100 rounded-md flex items-center justify-center">
                        <p className="text-neutral-500">Water impact trend chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">E-Waste Diversion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-neutral-100 rounded-md flex items-center justify-center">
                        <p className="text-neutral-500">E-waste diversion trend chart</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Total Environmental Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-neutral-100 rounded-md flex items-center justify-center">
                        <p className="text-neutral-500">Environmental score trend chart</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Impact Timeline</h3>
                <div className="border rounded-lg overflow-hidden">
                  <ScrollArea className="h-80">
                    <div className="p-4">
                      <div className="relative pl-6 border-l-2 border-dashed border-neutral-200 space-y-6">
                        <div className="relative">
                          <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <i className="ri-truck-line text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h4 className="font-medium">First Circular Computing Order</h4>
                              <span className="text-sm text-neutral-500">Jan 15, 2024</span>
                            </div>
                            <p className="text-neutral-600 text-sm mt-1">
                              Deployed 25 remanufactured laptops, reducing carbon footprint by 3,750 kg CO₂e
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <i className="ri-water-flash-line text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h4 className="font-medium">First Water Project Contribution</h4>
                              <span className="text-sm text-neutral-500">Feb 28, 2024</span>
                            </div>
                            <p className="text-neutral-600 text-sm mt-1">
                              Clean water provided to 50 people in Tanzania through charity: water
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                            <i className="ri-file-paper-line text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h4 className="font-medium">First Quarterly ESG Report</h4>
                              <span className="text-sm text-neutral-500">Mar 31, 2024</span>
                            </div>
                            <p className="text-neutral-600 text-sm mt-1">
                              Established environmental baseline and sustainability goals
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <i className="ri-recycle-line text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h4 className="font-medium">IT Asset Disposition Programme Launch</h4>
                              <span className="text-sm text-neutral-500">Apr 15, 2024</span>
                            </div>
                            <p className="text-neutral-600 text-sm mt-1">
                              Initiated sustainable IT lifecycle management programme
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <i className="ri-truck-line text-xl"></i>
                          </div>
                          <div className="ml-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <h4 className="font-medium">Major Deployment Expansion</h4>
                              <span className="text-sm text-neutral-500">May 10, 2024</span>
                            </div>
                            <p className="text-neutral-600 text-sm mt-1">
                              Expanded remanufactured laptop deployment, doubling environmental impact
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Shareable Social Impact Cards */}
      <h2 className="text-xl font-semibold mb-4">Shareable Impact Cards</h2>
      <p className="text-neutral-600 mb-4">
        Celebrate and share your sustainability achievements with these ready-to-post social media cards
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shareableCards.map(card => (
          <Card key={card.id} className="overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center text-center p-4">
              <div className={`h-16 w-16 rounded-full ${card.bgColor} flex items-center justify-center ${card.color} mb-2`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold">
                {formatEnvironmentalImpact(card.value, card.unit)}
              </h3>
              <p className="text-neutral-700">{card.title}</p>
            </div>
            <CardFooter className="flex justify-between p-4">
              <p className="text-xs text-neutral-500">
                {user?.company} • Circular Computing
              </p>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}