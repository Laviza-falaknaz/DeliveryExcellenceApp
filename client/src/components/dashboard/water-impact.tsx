import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatEnvironmentalImpact } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { WaterProject } from "@shared/schema";
import charityWaterImage from "@assets/Charity Water.png";
import waterIcon from "@assets/Minerals Saved Icon CC _1757592540046.png";

export default function WaterImpact() {
  const { data: impact, isLoading: isImpactLoading } = useQuery({
    queryKey: ["/api/impact"],
  });

  const { data: waterProjects, isLoading: isProjectsLoading } = useQuery<WaterProject[]>({
    queryKey: ["/api/water-projects"],
  });

  // Featured project is the first one
  const featuredProject = waterProjects && waterProjects.length > 0 ? waterProjects[0] : null;

  if (isImpactLoading || isProjectsLoading) {
    return <WaterImpactSkeleton />;
  }

  if (!impact || !waterProjects || waterProjects.length === 0) {
    return null;
  }

  const projectCount = waterProjects.length;
  const countries = [...new Set(waterProjects.map(project => project.location))];
  
  // Calculate progress toward next milestone (e.g., 75% of the way to the next thousand litres)
  const currentWaterProvided = impact.waterProvided;
  const nextMilestone = Math.ceil(currentWaterProvided / 1000) * 1000;
  const previousMilestone = Math.floor(currentWaterProvided / 1000) * 1000;
  const progressPercentage = ((currentWaterProvided - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  
  // Calculate remaining before next milestone
  const remaining = nextMilestone - currentWaterProvided;
  const laptopsNeeded = Math.ceil(remaining / 500); // Assuming each laptop contributes ~500L

  return (
    <Card className="bg-white overflow-hidden border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-3">
            <img src={waterIcon} alt="Water Icon" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">charity: water Impact</h3>
            <p className="text-sm text-neutral-500">Your purchases help provide clean water</p>
          </div>
        </div>

        {featuredProject && (
          <a 
            href="https://circularcomputing.com/sustainability-projects/" 
            target="_blank" 
            rel="noreferrer"
            className="block mt-4 relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <img
              src={charityWaterImage}
              alt="Families celebrating access to clean water through charity: water partnership"
              className="w-full h-48 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
              <h4 className="font-medium">charity: water Partnership</h4>
              <p className="text-sm text-white/80">
                Your purchase helps fund clean water projects in developing countries
              </p>
            </div>
          </a>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-2">
                <i className="ri-user-line text-lg"></i>
              </div>
              <span className="text-sm font-medium text-neutral-700">People Impacted</span>
            </div>
            <p className="text-2xl font-bold mt-2">{impact.familiesHelped * 5}</p>
            <p className="text-xs text-success mt-1">+{Math.round(impact.familiesHelped * 0.4)} from your orders</p>
          </div>

          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-2">
                <img src={waterIcon} alt="Water Icon" className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-neutral-700">Water Provided</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {impact.familiesHelped} families
            </p>
            <p className="text-xs text-success mt-1">
              Figure for 1 week supply per family
            </p>
          </div>

          <div className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-2">
                <i className="ri-map-pin-line text-lg"></i>
              </div>
              <span className="text-sm font-medium text-neutral-700">Projects Supported</span>
            </div>
            <p className="text-2xl font-bold mt-2">{projectCount}</p>
            <p className="text-xs text-neutral-500 mt-1">
              {countries.join(", ")}
            </p>
          </div>
        </div>



        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="btn-outline-hover" asChild>
            <Link href="/water-projects">
              View Water Projects
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WaterImpactSkeleton() {
  return (
    <Card className="bg-white overflow-hidden border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex items-center mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>

        <Skeleton className="w-full h-48 rounded-lg" />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="p-4 border border-neutral-200 rounded-lg">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-2 w-full rounded-full mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}
