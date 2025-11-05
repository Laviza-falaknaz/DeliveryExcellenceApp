import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DeliveryTimeline } from "@shared/schema";
import { Package, Truck, Building2, FileText, CreditCard, CheckCircle2, Leaf, Droplet, Recycle, Trophy, Star, Zap } from "lucide-react";

interface OrderJourneyProps {
  timeline: DeliveryTimeline | null;
  environmentalImpact?: {
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
  };
}

interface JourneyStage {
  id: string;
  label: string;
  date: Date | null;
  icon: any;
  landmarkColor: string;
  achievementBadge: string;
  environmentalBoost: string;
  position: number; // 0-100 for path positioning
}

// Particle Effect Component
function ParticleEffect({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: color, top: "50%", left: "50%" }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / 8) * Math.PI * 2) * 60,
            y: Math.sin((i / 8) * Math.PI * 2) * 60,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
}

// Achievement Badge Component
function AchievementBadge({ label, icon, unlocked, color }: { label: string; icon: any; unlocked: boolean; color: string }) {
  const Icon = icon;
  
  if (!unlocked) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-200 text-neutral-400 text-xs">
        <div className="w-4 h-4 rounded-full bg-neutral-300 flex items-center justify-center">
          <div className="w-2 h-2 bg-neutral-400 rounded-full" />
        </div>
        <span>Locked</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="flex items-center gap-2 px-3 py-2 rounded-full text-white text-xs font-medium shadow-lg"
      style={{ backgroundColor: color }}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Icon className="w-4 h-4" />
      </motion.div>
      <span>{label}</span>
    </motion.div>
  );
}

