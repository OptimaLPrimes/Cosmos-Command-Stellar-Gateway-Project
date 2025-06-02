// src/components/galaxy/GalaxyMap.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanetInfo {
  name: string;
  gravity: string;
  resources: string[];
  terrain: string;
  biome: string;
  color: number;
  size: number;
  position: [number, number, number];
  textureUrl?: string; // Optional: for actual textures later
}

const samplePlanets: PlanetInfo[] = [
  { name: 'Solara Prime', gravity: '1.0 G', resources: ['Water', 'Iron'], terrain: 'Varied', biome: 'Temperate', color: 0xffa500, size: 2, position: [0,0,0], textureUrl: 'https://placehold.co/256x256/FFA500/000000.png?text=Solara' },
  { name: 'Cryos', gravity: '0.8 G', resources: ['Ice', 'Methane'], terrain: 'Frozen Tundra', biome: 'Ice World', color: 0xadd8e6, size: 1.5, position: [10, 0, 5], textureUrl: 'https://placehold.co/256x256/ADD8E6/000000.png?text=Cryos' },
  { name: 'Vulcanis', gravity: '1.5 G', resources: ['Titanium', 'Sulfur'], terrain: 'Volcanic', biome: 'Lava World', color: 0xff4500, size: 1.8, position: [-8, 2, -10], textureUrl: 'https://placehold.co/256x256/FF4500/FFFFFF.png?text=Vulcanis' },
  { name: 'Veridia', gravity: '0.95 G', resources: ['Flora', 'Fauna', 'Oxygen'], terrain: 'Lush Forests', biome: 'Jungle', color: 0x00ff00, size: 2.2, position: [5, -3, 12], textureUrl: 'https://placehold.co/256x256/00FF00/000000.png?text=Veridia' },
];

export function GalaxyMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1A001A); // Dark Purple

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      if (Math.sqrt(x*x + y*y + z*z) > 100) { // only add stars far enough
         starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Planets
    const textureLoader = new THREE.TextureLoader();
    samplePlanets.forEach(planetData => {
      const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
      let material;
      if (planetData.textureUrl) {
        const texture = textureLoader.load(planetData.textureUrl);
        material = new THREE.MeshStandardMaterial({ map: texture });
      } else {
        material = new THREE.MeshStandardMaterial({ color: planetData.color, roughness: 0.7, metalness: 0.3 });
      }
      const planetMesh = new THREE.Mesh(geometry, material);
      planetMesh.position.set(...planetData.position);
      planetMesh.userData = planetData; // Store data for click events
      scene.add(planetMesh);
    });

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0 && intersects[0].object.userData.name) {
        setSelectedPlanet(intersects[0].object.userData as PlanetInfo);
      }
    };
    currentMount.addEventListener('click', onClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // Make planets slowly orbit/rotate (example)
      scene.children.forEach(obj => {
        if(obj.userData.name) { // Assuming only planets have name in userData
          obj.rotation.y += 0.001;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', onClick);
      if(rendererRef.current) currentMount.removeChild(rendererRef.current.domElement);
      renderer.dispose();
      controls.dispose();
    };
  }, []);
  
  const zoom = (factor: number) => controlsRef.current?.dollyIn(factor);
  const resetView = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 5, 20);
      controlsRef.current.target.set(0,0,0);
    }
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
      <div ref={mountRef} className="w-full h-full" data-ai-hint="galaxy space" />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" onClick={() => zoom(1.2)} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><ZoomInIcon className="w-5 h-5" /></Button>
        <Button size="icon" onClick={() => zoom(0.8)} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><ZoomOutIcon className="w-5 h-5" /></Button>
        <Button size="icon" onClick={resetView} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><RotateCcwIcon className="w-5 h-5" /></Button>
      </div>
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute top-4 left-4 w-full max-w-xs"
          >
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-headline text-glow-primary">{selectedPlanet.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPlanet(null)} className="text-muted-foreground hover:text-primary">
                  <XIcon className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Gravity:</strong> {selectedPlanet.gravity}</p>
                <p><strong>Resources:</strong> {selectedPlanet.resources.join(', ')}</p>
                <p><strong>Terrain:</strong> {selectedPlanet.terrain}</p>
                <p><strong>Biome:</strong> {selectedPlanet.biome}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
