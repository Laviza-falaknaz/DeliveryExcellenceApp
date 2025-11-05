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
  number: string;
  label: string;
  date: Date | null;
  description: string;
  color: string;
  lightColor: string;
}

// Flying Plane SVG Component
function FlyingPlane() {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="absolute"
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        offsetPath: "path('M 0,0 A 80,80 0 1,1 0,0.1')",
        offsetDistance: "0%"
      }}
    >
      <motion.g
        animate={{
          offsetDistance: ["0%", "100%"]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <path
          d="M20 8 L24 20 L32 22 L24 24 L20 32 L16 24 L8 22 L16 20 Z"
          fill="#10b981"
          stroke="#047857"
          strokeWidth="1"
        />
        <circle cx="20" cy="20" r="3" fill="#fbbf24" />
      </motion.g>
    </motion.svg>
  );
}

// Stage SVG Graphics
function OrderConfirmedGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#dcfce7" : "#f3f4f6"} />
      <motion.path
        d="M40 60 L52 72 L80 44"
        fill="none"
        stroke={isActive ? "#10b981" : "#9ca3af"}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: isActive ? 1 : 0.3 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M35 40 L50 30 L60 35 L70 30 L85 40"
        fill="none"
        stroke={isActive ? "#059669" : "#d1d5db"}
        strokeWidth="3"
        strokeLinecap="round"
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function WarehouseGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#d1fae5" : "#f3f4f6"} />
      <path d="M35 45 L60 30 L85 45 L85 80 L35 80 Z" fill={isActive ? "#10b981" : "#9ca3af"} opacity="0.3" />
      <path d="M30 45 L60 25 L90 45" fill="none" stroke={isActive ? "#047857" : "#6b7280"} strokeWidth="3" strokeLinecap="round" />
      <rect x="50" y="60" width="20" height="20" fill={isActive ? "#047857" : "#9ca3af"} />
      {isActive && (
        <motion.rect
          x="50"
          y="60"
          width="15"
          height="15"
          fill="#fbbf24"
          animate={{ y: [60, 50, 60] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <rect x="40" y="50" width="10" height="10" fill={isActive ? "#6ee7b7" : "#d1d5db"} opacity="0.6" />
      <rect x="70" y="50" width="10" height="10" fill={isActive ? "#6ee7b7" : "#d1d5db"} opacity="0.6" />
    </svg>
  );
}

function DispatchedGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#cffafe" : "#f3f4f6"} />
      <motion.g animate={isActive ? { x: [-2, 0, -2] } : {}} transition={{ duration: 0.5, repeat: Infinity }}>
        <rect x="40" y="50" width="35" height="20" rx="2" fill={isActive ? "#06b6d4" : "#9ca3af"} />
        <rect x="75" y="52" width="12" height="16" rx="1" fill={isActive ? "#0891b2" : "#9ca3af"} />
        <rect x="77" y="55" width="8" height="8" fill={isActive ? "#a5f3fc" : "#e5e7eb"} opacity="0.7" />
        <circle cx="50" cy="72" r="5" fill={isActive ? "#1f2937" : "#6b7280"} />
        <circle cx="77" cy="72" r="5" fill={isActive ? "#1f2937" : "#6b7280"} />
        {isActive && (
          <>
            <motion.circle cx="50" cy="72" r="6" fill="none" stroke="#06b6d4" strokeWidth="1" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.circle cx="77" cy="72" r="6" fill="none" stroke="#06b6d4" strokeWidth="1" animate={{ scale: [1, 1.5], opacity: [1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
          </>
        )}
        <path d="M45 57 Q48 54 50 57" fill="#10b981" />
      </motion.g>
      {isActive && (
        <>
          <motion.line x1="20" y1="78" x2="35" y2="78" stroke="#d1d5db" strokeWidth="2" strokeDasharray="5,5" animate={{ x1: [20, 100], x2: [35, 115] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </>
      )}
    </svg>
  );
}

function InvoiceGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#dbeafe" : "#f3f4f6"} />
      <rect x="45" y="40" width="30" height="40" rx="2" fill={isActive ? "#3b82f6" : "#9ca3af"} opacity="0.2" />
      <motion.path
        d="M45 40 L60 55 L75 40"
        fill="none"
        stroke={isActive ? "#2563eb" : "#6b7280"}
        strokeWidth="2"
        animate={isActive ? { pathLength: [0, 1, 1, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <line x1="50" y1="50" x2="70" y2="50" stroke={isActive ? "#1d4ed8" : "#9ca3af"} strokeWidth="2" />
      <line x1="50" y1="58" x2="70" y2="58" stroke={isActive ? "#1d4ed8" : "#9ca3af"} strokeWidth="2" />
      <line x1="50" y1="66" x2="65" y2="66" stroke={isActive ? "#1d4ed8" : "#9ca3af"} strokeWidth="2" />
      {isActive && (
        <>
          <motion.circle cx="55" cy="35" r="2" fill="#3b82f6" animate={{ y: [35, 25], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.circle cx="65" cy="37" r="2" fill="#3b82f6" animate={{ y: [37, 27], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
        </>
      )}
    </svg>
  );
}

function PaymentGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#ede9fe" : "#f3f4f6"} />
      <rect x="35" y="45" width="50" height="32" rx="4" fill={isActive ? "#8b5cf6" : "#9ca3af"} />
      <rect x="35" y="52" width="50" height="6" fill={isActive ? "#6d28d9" : "#6b7280"} />
      <rect x="40" y="62" width="12" height="10" rx="1" fill={isActive ? "#fbbf24" : "#d1d5db"} />
      <line x1="40" y1="76" x2="75" y2="76" stroke={isActive ? "#ddd6fe" : "#e5e7eb"} strokeWidth="2" />
      {isActive && (
        <>
          <motion.circle
            cx="60"
            cy="60"
            r="15"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="60"
            cy="60"
            r="15"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
          />
        </>
      )}
    </svg>
  );
}

function FulfilledGraphic({ isActive }: { isActive: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r="50" fill={isActive ? "#fce7f3" : "#f3f4f6"} />
      <rect x="42" y="40" width="36" height="26" rx="2" fill={isActive ? "#a5f3d0" : "#d1d5db"} stroke={isActive ? "#059669" : "#9ca3af"} strokeWidth="2" />
      <motion.rect
        x="45" y="43" width="30" height="20"
        fill={isActive ? "#10b981" : "#9ca3af"}
        opacity={isActive ? 0.4 : 0.2}
        animate={isActive ? { opacity: [0.3, 0.7, 0.3] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <path d="M38 66 L42 66 L45 74 L75 74 L78 66 L82 66 L79 76 L41 76 Z" fill={isActive ? "#047857" : "#9ca3af"} />
      <circle cx="60" cy="52" r="3" fill={isActive ? "#10b981" : "#6b7280"} />
      {isActive && (
        <>
          <motion.path d="M30 45 Q32 42 34 45" fill="#10b981" animate={{ x: [30, 25], y: [45, 35], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.path d="M82 50 Q84 47 86 50" fill="#10b981" animate={{ x: [82, 87], y: [50, 40], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
        </>
      )}
    </svg>
  );
}

export default function OrderJourney({ timeline, environmentalImpact }: OrderJourneyProps) {
  const stages: JourneyStage[] = [
    {
      id: "orderConfirmed",
      number: "01",
      label: "Order Confirmed",
      date: timeline?.orderDate || null,
      description: "Your order has been successfully placed",
      color: "#ec4899",
      lightColor: "#fce7f3"
    },
    {
      id: "sentToWarehouse",
      number: "02",
      label: "Sent to Warehouse",
      date: timeline?.sentToWarehouse || null,
      description: "Order forwarded to fulfillment center",
      color: "#10b981",
      lightColor: "#d1fae5"
    },
    {
      id: "dispatched",
      number: "03",
      label: "Dispatched",
      date: timeline?.dispatchDate || null,
      description: "Your device is on its way",
      color: "#06b6d4",
      lightColor: "#cffafe"
    },
    {
      id: "invoiceSent",
      number: "04",
      label: "Invoice Sent",
      date: timeline?.invoiceMailed || null,
      description: "Digital invoice delivered",
      color: "#3b82f6",
      lightColor: "#dbeafe"
    },
    {
      id: "paymentConfirmed",
      number: "05",
      label: "Payment Confirmed",
      date: timeline?.paymentDate || null,
      description: "Payment successfully processed",
      color: "#8b5cf6",
      lightColor: "#ede9fe"
    },
    {
      id: "fulfilled",
      number: "06",
      label: "Fulfilled",
      date: timeline?.dateFulfilled || null,
      description: "Your device is ready!",
      color: "#ec4899",
      lightColor: "#fce7f3"
    }
  ];

  const completedStages = stages.filter(stage => stage.date !== null);
  const currentStageIndex = completedStages.length > 0 ? completedStages.length - 1 : -1;
  const nextStageIndex = currentStageIndex + 1;
  const isComplete = completedStages.length === stages.length;

  const getGraphic = (stageId: string, isActive: boolean) => {
    switch (stageId) {
      case "orderConfirmed": return <OrderConfirmedGraphic isActive={isActive} />;
      case "sentToWarehouse": return <WarehouseGraphic isActive={isActive} />;
      case "dispatched": return <DispatchedGraphic isActive={isActive} />;
      case "invoiceSent": return <InvoiceGraphic isActive={isActive} />;
      case "paymentConfirmed": return <PaymentGraphic isActive={isActive} />;
      case "fulfilled": return <FulfilledGraphic isActive={isActive} />;
      default: return null;
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    };
  };

  return (
    <div className="py-12 px-4">
      {/* Journey Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-neutral-900 mb-3">Your Order Journey</h2>
        <p className="text-neutral-600">Track your device's progress through our sustainable fulfillment process</p>
      </div>

      {/* Stages Container */}
      <div className="max-w-7xl mx-auto relative">
        {/* Connecting Path */}
        <svg className="absolute top-[100px] left-0 w-full h-[200px] -z-10" preserveAspectRatio="none">
          <motion.path
            d="M 150 100 Q 300 50, 450 100 T 750 100 Q 900 50, 1050 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            strokeDasharray="10,10"
          />
          <motion.path
            d="M 150 100 Q 300 50, 450 100 T 750 100 Q 900 50, 1050 100"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="10,10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: completedStages.length / stages.length }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* Stages Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {stages.map((stage, index) => {
            const isCompleted = stage.date !== null;
            const isCurrent = index === nextStageIndex;
            const isPending = !isCompleted && !isCurrent;
            const dateTime = formatDateTime(stage.date);

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative flex flex-col items-center"
              >
                {/* Stage Number */}
                <motion.div
                  className={`
                    absolute -top-8 left-1/2 -translate-x-1/2 z-20
                    w-14 h-14 rounded-full flex items-center justify-center
                    text-xl font-bold border-4 border-white shadow-lg
                    ${isCompleted ? `bg-gradient-to-br from-[${stage.color}] to-[${stage.color}]/80 text-white` :
                      isCurrent ? "bg-white text-emerald-600 border-emerald-400" :
                      "bg-neutral-100 text-neutral-400 border-neutral-200"}
                  `}
                  style={isCompleted ? {
                    background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}dd 100%)`
                  } : {}}
                  whileHover={{ scale: 1.1 }}
                >
                  {stage.number}
                </motion.div>

                {/* Main Stage Circle */}
                <motion.div
                  className={`
                    relative rounded-full overflow-hidden
                    transition-all duration-500
                    ${isCompleted ? "ring-4 shadow-xl" :
                      isCurrent ? "ring-4 ring-emerald-300 shadow-2xl" :
                      "opacity-40 grayscale"}
                  `}
                  style={isCompleted ? {
                    boxShadow: `0 0 0 4px ${stage.color}40, 0 10px 30px ${stage.color}30`
                  } : {}}
                  whileHover={!isPending ? { scale: 1.05 } : {}}
                >
                  {/* Flying Plane for Current Stage */}
                  {isCurrent && (
                    <div className="absolute inset-0 z-30 pointer-events-none">
                      <motion.div
                        className="absolute"
                        style={{
                          top: "50%",
                          left: "50%",
                          marginLeft: "-20px",
                          marginTop: "-20px"
                        }}
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <motion.svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          animate={{
                            x: [0, 70, 0, -70, 0],
                            y: [0, -70, 0, 70, 0]
                          }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <path
                            d="M20 8 L24 20 L32 22 L24 24 L20 32 L16 24 L8 22 L16 20 Z"
                            fill="#10b981"
                            stroke="#047857"
                            strokeWidth="1.5"
                          />
                          <circle cx="20" cy="20" r="4" fill="#fbbf24" />
                        </motion.svg>
                      </motion.div>
                    </div>
                  )}

                  {/* Stage Graphic */}
                  <div className="relative z-10">
                    {getGraphic(stage.id, isCompleted || isCurrent)}
                  </div>

                  {/* Active Pulse Effect */}
                  {isCurrent && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-emerald-400"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-teal-400"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 0, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                    </>
                  )}
                </motion.div>

                {/* Stage Info */}
                <div className="mt-6 text-center max-w-[200px]">
                  <h4 className={`
                    text-lg font-bold mb-2
                    ${isCompleted ? "text-neutral-900" :
                      isCurrent ? "text-emerald-700" :
                      "text-neutral-400"}
                  `}>
                    {stage.label}
                  </h4>
                  <p className={`
                    text-sm mb-3
                    ${isCompleted ? "text-neutral-600" :
                      isCurrent ? "text-emerald-600" :
                      "text-neutral-400"}
                  `}>
                    {stage.description}
                  </p>

                  {/* Date & Status */}
                  {isCompleted && dateTime && (
                    <div className="inline-block px-4 py-2 rounded-full text-xs font-medium" style={{
                      backgroundColor: stage.lightColor,
                      color: stage.color
                    }}>
                      {dateTime.date} • {dateTime.time}
                    </div>
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      className="inline-block px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      In Progress...
                    </motion.div>
                  )}
                  
                  {isPending && (
                    <div className="inline-block px-4 py-2 rounded-full bg-neutral-100 text-neutral-400 text-xs font-medium">
                      Pending
                    </div>
                  )}
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
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            className="mt-20 max-w-4xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-10 text-white shadow-2xl"
          >
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-3xl font-bold mb-3">Order Complete!</h3>
              <p className="text-xl text-white/90 mb-8">Your sustainable journey is complete</p>

              <div className="grid grid-cols-3 gap-6 bg-white/15 backdrop-blur-md rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.carbonSaved.toFixed(1)}kg</div>
                  <div className="text-white/80 text-sm">CO₂ Saved</div>
                </div>
                <div className="text-center border-x border-white/30">
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.waterProvided.toLocaleString()}L</div>
                  <div className="text-white/80 text-sm">Water Provided</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{environmentalImpact.mineralsSaved.toFixed(1)}kg</div>
                  <div className="text-white/80 text-sm">Minerals Saved</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
