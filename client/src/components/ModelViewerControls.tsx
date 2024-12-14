import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Glasses, Camera } from "lucide-react";

interface ModelViewerControlsProps {
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onObjectVisibilityToggle: (visible: boolean) => void;
  onVRToggle: () => void;
  onARToggle: (mode: "marker" | "markerless") => void;
}

export function ModelViewerControls({
  onColorChange,
  onOpacityChange,
  onObjectVisibilityToggle,
  onVRToggle,
  onARToggle,
}: ModelViewerControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [color, setColor] = useState("#00ff00");
  const [opacity, setOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={`bg-card border-r transition-all duration-300 flex ${isExpanded ? "w-64" : "w-12"}`}>
      <div className="flex-1 p-4 overflow-hidden">
        {isExpanded && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">View Options</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={onVRToggle}
                >
                  <Glasses className="h-4 w-4" />
                  VR Mode
                </Button>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => onARToggle("marker")}
                  >
                    <Camera className="h-4 w-4" />
                    AR with Marker
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => onARToggle("markerless")}
                  >
                    <Camera className="h-4 w-4" />
                    AR Without Marker
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Model Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    onColorChange(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opacity">Opacity</Label>
                <Slider
                  id="opacity"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[opacity]}
                  onValueChange={(values) => {
                    const value = values[0];
                    setOpacity(value);
                    onOpacityChange(value);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="visibility">Visible</Label>
                <Switch
                  id="visibility"
                  checked={isVisible}
                  onCheckedChange={(checked) => {
                    setIsVisible(checked);
                    onObjectVisibilityToggle(checked);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-auto border-l"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
