import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import UserAvatar from "./user-avatar";
import { cn } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";

interface NavTabProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavTab({ href, icon, children, active }: NavTabProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex flex-col items-center py-2 px-4 text-neutral-500 cursor-pointer",
          active && "text-primary border-b-2 border-primary"
        )}
      >
        <i className={`${icon} text-xl`}></i>
        <span className="text-xs mt-1">{children}</span>
      </div>
    </Link>
  );
}

export default function MobileNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    staleTime: 300000, // 5 minutes
  });

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-30 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-neutral-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <div className="p-4 border-b border-neutral-200">
                <a href="https://circularcomputing.com/" target="_blank" rel="noreferrer">
                  <img 
                    src="/attached_assets/CC_Logo_Teal.png" 
                    alt="Circular Computing" 
                    className="h-8 w-auto cursor-pointer"
                  />
                </a>
              </div>

              <div className="py-4">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Main
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-dashboard-line text-xl mr-3"></i>
                        <span>Dashboard</span>
                      </div>
                    </Link>
                    <Link href="/orders" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/orders" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-truck-line text-xl mr-3"></i>
                        <span>Orders</span>
                      </div>
                    </Link>
                    <Link href="/rma" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/rma" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-refresh-line text-xl mr-3"></i>
                        <span>RMA Tracking</span>
                      </div>
                    </Link>
                    <Link href="/support" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/support" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-customer-service-2-line text-xl mr-3"></i>
                        <span>Support</span>
                      </div>
                    </Link>
                    <Link href="/warranty" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/warranty" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-shield-check-line text-xl mr-3"></i>
                        <span>Warranty & Troubleshooting</span>
                      </div>
                    </Link>
                  </nav>
                </div>

                <div className="px-4 py-2 mt-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Impact
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/water-projects" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/water-projects" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-water-flash-line text-xl mr-3"></i>
                        <span>Water Projects</span>
                      </div>
                    </Link>
                    <Link href="/impact" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/impact" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-leaf-line text-xl mr-3"></i>
                        <span>Your Impact</span>
                      </div>
                    </Link>
                    <Link href="/esg-report" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/esg-report" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-file-chart-line text-xl mr-3"></i>
                        <span>ESG Report</span>
                      </div>
                    </Link>
                    <Link href="/case-studies" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/case-studies" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-file-text-line text-xl mr-3"></i>
                        <span>Case Studies</span>
                      </div>
                    </Link>
                  </nav>
                </div>

                <div className="px-4 py-2 mt-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Account
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/profile" onClick={() => setOpen(false)}>
                      <div className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100 cursor-pointer",
                        location === "/profile" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-user-settings-line text-xl mr-3"></i>
                        <span>Profile Settings</span>
                      </div>
                    </Link>
                  </nav>
                </div>
              </div>

              {user && (
                <div className="p-4 mt-auto border-t border-neutral-200">
                  <div className="flex items-center">
                    <UserAvatar name={user.name} />
                    <div className="ml-3">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.company}</p>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <a href="https://circularcomputing.com/" target="_blank" rel="noreferrer">
            <img 
              src="/attached_assets/CC_Logo_Teal.png" 
              alt="Circular Computing" 
              className="h-8 w-auto cursor-pointer"
            />
          </a>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-neutral-700">
            <Bell className="h-6 w-6" />
          </Button>
          {user && <UserAvatar name={user.name} />}
        </div>
      </div>
      
      {/* Mobile Navigation Tabs */}
      <div className="bg-white border-t border-neutral-200 flex justify-around">
        <NavTab href="/" icon="ri-dashboard-line" active={location === "/"}>
          Dashboard
        </NavTab>
        <NavTab href="/orders" icon="ri-truck-line" active={location === "/orders"}>
          Orders
        </NavTab>
        <NavTab href="/warranty" icon="ri-shield-check-line" active={location === "/warranty"}>
          Warranty
        </NavTab>
        <NavTab href="/support" icon="ri-customer-service-2-line" active={location === "/support"}>
          Support
        </NavTab>
        <NavTab href="/esg-report" icon="ri-file-chart-line" active={location === "/esg-report"}>
          ESG
        </NavTab>
      </div>
    </header>
  );
}
