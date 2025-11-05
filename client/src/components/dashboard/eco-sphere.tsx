import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Sparkles, Droplet, Users, Wind, Zap } from "lucide-react";

interface EcoSphereProps {
  level: number;
  xp: number;
  streak: number;
  achievements: number;
  carbonSaved: number;
  waterProvided: number;
  familiesHelped: number;
  onSphereClick: () => void;
}

export function EcoSphere({
  level,
  xp,
  streak,
  achievements,
  carbonSaved,
  waterProvided,
  familiesHelped,
  onSphereClick
}: EcoSphereProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Calculate visual properties based on progress
  const sphereSize = Math.min(180 + (level * 15), 350); // Grows with level
  const glowIntensity = Math.min(0.3 + (carbonSaved / 1000), 0.9); // Glow increases with impact
  const energyFlowSpeed = Math.max(8 - (streak * 0.1), 2); // Faster with streak
  const particleCount = Math.min(Math.floor(carbonSaved / 100) + Math.floor(waterProvided / 500), 20);
  const crystalCount = Math.min(achievements, 8);

  // Memoize particle positions and paths
  const particles = useMemo(() => 
    Array.from({ length: 20 }).map((_, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 180 + Math.random() * 80;
      return {
        type: i % 3 === 0 ? 'butterfly' : i % 3 === 1 ? 'droplet' : 'spark',
        angle,
        radius,
        duration: 10 + Math.random() * 10,
        delay: i * 0.5
      };
    }), []
  );

  const crystals = useMemo(() => 
    Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return {
        angle,
        distance: 120 + Math.random() * 40,
        color: ['emerald', 'aquamarine', 'gold', 'teal'][i % 4],
        delay: i * 0.3
      };
    }), []
  );

  const energyBeams = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      length: 100 + Math.random() * 50,
      delay: i * 0.2
    })), []
  );

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* Central Eco-Sphere */}
      <motion.div
        className="relative cursor-pointer"
        style={{ width: sphereSize, height: sphereSize }}
        onClick={onSphereClick}
        onHoverStart={() => setHoveredElement('sphere')}
        onHoverEnd={() => setHoveredElement(null)}
        whileHover={{ scale: 1.05 }}
        animate={{ 
          scale: [1, 1.02, 1],
          rotate: [0, 360]
        }}
        transition={{ 
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" }
        }}
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-600/30 blur-3xl"
          style={{ opacity: glowIntensity }}
          animate={{ scale: [1, 1.2, 1], opacity: [glowIntensity, glowIntensity * 0.7, glowIntensity] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Middle glow layer */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-300/40 to-cyan-400/40 blur-2xl"
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Core sphere - glassmorphic */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-400/30 to-cyan-500/20 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          
          {/* Inner energy patterns */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.6) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.4) 0%, transparent 50%)'
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Floating particles inside sphere */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`inner-${i}`}
              className="absolute w-2 h-2 bg-white/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.4
              }}
            />
          ))}

          {/* Pulse effect when hovered */}
          <AnimatePresence>
            {hoveredElement === 'sphere' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-br from-emerald-400/40 to-cyan-400/40 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Level indicator at center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-white/90 font-bold text-4xl drop-shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level}
          </motion.div>
        </div>
      </motion.div>

      {/* Crystal blooms for achievements */}
      {Array.from({ length: crystalCount }).map((_, i) => {
        const crystal = crystals[i];
        const x = Math.cos(crystal.angle) * crystal.distance;
        const y = Math.sin(crystal.angle) * crystal.distance;
        const colorMap = {
          emerald: 'from-emerald-400 to-emerald-600',
          aquamarine: 'from-cyan-400 to-cyan-600',
          gold: 'from-yellow-400 to-amber-500',
          teal: 'from-teal-400 to-teal-600'
        };

        return (
          <motion.div
            key={`crystal-${i}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: x,
              marginTop: y
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1,
              rotate: 0,
              y: [0, -5, 0]
            }}
            transition={{
              scale: { delay: crystal.delay, duration: 0.6 },
              rotate: { delay: crystal.delay, duration: 0.6 },
              y: { duration: 2, repeat: Infinity, delay: crystal.delay }
            }}
          >
            <div className={`w-8 h-8 bg-gradient-to-br ${colorMap[crystal.color as keyof typeof colorMap]} rounded-lg transform rotate-45 shadow-lg`}>
              <div className="absolute inset-1 bg-white/30 rounded-sm" />
            </div>
          </motion.div>
        );
      })}

      {/* Energy beams for streak */}
      {streak > 0 && energyBeams.slice(0, Math.min(Math.floor(streak / 2), 12)).map((beam, i) => {
        const x1 = Math.cos(beam.angle) * 60;
        const y1 = Math.sin(beam.angle) * 60;
        const x2 = Math.cos(beam.angle) * (60 + beam.length);
        const y2 = Math.sin(beam.angle) * (60 + beam.length);

        return (
          <motion.div
            key={`beam-${i}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              width: 2,
              height: beam.length,
              transformOrigin: 'top',
              transform: `rotate(${beam.angle * (180 / Math.PI) + 90}deg)`,
              marginLeft: x1,
              marginTop: y1
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scaleY: [0, 1, 0]
            }}
            transition={{
              duration: energyFlowSpeed,
              repeat: Infinity,
              delay: beam.delay,
              ease: "easeOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-b from-cyan-400 via-emerald-400 to-transparent blur-sm" />
          </motion.div>
        );
      })}

      {/* Orbiting particles (butterflies, droplets, sparks) */}
      {particles.slice(0, particleCount).map((particle, i) => {
        const Icon = particle.type === 'butterfly' ? Wind : particle.type === 'droplet' ? Droplet : Sparkles;
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute"
            style={{
              left: '50%',
              top: '50%'
            }}
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay
            }}
          >
            <motion.div
              style={{
                marginLeft: Math.cos(particle.angle) * particle.radius,
                marginTop: Math.sin(particle.angle) * particle.radius
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon 
                className={`h-4 w-4 ${
                  particle.type === 'butterfly' ? 'text-pink-400' :
                  particle.type === 'droplet' ? 'text-blue-400' :
                  'text-yellow-400'
                }`}
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* XP Progress ring */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50%"
          cy="50%"
          r={sphereSize / 2 + 20}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3"
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r={sphereSize / 2 + 20}
          fill="none"
          stroke="url(#xp-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: (xp % 1000) / 1000 }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeDasharray={`${2 * Math.PI * (sphereSize / 2 + 20)}`}
        />
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
