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
              <div className="relative w-[320px] h-[280px]">
                <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left side: Laptop Purchase */}
                  <g>
                    <text x="30" y="25" fontSize="12" fontWeight="600" fill="#374151">Your Purchase</text>
                    
                    {/* Laptop icon */}
                    <motion.rect
                      x="20"
                      y="40"
                      width="70"
                      height="50"
                      rx="3"
                      fill="#08ABAB"
                      stroke="#066B6B"
                      strokeWidth="2"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <rect x="25" y="45" width="60" height="35" rx="2" fill="#E0F2F1" />
                    <path d="M50 60 L60 70 L40 70 Z" fill="#08ABAB" />
                    <circle cx="55" cy="75" r="3" fill="#FF9E1C" />
                    
                    {/* Checkmark badge */}
                    <motion.circle
                      cx="80"
                      cy="50"
                      r="12"
                      fill="#FF9E1C"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.6, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <motion.path
                      d="M75 50 L78 53 L85 46"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.7, repeat: Infinity, repeatDelay: 3 }}
                    />
                  </g>

                  {/* Arrow with flowing particles */}
                  <motion.path
                    d="M100 65 L180 65"
                    stroke="#08ABAB"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M175 60 L185 65 L175 70"
                    fill="#08ABAB"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />

                  {/* Flowing dots along arrow */}
                  {[0, 1, 2].map((i) => (
                    <motion.circle
                      key={`dot-${i}`}
                      cx="100"
                      cy="65"
                      r="3"
                      fill="#FF9E1C"
                      initial={{ x: 0 }}
                      animate={{ x: 80 }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  ))}

                  {/* Right side: Water Well & Community */}
                  <g>
                    <text x="185" y="25" fontSize="12" fontWeight="600" fill="#374151">Clean Water Impact</text>
                    
                    {/* Water well/pump */}
                    <rect x="200" y="50" width="25" height="40" rx="2" fill="#08ABAB" stroke="#066B6B" strokeWidth="2" />
                    <rect x="210" y="45" width="5" height="10" fill="#066B6B" />
                    
                    {/* Pump handle */}
                    <motion.path
                      d="M215 45 Q220 35, 225 40"
                      stroke="#066B6B"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ transformOrigin: "215px 45px" }}
                    />
                    
                    {/* Water flowing from pump */}
                    {[0, 1, 2].map((i) => (
                      <motion.path
                        key={`water-${i}`}
                        d="M212 90 Q212 95, 212 100"
                        stroke="#2196F3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ 
                          pathLength: [0, 1, 1],
                          opacity: [0, 1, 0],
                          y: [0, 20]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </g>

                  {/* Bottom: Community Impact */}
                  <g>
                    <text x="60" y="140" fontSize="12" fontWeight="600" fill="#374151" textAnchor="middle">Families Helped</text>
                    
                    {/* Family icons */}
                    {[0, 1, 2].map((i) => (
                      <motion.g
                        key={`family-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.3, duration: 0.5 }}
                      >
                        {/* Person circle */}
                        <circle cx={40 + i * 35} cy="165" r="8" fill="#08ABAB" />
                        {/* Person body */}
                        <path
                          d={`M${40 + i * 35} 173 L${40 + i * 35} 185 M${35 + i * 35} 178 L${45 + i * 35} 178`}
                          stroke="#08ABAB"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        
                        {/* Water droplet above person */}
                        <motion.path
                          d={`M${40 + i * 35} 145 C${40 + i * 35} 145 ${35 + i * 35} 150 ${35 + i * 35} 153 C${35 + i * 35} 156 ${37 + i * 35} 158 ${40 + i * 35} 158 C${43 + i * 35} 158 ${45 + i * 35} 156 ${45 + i * 35} 153 C${45 + i * 35} 150 ${40 + i * 35} 145 ${40 + i * 35} 145 Z`}
                          fill="#2196F3"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: [0, 1, 1], y: 0 }}
                          transition={{
                            delay: 1.5 + i * 0.3,
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        />
                      </motion.g>
                    ))}

                    {/* Impact text */}
                    <motion.text
                      x="160"
                      y="175"
                      fontSize="14"
                      fontWeight="700"
                      fill="#08ABAB"
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1] }}
                      transition={{ delay: 2, duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      + Clean Water
                    </motion.text>
                  </g>

                  {/* Background subtle circles for depth */}
                  <circle cx="260" cy="200" r="40" fill="#E0F2F1" opacity="0.3" />
                  <circle cx="280" cy="160" r="25" fill="#FFF9C4" opacity="0.3" />
                </svg>
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
