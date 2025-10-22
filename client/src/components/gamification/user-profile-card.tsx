import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LevelBadge } from "./level-badge";
import { ExperienceBar } from "./experience-bar";
import { StreakDisplay } from "./streak-display";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Trophy, Zap, Target } from "lucide-react";

export function UserProfileCard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: progress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["/api/gamification/user-progress"],
  });

  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/gamification/user-achievements"],
  });

  if (isLoadingProgress) {
    return <Skeleton className="h-64 w-full" />;
  }

  const userProgress = progress || {
    level: 1,
    experiencePoints: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  const unlockedAchievements = achievements?.length || 0;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-neutral-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <LevelBadge
            level={userProgress.level}
            experiencePoints={userProgress.experiencePoints}
            showProgress={true}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xl text-neutral-900 truncate">
              {user?.name}
            </h3>
            <p className="text-sm text-neutral-600">{user?.company}</p>
            <div className="mt-2">
              <ExperienceBar
                current={userProgress.experiencePoints % 1000}
                total={1000}
                level={userProgress.level}
                showLabel={false}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <motion.div
            className="text-center p-3 bg-gradient-to-br from-[#08ABAB]/10 to-transparent rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex justify-center mb-1">
              <Trophy className="h-5 w-5 text-[#08ABAB]" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{unlockedAchievements}</p>
            <p className="text-xs text-neutral-600">Achievements</p>
          </motion.div>

          <motion.div
            className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-transparent rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex justify-center mb-1">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{userProgress.currentStreak}</p>
            <p className="text-xs text-neutral-600">Day Streak</p>
          </motion.div>

          <motion.div
            className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-transparent rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex justify-center mb-1">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{userProgress.totalPoints}</p>
            <p className="text-xs text-neutral-600">Total XP</p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
