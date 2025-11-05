import { motion } from "framer-motion";
import { Target, CheckCircle, Trophy } from "lucide-react";
import { useState } from "react";

interface EcoChallengeProps {
  userName: string;
}

export function EcoChallenge({ userName }: EcoChallengeProps) {
  const [completed, setCompleted] = useState(false);

  // Daily rotating challenges
  const challenges = [
    {
      title: "Share Your Impact",
      description: "Share your sustainability journey on social media",
      xp: 50,
      icon: Trophy
    },
    {
      title: "Learn More",
      description: "Read a case study about our environmental projects",
      xp: 30,
      icon: Target
    },
    {
      title: "Track Progress",
      description: "Check your order status and environmental savings",
      xp: 25,
      icon: CheckCircle
    }
  ];

  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % challenges.length;
  const challenge = challenges[dayIndex];
  const ChallengeIcon = challenge.icon;

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <motion.div
        className="bg-gradient-to-br from-gold-400/10 to-amber-600/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-amber-400/30 shadow-2xl min-w-[400px]"
        animate={{
          boxShadow: [
            '0 0 20px rgba(251, 191, 36, 0.2)',
            '0 0 30px rgba(251, 191, 36, 0.3)',
            '0 0 20px rgba(251, 191, 36, 0.2)'
          ]
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="p-3 rounded-xl bg-amber-400/20 border border-amber-400/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ChallengeIcon className="h-6 w-6 text-amber-400" />
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-white/90 font-semibold">Daily Eco Challenge</h4>
              <span className="text-amber-400 text-sm font-medium">+{challenge.xp} XP</span>
            </div>
            
            <p className="text-white/70 text-sm mb-3">{challenge.description}</p>

            <motion.button
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${completed 
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30' 
                  : 'bg-amber-500/30 text-amber-300 border border-amber-400/30 hover:bg-amber-500/40'
                }
              `}
              onClick={() => setCompleted(true)}
              disabled={completed}
              whileHover={!completed ? { scale: 1.05 } : {}}
              whileTap={!completed ? { scale: 0.95 } : {}}
              data-testid="button-complete-challenge"
            >
              {completed ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              ) : (
                'Complete Challenge'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
