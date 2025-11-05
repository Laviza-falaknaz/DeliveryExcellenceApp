import { useMutation } from "@tanstack/react-query";
import SustainabilityQuiz from "@/components/games/sustainability-quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, ArrowLeft } from "lucide-react";

export default function SustainabilityQuizPage() {
  const { toast } = useToast();
  
  const recordQuizCompletion = useMutation({
    mutationFn: async ({ score, totalPoints }: { score: number; totalPoints: number }) => {
      const percentage = (score / totalPoints) * 100;
      const pointsEarned = score;
      
      return await apiRequest("/api/gamification/activity-log", {
        method: "POST",
        body: JSON.stringify({
          activityType: "quiz_completed",
          description: `Completed Sustainability Quiz with ${Math.round(percentage)}% accuracy`,
          pointsEarned: pointsEarned
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/activity-log"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-achievements"] });
      
      toast({
        title: "XP Awarded!",
        description: "Your quiz score has been added to your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleQuizComplete = (score: number, totalPoints: number) => {
    recordQuizCompletion.mutate({ score, totalPoints });
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#08ABAB] to-emerald-500 mb-4">
          <Gamepad2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-poppins text-neutral-900 mb-3">
          Sustainability Quiz Challenge
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Test your knowledge about circular economy, e-waste, and environmental impact.
          Earn XP for every correct answer and become a sustainability champion!
        </p>
      </div>

      <SustainabilityQuiz onComplete={handleQuizComplete} />

      <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="ri-information-line text-blue-600"></i>
            Did You Know?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-0.5"></i>
              <span>Every remanufactured laptop prevents 3kg of e-waste from polluting our planet</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-0.5"></i>
              <span>Manufacturing accounts for 80% of a device's total carbon footprint</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-0.5"></i>
              <span>Circular Computing saves over 1,200 litres of water per device remanufactured</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-0.5"></i>
              <span>Your choice to buy remanufactured helps provide clean water to families in need</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
