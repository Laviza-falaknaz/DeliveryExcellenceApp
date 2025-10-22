import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Check } from "lucide-react";

interface AchievementCardProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    category: string;
    icon: string;
    badgeColor: string;
    points: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
}

export function AchievementCard({ achievement, unlocked, unlockedAt }: AchievementCardProps) {
  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.05 : 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`overflow-hidden ${unlocked ? "border-[#08ABAB] shadow-lg" : "opacity-60"}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              className={`h-14 w-14 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0 ${unlocked ? "shadow-lg" : "bg-gray-400"}`}
              style={unlocked ? { backgroundColor: achievement.badgeColor } : {}}
              animate={unlocked ? {
                boxShadow: [
                  `0 0 0 0 ${achievement.badgeColor}40`,
                  `0 0 0 10px ${achievement.badgeColor}00`,
                  `0 0 0 0 ${achievement.badgeColor}40`,
                ],
              } : {}}
              transition={unlocked ? {
                duration: 2,
                repeat: Infinity,
              } : {}}
            >
              {unlocked ? (
                <i className={achievement.icon}></i>
              ) : (
                <Lock className="h-6 w-6" />
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-neutral-900 truncate">
                  {achievement.name}
                </h4>
                {unlocked && (
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="capitalize text-xs">
                  {achievement.category}
                </Badge>
                <span className="text-xs font-medium text-[#08ABAB]">
                  {achievement.points} XP
                </span>
              </div>
              
              {unlocked && unlockedAt && (
                <p className="text-xs text-neutral-500 mt-2">
                  Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
