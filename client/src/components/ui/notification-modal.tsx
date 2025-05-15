import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "impact" | "water" | "support";
  date: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
}: NotificationModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredNotifications = selectedType
    ? notifications.filter((notification) => notification.type === selectedType)
    : notifications;

  const types = [
    { id: "order", label: "Orders", icon: "ri-truck-line" },
    { id: "impact", label: "Impact", icon: "ri-leaf-line" },
    { id: "water", label: "Water", icon: "ri-water-flash-line" },
    { id: "support", label: "Support", icon: "ri-customer-service-2-line" },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-primary-light/10 text-primary";
      case "impact":
        return "bg-success/10 text-success";
      case "water":
        return "bg-secondary/10 text-secondary";
      case "support":
        return "bg-accent/10 text-accent";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return "ri-truck-line";
      case "impact":
        return "ri-leaf-line";
      case "water":
        return "ri-water-flash-line";
      case "support":
        return "ri-customer-service-2-line";
      default:
        return "ri-notification-3-line";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            Stay updated with your orders, impacts, and support requests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-2 py-2 overflow-x-auto">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            All
          </Button>
          {types.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.id)}
              className="flex items-center"
            >
              <i className={`${type.icon} mr-1`}></i>
              {type.label}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto my-2">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg border ${
                      notification.read ? "bg-white" : "bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <i className={getTypeIcon(notification.type)}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-neutral-500">
                            {notification.date.toLocaleDateString()} at{" "}
                            {notification.date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary"
                              onClick={() => {
                                onMarkAsRead(notification.id);
                                onClose();
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              {notification.actionText || "View Details"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 mb-3">
                  <i className="ri-notification-off-line text-2xl text-neutral-400"></i>
                </div>
                <h4 className="font-medium text-neutral-700">No notifications</h4>
                <p className="text-sm text-neutral-500">
                  When you receive notifications, they will appear here.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              notifications.forEach((n) => onMarkAsRead(n.id));
              onClose();
            }}
          >
            Mark all as read
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