// Isometric Landmark Component
function IsometricLandmark({ stage, isCompleted, isCurrent }: { stage: JourneyStage; isCompleted: boolean; isCurrent: boolean }) {
  const Icon = stage.icon;
  
  return (
    <div className="relative">
      {/* Particles for completed stages */}
      {isCompleted && <ParticleEffect color={stage.landmarkColor} />}
      
      {/* Main Landmark Building */}
      <motion.div
        className="relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Building Shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-md"
          style={{ backgroundColor: isCompleted || isCurrent ? stage.landmarkColor : "#d1d5db", opacity: 0.4 }}
        />
        
        {/* Isometric Building */}
        <svg width="100" height="120" viewBox="0 0 100 120" className="relative z-10">
          {/* Building Base (Front Face) */}
          <motion.path
            d="M20 80 L50 60 L80 80 L80 110 L50 130 L20 110 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#e5e7eb"}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: isCompleted || isCurrent ? 1 : 0.3 }}
          />
          
          {/* Building Left Face */}
          <motion.path
            d="M20 80 L50 60 L50 90 L20 110 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#d1d5db"}
            style={{ opacity: 0.7 }}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: isCompleted || isCurrent ? 0.7 : 0.2 }}
          />
          
          {/* Building Right Face */}
          <motion.path
            d="M50 60 L80 80 L80 110 L50 90 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#9ca3af"}
            style={{ opacity: 0.5 }}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: isCompleted || isCurrent ? 0.5 : 0.15 }}
          />
          
          {/* Building Top (Roof) */}
          <motion.path
            d="M50 40 L70 50 L50 60 L30 50 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#d1d5db"}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isCompleted || isCurrent ? 0.9 : 0.4 }}
          />
          
          {/* Roof Connection to Building */}
          <path
            d="M30 50 L50 40 L50 60 L30 70 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#9ca3af"}
            style={{ opacity: 0.6 }}
          />
          <path
            d="M50 40 L70 50 L70 70 L50 60 Z"
            fill={isCompleted || isCurrent ? stage.landmarkColor : "#6b7280"}
            style={{ opacity: 0.4 }}
          />
          
          {/* Icon on Building */}
          <foreignObject x="35" y="75" width="30" height="30">
            <div className="w-full h-full flex items-center justify-center">
              <Icon 
                className={`w-6 h-6 ${isCompleted || isCurrent ? "text-white" : "text-neutral-400"}`}
                strokeWidth={2.5}
              />
            </div>
          </foreignObject>
          
          {/* Pulsing Ring for Current Stage */}
          {isCurrent && (
            <>
              <motion.circle
                cx="50"
                cy="90"
                r="45"
                fill="none"
                stroke={stage.landmarkColor}
                strokeWidth="2"
                animate={{ r: [40, 50], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.circle
                cx="50"
                cy="90"
                r="45"
                fill="none"
                stroke={stage.landmarkColor}
                strokeWidth="2"
                animate={{ r: [40, 50], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </svg>
        
        {/* Completion Checkmark */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Animated Delivery Vehicle
function DeliveryVehicle({ progress, isMoving }: { progress: number; isMoving: boolean }) {
  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 z-20"
      style={{ left: `${progress}%` }}
      animate={isMoving ? { x: [0, 3, 0] } : {}}
      transition={isMoving ? { duration: 0.5, repeat: Infinity } : {}}
    >
      <svg width="60" height="40" viewBox="0 0 60 40" className="drop-shadow-xl">
        {/* Truck Body */}
        <rect x="15" y="10" width="30" height="18" rx="2" fill="#10b981" />
        <rect x="45" y="12" width="10" height="14" rx="1" fill="#059669" />
        
        {/* Windshield */}
        <path d="M47 13 L52 13 L52 22 L47 22" fill="#d1fae5" opacity="0.7" />
        
        {/* Cargo Box */}
        <rect x="18" y="12" width="24" height="14" fill="#047857" opacity="0.3" />
        
        {/* Package Icon */}
        <rect x="26" y="16" width="8" height="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.5" />
        
        {/* Wheels */}
        <motion.circle
          cx="25"
          cy="30"
          r="5"
          fill="#1f2937"
          animate={isMoving ? { rotate: 360 } : {}}
          transition={isMoving ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        />
        <circle cx="25" cy="30" r="3" fill="#6b7280" />
        
        <motion.circle
          cx="50"
          cy="30"
          r="5"
          fill="#1f2937"
          animate={isMoving ? { rotate: 360 } : {}}
          transition={isMoving ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        />
        <circle cx="50" cy="30" r="3" fill="#6b7280" />
        
        {/* Motion Lines */}
        {isMoving && (
          <>
            <motion.line
              x1="5"
              y1="15"
              x2="12"
              y2="15"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ x1: [5, -5], x2: [12, 2], opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.line
              x1="5"
              y1="20"
              x2="12"
              y2="20"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ x1: [5, -5], x2: [12, 2], opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
          </>
        )}
      </svg>
      
      {/* Exhaust Puff */}
      {isMoving && (
        <motion.div
          className="absolute -left-4 top-1/2 w-3 h-3 rounded-full bg-neutral-300"
          animate={{
            x: [-10, -20],
            y: [-5, -15],
            scale: [0.5, 1.5],
            opacity: [0.6, 0]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

export default function OrderJourney({ timeline, environmentalImpact }: OrderJourneyProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const stages: JourneyStage[] = [
    {
      id: "orderConfirmed",
      label: "Order Confirmed",
      date: timeline?.orderDate || null,
      icon: Package,
      landmarkColor: "#8b5cf6",
      achievementBadge: "Order Placed",
      environmentalBoost: "+5 Impact Points",
      position: 5
    },
    {
      id: "sentToWarehouse",
      label: "Warehouse Processing",
      date: timeline?.sentToWarehouse || null,
      icon: Building2,
      landmarkColor: "#3b82f6",
      achievementBadge: "Ready to Ship",
      environmentalBoost: "+10 Impact Points",
      position: 25
    },
    {
      id: "dispatched",
      label: "En Route",
      date: timeline?.dispatchDate || null,
      icon: Truck,
      landmarkColor: "#06b6d4",
      achievementBadge: "On the Move",
      environmentalBoost: "+15 Impact Points",
      position: 45
    },
    {
      id: "invoiceSent",
      label: "Invoice Sent",
      date: timeline?.invoiceMailed || null,
      icon: FileText,
      landmarkColor: "#f59e0b",
      achievementBadge: "Paperwork Done",
      environmentalBoost: "+5 Impact Points",
      position: 65
    },
    {
      id: "paymentConfirmed",
      label: "Payment Confirmed",
      date: timeline?.paymentDate || null,
      icon: CreditCard,
      landmarkColor: "#ec4899",
      achievementBadge: "All Set",
      environmentalBoost: "+10 Impact Points",
      position: 82
    },
    {
      id: "fulfilled",
      label: "Delivered",
      date: timeline?.dateFulfilled || null,
      icon: CheckCircle2,
      landmarkColor: "#10b981",
      achievementBadge: "Journey Complete",
      environmentalBoost: "+25 Impact Points",
      position: 95
    }
  ];

  const completedStages = stages.filter(stage => stage.date !== null);
  const currentStageIndex = completedStages.length;
  const currentStage = stages[currentStageIndex];
  const overallProgress = (completedStages.length / stages.length) * 100;
  const vehiclePosition = completedStages.length > 0 
    ? stages[completedStages.length - 1].position 
    : 0;

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const totalImpactPoints = completedStages.length * 10;
  const isComplete = completedStages.length === stages.length;

  return (
    <div className="py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold mb-3"
        >
          <Trophy className="w-5 h-5" />
          <span>Journey Progress: {Math.round(overallProgress)}%</span>
          <Star className="w-5 h-5" />
        </motion.div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your Sustainable Delivery Journey</h2>
        <p className="text-neutral-600">Track your device as it travels through our eco-friendly fulfillment process</p>
      </div>

      {/* Impact Points Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">{totalImpactPoints} Points</div>
              <div className="text-sm text-emerald-600">Environmental Impact Earned</div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Recycle className="w-8 h-8 text-emerald-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Journey Map Container */}
      <div className="relative max-w-6xl mx-auto bg-gradient-to-b from-sky-50 to-emerald-50 rounded-3xl p-8 shadow-xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#10b981" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Progress Bar Track */}
        <div className="relative h-2 bg-neutral-200 rounded-full mb-16 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ opacity: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-white"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{ width: "50%" }}
            />
          </motion.div>
        </div>

        {/* Journey Path with Landmarks */}
        <div className="relative h-64 mb-12">
          {/* Winding Path SVG */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset={`${overallProgress}%`} stopColor="#10b981" stopOpacity="1" />
                <stop offset={`${overallProgress}%`} stopColor="#d1d5db" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d1d5db" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Background Path */}
            <motion.path
              d="M 0 130 Q 150 80, 300 130 T 600 130 Q 750 80, 900 130 T 1200 130"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Active Path */}
            <motion.path
              d="M 0 130 Q 150 80, 300 130 T 600 130 Q 750 80, 900 130 T 1200 130"
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: overallProgress / 100 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          {/* Delivery Vehicle */}
          <DeliveryVehicle progress={vehiclePosition} isMoving={currentStageIndex < stages.length && currentStageIndex > 0} />

          {/* Landmarks */}
          {stages.map((stage, index) => {
            const isCompleted = stage.date !== null;
            const isCurrent = index === currentStageIndex;
            
            return (
              <motion.div
                key={stage.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${stage.position}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)"
                }}
                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
              >
                <IsometricLandmark stage={stage} isCompleted={isCompleted} isCurrent={isCurrent} />
              </motion.div>
            );
          })}
        </div>

        {/* Stage Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage, index) => {
            const isCompleted = stage.date !== null;
            const isCurrent = index === currentStageIndex;
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`
                  relative p-4 rounded-xl border-2 text-center transition-all
                  ${isCompleted ? "bg-white border-emerald-300 shadow-lg" :
                    isCurrent ? "bg-white border-teal-300 shadow-xl ring-4 ring-teal-100" :
                    "bg-neutral-50 border-neutral-200"}
                `}
              >
                {/* Stage Icon Badge */}
                <div className={`
                  w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
                  ${isCompleted ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                    isCurrent ? "bg-gradient-to-br from-teal-400 to-teal-600" :
                    "bg-neutral-200"}
                `}>
                  <Icon className={`w-6 h-6 ${isCompleted || isCurrent ? "text-white" : "text-neutral-400"}`} />
                </div>

                {/* Stage Label */}
                <h4 className={`
                  font-bold mb-2 text-sm
                  ${isCompleted ? "text-neutral-900" :
                    isCurrent ? "text-teal-700" :
                    "text-neutral-400"}
                `}>
                  {stage.label}
                </h4>

                {/* Achievement Badge */}
                <div className="mb-3">
                  <AchievementBadge
                    label={stage.achievementBadge}
                    icon={isCompleted ? Star : isCurrent ? Zap : Trophy}
                    unlocked={isCompleted || isCurrent}
                    color={stage.landmarkColor}
                  />
                </div>

                {/* Date */}
                {isCompleted && (
                  <div className="text-xs text-neutral-600 font-medium">
                    {formatDate(stage.date)}
                  </div>
                )}

                {/* Current Stage Indicator */}
                {isCurrent && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs text-teal-600 font-bold mt-2"
                  >
                    In Progress...
                  </motion.div>
                )}

                {/* Environmental Boost */}
                {(isCompleted || isCurrent) && (
                  <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {stage.environmentalBoost}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {isComplete && environmentalImpact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-12 text-white shadow-2xl">
              {/* Confetti Effect */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: ["#fbbf24", "#f59e0b", "#10b981", "#06b6d4"][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: -20
                    }}
                    animate={{
                      y: [0, 600],
                      rotate: [0, 360],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-7xl mb-6"
                >
                  🎉
                </motion.div>
                <h3 className="text-4xl font-bold mb-4">Journey Complete!</h3>
                <p className="text-xl mb-8 text-white/90">You've completed your sustainable delivery journey</p>

                <div className="grid grid-cols-3 gap-6 bg-white/20 backdrop-blur-lg rounded-2xl p-8">
                  <div className="text-center">
                    <Leaf className="w-8 h-8 mx-auto mb-3" />
                    <div className="text-4xl font-bold mb-2">{environmentalImpact.carbonSaved.toFixed(1)}kg</div>
                    <div className="text-white/90 text-sm">CO₂ Saved</div>
                  </div>
                  <div className="text-center border-x border-white/30">
                    <Droplet className="w-8 h-8 mx-auto mb-3" />
                    <div className="text-4xl font-bold mb-2">{environmentalImpact.waterProvided.toLocaleString()}L</div>
                    <div className="text-white/90 text-sm">Water Provided</div>
                  </div>
                  <div className="text-center">
                    <Recycle className="w-8 h-8 mx-auto mb-3" />
                    <div className="text-4xl font-bold mb-2">{environmentalImpact.mineralsSaved.toFixed(1)}kg</div>
                    <div className="text-white/90 text-sm">Minerals Saved</div>
                  </div>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex items-center justify-center gap-3 text-lg"
                >
                  <Trophy className="w-6 h-6" />
                  <span className="font-semibold">Total Impact: {totalImpactPoints} Points Earned!</span>
                  <Star className="w-6 h-6" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
