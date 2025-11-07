import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Orders from "@/pages/orders";
import Support from "@/pages/support";
import Login from "@/pages/login";
import RMA from "@/pages/rma";
import Impact from "@/pages/impact";
import WaterProjects from "@/pages/water-projects";
import Profile from "@/pages/profile";
import CaseStudies from "@/pages/case-studies";
import Warranty from "@/pages/warranty";
import Remanufactured from "@/pages/remanufactured";
import ESGReport from "@/pages/esg-report";
import DeliveryTimeline from "@/pages/delivery-timeline";
import WarrantyClaim from "@/pages/warranty-claim";
import OrderJourneyPage from "@/pages/order-journey";
import { AdminDashboard } from "@/pages/admin-dashboard";
import { ImpactEquivalencySettings } from "@/pages/admin/impact-equivalency-settings";
import { EsgParameters } from "@/pages/admin/esg-parameters";
import SustainabilityQuizPage from "@/pages/sustainability-quiz-page";
import WasteSortingGamePage from "@/pages/waste-sorting-game-page";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { FloatingChat } from "@/components/ui/floating-chat";
import { LaunchAnimation } from "@/components/ui/launch-animation";
import { AnimatePresence } from "framer-motion";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiRequest("GET", "/api/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const user = await response.json();
        if (user.isAdmin) {
          setIsAdmin(true);
        } else {
          setLocation("/");
        }
      } catch (error) {
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAdmin ? <>{children}</> : null;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // Don't show layout for login page
  if (location === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
      <FloatingChat />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Route>
      <Route path="/orders/:id/journey">
        <ProtectedRoute>
          <OrderJourneyPage />
        </ProtectedRoute>
      </Route>
      <Route path="/delivery-timeline">
        <ProtectedRoute>
          <DeliveryTimeline />
        </ProtectedRoute>
      </Route>
      <Route path="/rma">
        <ProtectedRoute>
          <RMA />
        </ProtectedRoute>
      </Route>
      <Route path="/support">
        <ProtectedRoute>
          <Support />
        </ProtectedRoute>
      </Route>
      <Route path="/impact">
        <ProtectedRoute>
          <Impact />
        </ProtectedRoute>
      </Route>
      <Route path="/water-projects">
        <ProtectedRoute>
          <WaterProjects />
        </ProtectedRoute>
      </Route>
      <Route path="/warranty">
        <ProtectedRoute>
          <Warranty />
        </ProtectedRoute>
      </Route>
      <Route path="/remanufactured">
        <ProtectedRoute>
          <Remanufactured />
        </ProtectedRoute>
      </Route>
      <Route path="/warranty-claim">
        <ProtectedRoute>
          <WarrantyClaim />
        </ProtectedRoute>
      </Route>
      <Route path="/esg-report">
        <ProtectedRoute>
          <ESGReport />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/case-studies">
        <ProtectedRoute>
          <CaseStudies />
        </ProtectedRoute>
      </Route>
      <Route path="/delivery-timeline">
        <ProtectedRoute>
          <DeliveryTimeline />
        </ProtectedRoute>
      </Route>
      <Route path="/quiz">
        <ProtectedRoute>
          <SustainabilityQuizPage />
        </ProtectedRoute>
      </Route>
      <Route path="/sorting-game">
        <ProtectedRoute>
          <WasteSortingGamePage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/impact-equivalency-settings">
        <AdminProtectedRoute>
          <ImpactEquivalencySettings />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/esg-parameters">
        <AdminProtectedRoute>
          <EsgParameters />
        </AdminProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(() => {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenLaunchAnimation');
    return !hasSeenAnimation;
  });

  const handleAnimationComplete = () => {
    sessionStorage.setItem('hasSeenLaunchAnimation', 'true');
    setShowLaunchAnimation(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AnimatePresence mode="wait">
          {showLaunchAnimation ? (
            <LaunchAnimation
              key="launch"
              onComplete={handleAnimationComplete}
            />
          ) : (
            <AppLayout key="app">
              <Router />
            </AppLayout>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
