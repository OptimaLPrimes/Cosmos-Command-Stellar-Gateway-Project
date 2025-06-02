// src/components/galaxy/GalaxyMap.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelestialBodyInfo {
  name: string;
  type: 'Star' | 'Planet';
  gravity: string;
  resources: string[];
  terrain: string;
  biome: string;
  color: number;
  size: number;
  position: [number, number, number];
  textureUrl: string;
}

const solarSystemData: CelestialBodyInfo[] = [
  { name: 'Sun', type: 'Star', gravity: '274.0 m/s²', resources: ['Helium', 'Hydrogen'], terrain: 'Plasma', biome: 'Star', color: 0xFFD700, size: 4.0, position: [0,0,0], textureUrl: 'https://placehold.co/256x256/FFD700/000000.png?text=Sun' },
  { name: 'Mercury', type: 'Planet', gravity: '0.38 G', resources: ['Iron', 'Nickel'], terrain: 'Cratered', biome: 'Rocky', color: 0x8C8C8C, size: 0.5, position: [8, 0, 0], textureUrl: 'https://placehold.co/256x256/8C8C8C/FFFFFF.png?text=Mercury' },
  { name: 'Venus', type: 'Planet', gravity: '0.91 G', resources: ['Sulfuric Acid', 'CO2'], terrain: 'Volcanic Plains', biome: 'Hot House', color: 0xE6D2A8, size: 0.9, position: [14, 0, 0], textureUrl: 'https://placehold.co/256x256/E6D2A8/000000.png?text=Venus' },
  { name: 'Earth', type: 'Planet', gravity: '1.0 G', resources: ['Water', 'Oxygen', 'Life'], terrain: 'Varied', biome: 'Temperate', color: 0x6B93D6, size: 1.0, position: [20, 0, 0], textureUrl: 'https://placehold.co/256x256/6B93D6/FFFFFF.png?text=Earth' },
  { name: 'Mars', type: 'Planet', gravity: '0.38 G', resources: ['Iron Oxide', 'Water Ice'], terrain: 'Canyons, Deserts', biome: 'Cold Desert', color: 0xD97C57, size: 0.7, position: [28, 0, 0], textureUrl: 'https://placehold.co/256x256/D97C57/FFFFFF.png?text=Mars' },
  { name: 'Jupiter', type: 'Planet', gravity: '2.53 G', resources: ['Hydrogen', 'Helium'], terrain: 'Gas Layers', biome: 'Gas Giant', color: 0xC9A78A, size: 2.8, position: [45, 0, 0], textureUrl: 'https://placehold.co/256x256/C9A78A/FFFFFF.png?text=Jupiter' },
  { name: 'Saturn', type: 'Planet', gravity: '1.07 G', resources: ['Hydrogen', 'Helium', 'Ice'], terrain: 'Gas Layers, Rings', biome: 'Gas Giant', color: 0xF0E6C6, size: 2.4, position: [65, 0, 0], textureUrl: 'https://placehold.co/256x256/F0E6C6/000000.png?text=Saturn' },
  { name: 'Uranus', type: 'Planet', gravity: '0.9 G', resources: ['Methane', 'Ammonia', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0xAEEEEE, size: 1.8, position: [85, 0, 0], textureUrl: 'https://placehold.co/256x256/AEEEEE/000000.png?text=Uranus' },
  { name: 'Neptune', type: 'Planet', gravity: '1.14 G', resources: ['Methane', 'Hydrogen', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0x3A7CEC, size: 1.7, position: [100, 0, 0], textureUrl: 'https://placehold.co/256x256/3A7CEC/FFFFFF.png?text=Neptune' },
];


export function GalaxyMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialBodyInfo | null>(null);
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
    camera.position.set(0, 15, 40); // Adjusted camera for new scale
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
    controls.maxDistance = 200; // Increased max distance
    controlsRef.current = controls;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Slightly reduced ambient
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 1000); // Brighter point light
    pointLight.position.set(0, 0, 0); // Positioned at the Sun
    scene.add(pointLight);

    // Stars
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      if (Math.sqrt(x*x + y*y + z*z) > 150) { // only add stars far enough
         starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Celestial Bodies
    const textureLoader = new THREE.TextureLoader();
    solarSystemData.forEach(bodyData => {
      const geometry = new THREE.SphereGeometry(bodyData.size, 32, 32);
      let material;
      const texture = textureLoader.load(bodyData.textureUrl);

      if (bodyData.type === 'Star') { // Sun
        material = new THREE.MeshBasicMaterial({ map: texture });
      } else { // Planets
        material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8, metalness: 0.2 });
      }
      const bodyMesh = new THREE.Mesh(geometry, material);
      bodyMesh.position.set(...bodyData.position);
      bodyMesh.userData = bodyData; // Store data for click events
      bodyMesh.name = bodyData.name; // For potential direct access
      scene.add(bodyMesh);

      // Basic orbit lines for planets
      if (bodyData.type === 'Planet') {
        const orbitRadius = Math.sqrt(bodyData.position[0]**2 + bodyData.position[2]**2);
        const orbitGeometry = new THREE.RingGeometry(orbitRadius - 0.05, orbitRadius + 0.05, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true, side: THREE.DoubleSide });
        const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitMesh.rotation.x = Math.PI / 2; // Align with XZ plane
        orbitMesh.position.set(0, bodyData.position[1], 0); // Center orbit at Sun's y-level for simplicity
        scene.add(orbitMesh);
      }
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
      const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.userData.name)); // Intersect only with named objects
      if (intersects.length > 0) {
        setSelectedBody(intersects[0].object.userData as CelestialBodyInfo);
      }
    };
    currentMount.addEventListener('click', onClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // Make celestial bodies slowly rotate
      scene.children.forEach(obj => {
        if(obj.userData.name) { 
          obj.rotation.y += 0.001;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', onClick);
      if(rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      renderer.dispose();
      controls.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);
  
  const zoom = (factor: number) => {
    if(controlsRef.current) {
      controlsRef.current.dollyIn(factor);
      controlsRef.current.update();
    }
  }
  const resetView = () => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 15, 40); // Reset to initial view
      controlsRef.current.target.set(0,0,0);
      controlsRef.current.update();
    }
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
      <div ref={mountRef} className="w-full h-full" data-ai-hint="solar system space" />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" onClick={() => zoom(1.2)} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><ZoomInIcon className="w-5 h-5" /></Button>
        <Button size="icon" onClick={() => zoom(0.8)} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><ZoomOutIcon className="w-5 h-5" /></Button>
        <Button size="icon" onClick={resetView} className="glass-card !bg-background/50 !border-accent/50 hover:!bg-accent/30 btn-glow-accent"><RotateCcwIcon className="w-5 h-5" /></Button>
      </div>
      <AnimatePresence>
        {selectedBody && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute top-4 left-4 w-full max-w-xs"
          >
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-headline text-glow-primary">{selectedBody.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBody(null)} className="text-muted-foreground hover:text-primary">
                  <XIcon className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Type:</strong> {selectedBody.type}</p>
                <p><strong>Surface Gravity:</strong> {selectedBody.gravity}</p>
                <p><strong>Key Resources:</strong> {selectedBody.resources.join(', ')}</p>
                <p><strong>Terrain Type:</strong> {selectedBody.terrain}</p>
                <p><strong>Primary Biome:</strong> {selectedBody.biome}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
