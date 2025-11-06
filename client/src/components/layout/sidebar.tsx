import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import UserAvatar from "./user-avatar";
import { Separator } from "@/components/ui/separator";

interface NavItemProps {
  href: string;
  icon: string;
  children: React.ReactNode;
  active?: boolean;
}

function NavItem({ href, icon, children, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center px-3 py-2 rounded-lg mb-1 text-black hover:bg-neutral-100 cursor-pointer",
          active && "bg-neutral-100 text-black font-medium"
        )}
      >
        <i className={`${icon} text-xl mr-3`}></i>
        <span>{children}</span>
      </div>
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-3">
        {title}
      </h3>
      <nav>{children}</nav>
    </div>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    staleTime: 300000, // 5 minutes
  });

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-w-64 bg-white border-r border-neutral-200 shadow-sm">
      <div className="p-4 border-b border-neutral-200">
        <a href="https://circularcomputing.com/" target="_blank" rel="noreferrer">
          <div className="flex items-center cursor-pointer">
            <img 
              src="/attached_assets/CC_Logo_Teal.png" 
              alt="Circular Computing" 
              className="h-8 w-auto"
            />
          </div>
        </a>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <NavSection title="Main">
          <NavItem href="/" icon="ri-dashboard-line" active={location === "/"}>
            Dashboard
          </NavItem>
          <NavItem
            href="/orders"
            icon="ri-truck-line"
            active={location === "/orders"}
          >
            Your Orders
          </NavItem>
          <NavItem
            href="/warranty-claim"
            icon="ri-alert-line"
            active={location === "/warranty-claim"}
          >
            Create RMA
          </NavItem>
          <NavItem
            href="/rma"
            icon="ri-refresh-line"
            active={location === "/rma"}
          >
            RMA Tracking
          </NavItem>
          <NavItem
            href="/support"
            icon="ri-customer-service-2-line"
            active={location === "/support"}
          >
            Support
          </NavItem>
          <NavItem
            href="/warranty"
            icon="ri-shield-check-line"
            active={location === "/warranty"}
          >
            Warranty & Troubleshooting
          </NavItem>
          <NavItem
            href="/remanufactured"
            icon="ri-recycle-line"
            active={location === "/remanufactured"}
          >
            Remanufactured Explained
          </NavItem>
        </NavSection>

        <NavSection title="Impact">
          <NavItem
            href="/water-projects"
            icon="ri-water-flash-line"
            active={location === "/water-projects"}
          >
            Water Projects
          </NavItem>
          <NavItem
            href="/impact"
            icon="ri-leaf-line"
            active={location === "/impact"}
          >
            Your Impact
          </NavItem>
          <NavItem
            href="/esg-report"
            icon="ri-file-chart-line"
            active={location === "/esg-report"}
          >
            ESG Report
          </NavItem>
          <NavItem
            href="/case-studies"
            icon="ri-file-text-line"
            active={location === "/case-studies"}
          >
            Case Studies
          </NavItem>
        </NavSection>

        <NavSection title="Account">
          <NavItem
            href="/profile"
            icon="ri-user-settings-line"
            active={location === "/profile"}
          >
            Profile Settings
          </NavItem>
        </NavSection>

        {user?.isAdmin && (
          <NavSection title="Administration">
            <NavItem
              href="/admin"
              icon="ri-admin-line"
              active={location === "/admin"}
            >
              Admin Portal
            </NavItem>
          </NavSection>
        )}
      </div>

      {user && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <UserAvatar name={user.name} />
            <div className="ml-3">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.company}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
