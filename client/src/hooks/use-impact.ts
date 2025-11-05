import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentalImpact, WaterProject, CaseStudy, InsertCaseStudy } from "@shared/schema";

interface ImpactData {
  carbonSaved: number;
  waterProvided: number;
  waterSaved?: number;
  mineralsSaved: number;
  treesEquivalent: number;
  familiesHelped: number;
}

export function useImpact() {
  const { toast } = useToast();

  const { data: impact, isLoading: isLoadingImpact } = useQuery<ImpactData>({
    queryKey: ["/api/impact"],
  });

  const { data: waterProjects, isLoading: isLoadingWaterProjects } = useQuery<WaterProject[]>({
    queryKey: ["/api/water-projects"],
  });

  const { data: caseStudies, isLoading: isLoadingCaseStudies } = useQuery<CaseStudy[]>({
    queryKey: ["/api/case-studies"],
  });

  async function submitCaseStudy(caseStudyData: Omit<InsertCaseStudy, "userId">) {
    try {
      await apiRequest("POST", "/api/case-studies", caseStudyData);
      queryClient.invalidateQueries({ queryKey: ["/api/case-studies"] });
      toast({
        title: "Case Study Submitted",
        description: "Your case study has been submitted successfully. Our team will review it and contact you soon.",
      });
      return true;
    } catch (error) {
      console.error("Submit case study error:", error);
      toast({
        title: "Error",
        description: "Failed to submit case study. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Calculate progress towards next milestone (for water impact)
  function calculateWaterMilestone() {
    if (!impact) return { progress: 0, nextMilestone: 0, remaining: 0, laptopsNeeded: 0 };
    
    const currentWaterProvided = impact.waterProvided;
    const nextMilestone = Math.ceil(currentWaterProvided / 1000) * 1000;
    const previousMilestone = Math.floor(currentWaterProvided / 1000) * 1000;
    const progress = ((currentWaterProvided - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
    const remaining = nextMilestone - currentWaterProvided;
    const laptopsNeeded = Math.ceil(remaining / 500); // Assuming each laptop contributes ~500L
    
    return {
      progress,
      nextMilestone,
      remaining,
      laptopsNeeded
    };
  }

  // Get featured water project (first in the list)
  function getFeaturedWaterProject() {
    if (!waterProjects || waterProjects.length === 0) return null;
    return waterProjects[0];
  }

  // Get list of countries from water projects
  function getWaterProjectCountries() {
    if (!waterProjects) return [];
    return Array.from(new Set(waterProjects.map(project => project.location)));
  }

  // Check if user has already submitted a case study
  function hasSubmittedCaseStudy() {
    return caseStudies && caseStudies.length > 0;
  }

  return {
    impact,
    waterProjects,
    caseStudies,
    isLoadingImpact,
    isLoadingWaterProjects,
    isLoadingCaseStudies,
    submitCaseStudy,
    calculateWaterMilestone,
    getFeaturedWaterProject,
    getWaterProjectCountries,
    hasSubmittedCaseStudy,
  };
}
