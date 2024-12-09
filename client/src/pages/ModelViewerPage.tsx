import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelViewer } from "../components/ModelViewer";

export function ModelViewerPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            3D Model Viewer
          </h1>
        </header>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Model Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ModelViewer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
