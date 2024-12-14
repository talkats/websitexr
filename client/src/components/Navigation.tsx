import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="link" className="text-lg font-semibold">
                User Management
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="link" className="text-lg font-semibold">
                Project Management
              </Button>
            </Link>
            <Link href="/model-viewer">
              <Button variant="link" className="text-lg font-semibold">
                3D Model Viewer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
