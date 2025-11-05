import { motion, AnimatePresence } from "framer-motion";
import { useState, ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface OrbitalPanelProps {
  title: string;
  icon: LucideIcon;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
  children: ReactNode;
  expandable?: boolean;
  accentColor?: string;
}

export function OrbitalPanel({ 
  title, 
  icon: Icon, 
  position, 
  children, 
  expandable = true,
  accentColor = 'emerald'
}: OrbitalPanelProps) {
  const [isExpanded, setIsExpanded] = useState(!expandable);

  const positionClasses = {
    'top-left': 'top-8 left-8',
    'top-right': 'top-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-right': 'bottom-8 right-8',
    'left': 'top-1/2 -translate-y-1/2 left-8',
    'right': 'top-1/2 -translate-y-1/2 right-8'
  };

  const accentColorClasses = {
    emerald: 'from-emerald-400/20 to-emerald-600/20 border-emerald-400/30 shadow-emerald-500/20',
    cyan: 'from-cyan-400/20 to-cyan-600/20 border-cyan-400/30 shadow-cyan-500/20',
    gold: 'from-amber-400/20 to-amber-600/20 border-amber-400/30 shadow-amber-500/20',
    teal: 'from-teal-400/20 to-teal-600/20 border-teal-400/30 shadow-teal-500/20'
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-10`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      <motion.div
        className={`
          bg-gradient-to-br ${accentColorClasses[accentColor as keyof typeof accentColorClasses]}
          backdrop-blur-xl rounded-3xl border shadow-2xl
          ${expandable ? 'cursor-pointer' : ''}
        `}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
        whileHover={expandable ? { scale: 1.02, y: -2 } : {}}
        animate={{
          boxShadow: [
            '0 0 20px rgba(16, 185, 129, 0.2)',
            '0 0 30px rgba(16, 185, 129, 0.3)',
            '0 0 20px rgba(16, 185, 129, 0.2)'
          ]
        }}
        transition={{
          boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Header - icon and title */}
        <div className="p-6 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Icon className="h-6 w-6 text-white/90" />
          </motion.div>
          <div>
            <h3 className="text-white/90 font-semibold text-lg">{title}</h3>
          </div>
        </div>

        {/* Content - always shown if non-expandable, animated if expandable */}
        {!expandable ? (
          <div className="px-6 pb-6 border-t border-white/10 pt-4">
            {children}
          </div>
        ) : (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-white/10 pt-4">
                  {children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
}
