import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface ExperienceBarProps {
  current: number;
  total: number;
  level: number;
  showLabel?: boolean;
  className?: string;
}

export function ExperienceBar({ current, total, level, showLabel = true, className = "" }: ExperienceBarProps) {
  const percentage = (current / total) * 100;
  const remaining = total - current;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">
            Level {level}
          </span>
          <span className="text-xs text-neutral-500">
            {current} / {total} XP
          </span>
        </div>
      )}
      <div className="relative">
        <Progress value={percentage} className="h-3" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 pointer-events-none"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: "50%",
          }}
        />
      </div>
      {showLabel && remaining > 0 && (
        <p className="text-xs text-neutral-500 mt-1">
          {remaining} XP until level {level + 1}
        </p>
      )}
    </div>
  );
}
