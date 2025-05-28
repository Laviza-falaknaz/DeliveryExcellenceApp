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
            See how your laptop purchases help provide clean water to communities in need
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="mr-2" asChild>
            <a href="https://www.charitywater.org/" target="_blank" rel="noreferrer">
              About charity: water
            </a>
          </Button>
          <Button asChild>
            <a href="https://www.charitywater.org/donate" target="_blank" rel="noreferrer">
              Donate Directly
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
                      {formatEnvironmentalImpact(impact.waterProvided, "litres")}
                    </h3>
                    <span className="text-neutral-500 ml-2">of clean water provided</span>
                  </div>
                  <p className="text-neutral-600 mb-4">
                    Helping <span className="font-semibold">{impact.familiesHelped} families</span> access clean water
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progress to Next Project</span>
                      <span>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-sm text-neutral-500">
                      Just {formatEnvironmentalImpact(25000 - (impact.waterProvided || 0), "litres")} more to fund a new water point
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
                <svg width="250" height="250" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="250" cy="250" r="240" fill="#E3F2FD" />
                  <path d="M250 50C361.046 50 450 138.954 450 250C450 361.046 361.046 450 250 450C138.954 450 50 361.046 50 250C50 138.954 138.954 50 250 50Z" fill="#0288D1" fillOpacity="0.1" />
                  <path d="M250 90C339.411 90 410 160.589 410 250C410 339.411 339.411 410 250 410C160.589 410 90 339.411 90 250C90 160.589 160.589 90 250 90Z" fill="#0288D1" fillOpacity="0.2" />
                  <path d="M250,250 m0,-160 a160,160 0 1,0 0,320 a160,160 0 1,0 0,-320" fill="#0288D1" fillOpacity="0.1" />
                  <path d="M250,250 m0,-120 a120,120 0 1,0 0,240 a120,120 0 1,0 0,-240" fill="#0288D1" fillOpacity="0.2" />
                  <path d="M250,250 m0,-80 a80,80 0 1,0 0,160 a80,80 0 1,0 0,-160" fill="#0288D1" fillOpacity="0.3" />
                  <circle cx="250" cy="250" r="40" fill="#0288D1" />
                  <path d="M230,200 C250,150 270,200 270,160 C290,120 310,170 330,190" stroke="#0288D1" strokeWidth="8" strokeLinecap="round" />
                  <path d="M170,220 C190,170 210,220 230,180 C250,140 270,190 290,210" stroke="#0288D1" strokeWidth="8" strokeLinecap="round" />
                  <path d="M190,270 C210,220 230,270 250,230 C270,190 290,240 310,260" stroke="#0288D1" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Project Gallery */}
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Our Water Projects</h2>
      
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
                    <span>Water Provided</span>
                    <span className="font-semibold">{formatEnvironmentalImpact(project.waterProvided, "litres")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://www.charitywater.org/our-projects" target="_blank" rel="noreferrer">
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
                      src="https://www.charitywater.org/assets/images/global/logos/charity-water-logo-main.svg"
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
                      src="https://images.unsplash.com/photo-1580310614729-ccd69652491d?ixlib=rb-4.0.3&auto=format&fit=crop&w=450&h=300"
                      alt="Woman collecting clean water from a well"
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
                      src="https://images.unsplash.com/photo-1563906267088-b029e7101114?ixlib=rb-4.0.3&auto=format&fit=crop&w=450&h=300"
                      alt="Children celebrating access to clean water"
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-secondary mb-2">
                Together, We Can Make a Difference
              </h3>
              <p className="text-neutral-700 mb-4">
                Every remanufactured laptop you purchase helps provide clean water to communities in need while also reducing environmental impact. It's a win-win for people and the planet.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <a href="/orders/new">Purchase Laptops</a>
                </Button>
                <Button variant="outline" className="border-secondary text-secondary" asChild>
                  <a href="https://www.charitywater.org/donate" target="_blank" rel="noreferrer">
                    Donate Directly
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-6 flex-shrink-0">
              <img
                src="https://circularcomputing.com/wp-content/uploads/2023/10/charity-water-hands-1024x683.jpg"
                alt="Hands receiving clean water - charity: water partnership"
                className="rounded-lg shadow-sm max-w-[300px] h-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
