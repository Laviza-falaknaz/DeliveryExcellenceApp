import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Sparkles, Droplet, Users, TrendingUp, Leaf } from "lucide-react";

interface EcosystemProps {
  level: number;
  xp: number;
  streak: number;
  achievements: number;
  carbonSaved: number;
  waterProvided: number;
  familiesHelped: number;
  onTreeClick: () => void;
  onFlowerClick: () => void;
  onButterflyClick: () => void;
  onImpactClick: () => void;
}

export function LivingEcosystem({
  level,
  xp,
  streak,
  achievements,
  carbonSaved,
  waterProvided,
  familiesHelped,
  onTreeClick,
  onFlowerClick,
  onButterflyClick,
  onImpactClick
}: EcosystemProps) {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Calculate visual properties based on progress
  const treeHeight = Math.min(40 + (level * 8), 80); // Tree grows from 40% to 80% height
  const treeWidth = Math.min(20 + (level * 3), 45); // Tree expands width
  const backgroundBrightness = Math.min(50 + (carbonSaved / 10), 100); // Brightens with impact
  const flowerCount = Math.min(achievements, 12); // Max 12 visible flowers
  const butterflyCount = Math.min(Math.floor(streak / 2), 8); // 1 butterfly per 2 days streak

  // Tree layers for depth
  const treeGrowth = (level / 10) * 100; // Percentage of full growth

  // Memoize all random values to prevent re-calculation on re-render
  const grassBlades = useMemo(() => 
    Array.from({ length: 30 }).map(() => ({
      height: Math.random() * 40 + 20,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2
    })), []
  );

  const treeLeaves = useMemo(() => 
    Array.from({ length: Math.max(Math.floor(treeGrowth / 10), 0) }).map(() => ({
      top: Math.random() * 80,
      left: Math.random() * 80 + 10,
      delay: Math.random() * 3
    })), [treeGrowth]
  );

  const sparkles = useMemo(() => 
    Array.from({ length: 5 }).map(() => ({
      top: 20 + Math.random() * 40,
      left: Math.random() * 100
    })), []
  );

  const flowerPositions = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      position: (i / 12) * 100
    })), []
  );

  const butterflyPaths = useMemo(() => 
    Array.from({ length: 8 }).map(() => ({
      startLeft: Math.random() * 80 + 10,
      startTop: Math.random() * 40 + 10,
      pathX: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
      pathY: [Math.random() * 200 + 100, Math.random() * 200 + 100, Math.random() * 200 + 100],
      duration: 15 + Math.random() * 10
    })), []
  );

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200" style={{ filter: `brightness(${backgroundBrightness}%)` }}>
      
      {/* Animated Sky Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-blue-300/30 via-transparent to-transparent"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Clouds */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl"
        animate={{ x: [0, 100, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 right-20 w-40 h-20 bg-white/30 rounded-full blur-xl"
        animate={{ x: [0, -80, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ground Layer */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-600/30 via-emerald-400/20 to-transparent" />
      
      {/* Grass Details */}
      <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-around opacity-40">
        {grassBlades.map((blade, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-emerald-700 to-emerald-500"
            style={{ height: `${blade.height}px` }}
            animate={{ scaleY: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
            transition={{ duration: blade.duration, repeat: Infinity, delay: blade.delay }}
          />
        ))}
      </div>

      {/* Central Tree - Interactive */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 cursor-pointer"
        style={{ width: `${treeWidth}%`, height: `${treeHeight}%` }}
        onClick={onTreeClick}
        onHoverStart={() => setHoveredElement('tree')}
        onHoverEnd={() => setHoveredElement(null)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Tree Trunk */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/5 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-xl"
          style={{ height: '40%' }}
          animate={{ scaleY: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Tree Canopy - Multiple Layers */}
        <motion.div
          className="absolute bottom-[35%] left-1/2 -translate-x-1/2 w-full"
          animate={{ rotate: [0, 1, -1, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          {/* Back layer */}
          <div className="absolute w-[90%] h-[90%] left-[5%] top-[10%] bg-emerald-600/60 rounded-full blur-sm" 
               style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
          
          {/* Middle layer */}
          <motion.div
            className="absolute w-[85%] h-[85%] left-[7.5%] top-[5%] bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Front layer with leaves */}
          <motion.div
            className="absolute w-[80%] h-[80%] left-[10%] bg-gradient-to-b from-emerald-400 to-emerald-500"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
          >
            {/* Leaf details */}
            {treeLeaves.map((leaf, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-emerald-300 rounded-full"
                style={{
                  top: `${leaf.top}%`,
                  left: `${leaf.left}%`
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, delay: leaf.delay }}
              />
            ))}
          </motion.div>

          {/* Glow effect when hovered */}
          <AnimatePresence>
            {hoveredElement === 'tree' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-emerald-400/30 rounded-full blur-2xl"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* XP Sparkles around tree */}
        {xp > 0 && sparkles.map((sparkle, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              top: `${sparkle.top}%`,
              left: `${sparkle.left}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Achievement Flowers */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        {Array.from({ length: flowerCount }).map((_, i) => {
          const colors = [
            'from-pink-400 to-pink-600',
            'from-purple-400 to-purple-600',
            'from-blue-400 to-blue-600',
            'from-yellow-400 to-yellow-600',
            'from-red-400 to-red-600',
            'from-indigo-400 to-indigo-600'
          ];
          const color = colors[i % colors.length];

          return (
            <motion.div
              key={`flower-${i}`}
              className="absolute bottom-16 cursor-pointer"
              style={{ left: `${flowerPositions[i].position}%` }}
              onClick={onFlowerClick}
              onHoverStart={() => setHoveredElement(`flower-${i}`)}
              onHoverEnd={() => setHoveredElement(null)}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.2, type: "spring" }}
              whileHover={{ scale: 1.3, y: -10 }}
            >
              {/* Stem */}
              <div className="w-0.5 h-12 bg-green-600 mx-auto" />
              
              {/* Flower Head */}
              <div className="relative -mt-2">
                {/* Petals */}
                {Array.from({ length: 6 }).map((_, p) => (
                  <motion.div
                    key={p}
                    className={`absolute w-4 h-6 bg-gradient-to-t ${color} rounded-full`}
                    style={{
                      transformOrigin: 'bottom center',
                      rotate: `${p * 60}deg`,
                      left: '50%',
                      top: '50%',
                      marginLeft: '-8px',
                      marginTop: '-12px'
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: p * 0.2 }}
                  />
                ))}
                
                {/* Center */}
                <div className="absolute w-3 h-3 bg-yellow-400 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                
                {/* Glow */}
                <AnimatePresence>
                  {hoveredElement === `flower-${i}` && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.8, scale: 2 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={`absolute inset-0 bg-gradient-to-t ${color} rounded-full blur-xl`}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Butterflies for Streak */}
      {Array.from({ length: butterflyCount }).map((_, i) => {
        const path = butterflyPaths[i];
        return (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute cursor-pointer"
            onClick={onButterflyClick}
            onHoverStart={() => setHoveredElement(`butterfly-${i}`)}
            onHoverEnd={() => setHoveredElement(null)}
            animate={{
              x: path.pathX,
              y: path.pathY
            }}
            transition={{
              duration: path.duration,
              repeat: Infinity,
              delay: i * 2
            }}
            style={{
              left: `${path.startLeft}%`,
              top: `${path.startTop}%`
            }}
          >
            {/* Simple butterfly shape */}
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="flex gap-0.5"
              >
                <div className="w-4 h-5 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full transform -rotate-45" />
                <div className="w-4 h-5 bg-gradient-to-bl from-orange-400 to-pink-500 rounded-full transform rotate-45" />
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-gray-800" />
            </div>
          </motion.div>
        );
      })}

      {/* Impact River/Water - Bottom interactive area */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-400/40 to-transparent cursor-pointer"
        onClick={onImpactClick}
        onHoverStart={() => setHoveredElement('impact')}
        onHoverEnd={() => setHoveredElement(null)}
        whileHover={{ height: 100 }}
      >
        {/* Water ripple effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-full"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Impact indicators when hovered */}
        <AnimatePresence>
          {hoveredElement === 'impact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-gray-600">CO₂ Saved</p>
                    <p className="font-bold text-green-600">{carbonSaved} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-gray-600">Water</p>
                    <p className="font-bold text-blue-600">{waterProvided} L</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-gray-600">Families</p>
                    <p className="font-bold text-purple-600">{familiesHelped}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sun - grows brighter with impact */}
      <motion.div
        className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ opacity: Math.min(0.5 + (carbonSaved / 200), 1) }}
      >
        <div className="absolute inset-0 bg-yellow-200/50 rounded-full blur-xl" />
      </motion.div>
    </div>
  );
}
