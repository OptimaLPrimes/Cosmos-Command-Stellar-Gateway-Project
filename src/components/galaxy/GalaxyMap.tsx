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
  color: number; // Used for emissive stars or as a fallback tint
  size: number;
  position: [number, number, number]; // Initial position
  textureUrl: string;
  orbitalSpeed?: number; // Radians per unit of time (relative for simulation)
  dataAiHint?: string;
  ringTextureUrl?: string; // Optional for planets with rings
}

const solarSystemData: CelestialBodyInfo[] = [
  { name: 'Sun', type: 'Star', gravity: '274.0 m/s²', resources: ['Helium', 'Hydrogen'], terrain: 'Plasma', biome: 'Star', color: 0xFFD700, size: 4.0, position: [0,0,0], textureUrl: 'https://placehold.co/256x256/FFD700/000000.png?text=Sun', dataAiHint: 'star texture' },
  { name: 'Mercury', type: 'Planet', gravity: '0.38 G', resources: ['Iron', 'Nickel'], terrain: 'Cratered', biome: 'Rocky', color: 0x8C8C8C, size: 0.5, position: [8, 0, 0], textureUrl: 'https://placehold.co/256x256/A0A0A0/333333.png?text=Mercury', orbitalSpeed: 0.47, dataAiHint: 'planet texture rocky' },
  { name: 'Venus', type: 'Planet', gravity: '0.91 G', resources: ['Sulfuric Acid', 'CO2'], terrain: 'Volcanic Plains', biome: 'Hot House', color: 0xE6D2A8, size: 0.9, position: [14, 0, 0], textureUrl: 'https://placehold.co/256x256/E6D2A9/6B4F34.png?text=Venus', orbitalSpeed: 0.35, dataAiHint: 'planet texture cloudy' },
  { name: 'Earth', type: 'Planet', gravity: '1.0 G', resources: ['Water', 'Oxygen', 'Life'], terrain: 'Varied', biome: 'Temperate', color: 0x6B93D6, size: 1.0, position: [20, 0, 0], textureUrl: 'https://placehold.co/256x256/6B93D6/1F5C2F.png?text=Earth', orbitalSpeed: 0.29, dataAiHint: 'planet texture earth-like' },
  { name: 'Mars', type: 'Planet', gravity: '0.38 G', resources: ['Iron Oxide', 'Water Ice'], terrain: 'Canyons, Deserts', biome: 'Cold Desert', color: 0xD97C57, size: 0.7, position: [28, 0, 0], textureUrl: 'https://placehold.co/256x256/D97C57/80381F.png?text=Mars', orbitalSpeed: 0.24, dataAiHint: 'planet texture mars' },
  { name: 'Jupiter', type: 'Planet', gravity: '2.53 G', resources: ['Hydrogen', 'Helium'], terrain: 'Gas Layers', biome: 'Gas Giant', color: 0xC9A78A, size: 2.8, position: [45, 0, 0], textureUrl: 'https://placehold.co/256x256/C9A78A/835F43.png?text=Jupiter', orbitalSpeed: 0.13, dataAiHint: 'planet texture jupiter' },
  { name: 'Saturn', type: 'Planet', gravity: '1.07 G', resources: ['Hydrogen', 'Helium', 'Ice'], terrain: 'Gas Layers, Rings', biome: 'Gas Giant', color: 0xF0E6C6, size: 2.4, position: [65, 0, 0], textureUrl: 'https://placehold.co/256x256/F0E6C6/736A50.png?text=Saturn', orbitalSpeed: 0.09, dataAiHint: 'planet texture saturn', ringTextureUrl: 'https://placehold.co/512x64/D3CBB6/A9A086.png?text=Rings' },
  { name: 'Uranus', type: 'Planet', gravity: '0.9 G', resources: ['Methane', 'Ammonia', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0xAEEEEE, size: 1.8, position: [85, 0, 0], textureUrl: 'https://placehold.co/256x256/AEEEEE/45B3B3.png?text=Uranus', orbitalSpeed: 0.06, dataAiHint: 'planet texture uranus' },
  { name: 'Neptune', type: 'Planet', gravity: '1.14 G', resources: ['Methane', 'Hydrogen', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0x3A7CEC, size: 1.7, position: [100, 0, 0], textureUrl: 'https://placehold.co/256x256/3A7CEC/2A588F.png?text=Neptune', orbitalSpeed: 0.05, dataAiHint: 'planet texture neptune' },
];


export function GalaxyMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialBodyInfo | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const clockRef = useRef<THREE.Clock | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    planetsRef.current = []; 

    clockRef.current = new THREE.Clock();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1A001A); 

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 35, 50); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 250; 
    controlsRef.current = controls;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2.5, 1200); 
    pointLight.position.set(0, 0, 0); 
    scene.add(pointLight);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      if (Math.sqrt(x*x + y*y + z*z) > 150) { 
         starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    const textureLoader = new THREE.TextureLoader();
    solarSystemData.forEach(bodyData => {
      const geometry = new THREE.SphereGeometry(bodyData.size, 32, 32);
      const bodyTexture = textureLoader.load(bodyData.textureUrl);
      let material;

      if (bodyData.type === 'Star') { 
        material = new THREE.MeshBasicMaterial({ map: bodyTexture, emissive: bodyData.color, emissiveIntensity: 1.5 });
      } else { 
        material = new THREE.MeshStandardMaterial({ map: bodyTexture, roughness: 0.8, metalness: 0.1 });
      }
      const bodyMesh = new THREE.Mesh(geometry, material);
      bodyMesh.position.set(...bodyData.position);
      bodyMesh.userData = { ...bodyData };
      bodyMesh.name = bodyData.name; 
      scene.add(bodyMesh);

      // Add rings for Saturn
      if (bodyData.name === 'Saturn' && bodyData.ringTextureUrl) {
        const ringTexture = textureLoader.load(bodyData.ringTextureUrl);
        const ringGeometry = new THREE.RingGeometry(bodyData.size * 1.2, bodyData.size * 2.2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
          map: ringTexture, 
          side: THREE.DoubleSide, 
          transparent: true, 
          opacity: 0.7 
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI * 0.45; // Tilt the rings
        ringMesh.userData.dataAiHint = "planet rings"; // For potential future use
        bodyMesh.add(ringMesh); // Add rings as a child of Saturn
      }

      if (bodyData.type === 'Planet' && bodyData.orbitalSpeed) {
        bodyMesh.userData.orbitalRadius = Math.sqrt(bodyData.position[0]**2 + bodyData.position[2]**2);
        bodyMesh.userData.initialY = bodyData.position[1];
        bodyMesh.userData.initialAngle = Math.atan2(bodyData.position[2], bodyData.position[0]);
        planetsRef.current.push(bodyMesh);

        const orbitRadius = bodyMesh.userData.orbitalRadius;
        const orbitPoints = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, bodyData.position[1], Math.sin(theta) * orbitRadius));
        }
        const orbitLineGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
        const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
        scene.add(orbitLine);
      }
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.userData.name && obj instanceof THREE.Mesh), true); 
      
      if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        // If rings are clicked, get the parent (Saturn)
        if (clickedObject.parent && clickedObject.parent.userData.name === 'Saturn') {
          clickedObject = clickedObject.parent;
        }
        if (clickedObject.userData.name) {
           setSelectedBody(clickedObject.userData as CelestialBodyInfo);
        }
      }
    };
    currentMount.addEventListener('click', onClick);

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current || !clockRef.current) return;
      requestAnimationFrame(animate);
      
      const elapsedTime = clockRef.current.getElapsedTime();

      controlsRef.current.update();
      
      sceneRef.current.children.forEach(obj => {
        if(obj.userData.name && obj instanceof THREE.Mesh) { 
          obj.rotation.y += 0.002; 
          // If it's Saturn, its rings (children) will rotate with it.
          // If specific ring rotation is desired independent of planet body, it can be added here.
        }
      });

      planetsRef.current.forEach(planet => {
        const P = planet.userData;
        if (P.orbitalSpeed && P.orbitalRadius !== undefined && P.initialAngle !== undefined) {
          const currentAngle = P.initialAngle + elapsedTime * P.orbitalSpeed * 0.1; 
          planet.position.x = Math.cos(currentAngle) * P.orbitalRadius;
          planet.position.y = P.initialY; 
          planet.position.z = Math.sin(currentAngle) * P.orbitalRadius;
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

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
      if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else if (object.material && typeof (object.material as any).dispose === 'function') {
              (object.material as any).dispose();
            }
          }
           if (object instanceof THREE.Line) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else if (object.material && typeof (object.material as any).dispose === 'function') {
               (object.material as any).dispose();
            }
          }
        });
      }
      planetsRef.current = [];
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
      cameraRef.current.position.set(0, 35, 50); 
      controlsRef.current.target.set(0,0,0);
      controlsRef.current.update();
    }
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
      <div ref={mountRef} className="w-full h-full" data-ai-hint="solar system planets orbit" />
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
            className="absolute top-4 left-4 w-full max-w-xs z-10" // Added z-index
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

