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
      <a
        className={cn(
          "flex items-center px-3 py-2 rounded-lg mb-1 text-neutral-700 hover:bg-neutral-100",
          active && "bg-primary-light/10 text-primary font-medium"
        )}
      >
        <i className={`${icon} text-xl mr-3`}></i>
        <span>{children}</span>
      </a>
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
        <Link href="/">
          <a className="flex items-center">
            <svg
              width="120"
              height="40"
              viewBox="0 0 240 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-10"
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
          </a>
        </Link>
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
            Orders
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
            Environmental Impact
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
