import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { Sparkles, Award, Package, Droplet } from "lucide-react";

interface EcoTreeProps {
  xp: number;
  achievements: number;
  completedOrders: number;
  familiesHelped: number;
  currentStreak: number;
}

export default function EcoTree({ xp, achievements, completedOrders, familiesHelped, currentStreak }: EcoTreeProps) {
  // Calculate tree stage based on XP
  const getTreeStage = () => {
    if (xp >= 800) return 'grand';
    if (xp >= 400) return 'mature';
    if (xp >= 200) return 'young';
    return 'seedling';
  };

  const stage = getTreeStage();
  const leafCount = Math.min(xp * 2, 2000); // 2 leaves per XP, max 2000 for visual reasons
  const flowerCount = achievements;
  const fruitCount = completedOrders;
  const waterDropCount = familiesHelped;

  // Tree colors based on stage
  const treeColors = {
    seedling: { trunk: '#8B4513', leaves: '#90EE90' },
    young: { trunk: '#654321', leaves: '#32CD32' },
    mature: { trunk: '#5C4033', leaves: '#228B22' },
    grand: { trunk: '#3E2723', leaves: '#006400' }
  };

  const colors = treeColors[stage];

  // Butterfly animation (appears based on streak)
  const butterflyCount = Math.min(Math.floor(currentStreak / 3), 5);

  // Generate leaf positions (spread across canopy)
  const generateLeafPositions = (count: number) => {
    const positions = [];
    const maxDisplay = Math.min(count, 100); // Display max 100 leaves visually
    for (let i = 0; i < maxDisplay; i++) {
      const angle = (i / maxDisplay) * Math.PI * 2;
      const radius = 40 + Math.random() * 60;
      const x = 150 + Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
      const y = 80 + Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 20;
      positions.push({ x, y, delay: i * 0.02 });
    }
    return positions;
  };

  const leafPositions = generateLeafPositions(leafCount);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-green-50 rounded-2xl overflow-hidden border-2 border-green-200 shadow-lg">
      {/* Sky with clouds */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-20 h-10 bg-white/40 rounded-full blur-sm"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-20 right-20 w-24 h-12 bg-white/30 rounded-full blur-sm"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-200 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-300 to-transparent" />

      {/* SVG Tree */}
      <svg viewBox="0 0 300 400" className="w-full h-full">
        <defs>
          {/* Gradient for trunk */}
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.trunk} stopOpacity="0.8" />
            <stop offset="50%" stopColor={colors.trunk} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.trunk} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Tree Trunk - different sizes based on stage */}
        {stage === 'seedling' && (
          <motion.rect
            x="145"
            y="300"
            width="10"
            height="60"
            fill="url(#trunkGradient)"
            rx="2"
            initial={{ height: 0, y: 360 }}
            animate={{ height: 60, y: 300 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}

        {stage === 'young' && (
          <>
            <motion.rect
              x="140"
              y="250"
              width="20"
              height="120"
              fill="url(#trunkGradient)"
              rx="4"
              initial={{ height: 0, y: 370 }}
              animate={{ height: 120, y: 250 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Small branches */}
            <motion.line x1="150" y1="280" x2="120" y2="260" stroke={colors.trunk} strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
            <motion.line x1="150" y1="280" x2="180" y2="260" stroke={colors.trunk} strokeWidth="4" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
          </>
        )}

        {(stage === 'mature' || stage === 'grand') && (
          <>
            <motion.rect
              x="135"
              y="200"
              width="30"
              height="170"
              fill="url(#trunkGradient)"
              rx="6"
              initial={{ height: 0, y: 370 }}
              animate={{ height: 170, y: 200 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {/* Main branches */}
            <motion.line x1="150" y1="230" x2="100" y2="180" stroke={colors.trunk} strokeWidth="8" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
            <motion.line x1="150" y1="230" x2="200" y2="180" stroke={colors.trunk} strokeWidth="8" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.4 }} />
            <motion.line x1="150" y1="260" x2="110" y2="220" stroke={colors.trunk} strokeWidth="6" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.6 }} />
            <motion.line x1="150" y1="260" x2="190" y2="220" stroke={colors.trunk} strokeWidth="6" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.6 }} />
          </>
        )}

        {/* Leaves - render as small circles with wind animation */}
        {leafPositions.map((pos, i) => (
          <motion.g key={`leaf-${i}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="3"
                    fill={colors.leaves}
                    opacity="0.8"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 0.8,
                      x: [0, Math.sin(i) * 2, 0],
                      y: [0, Math.cos(i) * 1, 0]
                    }}
                    transition={{ 
                      scale: { duration: 0.5, delay: pos.delay },
                      opacity: { duration: 0.5, delay: pos.delay },
                      x: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
                      y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }
                    }}
                    className="cursor-pointer hover:opacity-100"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> 2 leaves per XP earned!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.g>
        ))}

        {/* Flowers (Achievements) - positioned on upper branches */}
        {Array.from({ length: Math.min(flowerCount, 20) }).map((_, i) => {
          const angle = (i / flowerCount) * Math.PI;
          const x = 150 + Math.cos(angle) * 50;
          const y = 120 + Math.sin(angle) * 30;
          return (
            <TooltipProvider key={`flower-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/achievements">
                    <motion.g
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1 + i * 0.1 }}
                      whileHover={{ scale: 1.3 }}
                      className="cursor-pointer"
                    >
                      <circle cx={x} cy={y} r="6" fill="#FF69B4" />
                      <circle cx={x} cy={y} r="3" fill="#FFD700" />
                    </motion.g>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1"><Award className="h-3 w-3" /> Achievement unlocked!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Fruits (Completed Orders) - positioned on mid-branches */}
        {Array.from({ length: Math.min(fruitCount, 15) }).map((_, i) => {
          const angle = (i / fruitCount) * Math.PI * 1.5;
          const x = 150 + Math.cos(angle + 0.5) * 60;
          const y = 150 + Math.sin(angle) * 40;
          return (
            <TooltipProvider key={`fruit-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/orders">
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#DC143C"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.5 + i * 0.15 }}
                      whileHover={{ scale: 1.4 }}
                      className="cursor-pointer"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1"><Package className="h-3 w-3" /> Completed order</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Water Drops (Families Helped) - positioned near ground */}
        {Array.from({ length: Math.min(waterDropCount, 10) }).map((_, i) => {
          const x = 120 + i * 15;
          return (
            <TooltipProvider key={`water-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/impact">
                    <motion.g
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 2 + i * 0.2 }}
                      whileHover={{ scale: 1.3 }}
                      className="cursor-pointer"
                    >
                      <ellipse cx={x} cy="340" rx="4" ry="6" fill="#4169E1" opacity="0.8" />
                      <circle cx={x} cy="336" r="1.5" fill="#87CEEB" />
                    </motion.g>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1"><Droplet className="h-3 w-3" /> Family helped with clean water!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {/* Butterflies (based on streak) */}
        {Array.from({ length: butterflyCount }).map((_, i) => {
          const startX = 50 + i * 50;
          const startY = 100 + i * 30;
          return (
            <TooltipProvider key={`butterfly-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.g
                    animate={{
                      x: [0, 40, -20, 0],
                      y: [0, -30, 20, 0],
                    }}
                    transition={{
                      duration: 6 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5
                    }}
                  >
                    {/* Simple butterfly shape */}
                    <ellipse cx={startX} cy={startY} rx="6" ry="4" fill="#FF1493" opacity="0.7" transform={`rotate(-30 ${startX} ${startY})`} />
                    <ellipse cx={startX + 3} cy={startY} rx="6" ry="4" fill="#FF69B4" opacity="0.7" transform={`rotate(30 ${startX + 3} ${startY})`} />
                    <line x1={startX + 1.5} y1={startY - 4} x2={startX + 1.5} y2={startY + 4} stroke="#8B4513" strokeWidth="1" />
                  </motion.g>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {currentStreak} day streak!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </svg>

      {/* Tree Stats Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-green-200">
        <div className="text-center mb-2">
          <h3 className="font-bold text-sm text-neutral-800">
            {stage === 'seedling' && '🌱 Seedling'}
            {stage === 'young' && '🌿 Young Tree'}
            {stage === 'mature' && '🌳 Mature Tree'}
            {stage === 'grand' && '🏆 Grand Tree'}
          </h3>
          <p className="text-xs text-neutral-600">{xp} XP earned</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-green-600">{leafCount.toLocaleString()}</div>
            <div className="text-neutral-600">Leaves</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-pink-600">{flowerCount}</div>
            <div className="text-neutral-600">Flowers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-red-600">{fruitCount}</div>
            <div className="text-neutral-600">Fruits</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">{waterDropCount}</div>
            <div className="text-neutral-600">Water Drops</div>
          </div>
        </div>
      </div>
    </div>
  );
}
