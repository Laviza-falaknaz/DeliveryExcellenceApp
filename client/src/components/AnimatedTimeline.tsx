import { motion } from "framer-motion";
import { Package, CheckCircle2, Truck, Home, Warehouse, ClipboardCheck, CreditCard, FileText, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeliveryTimeline } from "@shared/schema";

interface TimelineStep {
  key: string;
  label: string;
  icon: any;
  animation: string; // Simple animation type
  completedAt?: Date | string | null;
}

interface AnimatedTimelineProps {
  timeline: DeliveryTimeline;
}

export function AnimatedTimeline({ timeline }: AnimatedTimelineProps) {
  const steps: TimelineStep[] = [
    { key: "orderDate", label: "Order Placed", icon: CheckCircle2, animation: "check" },
    { key: "paymentDate", label: "Payment Received", icon: CreditCard, animation: "check" },
    { key: "invoiceMailed", label: "Invoice Sent", icon: FileText, animation: "check" },
    { key: "sentToWarehouse", label: "Sent to Warehouse", icon: Warehouse, animation: "spin" },
    { key: "dateFulfilled", label: "Order Fulfilled", icon: Package, animation: "pack" },
    { key: "qualityCheckDate", label: "Quality Checked", icon: Star, animation: "sparkle" },
    { key: "dispatchDate", label: "Dispatched", icon: Truck, animation: "truck" },
    { key: "deliveryDate", label: "Delivered", icon: Home, animation: "celebrate" },
    { key: "orderCompleted", label: "Completed", icon: ClipboardCheck, animation: "celebrate" },
  ];

  // Find current active step
  const completedSteps = steps.filter(step => {
    const date = timeline[step.key as keyof DeliveryTimeline];
    return date && typeof date !== 'number' && new Date(date as Date) <= new Date();
  });
  
  const currentStepIndex = completedSteps.length;
  const isCurrentStep = (index: number) => index === currentStepIndex - 1;
  const isCompleted = (index: number) => index < currentStepIndex;

  return (
    <div className="relative py-8">
      {/* Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = isCompleted(index);
          const current = isCurrentStep(index);
          const date = timeline[step.key as keyof DeliveryTimeline];

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 relative overflow-hidden ${
                current ? 'border-accent border-2 shadow-lg' : completed ? 'border-green-500' : 'border-neutral-200'
              }`}>
                {/* Background Animation for Current Step */}
                {current && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}

                <div className="relative z-10">
                  {/* Icon with Animation */}
                  <div className={`mb-4 flex items-center justify-center w-16 h-16 rounded-full mx-auto ${
                    current ? 'bg-accent text-white' : 
                    completed ? 'bg-green-500 text-white' : 
                    'bg-neutral-100 text-neutral-400'
                  }`}>
                    {current ? (
                      <motion.div
                        animate={
                          step.animation === "spin" ? { rotate: 360 } :
                          step.animation === "build" ? { rotate: [0, -15, 15, -15, 0] } :
                          step.animation === "pack" ? { scale: [1, 1.1, 1] } :
                          step.animation === "sparkle" ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } :
                          step.animation === "truck" ? { x: [0, 10, 0] } :
                          {}
                        }
                        transition={
                          step.animation === "spin" ? { duration: 3, repeat: Infinity, ease: "linear" } :
                          step.animation === "build" ? { duration: 0.5, repeat: Infinity, repeatDelay: 1 } :
                          step.animation === "pack" ? { duration: 1, repeat: Infinity } :
                          step.animation === "sparkle" ? { duration: 2, repeat: Infinity } :
                          step.animation === "truck" ? { duration: 1.5, repeat: Infinity } :
                          { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
                        }
                      >
                        <Icon className="w-8 h-8" />
                      </motion.div>
                    ) : (
                      <Icon className="w-8 h-8" />
                    )}
                  </div>

                  {/* Step Label */}
                  <h4 className={`text-center font-medium mb-2 ${
                    current ? 'text-accent' : completed ? 'text-green-700' : 'text-neutral-600'
                  }`}>
                    {step.label}
                  </h4>

                  {/* Date */}
                  {date && (
                    <p className="text-xs text-center text-neutral-500">
                      {new Date(date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Current Step Indicator */}
                  {current && (
                    <motion.div
                      className="mt-3 flex items-center justify-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                    </motion.div>
                  )}

                  {/* Checkmark for Completed */}
                  {completed && !current && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-3 flex justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-8 max-w-4xl mx-auto">
        <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-green-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-2 text-center text-sm text-neutral-600">
          {completedSteps.length} of {steps.length} milestones completed
        </div>
      </div>
    </div>
  );
}
