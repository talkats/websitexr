import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from "@/components/ui/button";
import { ModelViewerControls } from "./ModelViewerControls";

export function ModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Mesh | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create a simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      flatShading: true,
      transparent: true,
      opacity: 1
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    modelRef.current = cube;
    setLoading(false);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Model control functions
  const handleColorChange = (color: string) => {
    if (modelRef.current) {
      (modelRef.current.material as THREE.MeshPhongMaterial).color.setStyle(color);
    }
  };

  const handleOpacityChange = (opacity: number) => {
    if (modelRef.current) {
      (modelRef.current.material as THREE.MeshPhongMaterial).opacity = opacity;
    }
  };

  const handleObjectVisibilityToggle = (visible: boolean) => {
    if (modelRef.current) {
      modelRef.current.visible = visible;
    }
  };

  const handleVRToggle = () => {
    if (rendererRef.current?.xr) {
      // VR mode implementation will go here
      console.log("VR mode toggled");
    }
  };

  const handleARToggle = (mode: "marker" | "markerless") => {
    if (rendererRef.current?.xr) {
      // AR mode implementation will go here
      console.log("AR mode toggled:", mode);
    }
  };

  // Reset view function
  const resetView = () => {
    if (!cameraRef.current || !controlsRef.current || !modelRef.current) return;

    // Reset camera position
    cameraRef.current.position.set(0, 0, 5);
    cameraRef.current.lookAt(0, 0, 0);

    // Reset controls
    controlsRef.current.reset();

    // Reset model rotation and position
    modelRef.current.rotation.set(0, 0, 0);
    modelRef.current.position.set(0, 0, 0);
  };

  return (
    <div className="flex h-[600px] relative">
      <ModelViewerControls
        onColorChange={handleColorChange}
        onOpacityChange={handleOpacityChange}
        onObjectVisibilityToggle={handleObjectVisibilityToggle}
        onVRToggle={handleVRToggle}
        onARToggle={handleARToggle}
      />
      <div className="flex-1">
        <div ref={containerRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-lg font-semibold">Loading model...</div>
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <Button onClick={resetView}>Reset View</Button>
        </div>
      </div>
    </div>
  );
}
