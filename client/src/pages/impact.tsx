import { useImpact } from "@/hooks/use-impact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatEnvironmentalImpact } from "@/lib/utils";
import carbonIcon from "@assets/Carbon Icon CC_1757609284710.png";
import waterIcon from "@assets/Minerals Saved Icon CC _1757609311468.png";
import resourceIcon from "@assets/Resource Pres Icon CC_1757609329084.png";
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
} from "recharts";
import { Link } from "wouter";
import { Copy, Share2 } from "lucide-react";

// Mock data for charts - would be replaced by actual data in a real implementation
const monthlyData = [
  { name: "Jan", carbon: 120, water: 1200, minerals: 300 },
  { name: "Feb", carbon: 180, water: 1800, minerals: 380 },
  { name: "Mar", carbon: 220, water: 2100, minerals: 420 },
  { name: "Apr", carbon: 260, water: 2400, minerals: 490 },
  { name: "May", carbon: 290, water: 2700, minerals: 540 },
  { name: "Jun", carbon: 310, water: 2900, minerals: 580 },
];

const materialBreakdown = [
  { name: "Aluminum", value: 35 },
  { name: "Copper", value: 20 },
  { name: "Plastics", value: 25 },
  { name: "Rare Earth", value: 10 },
  { name: "Other", value: 10 },
];

const COLORS = ["#4caf50", "#03a9f4", "#ffa726", "#f44336", "#9c27b0"];

export default function Impact() {
  const { impact, isLoadingImpact } = useImpact();
  const { toast } = useToast();

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
          <Button 
            variant="outline"
          >
            <i className="ri-download-line mr-2"></i>
            <span>Download Report</span>
          </Button>
          <Button 
            variant="outline"
            asChild
          >
            <Link href="/water-projects">View Water Projects</Link>
          </Button>
        </div>
      </div>

      {/* Impact Summary Cards */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingImpact ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : impact ? (
          <>
            <Card>
              <CardContent className="p-6">
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
                <div className="mt-4 text-sm flex items-center text-success">
                  <i className="ri-arrow-up-line mr-1"></i>
                  <span>
                    Equivalent to planting {impact.treesEquivalent} trees
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">
                      Clean Water Provided
                    </h3>
                    <p className="text-3xl font-bold mt-1">
                      {formatEnvironmentalImpact(impact.waterProvided, "litres")}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <img src={waterIcon} alt="Water Icon" className="w-7 h-7" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Impact level</span>
                    <span>High</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="mt-4 text-sm flex items-center text-secondary">
                  <i className="ri-group-line mr-1"></i>
                  <span>Helping {impact.familiesHelped} families</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
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
                    <span>Impact level</span>
                    <span>Medium</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="mt-4 text-sm flex items-center text-accent">
                  <i className="ri-earth-line mr-1"></i>
                  <span>Reduced mining impact by 68%</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="md:col-span-3 p-8 text-center bg-white rounded-xl shadow-sm">
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

      {/* Impact Trends Chart */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="carbon"
                    stroke="#4caf50"
                    strokeWidth={2}
                    name="Carbon Saved (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    stroke="#03a9f4"
                    strokeWidth={2}
                    name="Water Provided (L)"
                  />
                  <Line
                    type="monotone"
                    dataKey="minerals"
                    stroke="#ffa726"
                    strokeWidth={2}
                    name="Minerals Saved (g)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Impact Breakdown */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Minerals Saved Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={materialBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {materialBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Water Impact by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Ethiopia", water: 950 },
                    { name: "Rwanda", water: 750 },
                    { name: "Uganda", water: 500 },
                    { name: "Kenya", water: 300 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="water"
                    fill="#0288D1"
                    name="Water Provided (L)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
