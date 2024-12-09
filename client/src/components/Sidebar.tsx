import { Link, useLocation } from "wouter";
import { Users, FolderKanban, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function SidebarLink({ href, icon, children, isActive }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          isActive && "bg-primary/10 text-primary hover:bg-primary/20"
        )}
      >
        {icon}
        {children}
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="h-full border-r bg-card p-3 w-64 space-y-2">
      <div className="mb-4">
        <h2 className="font-semibold text-lg px-3 py-2">Dashboard</h2>
      </div>
      <nav className="space-y-1">
        <SidebarLink
          href="/"
          icon={<Users className="h-4 w-4" />}
          isActive={location === "/"}
        >
          User Management
        </SidebarLink>
        <SidebarLink
          href="/projects"
          icon={<FolderKanban className="h-4 w-4" />}
          isActive={location === "/projects"}
        >
          Project Management
        </SidebarLink>
        <SidebarLink
          href="/model-viewer"
          icon={<Box className="h-4 w-4" />}
          isActive={location === "/model-viewer"}
        >
          3D Model Viewer
        </SidebarLink>
      </nav>
    </div>
  );
}
