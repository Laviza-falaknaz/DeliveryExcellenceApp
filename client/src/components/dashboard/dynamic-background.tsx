import { motion } from "framer-motion";

interface DynamicBackgroundProps {
  progress: number; // 0-100 based on user's overall progress
}

export function DynamicBackground({ progress }: DynamicBackgroundProps) {
  // Background shifts from dark forest green to bright sunrise gold
  const darkColor = { h: 158, s: 64, l: 12 }; // Dark teal/forest green
  const lightColor = { h: 43, s: 96, l: 56 }; // Sunrise gold
  
  const interpolate = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const factor = Math.min(progress / 100, 1);
  const currentH = interpolate(darkColor.h, lightColor.h, factor);
  const currentS = interpolate(darkColor.s, lightColor.s, factor);
  const currentL = interpolate(darkColor.l, lightColor.l, factor);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsl(${currentH}, ${currentS}%, ${currentL}%) 0%, 
            hsl(${currentH + 20}, ${currentS - 10}%, ${currentL + 8}%) 50%, 
            hsl(${currentH - 15}, ${currentS - 5}%, ${currentL + 5}%) 100%)`
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Ambient light particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
              y: [0, -100]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Floating light orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-emerald-400/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-cyan-400/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1.2, 1, 1.2]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle grid overlay for depth */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
