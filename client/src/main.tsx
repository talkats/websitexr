import { StrictMode } from "react";
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
  
  // Check if user is authenticated
  const isAuthenticated = document.cookie.includes('authenticated=true');
  
  if (!isAuthenticated) {
    // Use setTimeout to avoid immediate redirect which can cause render issues
    setTimeout(() => setLocation('/login'), 0);
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/">
        <PrivateRoute component={HomePage} />
      </Route>
      <Route path="/projects">
        <PrivateRoute component={ProjectManagementPage} />
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
