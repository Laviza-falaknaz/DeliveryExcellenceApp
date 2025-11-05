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
      {(isActive || isCompleted) && <ParticleBurst color="#10b981" density={8} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : { scale: 1 }}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#10b981" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Purchase Button */}
        <motion.div
          className="relative w-16 h-16 rounded-xl flex items-center justify-center"
          style={{
            background: isActive || isCompleted ? "#fff" : "#e5e7eb",
            boxShadow: isActive || isCompleted ? "0 8px 20px rgba(16, 185, 129, 0.4)" : "none"
          }}
          animate={isActive ? {
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 8L8 4H24L26 8M6 8H26M6 8L8 24H24L26 8M12 12V20M16 12V20M20 12V20"
              stroke={isActive || isCompleted ? "#10b981" : "#9ca3af"}
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

// Stage 2: Sent to Warehouse - Eco-Crate on Conveyor with Robotic Arm
function SentToWarehouseAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#3b82f6" density={10} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
      >
        {(isActive || isCompleted) && <GlowRing color="#3b82f6" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Conveyor Belt */}
        <svg width="120" height="120" viewBox="0 0 120 120" className="absolute">
          <motion.line
            x1="20"
            y1="80"
            x2="100"
            y2="80"
            stroke={isActive || isCompleted ? "#1d4ed8" : "#4b5563"}
            strokeWidth="3"
            strokeDasharray="8 4"
            animate={isActive ? { strokeDashoffset: [0, -12] } : {}}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Robotic Arm */}
        {isActive && (
          <motion.svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            className="absolute"
            style={{ right: "10%", top: "10%" }}
            animate={{
              rotate: [0, -15, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.line
              x1="60"
              y1="20"
              x2="60"
              y2="50"
              stroke="#6b7280"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ y2: [50, 60, 50] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.line
              x1="60"
              y1="50"
              x2="40"
              y2="60"
              stroke="#9ca3af"
              strokeWidth="4"
              strokeLinecap="round"
              animate={{ x2: [40, 30, 40], y2: [60, 70, 60] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="40"
              cy="60"
              r="3"
              fill="#3b82f6"
              animate={{ cx: [40, 30, 40], cy: [60, 70, 60] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
        )}

        {/* Eco-Crate */}
        <motion.div
          className="relative"
          initial={{ x: -40, y: 10 }}
          animate={isActive ? {
            x: [-40, 0],
            y: [10, 0]
          } : { x: 0, y: 0 }}
          transition={isActive ? {
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1.5,
            ease: "easeInOut"
          } : {}}
        >
          <svg width="48" height="48" viewBox="0 0 48 48">
            <rect
              x="8"
              y="12"
              width="32"
              height="24"
              rx="2"
              fill={isActive || isCompleted ? "#10b981" : "#6b7280"}
              opacity="0.9"
            />
            <rect x="12" y="16" width="10" height="8" fill={isActive || isCompleted ? "#fff" : "#4b5563"} opacity="0.3" />
            <rect x="26" y="16" width="10" height="8" fill={isActive || isCompleted ? "#fff" : "#4b5563"} opacity="0.3" />
            <path d="M16 12 L24 8 L32 12" stroke={isActive || isCompleted ? "#047857" : "#4b5563"} strokeWidth="2" fill="none" />
            <circle cx="24" cy="22" r="3" fill="#fbbf24" />
          </svg>
        </motion.div>

        {/* Energy Trail */}
        {isActive && (
          <motion.div
            className="absolute w-16 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #10b981 50%, #3b82f6 100%)",
              left: "20%",
              top: "50%"
            }}
            animate={{
              x: [-20, 40],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

// Stage 3: Dispatched - Electric Truck/Drone Zoom with Camera Shake
function DispatchedAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#06b6d4" density={12} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        animate={isActive ? {
          rotate: [0, 3, -3, 2, -2, 0],
          x: [0, 2, -2, 1, -1, 0],
          y: [0, -1, 1, -1, 1, 0]
        } : {}}
        transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#06b6d4" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Electric Truck */}
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          initial={{ x: -80 }}
          animate={isActive ? {
            x: [-80, 0, 80, -80],
          } : { x: 0 }}
          transition={isActive ? {
            duration: 2.5,
            repeat: Infinity,
            ease: [0.65, 0, 0.35, 1]
          } : {}}
        >
          {/* Truck Body */}
          <rect x="16" y="20" width="32" height="18" rx="2" fill={isActive || isCompleted ? "#10b981" : "#9ca3af"} />
          <rect x="48" y="24" width="10" height="12" rx="1" fill={isActive || isCompleted ? "#059669" : "#6b7280"} />
          <rect x="20" y="24" width="24" height="10" fill={isActive || isCompleted ? "#047857" : "#6b7280"} opacity="0.3" />
          
          {/* Windshield */}
          <path d="M50 25 L54 25 L54 33 L50 33" fill="#a5f3fc" opacity="0.7" />
          
          {/* Lightning Bolt (Electric) */}
          <path d="M32 26 L30 30 L32 30 L30 34 L34 30 L32 30 L34 26 Z" fill="#fbbf24" />
          
          {/* Wheels */}
          <motion.circle
            cx="26"
            cy="40"
            r="5"
            fill="#1f2937"
            animate={isActive ? { rotate: 360 } : {}}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          />
          <circle cx="26" cy="40" r="3" fill="#6b7280" />
          
          <motion.circle
            cx="52"
            cy="40"
            r="5"
            fill="#1f2937"
            animate={isActive ? { rotate: 360 } : {}}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          />
          <circle cx="52" cy="40" r="3" fill="#6b7280" />
        </motion.svg>

        {/* Exhaust/Energy Trail */}
        {isActive && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
                  left: "20%",
                  top: "50%"
                }}
                animate={{
                  x: [-30, -60],
                  y: [0, -10],
                  scale: [0.5, 1.5],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
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

// Stage 4: Invoice Sent - Holographic Envelope
function InvoiceSentAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#f59e0b" density={10} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
      >
        {(isActive || isCompleted) && <GlowRing color="#f59e0b" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Envelope with Arc Motion - Multi-Keyframe Path */}
        <motion.svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          initial={{ x: 80, y: -40, rotate: 25, opacity: 0 }}
          animate={isActive || isCompleted ? {
            x: [80, 40, 10, 0],
            y: [-40, -50, -20, 0],
            rotate: [25, 15, 5, 0],
            opacity: [0, 0.7, 0.9, 1]
          } : {
            x: 80,
            y: -40,
            rotate: 25,
            opacity: 0.3
          }}
          transition={{
            duration: 1.2,
            ease: [0.34, 1.56, 0.64, 1],
            times: [0, 0.3, 0.7, 1]
          }}
        >
          {/* Envelope Body */}
          <rect
            x="8"
            y="16"
            width="40"
            height="28"
            rx="2"
            fill={isActive || isCompleted ? "#fff" : "#e5e7eb"}
            stroke={isActive || isCompleted ? "#f59e0b" : "#9ca3af"}
            strokeWidth="2"
          />
          
          {/* Envelope Flap */}
          <motion.path
            d="M8 16 L28 32 L48 16"
            fill="none"
            stroke={isActive || isCompleted ? "#f59e0b" : "#9ca3af"}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isActive || isCompleted ? 1 : 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          {/* Document Lines */}
          <line x1="14" y1="24" x2="42" y2="24" stroke={isActive || isCompleted ? "#d97706" : "#9ca3af"} strokeWidth="2" opacity="0.5" />
          <line x1="14" y1="30" x2="42" y2="30" stroke={isActive || isCompleted ? "#d97706" : "#9ca3af"} strokeWidth="2" opacity="0.5" />
          <line x1="14" y1="36" x2="35" y2="36" stroke={isActive || isCompleted ? "#d97706" : "#9ca3af"} strokeWidth="2" opacity="0.5" />
        </motion.svg>

        {/* Light Burst on Open */}
        {isActive && (
          <motion.div
            className="absolute w-20 h-20 rounded-full"
            style={{
              background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
              opacity: 0.6
            }}
            animate={{
              scale: [0, 1.5],
              opacity: [0.8, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

// Stage 5: Payment Confirmed - Credit Card Flip & Pulse
function PaymentConfirmedAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#ec4899" density={12} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: isActive || isCompleted
            ? "linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        animate={isActive ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#ec4899" intensity={isActive ? 1.5 : 0.8} />}
        
        {/* Credit Card */}
        <motion.div
          style={{ perspective: "1000px" }}
          className="relative"
        >
          <motion.svg
            width="64"
            height="40"
            viewBox="0 0 64 40"
            style={{ transformStyle: "preserve-3d" }}
            animate={isActive ? {
              rotateY: [0, 180, 360],
            } : {}}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <rect
              x="2"
              y="2"
              width="60"
              height="36"
              rx="4"
              fill={isActive || isCompleted ? "#fff" : "#e5e7eb"}
              stroke={isActive || isCompleted ? "#ec4899" : "#9ca3af"}
              strokeWidth="2"
            />
            <rect x="2" y="8" width="60" height="8" fill={isActive || isCompleted ? "#1f2937" : "#6b7280"} />
            <rect x="8" y="22" width="16" height="10" rx="2" fill={isActive || isCompleted ? "#fbbf24" : "#9ca3af"} />
            <circle cx="52" cy="27" r="6" fill={isActive || isCompleted ? "#ec4899" : "#9ca3af"} opacity="0.3" />
          </motion.svg>
        </motion.div>

        {/* Floating Particles */}
        {isActive && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-pink-300"
                style={{
                  left: "50%",
                  top: "50%"
                }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * (20 + Math.random() * 10),
                  y: Math.sin((i / 8) * Math.PI * 2) * (20 + Math.random() * 10) - 10,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Stage 6: Fulfilled - Laptop Powers On with Green Aura
function FulfilledAnimation({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  return (
    <div className="relative w-32 h-32">
      {(isActive || isCompleted) && <ParticleBurst color="#10b981" density={16} />}
      
      <motion.div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: (isActive || isCompleted)
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)"
        }}
        initial={{ scale: 0.9 }}
        animate={(isActive || isCompleted) ? {
          scale: [1, 1.15, 1],
        } : {}}
        transition={{ duration: 2, repeat: (isActive || isCompleted) ? Infinity : 0 }}
      >
        {(isActive || isCompleted) && <GlowRing color="#10b981" intensity={isActive ? 1.8 : 1.2} />}
        
        {/* Laptop */}
        <motion.svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={(isActive || isCompleted) ? {
            opacity: 1,
            scale: 1
          } : {
            opacity: 0.3,
            scale: 0.8
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Laptop Base */}
          <path
            d="M12 38 L52 38 L52 26 L12 26 Z"
            fill={isCompleted ? "#a5f3d0" : "#e5e7eb"}
            stroke={isCompleted ? "#059669" : "#9ca3af"}
            strokeWidth="2"
          />
          
          {/* Screen Glow */}
          {(isActive || isCompleted) && (
            <rect
              x="16"
              y="28"
              width="32"
              height="8"
              fill="#10b981"
              opacity="0.6"
            />
          )}
          
          {/* Keyboard Base */}
          <path
            d="M8 38 L12 38 L52 38 L56 38 L58 44 L6 44 Z"
            fill={(isActive || isCompleted) ? "#047857" : "#6b7280"}
          />
          
          {/* Power Button */}
          <motion.circle
            cx="32"
            cy="32"
            r="3"
            fill={(isActive || isCompleted) ? "#10b981" : "#6b7280"}
            animate={(isActive || isCompleted) ? {
              opacity: [1, 0.5, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.svg>

        {/* Holographic Light Rays */}
        {(isActive || isCompleted) && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-16 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #10b981 0%, transparent 100%)",
                  left: "50%",
                  top: "50%",
                  transformOrigin: "bottom",
                  rotate: `${i * 60}deg`
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
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
      subtitle: "Processing at our eco-fulfillment center",
      date: timeline?.sentToWarehouse || null,
      position: 1
    },
    {
      id: "dispatched",
      label: "Dispatched",
      subtitle: "Your device is on its way",
      date: timeline?.dispatchDate || null,
      position: 2
    },
    {
      id: "invoiceSent",
      label: "Invoice Sent",
      subtitle: "Digital invoice delivered to your inbox",
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
      subtitle: "Your sustainable laptop is ready!",
      date: timeline?.dateFulfilled || null,
      position: 5
    }
  ];

  const completedStages = stages.filter(stage => stage.date !== null);
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
    <div className="relative py-8 px-4 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-lg">
      {/* Subtle Particle Flow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2"
        >
          Your Sustainable Journey
        </motion.h2>
        <p className="text-neutral-600 text-sm md:text-base">Eco-luxury delivery in progress</p>
      </div>

      {/* Progress Path */}
      <div className="relative max-w-5xl mx-auto mb-10">
        <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #ec4899 100%)"
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Progress Percentage */}
        <motion.div
          className="absolute -top-10 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
            left: `${progress}%`,
            transform: "translateX(-50%)"
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {Math.round(progress)}% Complete
        </motion.div>
      </div>

      {/* Timeline Stages */}
      <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {stages.map((stage, index) => {
          const isCompleted = stage.date !== null;
          const isCurrent = index === currentStageIndex && !isComplete;
          
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
              {/* Stage Number */}
              <motion.div
                className="absolute -top-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10"
                style={{
                  background: isCompleted || isCurrent
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                  color: isCompleted || isCurrent ? "#fff" : "#6b7280",
                  boxShadow: isCompleted || isCurrent ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none"
                }}
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>

              {/* Stage Animation */}
              <div className="relative mb-4">
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

              {/* Stage Info - Card */}
              <motion.div
                className={`
                  relative p-3 md:p-4 rounded-xl text-center min-h-[120px] md:min-h-[140px] w-full
                  ${isCompleted || isCurrent
                    ? "bg-white/90 backdrop-blur-sm border-2 border-emerald-400 shadow-lg"
                    : "bg-white/50 backdrop-blur-sm border-2 border-neutral-200"}
                `}
                whileHover={isCompleted || isCurrent ? { y: -4, scale: 1.02 } : {}}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Soft Glow Border */}
                {(isCompleted || isCurrent) && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-20"
                    style={{
                      boxShadow: "inset 0 0 20px #10b981"
                    }}
                  />
                )}

                <h4 className={`
                  text-xs md:text-sm font-bold mb-1 md:mb-2
                  ${isCompleted || isCurrent ? "text-neutral-900" : "text-neutral-500"}
                `}>
                  {stage.label}
                </h4>
                
                <p className={`
                  text-xs mb-2 md:mb-3
                  ${isCompleted || isCurrent ? "text-neutral-600" : "text-neutral-400"}
                `}>
                  {stage.subtitle}
                </p>

                {/* Date or Status */}
                {isCompleted && (
                  <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                    {formatDate(stage.date)}
                  </div>
                )}
                
                {isCurrent && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full inline-block"
                  >
                    In Progress...
                  </motion.div>
                )}

                {!isCompleted && !isCurrent && (
                  <div className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full inline-block">
                    Pending
                  </div>
                )}
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
                
                <h3 className="text-4xl font-bold text-white mb-4">Eco-Mission Complete!</h3>
                <p className="text-xl text-white/90 mb-8 flex items-center justify-center gap-2">
                  Your order is ready <Leaf className="w-6 h-6" /> <Sparkles className="w-6 h-6" />
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
