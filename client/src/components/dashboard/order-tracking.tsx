import { motion } from "framer-motion";
import { calculateOrderStages } from "@/lib/utils";

interface OrderTrackingProps {
  status: string;
}

export default function OrderTracking({ status }: OrderTrackingProps) {
  const stages = calculateOrderStages(status);
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3">Order Progress</h4>
      <div className="relative">
        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${stages.filter(stage => stage.active).length / stages.length * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {stages.map((stage, index) => (
            <div key={index} className="relative flex flex-col items-center">
              <div 
                className={`h-4 w-4 rounded-full ${
                  stage.active ? "bg-primary" : "bg-neutral-300"
                } border-2 border-white shadow-sm`}
              />
              <span 
                className={`absolute top-6 text-xs font-medium ${
                  stage.active ? "text-neutral-600" : "text-neutral-500"
                } whitespace-nowrap`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
