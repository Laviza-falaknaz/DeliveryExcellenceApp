import { Card, CardContent } from "@/components/ui/card";
import { formatEnvironmentalImpact } from "@/lib/utils";
import MiniSparkline from "./mini-sparkline";
import { motion } from "framer-motion";

interface ImpactCardProps {
  title: string;
  value: number;
  unit: string;
  icon: string;
  iconImage?: string;
  iconColor: string;
  iconBgColor: string;
  progress: number;
  footnote1: string;
  footnote2?: string;
  trend?: number[];
  trendColor?: string;
}

export default function ImpactCard({
  title,
  value,
  unit,
  icon,
  iconImage,
  iconColor,
  iconBgColor,
  progress,
  footnote1,
  footnote2,
  trend,
  trendColor,
}: ImpactCardProps) {
  const formattedValue = formatEnvironmentalImpact(value, unit);

  return (
    <Card data-testid="impact-card" className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6" data-testid="impact-card-content">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-neutral-500 mb-2">
              {title}
            </h3>
            <motion.p 
              className="text-3xl font-bold text-neutral-900" 
              data-testid="impact-card-value"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              {formattedValue}
            </motion.p>
          </div>
          <motion.div 
            className={`h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center shadow-sm`} 
            data-testid="impact-card-icon"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {iconImage ? (
              <img src={iconImage} alt={title} className="w-7 h-7" />
            ) : (
              <i className={`${icon} text-xl ${iconColor}`}></i>
            )}
          </motion.div>
        </div>
        
        {trend && trend.length > 0 && trendColor && (
          <div className="mb-3 h-10">
            <MiniSparkline data={trend} color={trendColor} height={40} />
          </div>
        )}
        
        <div className={`text-xs flex items-center ${iconColor} font-medium`} data-testid="impact-card-footer">
          <i className="ri-arrow-up-line mr-1"></i>
          <span>{footnote1}</span>
        </div>
      </CardContent>
    </Card>
  );
}
