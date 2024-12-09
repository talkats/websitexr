import React, { StrictMode, useEffect } from "react";
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
  const isAuthenticated = document.cookie.includes('authenticated=true');
  
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const isAuthenticated = document.cookie.includes('authenticated=true');

  // Redirect to home if authenticated user tries to access login page
  useEffect(() => {
    if (isAuthenticated && location === '/login') {
      window.location.href = '/';
    }
  }, [isAuthenticated, location]);

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
