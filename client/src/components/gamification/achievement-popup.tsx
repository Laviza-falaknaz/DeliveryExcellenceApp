import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Confetti } from "./confetti";
import { useState, useEffect } from "react";

interface AchievementPopupProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    category: string;
    icon: string;
    badgeColor: string;
    points: number;
  } | null;
  onClose: () => void;
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  return (
    <>
      <Confetti active={showConfetti} />
      <AnimatePresence>
        {achievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md w-full p-6 relative overflow-hidden bg-gradient-to-br from-white to-gray-50">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br opacity-10"
                  style={{ background: `linear-gradient(135deg, ${achievement.badgeColor} 0%, transparent 50%)` }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 z-10"
                  data-testid="close-achievement-popup"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center relative z-10">
                  <motion.div
                    className="mb-4 inline-flex items-center justify-center"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div
                      className="h-24 w-24 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl"
                      style={{ backgroundColor: achievement.badgeColor }}
                    >
                      <i className={achievement.icon}></i>
                    </div>
                  </motion.div>

                  <motion.h2
                    className="text-2xl font-bold mb-2 text-neutral-900"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Achievement Unlocked!
                  </motion.h2>

                  <motion.h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: achievement.badgeColor }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {achievement.name}
                  </motion.h3>

                  <motion.p
                    className="text-neutral-600 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {achievement.description}
                  </motion.p>

                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Badge variant="secondary" className="capitalize">
                      {achievement.category}
                    </Badge>
                    <Badge className="bg-[#08ABAB] hover:bg-[#08ABAB]/90">
                      +{achievement.points} XP
                    </Badge>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
