import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DeliveryTimeline } from "@shared/schema";
import { Sparkles, Package, CreditCard, FileText, Warehouse, CheckCircle2, Truck, Home, Leaf } from "lucide-react";

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
  icon: typeof Sparkles;
  color: string;
  gradient: string;
  date: Date | null;
  description: string;
}

export default function OrderJourney({ timeline, environmentalImpact }: OrderJourneyProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const stages: JourneyStage[] = [
    {
      id: "orderPlaced",
      label: "Order Placed",
      icon: Sparkles,
      color: "from-emerald-400 to-teal-500",
      gradient: "bg-gradient-to-br from-emerald-400/20 to-teal-500/20",
      date: timeline?.orderDate || null,
      description: "Your eco-mission begins! Order successfully confirmed."
    },
    {
      id: "paymentConfirmed",
      label: "Payment Confirmed",
      icon: CreditCard,
      color: "from-teal-400 to-cyan-500",
      gradient: "bg-gradient-to-br from-teal-400/20 to-cyan-500/20",
      date: timeline?.paymentDate || null,
      description: "Payment processed securely. Funding the circular economy!"
    },
    {
      id: "invoiceSent",
      label: "Invoice Sent",
      icon: FileText,
      color: "from-cyan-400 to-blue-500",
      gradient: "bg-gradient-to-br from-cyan-400/20 to-blue-500/20",
      date: timeline?.invoiceMailed || null,
      description: "Digital invoice delivered. Paperless for the planet."
    },
    {
      id: "sentToWarehouse",
      label: "Sent to Warehouse",
      icon: Warehouse,
      color: "from-blue-400 to-indigo-500",
      gradient: "bg-gradient-to-br from-blue-400/20 to-indigo-500/20",
      date: timeline?.sentToWarehouse || null,
      description: "Order forwarded to our sustainable fulfillment center."
    },
    {
      id: "fulfilled",
      label: "Fulfilled",
      icon: CheckCircle2,
      color: "from-indigo-400 to-purple-500",
      gradient: "bg-gradient-to-br from-indigo-400/20 to-purple-500/20",
      date: timeline?.dateFulfilled || null,
      description: "Your remanufactured device is ready. Renewed and revived!"
    },
    {
      id: "dispatched",
      label: "Dispatched",
      icon: Truck,
      color: "from-purple-400 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-400/20 to-pink-500/20",
      date: timeline?.dispatchDate || null,
      description: "En route! Your device is on its sustainable journey to you."
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: Home,
      color: "from-pink-400 to-emerald-500",
      gradient: "bg-gradient-to-br from-pink-400/20 to-emerald-500/20",
      date: timeline?.orderCompleted || null,
      description: "Mission complete! Welcome to the circular computing revolution."
    }
  ];

  const completedStages = stages.filter(stage => stage.date !== null);
  const currentStageIndex = completedStages.length > 0 ? completedStages.length - 1 : 0;
  const progress = (completedStages.length / stages.length) * 100;
  const isComplete = completedStages.length === stages.length;

  useEffect(() => {
    if (isComplete && !showReward) {
      const timer = setTimeout(() => setShowReward(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, showReward]);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="relative py-8 px-6">
      {/* Eco-Luxury Header */}
      <div className="mb-8 text-center">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent"
        >
          Your Eco Mission Progress
        </motion.h3>
        <p className="text-sm text-neutral-600 mt-2">
          Track your device's rebirth journey through our sustainable fulfillment process
        </p>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-12 relative">
        <div className="h-2 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{
                x: ["-100%", "100%"]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
        
        {/* Progress percentage */}
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-sm font-semibold text-emerald-600">
            {Math.round(progress)}% Complete
          </span>
          <span className="text-xs text-neutral-500 ml-2">
            ({completedStages.length} of {stages.length} stages)
          </span>
        </motion.div>
      </div>

      {/* Journey Stages */}
      <div className="space-y-6">
        {stages.map((stage, index) => {
          const isCompleted = stage.date !== null;
          const isCurrent = index === currentStageIndex && !isComplete;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              className="relative"
            >
              <div className={`
                relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300
                ${isCompleted 
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50" 
                  : "border-neutral-200 bg-white"
                }
                ${isCurrent ? "ring-4 ring-emerald-200/50 shadow-lg shadow-emerald-100" : ""}
                ${hoveredStage === stage.id ? "scale-[1.02] shadow-xl" : ""}
              `}>
                {/* Stage Icon with Glow */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className={`
                      relative w-16 h-16 rounded-2xl flex items-center justify-center
                      ${isCompleted ? `bg-gradient-to-br ${stage.color}` : "bg-neutral-100"}
                      ${isCurrent ? "animate-pulse" : ""}
                    `}
                    animate={isCurrent ? {
                      boxShadow: [
                        "0 0 0px rgba(16, 185, 129, 0)",
                        "0 0 30px rgba(16, 185, 129, 0.4)",
                        "0 0 0px rgba(16, 185, 129, 0)"
                      ]
                    } : {}}
                    transition={{
                      repeat: Infinity,
                      duration: 2
                    }}
                  >
                    <Icon 
                      className={`w-8 h-8 ${isCompleted ? "text-white" : "text-neutral-400"}`}
                      strokeWidth={2.5}
                    />
                    
                    {/* Particle effect for current stage */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2
                        }}
                        style={{
                          background: `radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent)`
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Stage Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className={`
                        text-lg font-semibold
                        ${isCompleted ? "text-emerald-900" : "text-neutral-400"}
                      `}>
                        {stage.label}
                      </h4>
                      <p className={`
                        text-sm mt-1
                        ${isCompleted ? "text-emerald-700" : "text-neutral-500"}
                      `}>
                        {stage.description}
                      </p>
                    </div>

                    {/* Date/Time */}
                    {isCompleted && stage.date && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-end text-right flex-shrink-0"
                      >
                        <span className="text-sm font-medium text-emerald-700">
                          {formatDate(stage.date)}
                        </span>
                        <span className="text-xs text-emerald-600">
                          {formatTime(stage.date)}
                        </span>
                      </motion.div>
                    )}
                    
                    {!isCompleted && (
                      <span className="text-xs text-neutral-400 flex-shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Connecting line */}
                {index < stages.length - 1 && (
                  <div className={`
                    absolute left-[2.5rem] top-[5.5rem] w-0.5 h-6
                    ${isCompleted ? "bg-gradient-to-b from-emerald-300 to-transparent" : "bg-neutral-200"}
                  `} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Reward */}
      <AnimatePresence>
        {isComplete && showReward && environmentalImpact && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl"
          >
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: "100%"
                  }}
                  animate={{
                    y: "-10%",
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              {/* Celebration Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  scale: { type: "spring", stiffness: 200 },
                  rotate: { duration: 0.5, delay: 0.3 }
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <Leaf className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">
                🎉 Eco Mission Complete!
              </h3>
              <p className="text-white/90 mb-6">
                Congratulations! Your remanufactured device has been delivered.
              </p>

              {/* Environmental Impact Stats */}
              <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {environmentalImpact.carbonSaved.toFixed(1)}kg
                  </div>
                  <div className="text-sm text-white/80">CO₂ Saved</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">
                    {environmentalImpact.waterProvided.toLocaleString()}L
                  </div>
                  <div className="text-sm text-white/80">Water Provided</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">
                    {environmentalImpact.mineralsSaved.toFixed(1)}kg
                  </div>
                  <div className="text-sm text-white/80">Minerals Saved</div>
                </div>
              </div>

              <p className="text-sm text-white/70 mt-4">
                You're making a real difference in the fight against e-waste! 🌱
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
