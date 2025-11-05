import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { DeliveryTimeline } from "@shared/schema";

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
  description: string;
  color: string;
}

// Animated Warehouse SVG Component
function WarehouseAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Warehouse Building */}
      <motion.path
        d="M20 40 L50 20 L80 40 L80 80 L20 80 Z"
        fill="url(#warehouseGrad)"
        stroke="#047857"
        strokeWidth="2"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: isActive ? 1 : 0.3 }}
      />
      <defs>
        <linearGradient id="warehouseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Roof */}
      <motion.path
        d="M15 40 L50 15 L85 40 L80 40 L50 20 L20 40 Z"
        fill="#059669"
        animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Boxes being moved */}
      {isActive && (
        <motion.rect
          x="35"
          y="50"
          width="12"
          height="12"
          fill="#fbbf24"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 50, opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
        />
      )}
      {/* Door */}
      <rect x="42" y="60" width="16" height="20" fill="#065f46" />
      {/* Windows */}
      <rect x="28" y="48" width="8" height="8" fill="#6ee7b7" opacity="0.6" />
      <rect x="64" y="48" width="8" height="8" fill="#6ee7b7" opacity="0.6" />
    </svg>
  );
}

// Animated Truck SVG Component
function TruckAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Road */}
      <rect x="0" y="70" width="100" height="4" fill="#d1d5db" />
      {isActive && (
        <>
          <motion.rect
            x="0"
            y="71"
            width="20"
            height="2"
            fill="#fff"
            animate={{ x: [-20, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.rect
            x="40"
            y="71"
            width="20"
            height="2"
            fill="#fff"
            animate={{ x: [-20, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.4 }}
          />
        </>
      )}
      {/* Truck Body */}
      <motion.g
        animate={isActive ? { x: [-10, 0, -10] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <rect x="30" y="45" width="35" height="20" fill="url(#truckGrad)" stroke="#047857" strokeWidth="2" rx="2" />
        <rect x="65" y="50" width="15" height="15" fill="url(#truckGrad)" stroke="#047857" strokeWidth="2" rx="1" />
        {/* Wheels */}
        <motion.circle
          cx="42"
          cy="67"
          r="5"
          fill="#1f2937"
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ originX: "42px", originY: "67px" }}
        />
        <motion.circle
          cx="68"
          cy="67"
          r="5"
          fill="#1f2937"
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ originX: "68px", originY: "67px" }}
        />
        {/* Window */}
        <rect x="67" y="52" width="11" height="8" fill="#a7f3d0" opacity="0.7" />
        {/* Leaf symbol */}
        <path d="M45 52 Q50 48 52 52 Q50 55 45 52" fill="#10b981" />
      </motion.g>
      <defs>
        <linearGradient id="truckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated Invoice SVG Component
function InvoiceAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Envelope */}
      <motion.rect
        x="25"
        y="35"
        width="50"
        height="35"
        fill="url(#envelopeGrad)"
        stroke="#0891b2"
        strokeWidth="2"
        rx="2"
        animate={isActive ? { y: [35, 32, 35] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.path
        d="M25 35 L50 55 L75 35"
        fill="none"
        stroke="#0891b2"
        strokeWidth="2"
        animate={isActive ? { pathLength: [0, 1] } : { pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      />
      {/* Flying paper particles */}
      {isActive && (
        <>
          <motion.circle
            cx="50"
            cy="40"
            r="2"
            fill="#06b6d4"
            initial={{ y: 40, opacity: 1 }}
            animate={{ y: 20, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.circle
            cx="45"
            cy="45"
            r="2"
            fill="#06b6d4"
            initial={{ y: 45, opacity: 1 }}
            animate={{ y: 25, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
      <defs>
        <linearGradient id="envelopeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated Payment SVG Component  
function PaymentAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Credit Card */}
      <motion.rect
        x="20"
        y="35"
        width="60"
        height="38"
        fill="url(#cardGrad)"
        stroke="#7c3aed"
        strokeWidth="2"
        rx="4"
        animate={isActive ? { rotateY: [0, 5, 0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Magnetic strip */}
      <rect x="20" y="45" width="60" height="6" fill="#6d28d9" />
      {/* Chip */}
      <rect x="28" y="56" width="12" height="10" fill="#fbbf24" rx="1" />
      {/* Processing waves */}
      {isActive && (
        <>
          <motion.circle
            cx="50"
            cy="61"
            r="8"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.circle
            cx="50"
            cy="61"
            r="8"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
      <defs>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated Fulfillment SVG Component
function FulfillmentAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Laptop */}
      <motion.g
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ originX: "50px", originY: "50px" }}
      >
        {/* Screen */}
        <rect x="30" y="25" width="40" height="28" fill="url(#screenGrad)" stroke="#059669" strokeWidth="2" rx="2" />
        {/* Screen content - green aura */}
        <motion.rect
          x="33"
          y="28"
          width="34"
          height="22"
          fill="#10b981"
          opacity={isActive ? 0.6 : 0.3}
          animate={isActive ? { opacity: [0.3, 0.8, 0.3] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Keyboard */}
        <path d="M25 53 L30 53 L35 60 L65 60 L70 53 L75 53 L72 62 L28 62 Z" fill="#047857" stroke="#059669" strokeWidth="2" />
        {/* Power button glow */}
        {isActive && (
          <motion.circle
            cx="50"
            cy="40"
            r="3"
            fill="#10b981"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.g>
      {/* Floating leaves around laptop */}
      {isActive && (
        <>
          <motion.path
            d="M20 40 Q22 35 25 40"
            fill="#10b981"
            initial={{ x: 20, y: 40, opacity: 0 }}
            animate={{ x: 15, y: 30, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.path
            d="M75 45 Q77 40 80 45"
            fill="#10b981"
            initial={{ x: 75, y: 45, opacity: 0 }}
            animate={{ x: 80, y: 35, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
      <defs>
        <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated Order Confirmed SVG Component
function OrderConfirmedAnimation({ isActive }: { isActive: boolean }) {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" className="mx-auto">
      {/* Checkmark circle */}
      <motion.circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="url(#confirmGrad)"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0 }}
        transition={{ duration: 1 }}
      />
      {/* Checkmark */}
      <motion.path
        d="M35 50 L45 60 L65 38"
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Burst particles */}
      {isActive && (
        <>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.circle
              key={angle}
              cx="50"
              cy="50"
              r="3"
              fill="#10b981"
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos(angle * Math.PI / 180) * 30,
                y: Math.sin(angle * Math.PI / 180) * 30,
                opacity: 0,
                scale: 1
              }}
              transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
            />
          ))}
        </>
      )}
      <defs>
        <linearGradient id="confirmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function OrderJourney({ timeline, environmentalImpact }: OrderJourneyProps) {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  // Correct sequence: order confirmed -> sent to warehouse -> dispatched -> invoice sent -> payment confirmed -> fulfilled
  const stages: JourneyStage[] = [
    {
      id: "orderConfirmed",
      label: "Order Confirmed",
      date: timeline?.orderDate || null,
      description: "Your eco-mission begins! Order successfully placed.",
      color: "from-emerald-400 to-emerald-600"
    },
    {
      id: "sentToWarehouse",
      label: "Sent to Warehouse",
      date: timeline?.sentToWarehouse || null,
      description: "Order forwarded to our sustainable fulfillment center.",
      color: "from-teal-400 to-teal-600"
    },
    {
      id: "dispatched",
      label: "Dispatched",
      date: timeline?.dispatchDate || null,
      description: "En route! Your device is on its way.",
      color: "from-cyan-400 to-cyan-600"
    },
    {
      id: "invoiceSent",
      label: "Invoice Sent",
      date: timeline?.invoiceMailed || null,
      description: "Digital invoice delivered. Paperless for the planet.",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: "paymentConfirmed",
      label: "Payment Confirmed",
      date: timeline?.paymentDate || null,
      description: "Payment processed. Funding the circular economy!",
      color: "from-purple-400 to-purple-600"
    },
    {
      id: "fulfilled",
      label: "Fulfilled",
      date: timeline?.dateFulfilled || null,
      description: "Your remanufactured device is ready. Mission complete!",
      color: "from-pink-400 to-pink-600"
    }
  ];

  const completedStages = stages.filter(stage => stage.date !== null);
  const currentStageIndex = completedStages.length > 0 ? completedStages.length - 1 : -1;
  const nextStageIndex = currentStageIndex + 1;
  const progress = (completedStages.length / stages.length) * 100;
  const isComplete = completedStages.length === stages.length;

  useEffect(() => {
    if (nextStageIndex >= 0 && nextStageIndex < stages.length) {
      setActiveStage(stages[nextStageIndex].id);
    }
  }, [nextStageIndex]);

  const getAnimation = (stageId: string, isActive: boolean) => {
    switch (stageId) {
      case "orderConfirmed":
        return <OrderConfirmedAnimation isActive={isActive} />;
      case "sentToWarehouse":
        return <WarehouseAnimation isActive={isActive} />;
      case "dispatched":
        return <TruckAnimation isActive={isActive} />;
      case "invoiceSent":
        return <InvoiceAnimation isActive={isActive} />;
      case "paymentConfirmed":
        return <PaymentAnimation isActive={isActive} />;
      case "fulfilled":
        return <FulfillmentAnimation isActive={isActive} />;
      default:
        return null;
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };
  };

  return (
    <div className="relative py-8">
      {/* Cinematic Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Your Device's Rebirth Journey
        </h3>
        <p className="text-neutral-600">
          Follow your laptop's transformation through our sustainable process
        </p>
      </motion.div>

      {/* Animated Progress Path */}
      <div className="relative max-w-5xl mx-auto">
        {/* Background progress line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-neutral-200 via-neutral-300 to-neutral-200" />
        
        {/* Animated progress line */}
        <motion.div
          className="absolute left-1/2 top-0 w-1 -translate-x-1/2 bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500"
          initial={{ height: "0%" }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Glowing dot at the end */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/50"
            animate={{
              scale: [1, 1.3, 1],
              boxShadow: [
                "0 0 10px rgba(16, 185, 129, 0.5)",
                "0 0 20px rgba(16, 185, 129, 0.8)",
                "0 0 10px rgba(16, 185, 129, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Journey Stages */}
        <div className="relative space-y-24 py-8">
          {stages.map((stage, index) => {
            const isCompleted = stage.date !== null;
            const isCurrent = index === nextStageIndex;
            const dateTime = formatDateTime(stage.date);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.8 }}
                className="relative"
              >
                <div className={`flex items-center gap-8 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                  {/* Content Side */}
                  <div className={`flex-1 ${isLeft ? "text-right" : "text-left"}`}>
                    <motion.div
                      className={`
                        inline-block p-6 rounded-2xl border-2 transition-all
                        ${isCompleted 
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg shadow-emerald-100/50" 
                          : isCurrent
                          ? "bg-white border-teal-300 shadow-xl shadow-teal-100"
                          : "bg-neutral-50 border-neutral-200"
                        }
                      `}
                      animate={isCurrent ? {
                        boxShadow: [
                          "0 10px 30px rgba(20, 184, 166, 0.2)",
                          "0 10px 40px rgba(20, 184, 166, 0.4)",
                          "0 10px 30px rgba(20, 184, 166, 0.2)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <h4 className={`
                        text-xl font-bold mb-2
                        ${isCompleted ? "text-emerald-900" : isCurrent ? "text-teal-700" : "text-neutral-400"}
                      `}>
                        {stage.label}
                      </h4>
                      <p className={`
                        text-sm mb-3
                        ${isCompleted ? "text-emerald-700" : isCurrent ? "text-teal-600" : "text-neutral-500"}
                      `}>
                        {stage.description}
                      </p>
                      {isCompleted && dateTime && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 justify-end">
                          <span className="font-medium">{dateTime.date}</span>
                          <span className="text-emerald-500">•</span>
                          <span>{dateTime.time}</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="flex items-center gap-2 text-sm text-teal-600 font-medium justify-end">
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            In Progress
                          </motion.span>
                          <motion.div
                            className="flex gap-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <span>•</span>
                            <span>•</span>
                            <span>•</span>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Central Animation */}
                  <div className="relative z-10">
                    <motion.div
                      className={`
                        relative w-32 h-32 rounded-3xl flex items-center justify-center
                        ${isCompleted 
                          ? `bg-gradient-to-br ${stage.color}` 
                          : isCurrent
                          ? "bg-gradient-to-br from-teal-100 to-cyan-100 border-4 border-teal-300"
                          : "bg-neutral-100 border-4 border-neutral-200"
                        }
                      `}
                      animate={isCurrent ? {
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      } : {}}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {getAnimation(stage.id, isCompleted || isCurrent)}
                      
                      {/* Completion badge */}
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                          className="absolute -top-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10 L8 14 L16 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </motion.div>
                      )}

                      {/* Work in progress indicator */}
                      {isCurrent && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-3xl border-4 border-teal-400"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 0, 0.7]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-3xl border-4 border-cyan-400"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 0, 0.7]
                            }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                          />
                        </>
                      )}
                    </motion.div>
                  </div>

                  {/* Empty space for layout balance */}
                  <div className="flex-1" />
                </div>
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
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
            className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-10 text-white shadow-2xl"
          >
            {/* Floating particles */}
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  initial={{ x: `${Math.random() * 100}%`, y: "110%" }}
                  animate={{
                    y: "-10%",
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
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
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.8 }}
                className="text-6xl mb-4"
              >
                🌱
              </motion.div>
              <h3 className="text-3xl font-bold mb-3">Mission Complete!</h3>
              <p className="text-xl text-white/90 mb-8">Your remanufactured device journey is complete</p>

              <div className="grid grid-cols-3 gap-6 bg-white/15 backdrop-blur-md rounded-2xl p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.carbonSaved.toFixed(1)}kg</div>
                  <div className="text-white/80">CO₂ Saved</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-center border-x border-white/30"
                >
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.waterProvided.toLocaleString()}L</div>
                  <div className="text-white/80">Water Provided</div>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.mineralsSaved.toFixed(1)}kg</div>
                  <div className="text-white/80">Minerals Saved</div>
                </motion.div>
              </div>

              <p className="text-white/70 mt-6">Thank you for choosing circular computing! 🌍</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
