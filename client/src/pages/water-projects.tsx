import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEnvironmentalImpact } from "@/lib/utils";
import { WaterProject } from "@shared/schema";
import { motion } from "framer-motion";

export default function WaterProjects() {
  const { data: waterProjects, isLoading: isLoadingProjects } = useQuery<WaterProject[]>({
    queryKey: ["/api/water-projects"],
  });

  const { data: impact, isLoading: isLoadingImpact } = useQuery({
    queryKey: ["/api/impact"],
  });

  const progressValue = impact ? (impact.waterProvided / 25000) * 100 : 0;

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-neutral-900">
            Projects by charity: water
          </h1>
          <p className="text-neutral-600">
            See how your laptop purchases help provide clean water to communities in need.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button 
            variant="outline" 
            className="bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors" 
            asChild
          >
            <a href="https://www.charitywater.org/" target="_blank" rel="noreferrer">
              About charity: water
            </a>
          </Button>
        </div>
      </div>

      {/* Impact Summary Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-4">Your Water Impact</h2>
              <p className="text-neutral-700 mb-6">
                Through your purchases with Circular Computing, you're helping provide clean, safe drinking water to people in need. Each remanufactured laptop helps fund clean water projects in developing countries.
              </p>
              {isLoadingImpact ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : impact ? (
                <>
                  <div className="flex items-baseline mb-2">
                    <h3 className="text-3xl font-bold text-secondary">
                      {impact.familiesHelped} families
                    </h3>
                    <span className="text-neutral-500 ml-2">receiving clean water</span>
                  </div>
                  <p className="text-neutral-600 mb-4">
                    <span className="font-semibold">per family per week</span>
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress to Next Project</span>
                      <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-sm text-neutral-500">
                      Just {25 - (impact.familiesHelped || 0)} more families to fund a new water point
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-neutral-500">No impact data available yet. Start making purchases to contribute!</p>
              )}
            </div>
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="95" fill="#FFF9C4" stroke="#F57F17" strokeWidth="2" />
                  
                  {/* Jerry can main body */}
                  <path d="M60 70 L60 150 Q60 160, 70 160 L130 160 Q140 160, 140 150 L140 70 Q140 60, 130 60 L70 60 Q60 60, 60 70 Z" fill="#FBC02D" stroke="#F57F17" strokeWidth="2" />
                  
                  {/* Jerry can spout/neck */}
                  <rect x="120" y="50" width="25" height="20" fill="#FBC02D" stroke="#F57F17" strokeWidth="2" rx="3" />
                  
                  {/* Jerry can cap */}
                  <circle cx="132.5" cy="55" r="8" fill="#F57F17" stroke="#E65100" strokeWidth="2" />
                  <circle cx="132.5" cy="55" r="4" fill="#FF8F00" />
                  
                  {/* Handle */}
                  <path d="M50 80 Q45 85, 45 95 Q45 105, 50 110" stroke="#F57F17" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <rect x="48" y="85" width="12" height="20" fill="#FBC02D" stroke="#F57F17" strokeWidth="2" rx="2" />
                  
                  {/* Water level inside jerry can */}
                  <path d="M65 75 L65 145 Q65 155, 75 155 L125 155 Q135 155, 135 145 L135 75 Z" fill="#2196F3" fillOpacity="0.7" />
                  
                  {/* Water surface ripples */}
                  <path d="M70 80 Q85 75, 100 80 Q115 85, 130 80" stroke="#1976D2" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M70 85 Q85 80, 100 85 Q115 90, 130 85" stroke="#1976D2" strokeWidth="1" fill="none" strokeLinecap="round" />
                  
                  {/* Jerry can ridges/details */}
                  <line x1="75" y1="70" x2="125" y2="70" stroke="#F57F17" strokeWidth="1" />
                  <line x1="75" y1="140" x2="125" y2="140" stroke="#F57F17" strokeWidth="1" />
                  
                  {/* Water drops near spout */}
                  <path d="M130 45 C130 40, 135 40, 135 45 C135 50, 130 50, 130 45 Z" fill="#2196F3" />
                  <path d="M140 40 C140 35, 145 35, 145 40 C145 45, 140 45, 140 40 Z" fill="#2196F3" />
                  
                  {/* Ground/base line */}
                  <ellipse cx="100" cy="170" rx="50" ry="8" fill="#E0E0E0" fillOpacity="0.5" />
                </svg>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Project Gallery */}
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Projects by charity: water</h2>
      
      {isLoadingProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      ) : waterProjects && waterProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {waterProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 text-sm mb-4">
                  {project.description}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>People Impacted</span>
                    <span className="font-semibold">{project.peopleImpacted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Families Supported</span>
                    <span className="font-semibold">{Math.round(project.peopleImpacted / 5)} families</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors" asChild>
                  <a href={
                    project.name === "Uganda Rainwater Harvesting" 
                      ? "https://www.charitywater.org/our-projects/uganda"
                      : project.name === "Rwanda Clean Water Project"
                      ? "https://www.charitywater.org/our-projects/rwanda"
                      : project.name === "Ethiopia Clean Water Initiative"
                      ? "https://www.charitywater.org/our-projects/ethiopia"
                      : "https://www.charitywater.org/our-projects"
                  } target="_blank" rel="noreferrer">
                    Learn More
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-neutral-200 mb-8">
          <h3 className="text-lg font-medium text-neutral-700">No water projects available</h3>
          <p className="text-neutral-500 mt-2">Check back later for updates on our water projects.</p>
        </div>
      )}

      {/* About Charity: water */}
      <div className="mb-8">
        <Tabs defaultValue="about">
          <TabsList className="mb-4">
            <TabsTrigger value="about">About charity: water</TabsTrigger>
            <TabsTrigger value="impact">The Impact</TabsTrigger>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
          </TabsList>
          <TabsContent value="about">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About charity: water</h3>
                    <p className="text-neutral-700 mb-4">
                      charity: water is a nonprofit organization bringing clean and safe drinking water to people in developing countries. Since 2006, they've funded 91,414 water projects for 14.76 million people around the world.
                    </p>
                    <p className="text-neutral-700 mb-4">
                      100% of public donations go directly to clean water projects. Their operating costs are covered by private donors, ensuring every dollar you donate can have the biggest impact possible.
                    </p>
                    <p className="text-neutral-700">
                      Through our partnership with charity: water, every remanufactured laptop purchased contributes to funding clean water projects, creating a positive impact beyond just environmental sustainability.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src="/attached_assets/charity-water-logo.jpeg"
                      alt="charity: water logo"
                      className="rounded-lg max-w-[300px] h-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="impact">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">The Impact of Clean Water</h3>
                    <p className="text-neutral-700 mb-4">
                      Access to clean water changes everything. It improves health, increases access to education, and creates opportunities for women and girls who often spend hours collecting water.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-neutral-700 mb-4">
                      <li>
                        <span className="font-medium">Health:</span> Reduces water-related diseases like cholera, typhoid, and dysentery
                      </li>
                      <li>
                        <span className="font-medium">Education:</span> Children can attend school instead of collecting water
                      </li>
                      <li>
                        <span className="font-medium">Women's empowerment:</span> Women gain back hours of their day for economic opportunities
                      </li>
                      <li>
                        <span className="font-medium">Economic growth:</span> Communities can focus on agriculture and business
                      </li>
                    </ul>
                    <p className="text-neutral-700">
                      With every laptop purchase, you're contributing to these transformative impacts.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src="/attached_assets/Impact.png"
                      alt="Children accessing clean water"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="stories">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Success Stories</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/5 rounded-lg">
                        <h4 className="font-medium">Alem's Story - Ethiopia</h4>
                        <p className="text-sm text-neutral-700 mt-1">
                          "Before the well, I walked 3 hours every day to collect water for my family. Now, I can attend school and dream of becoming a doctor. Clean water changed my whole future."
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg">
                        <h4 className="font-medium">Mutesi's Village - Rwanda</h4>
                        <p className="text-sm text-neutral-700 mt-1">
                          "Our village used to suffer from many illnesses. Since the water project was completed, our children are healthier, and our community is thriving with new businesses and opportunities."
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg">
                        <h4 className="font-medium">Baraka's Community - Uganda</h4>
                        <p className="text-sm text-neutral-700 mt-1">
                          "The new rainwater harvesting system provides clean water throughout the year. Our school attendance has improved by 40%, and waterborne diseases have decreased dramatically."
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src="/attached_assets/Success.png"
                      alt="Girl joyfully playing with clean water"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>


    </div>
  );
}
