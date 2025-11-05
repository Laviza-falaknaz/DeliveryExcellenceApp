import { useMutation } from "@tanstack/react-query";
import WasteSortingGame from "@/components/games/waste-sorting-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Recycle, ArrowLeft } from "lucide-react";

export default function WasteSortingGamePage() {
  const { toast } = useToast();
  
  const recordGameCompletion = useMutation({
    mutationFn: async ({ score, totalPoints }: { score: number; totalPoints: number }) => {
      const percentage = (score / totalPoints) * 100;
      
      return await apiRequest("POST", "/api/gamification/activity-log", {
        activityType: "game_completed",
        description: `Completed Waste Sorting Game with ${Math.round(percentage)}% accuracy`,
        pointsEarned: score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/activity-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-achievements"] });
      
      toast({
        title: "XP Awarded!",
        description: "Your game score has been added to your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save game results. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleGameComplete = (score: number, totalPoints: number) => {
    recordGameCompletion.mutate({ score, totalPoints });
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
          <Recycle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-poppins text-neutral-900 mb-3">
          Waste Sorting Challenge
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Learn to properly sort e-waste, recyclables, and reusables! Drag items into the correct bins
          and earn XP while mastering sustainable waste management.
        </p>
      </div>

      <WasteSortingGame onComplete={handleGameComplete} />

      <Card className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="ri-information-line text-emerald-600"></i>
            Sorting Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <i className="ri-computer-line text-red-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <strong className="text-neutral-900">E-Waste:</strong>
                  <p className="text-neutral-700">Electronics, batteries, circuit boards, screens - contain valuable materials and toxic substances</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="ri-recycle-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <strong className="text-neutral-900">Recyclable:</strong>
                  <p className="text-neutral-700">Paper, cardboard, metal, glass - can be processed into new materials</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <i className="ri-restart-line text-emerald-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <strong className="text-neutral-900">Reusable:</strong>
                  <p className="text-neutral-700">Working items, cables, packaging - can be used again without processing</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="ri-delete-bin-line text-neutral-600 mt-0.5 flex-shrink-0"></i>
                <div>
                  <strong className="text-neutral-900">Landfill:</strong>
                  <p className="text-neutral-700">Non-recyclable items like styrofoam and contaminated plastics</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
