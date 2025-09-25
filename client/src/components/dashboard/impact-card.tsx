import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatEnvironmentalImpact } from "@/lib/utils";

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
    <Card data-testid="impact-card">
      <CardContent className="p-6" data-testid="impact-card-content">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">
              {title}
            </h3>
            <p className="text-3xl font-bold mt-1" data-testid="impact-card-value">
              {formattedValue}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-full ${iconBgColor} flex items-center justify-center`} data-testid="impact-card-icon">
            {iconImage ? (
              <img src={iconImage} alt={title} className="w-7 h-7" />
            ) : (
              <i className={`${icon} text-xl`}></i>
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between mb-1 text-sm">
            <span>Impact level</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className="h-2"
          />
        </div>
        <div className={`mt-4 text-sm flex items-center ${iconColor}`} data-testid="impact-card-footer">
          <i className="ri-arrow-up-line mr-1"></i>
          <span>{footnote1}</span>
        </div>
      </CardContent>
    </Card>
  );
}
