import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  password: string;
  name: string;
  company: string;
  email: string;
  phoneNumber?: string;
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setIsLoading(true);
      await apiRequest("GET", "/api/auth/me");
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/login", credentials);
      
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      setIsAuthenticated(true);
      setLocation("/");
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(credentials: RegisterCredentials) {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/register", credentials);
      
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      setIsAuthenticated(true);
      setLocation("/");
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout");
      
      // Clear user data and cache
      queryClient.clear();
      
      setIsAuthenticated(false);
      setLocation("/login");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
}
