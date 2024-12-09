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
import { Navigation } from "./components/Navigation";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Parse cookies into an object
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const authenticated = cookies['authenticated'] === 'true';
        console.log('Auth check:', { authenticated, cookies });
        
        setIsAuthenticated(authenticated);
        setIsChecking(false);
        
        if (!authenticated) {
          console.log('Not authenticated, redirecting to login');
          setLocation('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsChecking(false);
        setLocation('/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <>
      <Navigation />
      <Component />
    </>
  ) : null;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = document.cookie.includes('authenticated=true');
      console.log('Router auth check:', { authenticated, location });
      
      setIsAuthenticated(authenticated);
      setIsChecking(false);
      
      if (authenticated && location === '/login') {
        console.log('Authenticated user at login page, redirecting to home');
        setLocation('/');
      }
    };
    
    checkAuth();
  }, [location, setLocation]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated ? null : <LoginPage />}
      </Route>
      <Route path="/projects">
        <PrivateRoute component={ProjectManagementPage} />
      </Route>
      <Route path="/">
        <PrivateRoute component={HomePage} />
      </Route>
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
