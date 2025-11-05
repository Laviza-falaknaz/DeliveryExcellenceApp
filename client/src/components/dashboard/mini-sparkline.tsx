import { motion } from "framer-motion";
import { useMemo } from "react";

interface MiniSparklineProps {
  data: number[];
  color: string; // Made required to avoid invalid fallback
  height?: number;
}

export default function MiniSparkline({ data, color, height = 40 }: MiniSparklineProps) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#gradient-${color.replace('#', '')})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
    </svg>
  );
}
