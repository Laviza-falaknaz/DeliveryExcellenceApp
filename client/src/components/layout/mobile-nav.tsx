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
      <a
        className={cn(
          "flex flex-col items-center py-2 px-4 text-neutral-500",
          active && "text-primary border-b-2 border-primary"
        )}
      >
        <i className={`${icon} text-xl`}></i>
        <span className="text-xs mt-1">{children}</span>
      </a>
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
                <svg
                  width="120"
                  height="40"
                  viewBox="0 0 240 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8"
                >
                  <path
                    d="M40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40C20 28.9543 28.9543 20 40 20Z"
                    fill="#2E7D32"
                  />
                  <path
                    d="M40 24C48.8366 24 56 31.1634 56 40C56 48.8366 48.8366 56 40 56C31.1634 56 24 48.8366 24 40C24 31.1634 31.1634 24 40 24Z"
                    fill="#4CAF50"
                    fillOpacity="0.5"
                  />
                  <path d="M80 30H220V36H80V30Z" fill="#2E7D32" />
                  <path d="M80 44H180V50H80V44Z" fill="#2E7D32" />
                </svg>
              </div>

              <div className="py-4">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Main
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-dashboard-line text-xl mr-3"></i>
                        <span>Dashboard</span>
                      </a>
                    </Link>
                    <Link href="/orders" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/orders" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-truck-line text-xl mr-3"></i>
                        <span>Orders</span>
                      </a>
                    </Link>
                    <Link href="/rma" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/rma" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-refresh-line text-xl mr-3"></i>
                        <span>RMA Tracking</span>
                      </a>
                    </Link>
                    <Link href="/support" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/support" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-customer-service-2-line text-xl mr-3"></i>
                        <span>Support</span>
                      </a>
                    </Link>
                    <Link href="/warranty" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/warranty" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-shield-check-line text-xl mr-3"></i>
                        <span>Warranty & Troubleshooting</span>
                      </a>
                    </Link>
                  </nav>
                </div>

                <div className="px-4 py-2 mt-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Impact
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/water-projects" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/water-projects" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-water-flash-line text-xl mr-3"></i>
                        <span>Water Projects</span>
                      </a>
                    </Link>
                    <Link href="/impact" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/impact" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-leaf-line text-xl mr-3"></i>
                        <span>Environmental Impact</span>
                      </a>
                    </Link>
                    <Link href="/esg-report" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/esg-report" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-file-chart-line text-xl mr-3"></i>
                        <span>ESG Report</span>
                      </a>
                    </Link>
                    <Link href="/case-studies" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/case-studies" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-file-text-line text-xl mr-3"></i>
                        <span>Case Studies</span>
                      </a>
                    </Link>
                  </nav>
                </div>

                <div className="px-4 py-2 mt-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Account
                  </h3>
                  <nav className="space-y-1">
                    <Link href="/profile" onClick={() => setOpen(false)}>
                      <a className={cn(
                        "flex items-center px-2 py-2 rounded-md text-neutral-700 hover:bg-neutral-100",
                        location === "/profile" && "bg-primary-light/10 text-primary font-medium"
                      )}>
                        <i className="ri-user-settings-line text-xl mr-3"></i>
                        <span>Profile Settings</span>
                      </a>
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
          <svg
            width="120"
            height="40"
            viewBox="0 0 240 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-8"
          >
            <path
              d="M40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40C20 28.9543 28.9543 20 40 20Z"
              fill="#2E7D32"
            />
            <path
              d="M40 24C48.8366 24 56 31.1634 56 40C56 48.8366 48.8366 56 40 56C31.1634 56 24 48.8366 24 40C24 31.1634 31.1634 24 40 24Z"
              fill="#4CAF50"
              fillOpacity="0.5"
            />
            <path d="M80 30H220V36H80V30Z" fill="#2E7D32" />
            <path d="M80 44H180V50H80V44Z" fill="#2E7D32" />
          </svg>
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
