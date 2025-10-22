import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LevelBadgeProps {
  level: number;
  experiencePoints: number;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, experiencePoints, showProgress = false, size = "md" }: LevelBadgeProps) {
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const progressInCurrentLevel = experiencePoints - xpForCurrentLevel;
  const progressPercentage = (progressInCurrentLevel / 1000) * 100;

  const sizeClasses = {
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-sm",
    lg: "h-20 w-20 text-lg",
  };

  const getLevelColor = (lvl: number) => {
    if (lvl < 5) return "from-gray-400 to-gray-600";
    if (lvl < 10) return "from-green-400 to-green-600";
    if (lvl < 20) return "from-blue-400 to-blue-600";
    if (lvl < 30) return "from-purple-400 to-purple-600";
    return "from-yellow-400 to-yellow-600";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="relative inline-flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}
          >
            {level}
          </div>
          {showProgress && (
            <svg className="absolute -inset-1" style={{ transform: "rotate(-90deg)" }}>
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="48%"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-[#08ABAB]"
                strokeDasharray={`${progressPercentage} ${100 - progressPercentage}`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${progressPercentage} ${100 - progressPercentage}` }}
                transition={{ duration: 1 }}
              />
            </svg>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-semibold">Level {level}</p>
          <p className="text-xs text-neutral-600">
            {progressInCurrentLevel} / 1000 XP
          </p>
          <p className="text-xs text-neutral-500">
            {1000 - progressInCurrentLevel} XP to level {level + 1}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
