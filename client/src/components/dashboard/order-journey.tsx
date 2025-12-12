import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useState, useEffect } from "react";
import { DeliveryTimeline } from "@shared/schema";
import { CheckCircle2, Sparkles, Leaf } from "lucide-react";

interface OrderJourneyProps {
  timeline: DeliveryTimeline | null;
  environmentalImpact?: {
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
  };
}

interface Stage {
  id: string;
  label: string;
  subtitle: string;
  date: Date | null;
  position: number;
}

// Particle Burst Effect
function ParticleBurst({ color, density = 12 }: { color: string; density?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(density)].map((_, i) => {
        const angle = (i / density) * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: color,
              left: "50%",
              top: "50%",
              boxShadow: `0 0 8px ${color}`
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.08,
              ease: "easeOut"
            }}
          />
        );
      })}
    </div>
  );
}

// Glow Effect
function GlowRing({ color, intensity = 1 }: { color: string; intensity?: number }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 ${20 * intensity}px ${color}, 0 0 ${40 * intensity}px ${color}`,
          opacity: 0.6
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 ${30 * intensity}px ${color}`,
          opacity: 0.4
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
    </>
  );
}

// Stage 1: Order Confirmed - Glowing Purchase Button with Sparks
function OrderConfirmedAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#08ABAB" density={8} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #08ABAB 0%, #069999 100%)"
            : "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#08ABAB" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Purchase Button */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "#fff" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(8, 171, 171, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 8L8 4H24L26 8M6 8H26M6 8L8 24H24L26 8M12 12V20M16 12V20M20 12V20"
              stroke={isActive || isCompleted ? "#08ABAB" : "#6b7280"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-yellow-400"
                style={{
                  left: "50%",
                  top: "50%",
                  boxShadow: "0 0 4px #fbbf24"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 2: Sent to Warehouse - Warehouse Icon
function SentToWarehouseAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#305269" density={10} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #305269 0%, #243d4f 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#305269" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Warehouse Icon Box */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "rgba(255, 255, 255, 0.9)" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(48, 82, 105, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 14L16 6L28 14M6 13V26H26V13M11 26V18H21V26"
              stroke={isActive || isCompleted ? "#305269" : "#6b7280"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: "#305269",
                  boxShadow: "0 0 4px #305269"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 3: Dispatched - Truck Icon
function DispatchedAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#663366" density={12} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #663366 0%, #4d264d 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#663366" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Truck Icon Box */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "rgba(255, 255, 255, 0.9)" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(102, 51, 102, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M2 8H20V22H2V8ZM20 12H26L30 16V22H20V12ZM7 24C8.65685 24 10 22.6569 10 21C10 19.3431 8.65685 18 7 18C5.34315 18 4 19.3431 4 21C4 22.6569 5.34315 24 7 24ZM25 24C26.6569 24 28 22.6569 28 21C28 19.3431 26.6569 18 25 18C23.3431 18 22 19.3431 22 21C22 22.6569 23.3431 24 25 24Z"
              stroke={isActive || isCompleted ? "#663366" : "#6b7280"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: "#663366",
                  boxShadow: "0 0 4px #663366"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 4: Invoice Sent - Envelope Icon
function InvoiceSentAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#f38aad" density={10} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #f38aad 0%, #e86799 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#f38aad" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Envelope Icon Box */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "rgba(255, 255, 255, 0.9)" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(243, 138, 173, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8H28V24H4V8ZM4 8L16 18L28 8"
              stroke={isActive || isCompleted ? "#f38aad" : "#6b7280"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: "#f38aad",
                  boxShadow: "0 0 4px #f38aad"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 5: Payment Confirmed - Credit Card Icon
function PaymentConfirmedAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#FF9E1C" density={12} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #FF9E1C 0%, #e88a0f 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#FF9E1C" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Credit Card Icon Box */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "rgba(255, 255, 255, 0.9)" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(255, 158, 28, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8H28V24H4V8ZM4 12H28M8 18H12M18 18H24"
              stroke={isActive || isCompleted ? "#FF9E1C" : "#6b7280"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: "#FF9E1C",
                  boxShadow: "0 0 4px #FF9E1C"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 6: Fulfilled - Laptop Icon
function FulfilledAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#08ABAB" density={16} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: (isActive || isCompleted)
            ? "linear-gradient(135deg, #08ABAB 0%, #069999 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#08ABAB" intensity={isActive ? 1.8 : 1.2} />}
        
        {/* Laptop Icon Box */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "rgba(255, 255, 255, 0.9)" : "#f3f4f6",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(8, 171, 171, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 8H28V22H4V8ZM2 24H30M12 14L15 17L20 12"
              stroke={isActive || isCompleted ? "#08ABAB" : "#6b7280"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>

        {/* Spark Effects */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  backgroundColor: "#08ABAB",
                  boxShadow: "0 0 4px #08ABAB"
                }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 50,
                  y: Math.sin((i / 6) * Math.PI * 2) * 50,
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}

        {/* Floating Leaves/Sparkles */}
        {(isActive || isCompleted) && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${60 + Math.random() * 20}%`
                }}
                animate={{
                  y: [-20, -60],
                  x: [0, (Math.random() - 0.5) * 20],
                  opacity: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
              >
                <Leaf className="w-3 h-3 text-emerald-400" />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function OrderJourney({ timeline, environmentalImpact }: OrderJourneyProps) {
  const stages: Stage[] = [
    {
      id: "orderConfirmed",
      label: "Order Confirmed",
      subtitle: "Your order has been placed successfully",
      date: timeline?.orderDate || null,
      position: 0
    },
    {
      id: "sentToWarehouse",
      label: "Sent to Warehouse",
      subtitle: "Processed at our world-leading facility",
      date: timeline?.sentToWarehouse || null,
      position: 1
    },
    {
      id: "dispatched",
      label: "Dispatched",
      subtitle: "Your order is on its way",
      date: timeline?.dispatchDate || null,
      position: 2
    },
    {
      id: "invoiceSent",
      label: "Invoice Sent",
      subtitle: "Invoice delivered to your inbox",
      date: timeline?.invoiceMailed || null,
      position: 3
    },
    {
      id: "paymentConfirmed",
      label: "Payment Confirmed",
      subtitle: "Transaction successfully processed",
      date: timeline?.paymentDate || null,
      position: 4
    },
    {
      id: "fulfilled",
      label: "Fulfilled",
      subtitle: "Your sustainable laptops are ready!",
      date: timeline?.dateFulfilled || null,
      position: 5
    }
  ];

  // Helper function to check if a stage should be marked as completed
  // A stage is complete if it has a date OR if any later stage has a date
  const isStageCompleted = (index: number): boolean => {
    // Check if current stage has a date
    if (stages[index].date !== null) return true;
    
    // Check if any later stage has a date
    for (let i = index + 1; i < stages.length; i++) {
      if (stages[i].date !== null) return true;
    }
    
    return false;
  };

  const completedStages = stages.filter((_, index) => isStageCompleted(index));
  const currentStageIndex = completedStages.length;
  const isComplete = completedStages.length === stages.length;
  const progress = (completedStages.length / stages.length) * 100;

  const getStageAnimation = (stageId: string, isActive: boolean, isCompleted: boolean) => {
    switch (stageId) {
      case "orderConfirmed":
        return <OrderConfirmedAnimation isActive={isActive} isCompleted={isCompleted} />;
      case "sentToWarehouse":
        return <SentToWarehouseAnimation isActive={isActive} isCompleted={isCompleted} />;
      case "dispatched":
        return <DispatchedAnimation isActive={isActive} isCompleted={isCompleted} />;
      case "invoiceSent":
        return <InvoiceSentAnimation isActive={isActive} isCompleted={isCompleted} />;
      case "paymentConfirmed":
        return <PaymentConfirmedAnimation isActive={isActive} isCompleted={isCompleted} />;
      case "fulfilled":
        return <FulfilledAnimation isActive={isActive} isCompleted={isCompleted} />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  return (
    <div className="relative py-8 px-4 overflow-hidden rounded-lg bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20">
      {/* Enhanced Particle Flow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 3 === 0 
                ? 'linear-gradient(135deg, #10b981, #34d399)' 
                : i % 3 === 1 
                ? 'linear-gradient(135deg, #0891b2, #22d3ee)'
                : 'linear-gradient(135deg, #06b6d4, #67e8f9)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -120],
              x: [0, (Math.random() - 0.5) * 40],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 drop-shadow-sm"
        >
          Your Sustainable IT Journey
        </motion.h2>
        <p className="text-neutral-700 text-sm md:text-base font-medium">Delivery timeline at a glance</p>
      </div>

      {/* Enhanced Progress Path */}
      <div className="relative max-w-5xl mx-auto mb-10">
        <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #14b8a6 35%, #06b6d4 70%, #0891b2 100%)"
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Enhanced Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </motion.div>
        </div>

        {/* Enhanced Progress Percentage */}
        <motion.div
          className="absolute -top-12 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-xl border-2 border-white/20"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #06b6d4 100%)",
            left: `${progress}%`,
            transform: "translateX(-50%)"
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          {Math.round(progress)}% Complete
        </motion.div>
      </div>

      {/* Timeline Stages */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 lg:gap-8">
        {stages.map((stage, index) => {
          const isCompleted = isStageCompleted(index);
          const isCurrent = index === currentStageIndex && !isComplete;
          
          const stageColors = [
            { bg: "#08ABAB", border: "#06d6d6", shadow: "rgba(8, 171, 171, 0.4)", glow: "#08ABAB" },
            { bg: "#305269", border: "#3d6a87", shadow: "rgba(48, 82, 105, 0.4)", glow: "#305269" },
            { bg: "#663366", border: "#804080", shadow: "rgba(102, 51, 102, 0.4)", glow: "#663366" },
            { bg: "#f38aad", border: "#f6a5c0", shadow: "rgba(243, 138, 173, 0.4)", glow: "#f38aad" },
            { bg: "#FF9E1C", border: "#ffb347", shadow: "rgba(255, 158, 28, 0.4)", glow: "#FF9E1C" },
            { bg: "#08ABAB", border: "#06d6d6", shadow: "rgba(8, 171, 171, 0.4)", glow: "#08ABAB" }
          ];
          const stageColor = stageColors[index];
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.2,
                duration: 1,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className="relative flex flex-col items-center"
            >
              {/* Stage Number with 60% Transparent Colors */}
              <motion.div
                className="absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold z-10 border-2"
                style={{
                  background: `linear-gradient(135deg, ${stageColor.bg}99 0%, ${stageColor.bg}80 100%)`,
                  borderColor: `${stageColor.border}99`,
                  color: "#fff",
                  boxShadow: `0 6px 20px ${stageColor.shadow.replace('0.4', '0.24')}, 0 0 0 3px ${stageColor.shadow.replace('0.4', '0.15')}`
                }}
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {index + 1}
              </motion.div>

              {/* Stage Animation */}
              <div className="relative mb-4 mt-2">
                {getStageAnimation(stage.id, isCurrent, isCompleted)}
                
                {/* Checkmark for Completed */}
                {isCompleted && !isCurrent && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg z-20"
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Stage Info - Enhanced Card */}
              <motion.div
                className={`
                  relative p-4 md:p-5 rounded-2xl text-center min-h-[180px] w-full transition-all duration-300 flex flex-col justify-between
                  ${isCompleted || isCurrent
                    ? "bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-sm border-2 border-emerald-400 shadow-xl"
                    : "bg-white/70 backdrop-blur-sm border-2 border-neutral-300 shadow-md"}
                `}
                whileHover={isCompleted || isCurrent ? { y: -6, scale: 1.03 } : { y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Enhanced Glow Border */}
                {(isCompleted || isCurrent) && (
                  <>
                    <div
                      className="absolute inset-0 rounded-2xl opacity-30"
                      style={{
                        boxShadow: "inset 0 0 30px #10b981"
                      }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/5 to-teal-400/5" />
                  </>
                )}

                <div className="flex-1 flex flex-col justify-center">
                  <h4 className={`
                    text-sm md:text-base font-bold mb-2
                    ${isCompleted || isCurrent ? "text-neutral-900" : "text-neutral-600"}
                  `}>
                    {stage.label}
                  </h4>
                  
                  <p className={`
                    text-xs md:text-sm mb-3 leading-relaxed
                    ${isCompleted || isCurrent ? "text-neutral-700" : "text-neutral-500"}
                  `}>
                    {stage.subtitle}
                  </p>
                </div>

                {/* Enhanced Date or Status */}
                <div className="mt-auto">
                  {isCompleted && stage.date && (
                    <div className="text-xs md:text-sm font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-1.5 rounded-full inline-block shadow-sm border border-emerald-200">
                      {formatDate(stage.date)}
                    </div>
                  )}
                  
                  {isCurrent && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs md:text-sm font-bold text-teal-700 bg-gradient-to-r from-teal-50 to-cyan-50 px-3 py-1.5 rounded-full inline-block shadow-sm border border-teal-300"
                    >
                      In Progress...
                    </motion.div>
                  )}

                  {!isCompleted && !isCurrent && (
                    <div className="text-xs md:text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full inline-block border border-neutral-200">
                      Pending
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="relative mt-20 max-w-4xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl p-12 text-center" style={{
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #ec4899 100%)"
            }}>
              {/* Confetti */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ["#fbbf24", "#10b981", "#06b6d4", "#ec4899"][i % 4],
                      left: `${Math.random() * 100}%`,
                      top: -20
                    }}
                    animate={{
                      y: [0, 600],
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "linear"
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.6 }}
                  className="text-7xl mb-6"
                >
                  🎉
                </motion.div>
                
                <h3 className="text-4xl font-bold text-white mb-4">Sustainable IT Order Complete!</h3>
                <p className="text-xl text-white/90 mb-8 flex items-center justify-center gap-2">
                  Your order has been fulfilled – Enjoy <Leaf className="w-6 h-6" /> <Sparkles className="w-6 h-6" />
                </p>

                {environmentalImpact && (
                  <div className="grid grid-cols-3 gap-6 bg-white/20 backdrop-blur-lg rounded-2xl p-8">
                    <div className="text-center">
                      <Leaf className="w-8 h-8 mx-auto mb-3 text-white" />
                      <div className="text-4xl font-bold text-white mb-2">
                        {environmentalImpact.carbonSaved.toFixed(1)}kg
                      </div>
                      <div className="text-white/90 text-sm">CO₂ Saved</div>
                    </div>
                    <div className="text-center border-x border-white/30">
                      <Sparkles className="w-8 h-8 mx-auto mb-3 text-white" />
                      <div className="text-4xl font-bold text-white mb-2">
                        {environmentalImpact.waterProvided.toLocaleString()}L
                      </div>
                      <div className="text-white/90 text-sm">Water Provided</div>
                    </div>
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                      </svg>
                      <div className="text-4xl font-bold text-white mb-2">
                        {environmentalImpact.mineralsSaved.toFixed(1)}kg
                      </div>
                      <div className="text-white/90 text-sm">Minerals Saved</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
