import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatEnvironmentalImpact } from "@/lib/utils";
import { WaterProject } from "@shared/schema";
import { motion } from "framer-motion";
import ugandaImage from "@assets/Uganda_1600 by 1027_a_1759311025910.png";

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
            See how your laptop purchases help provide clean water to communities in need
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex">
          <Button 
            variant="outline" 
            className="bg-[#08ABAB] border-[#08ABAB] text-white hover:bg-[#FF9E1C] hover:text-black hover:border-[#FF9E1C] transition-colors" 
            asChild
          >
            <a href="https://www.charitywater.org/" target="_blank" rel="noreferrer">
              Visit charity: water
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
                  <p className="text-neutral-600">
                    <span className="font-semibold">Figure is for 1 week supply per family</span>
                  </p>
                </>
              ) : (
                <p className="text-neutral-500">No impact data available yet. Start making purchases to contribute!</p>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-[280px] h-[280px]">
                {/* Animated laptop transforming into water droplets */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                >
                  {/* Laptop */}
                  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Laptop base */}
                    <motion.rect
                      x="60"
                      y="140"
                      width="160"
                      height="10"
                      rx="2"
                      fill="#08ABAB"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Laptop screen */}
                    <motion.rect
                      x="70"
                      y="80"
                      width="140"
                      height="60"
                      rx="3"
                      fill="#08ABAB"
                      stroke="#066B6B"
                      strokeWidth="2"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Screen content - recycling symbol */}
                    <motion.path
                      d="M140 100 L150 110 L145 110 L145 115 L135 115 L135 110 L130 110 Z"
                      fill="#FF9E1C"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>

                {/* Animated water droplets flowing from laptop */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ left: `${120 + i * 15}px`, top: '150px' }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                      y: [0, 60, 80],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  >
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                      <path
                        d="M10 0C10 0 0 10 0 16C0 20.4 4.5 24 10 24C15.5 24 20 20.4 20 16C20 10 10 0 10 0Z"
                        fill="#08ABAB"
                        fillOpacity="0.8"
                      />
                    </svg>
                  </motion.div>
                ))}

                {/* Water waves at bottom */}
                <motion.div
                  className="absolute bottom-8 left-1/2 -translate-x-1/2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <svg width="200" height="60" viewBox="0 0 200 60" fill="none">
                    <motion.path
                      d="M0 30 Q25 20, 50 30 T100 30 T150 30 T200 30"
                      stroke="#08ABAB"
                      strokeWidth="3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.path
                      d="M0 40 Q25 30, 50 40 T100 40 T150 40 T200 40"
                      stroke="#08ABAB"
                      strokeWidth="2"
                      fill="none"
                      strokeOpacity="0.6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    />
                    <motion.path
                      d="M0 50 Q25 40, 50 50 T100 50 T150 50 T200 50"
                      stroke="#08ABAB"
                      strokeWidth="1.5"
                      fill="none"
                      strokeOpacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                    />
                  </svg>
                </motion.div>

                {/* Hearts/impact symbols */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={`heart-${i}`}
                    className="absolute"
                    style={{ 
                      left: `${50 + i * 140}px`,
                      top: '180px'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.2, 1],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 1.5,
                      repeat: Infinity,
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        fill="#FF9E1C"
                      />
                    </svg>
                  </motion.div>
                ))}
              </div>
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
            <Card key={project.id} className="overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="min-h-[3.5rem] flex items-start">{project.name}</CardTitle>
                <CardDescription>{project.location}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
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
              <CardFooter className="mt-auto">
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
                      src={ugandaImage}
                      alt="Child accessing clean water in Uganda through charity: water"
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
                        <p className="text-sm text-neutral-700 mt-1 italic font-serif">
                          "Before the well, I walked 3 hours every day to collect water for my family. Now, I can attend school and dream of becoming a doctor. Clean water changed my whole future."
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg">
                        <h4 className="font-medium">Mutesi's Village - Rwanda</h4>
                        <p className="text-sm text-neutral-700 mt-1 italic font-serif">
                          "Our village used to suffer from many illnesses. Since the water project was completed, our children are healthier, and our community is thriving with new businesses and opportunities."
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/5 rounded-lg">
                        <h4 className="font-medium">Baraka's Community - Uganda</h4>
                        <p className="text-sm text-neutral-700 mt-1 italic font-serif">
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
