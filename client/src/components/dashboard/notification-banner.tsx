import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface NotificationBannerProps {
  message: string;
  subText: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationBanner({
  message,
  subText,
  isVisible,
  onClose,
}: NotificationBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div 
      className="bg-accent/10 border border-accent rounded-lg p-4 mb-6 flex items-start"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <i className="ri-notification-3-line text-accent mt-0.5 mr-3 flex-shrink-0"></i>
      <div>
        <p className="font-medium text-neutral-800">{message}</p>
        <p className="text-sm text-neutral-600">{subText}</p>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-auto text-neutral-500 hover:text-neutral-700"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
