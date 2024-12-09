import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { HomePage } from "./pages/HomePage";
import { ProjectManagementPage } from "./pages/ProjectManagementPage";
import { LoginPage } from "./pages/LoginPage";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = document.cookie.includes('authenticated=true');
      setIsAuthenticated(authenticated);
      setIsChecking(false);
      
      if (!authenticated) {
        setLocation('/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isChecking) {
    return null;
  }

  return isAuthenticated ? <Component /> : null;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = document.cookie.includes('authenticated=true');
      setIsAuthenticated(authenticated);
      
      // Redirect to login if not authenticated and not on login page
      if (!authenticated && location !== '/login') {
        setLocation('/login');
      }
      // Redirect to home if authenticated and on login page
      else if (authenticated && location === '/login') {
        setLocation('/');
      }
    };
    
    checkAuth();
    // Check authentication status periodically
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? null : <LoginPage />}
      </Route>
      <Route path="/projects">
        <PrivateRoute component={() => (
          <Layout>
            <ProjectManagementPage />
          </Layout>
        )} />
      </Route>
      <Route path="/">
        <PrivateRoute component={() => (
          <Layout>
            <HomePage />
          </Layout>
        )} />
      </Route>
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
