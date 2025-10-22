import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps) {
  const getStreakColor = (streak: number) => {
    if (streak < 3) return "text-gray-500";
    if (streak < 7) return "text-orange-500";
    if (streak < 14) return "text-red-500";
    return "text-purple-500";
  };

  const getStreakGradient = (streak: number) => {
    if (streak < 3) return "from-gray-400 to-gray-600";
    if (streak < 7) return "from-orange-400 to-orange-600";
    if (streak < 14) return "from-red-400 to-red-600";
    return "from-purple-400 to-purple-600";
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={currentStreak > 0 ? {
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getStreakGradient(currentStreak)} flex items-center justify-center`}>
                <Flame className={`h-6 w-6 text-white`} />
              </div>
            </motion.div>
            <div>
              <p className="text-xs text-neutral-500">Current Streak</p>
              <p className={`text-2xl font-bold ${getStreakColor(currentStreak)}`}>
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-neutral-500">Longest Streak</p>
            <p className="text-lg font-semibold text-neutral-700">
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>
        
        {currentStreak > 0 && (
          <div className="mt-3 p-2 bg-gradient-to-r from-[#08ABAB]/10 to-transparent rounded-lg">
            <p className="text-xs text-neutral-600">
              {currentStreak === 1 && "Great start! Come back tomorrow to keep your streak going."}
              {currentStreak >= 2 && currentStreak < 7 && "You're on a roll! Keep it up!"}
              {currentStreak >= 7 && currentStreak < 14 && "Amazing! You're building a great habit!"}
              {currentStreak >= 14 && "Incredible dedication! You're a sustainability champion!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
