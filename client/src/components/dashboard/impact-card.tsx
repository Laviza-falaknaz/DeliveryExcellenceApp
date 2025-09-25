import { Card, CardContent } from "@/components/ui/card";
import { formatEnvironmentalImpact } from "@/lib/utils";
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
}: ImpactCardProps) {
  const formattedValue = formatEnvironmentalImpact(value, unit);

  return (
    <Card className="overflow-hidden border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm text-neutral-500">{title}</span>
            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
              {formattedValue}
            </h3>
          </div>
          <div className={`h-10 w-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
            {iconImage ? (
              <img src={iconImage} alt={title} className="w-6 h-6" />
            ) : (
              <i className={`${icon} text-xl`}></i>
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-${iconColor.replace('text-', '')}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>{footnote1}</span>
            {footnote2 && <span>{footnote2}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
