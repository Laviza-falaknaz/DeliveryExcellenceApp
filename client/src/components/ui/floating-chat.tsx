import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 btn-primary-hover"
          aria-label="Open live chat"
        >
          <i className="ri-customer-service-2-line text-xl text-white"></i>
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Live Chat Support</DialogTitle>
            <DialogDescription>
              Get instant help from our support team
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                  <i className="ri-customer-service-2-line text-white text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-sm">Support Team</p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">
                Hello! How can we help you today? Our team is available to assist with orders, returns, and technical support.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full justify-start btn-outline-hover" 
                variant="outline"
                asChild
              >
                <a href="https://circularcomputing.com/contact/" target="_blank" rel="noreferrer">
                  <i className="ri-mail-line mr-2"></i>
                  Contact Support
                </a>
              </Button>
              
              <Button 
                className="w-full justify-start btn-outline-hover" 
                variant="outline"
                asChild
              >
                <a href="https://my-warranty.com/kb/" target="_blank" rel="noreferrer">
                  <i className="ri-book-line mr-2"></i>
                  Knowledge Base
                </a>
              </Button>
              
              <Button 
                className="w-full justify-start btn-outline-hover" 
                variant="outline"
                asChild
              >
                <a href="https://my-warranty.com/troubleshoot/" target="_blank" rel="noreferrer">
                  <i className="ri-tools-line mr-2"></i>
                  Troubleshooting
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}