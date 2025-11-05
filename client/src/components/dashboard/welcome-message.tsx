import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

interface WelcomeMessageProps {
  userName: string;
  totalImpact: number;
}

export function WelcomeMessage({ userName, totalImpact }: WelcomeMessageProps) {
  const messages = [
    `Welcome back, ${userName} — your impact is lighting up the planet.`,
    `Hello ${userName} — together we're creating a greener future.`,
    `Welcome ${userName} — every action counts toward a sustainable tomorrow.`,
    `Hi ${userName} — your eco-journey is making a real difference.`
  ];

  const message = messages[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % messages.length];

  return (
    <motion.div
      className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-teal-500/10 backdrop-blur-xl rounded-full px-8 py-4 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Leaf className="h-5 w-5 text-emerald-400" />
          </motion.div>
          
          <motion.p
            className="text-white/90 font-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {message}
          </motion.p>

          {totalImpact > 0 && (
            <motion.div
              className="ml-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              <span className="text-emerald-300 text-sm font-semibold">
                {totalImpact.toLocaleString()} kg CO₂ saved
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
