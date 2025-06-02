// src/components/galaxy/GalaxyMap.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XIcon, ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrbitalParams {
  semiMajorAxis: number;
  semiMinorAxis: number;
  eccentricity: number;
  inclination: number; // radians
  perihelionDistance: number;
  aphelionDistance: number;
  ellipseCX: number; // X-coordinate of the ellipse center relative to the focus (Sun)
  orbitalPeriodYears: number; // For display and conceptual animation speed
}

interface CelestialBodyInfo {
  name: string;
  type: 'Star' | 'Planet' | 'Comet';
  gravity: string;
  resources: string[];
  terrain: string;
  biome: string;
  color: number;
  size: number;
  position: [number, number, number]; // Initial position for planets, not used for comet's dynamic path
  textureUrl: string;
  dataAiHint?: string;
  orbitalSpeed?: number; // For planets
  ringTextureUrl?: string;
  orbitalParams?: OrbitalParams; // For comets or other complex orbits
}

const SOLAR_SYSTEM_SCALE_FACTOR = 20; // 1 AU = 20 units in the scene

const solarSystemData: CelestialBodyInfo[] = [
  { name: 'Sun', type: 'Star', gravity: '274.0 m/s²', resources: ['Helium', 'Hydrogen'], terrain: 'Plasma', biome: 'Star', color: 0xFFD700, size: 4.0, position: [0,0,0], textureUrl: 'https://placehold.co/256x256/FFA500/DC143C.png?text=Sun+Surface', dataAiHint: 'sun plasma' },
  { name: 'Mercury', type: 'Planet', gravity: '0.38 G', resources: ['Iron', 'Nickel'], terrain: 'Cratered', biome: 'Rocky', color: 0x8C8C8C, size: 0.5, position: [8, 0, 0], textureUrl: 'https://placehold.co/256x256/A0A0A0/333333.png?text=Mercury', orbitalSpeed: 0.47, dataAiHint: 'planet texture rocky' },
  { name: 'Venus', type: 'Planet', gravity: '0.91 G', resources: ['Sulfuric Acid', 'CO2'], terrain: 'Volcanic Plains', biome: 'Hot House', color: 0xE6D2A8, size: 0.9, position: [14, 0, 0], textureUrl: 'https://placehold.co/256x256/E6D2A9/6B4F34.png?text=Venus', orbitalSpeed: 0.35, dataAiHint: 'planet texture cloudy' },
  { name: 'Earth', type: 'Planet', gravity: '1.0 G', resources: ['Water', 'Oxygen', 'Life'], terrain: 'Varied', biome: 'Temperate', color: 0x6B93D6, size: 1.0, position: [20, 0, 0], textureUrl: 'https://placehold.co/256x256/6B93D6/1F5C2F.png?text=Earth', orbitalSpeed: 0.29, dataAiHint: 'planet texture earth-like' },
  { name: 'Mars', type: 'Planet', gravity: '0.38 G', resources: ['Iron Oxide', 'Water Ice'], terrain: 'Canyons, Deserts', biome: 'Cold Desert', color: 0xD97C57, size: 0.7, position: [28, 0, 0], textureUrl: 'https://placehold.co/256x256/D97C57/80381F.png?text=Mars', orbitalSpeed: 0.24, dataAiHint: 'planet texture mars' },
  { name: 'Jupiter', type: 'Planet', gravity: '2.53 G', resources: ['Hydrogen', 'Helium'], terrain: 'Gas Layers', biome: 'Gas Giant', color: 0xC9A78A, size: 2.8, position: [45, 0, 0], textureUrl: 'https://placehold.co/256x256/C9A78A/835F43.png?text=Jupiter', orbitalSpeed: 0.13, dataAiHint: 'planet texture jupiter' },
  { name: 'Saturn', type: 'Planet', gravity: '1.07 G', resources: ['Hydrogen', 'Helium', 'Ice'], terrain: 'Gas Layers, Rings', biome: 'Gas Giant', color: 0xF0E6C6, size: 2.4, position: [65, 0, 0], textureUrl: 'https://placehold.co/256x256/F0E6C6/736A50.png?text=Saturn', orbitalSpeed: 0.09, dataAiHint: 'planet texture saturn', ringTextureUrl: 'https://placehold.co/512x64/D3CBB6/A9A086.png?text=Rings' },
  { name: 'Uranus', type: 'Planet', gravity: '0.9 G', resources: ['Methane', 'Ammonia', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0xAEEEEE, size: 1.8, position: [85, 0, 0], textureUrl: 'https://placehold.co/256x256/AEEEEE/45B3B3.png?text=Uranus', orbitalSpeed: 0.06, dataAiHint: 'planet texture uranus' },
  { name: 'Neptune', type: 'Planet', gravity: '1.14 G', resources: ['Methane', 'Hydrogen', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0x3A7CEC, size: 1.7, position: [100, 0, 0], textureUrl: 'https://placehold.co/256x256/3A7CEC/2A588F.png?text=Neptune', orbitalSpeed: 0.05, dataAiHint: 'planet texture neptune' },
  {
    name: "Halley's Comet", type: 'Comet', gravity: 'Negligible', resources: ['Water Ice', 'Dust'], terrain: 'Icy Nucleus', biome: 'Cometary Coma (active)', color: 0xE0FFFF, size: 0.15, position: [0,0,0], // Dynamic
    textureUrl: 'https://placehold.co/128x128/E0FFFF/666666.png?text=Halley', dataAiHint: 'comet icy rock',
    orbitalParams: {
      semiMajorAxis: 17.834 * SOLAR_SYSTEM_SCALE_FACTOR, // a
      eccentricity: 0.967, // e
      semiMinorAxis: (17.834 * SOLAR_SYSTEM_SCALE_FACTOR) * Math.sqrt(1 - 0.967**2),
      inclination: 162.26 * (Math.PI / 180), 
      perihelionDistance: 0.586 * SOLAR_SYSTEM_SCALE_FACTOR,
      aphelionDistance: 35.082 * SOLAR_SYSTEM_SCALE_FACTOR,
      ellipseCX: -(17.834 * SOLAR_SYSTEM_SCALE_FACTOR * 0.967),
      orbitalPeriodYears: 76,
    }
  }
];

const ASTEROID_COUNT = 1000;
const ASTEROID_BELT_INNER_RADIUS = 33;
const ASTEROID_BELT_OUTER_RADIUS = 42;
const ASTEROID_BELT_THICKNESS = 1.5;

const EXISTING_STAR_COUNT = 5000; // Reduced from 15000

const GALAXY_PARTICLE_COUNT = 25000;
const GALAXY_RADIUS = 1500;
const GALAXY_CORE_RADIUS = 300;
const GALAXY_THICKNESS = 70;
const GALAXY_PARTICLE_SIZE = 2.5;
const GALAXY_VISIBILITY_START_DISTANCE = 300;
const GALAXY_VISIBILITY_FULL_DISTANCE = 900; // Camera distance when galaxy is fully visible
const CONTROLS_MAX_DISTANCE = 4000;


export function GalaxyMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialBodyInfo | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const planetsRef = useRef<THREE.Mesh[]>([]);
  const asteroidsGroupRef = useRef<THREE.Group | null>(null);
  
  const cometMeshRef = useRef<THREE.Mesh | null>(null);
  const cometOrbitCurveRef = useRef<THREE.EllipseCurve | null>(null);
  const cometGroupRef = useRef<THREE.Group | null>(null);

  const clockRef = useRef<THREE.Clock | null>(null);

  const asteroidGeometryRef = useRef<THREE.DodecahedronGeometry | null>(null);
  const asteroidTextureRef = useRef<THREE.Texture | null>(null);
  const asteroidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const starGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const starMaterialRef = useRef<THREE.PointsMaterial | null>(null);

  const milkyWayParticlesRef = useRef<THREE.Points | null>(null);
  const milkyWayGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const milkyWayMaterialRef = useRef<THREE.PointsMaterial | null>(null);


  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    planetsRef.current = []; 

    clockRef.current = new THREE.Clock();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050005); // Darker background

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, CONTROLS_MAX_DISTANCE * 1.5);
    camera.position.set(0, 45, 60); 
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = CONTROLS_MAX_DISTANCE;
    controlsRef.current = controls;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 3.0, 1500); 
    pointLight.position.set(0, 0, 0); 
    scene.add(pointLight);

    const starGeometry = new THREE.BufferGeometry();
    starGeometryRef.current = starGeometry;
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true, transparent: true, opacity: 0.7 });
    starMaterialRef.current = starMaterial;
    const starVertices = [];
    for (let i = 0; i < EXISTING_STAR_COUNT; i++) {
      const x = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2);
      const y = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2);
      const z = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2);
      const dist = Math.sqrt(x*x + y*y + z*z);
      if (dist > 300 && dist < CONTROLS_MAX_DISTANCE * 1.2) { // Ensure stars are far out
         starVertices.push(x, y, z);
      }
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    const textureLoader = new THREE.TextureLoader();

    // Create Milky Way Galaxy
    const galaxyVerticesArray: number[] = [];
    const galaxyColorsArray: number[] = [];
    const galaxyColor = new THREE.Color();

    for (let i = 0; i < GALAXY_PARTICLE_COUNT; i++) {
      let r, y_spread_factor;
      if (Math.random() < 0.2) { // 20% chance for a core star
        r = Math.random() * GALAXY_CORE_RADIUS;
        y_spread_factor = 0.3; // Core is flatter
      } else { // 80% chance for a disk star
        r = GALAXY_CORE_RADIUS + Math.random() * (GALAXY_RADIUS - GALAXY_CORE_RADIUS);
        y_spread_factor = 1.0;
      }

      const theta = Math.random() * 2 * Math.PI;
      const x_pos = r * Math.cos(theta);
      const z_pos = r * Math.sin(theta);
      const y_pos = (Math.random() - 0.5) * GALAXY_THICKNESS * y_spread_factor * (0.2 + 0.8 * (r / GALAXY_RADIUS));
      
      galaxyVerticesArray.push(x_pos, y_pos, z_pos);

      if (Math.random() < 0.7) { 
        galaxyColor.setHSL(0.55 + Math.random() * 0.2, 0.8 + Math.random()*0.2, 0.6 + Math.random() * 0.3); // Blues / Whites
      } else { 
        galaxyColor.setHSL(0.05 + Math.random() * 0.1, 0.8 + Math.random()*0.2, 0.6 + Math.random() * 0.2); // Pale Yellows/Oranges
      }
      galaxyColorsArray.push(galaxyColor.r, galaxyColor.g, galaxyColor.b);
    }

    const mwGeometry = new THREE.BufferGeometry();
    mwGeometry.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVerticesArray, 3));
    mwGeometry.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColorsArray, 3));
    milkyWayGeometryRef.current = mwGeometry;

    const mwMaterial = new THREE.PointsMaterial({
      size: GALAXY_PARTICLE_SIZE,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0, // Start invisible
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    milkyWayMaterialRef.current = mwMaterial;

    const milkyWay = new THREE.Points(mwGeometry, mwMaterial);
    scene.add(milkyWay);
    milkyWayParticlesRef.current = milkyWay;


    solarSystemData.forEach(bodyData => {
      if (bodyData.type === 'Comet' && bodyData.orbitalParams) {
        const cometParams = bodyData.orbitalParams;
        const cometNucleusGeo = new THREE.SphereGeometry(bodyData.size, 16, 16);
        const cometNucleusMat = new THREE.MeshStandardMaterial({
          map: textureLoader.load(bodyData.textureUrl),
          emissive: bodyData.color,
          emissiveIntensity: 0.3,
          roughness: 0.8,
        });
        const cometMesh = new THREE.Mesh(cometNucleusGeo, cometNucleusMat);
        cometMesh.userData = { ...bodyData, currentU: 0 };
        cometMesh.name = bodyData.name;
        cometMeshRef.current = cometMesh;

        const curve = new THREE.EllipseCurve(
          cometParams.ellipseCX, 0, 
          cometParams.semiMajorAxis, cometParams.semiMinorAxis,
          0, 2 * Math.PI, false, 0
        );
        cometOrbitCurveRef.current = curve;
        
        const points = curve.getPoints(256);
        const orbitPoints3D = points.map(p => new THREE.Vector3(p.x, p.y, 0));
        const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints3D);
        const orbitMat = new THREE.LineBasicMaterial({ color: bodyData.color, transparent: true, opacity: 0.3 });
        const cometOrbitLine = new THREE.Line(orbitGeom, orbitMat);

        const group = new THREE.Group();
        group.add(cometMesh);
        group.add(cometOrbitLine);
        group.rotation.x = cometParams.inclination;
        scene.add(group);
        cometGroupRef.current = group;

      } else { 
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

        if (bodyData.name === 'Saturn' && bodyData.ringTextureUrl) {
          const ringTexture = textureLoader.load(bodyData.ringTextureUrl);
          const ringGeometry = new THREE.RingGeometry(bodyData.size * 1.2, bodyData.size * 2.2, 64);
          const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
          const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
          ringMesh.rotation.x = Math.PI * 0.45; 
          ringMesh.userData.dataAiHint = "planet rings"; 
          bodyMesh.add(ringMesh); 
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
          const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
          const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
          scene.add(orbitLine);
        }
      }
    });

    const asteroids = new THREE.Group();
    asteroidsGroupRef.current = asteroids;
    asteroidGeometryRef.current = new THREE.DodecahedronGeometry(1, 0); 
    asteroidTextureRef.current = textureLoader.load('https://placehold.co/128x128/A9A9A9/696969.png?text=Rock'); 
    asteroidMaterialRef.current = new THREE.MeshStandardMaterial({ 
        map: asteroidTextureRef.current, 
        roughness: 0.9, 
        metalness: 0.1 
    });

    for (let i = 0; i < ASTEROID_COUNT; i++) {
      if (!asteroidGeometryRef.current || !asteroidMaterialRef.current) continue;
      const asteroidMesh = new THREE.Mesh(asteroidGeometryRef.current, asteroidMaterialRef.current);
      const size = Math.random() * 0.3 + 0.08; 
      asteroidMesh.scale.set(size, size, size * (Math.random() * 0.5 + 0.75)); 
      const radius = ASTEROID_BELT_INNER_RADIUS + Math.random() * (ASTEROID_BELT_OUTER_RADIUS - ASTEROID_BELT_INNER_RADIUS);
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y_ast = (Math.random() - 0.5) * ASTEROID_BELT_THICKNESS;
      asteroidMesh.position.set(x, y_ast, z);
      asteroidMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroidMesh.userData = { orbitalRadius: radius, orbitalAngle: angle, orbitalSpeed: (0.01 + Math.random() * 0.02) * (ASTEROID_BELT_OUTER_RADIUS / radius) * 0.5, rotationSpeed: new THREE.Vector3((Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005, (Math.random() - 0.5) * 0.005) };
      asteroids.add(asteroidMesh);
    }
    scene.add(asteroids);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersectableObjects = scene.children.filter(obj => obj.userData.name && obj instanceof THREE.Mesh || (obj instanceof THREE.Group && obj === cometGroupRef.current));
      const intersects = raycaster.intersectObjects(intersectableObjects, true); 
      
      if (intersects.length > 0) {
        let clickedObjectOrGroup = intersects[0].object;
        while (clickedObjectOrGroup.parent && clickedObjectOrGroup.parent !== scene && !clickedObjectOrGroup.userData.name) {
            if (clickedObjectOrGroup.parent === cometGroupRef.current && cometMeshRef.current) {
                 clickedObjectOrGroup = cometMeshRef.current;
                 break;
            }
            clickedObjectOrGroup = clickedObjectOrGroup.parent as THREE.Object3D;
        }
        if (clickedObjectOrGroup.userData.name) {
           setSelectedBody(clickedObjectOrGroup.userData as CelestialBodyInfo);
        }
      }
    };
    currentMount.addEventListener('click', onClick);

    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !controlsRef.current || !clockRef.current) return;
      requestAnimationFrame(animate);
      
      const deltaTime = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();

      controlsRef.current.update();
      
      sceneRef.current.children.forEach(obj => {
        if(obj.userData.name && obj instanceof THREE.Mesh && obj !== cometMeshRef.current) { 
          obj.rotation.y += 0.002; 
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

      if (asteroidsGroupRef.current) {
        asteroidsGroupRef.current.children.forEach(asteroid => {
          if (asteroid instanceof THREE.Mesh) {
            const P = asteroid.userData;
            if (P.orbitalSpeed && P.orbitalRadius !== undefined && P.orbitalAngle !== undefined) {
              const currentAngle = P.orbitalAngle + elapsedTime * P.orbitalSpeed;
              asteroid.position.x = Math.cos(currentAngle) * P.orbitalRadius;
              asteroid.position.z = Math.sin(currentAngle) * P.orbitalRadius;
              if (P.rotationSpeed) {
                asteroid.rotation.x += P.rotationSpeed.x * deltaTime * 20; // make rotation speed more noticeable
                asteroid.rotation.y += P.rotationSpeed.y * deltaTime * 20;
                asteroid.rotation.z += P.rotationSpeed.z * deltaTime * 20;
              }
            }
          }
        });
      }
      
      if (cometMeshRef.current && cometOrbitCurveRef.current && cometMeshRef.current.userData.orbitalParams) {
        const cometMesh = cometMeshRef.current;
        const cometData = cometMesh.userData as CelestialBodyInfo & { currentU: number };
        const params = cometData.orbitalParams!;
        
        const sunPosition = new THREE.Vector3(0,0,0);
        const cometWorldPosition = new THREE.Vector3();
        // Need to get world position from the mesh itself as it's parented to an inclined group
        if (cometMesh.parent) { // cometMesh is in cometGroupRef
            cometMesh.parent.localToWorld(cometMesh.position.clone(cometWorldPosition));
        } else {
             cometMesh.getWorldPosition(cometWorldPosition);
        }
        const distanceToSun = cometWorldPosition.distanceTo(sunPosition);

        const minSpeedFactor = 0.0005 / (params.orbitalPeriodYears / 76) ;
        const maxSpeedFactor = 0.1 / (params.orbitalPeriodYears / 76);

        let speedFactor;
        if (distanceToSun <= params.perihelionDistance * 1.1) {
            speedFactor = maxSpeedFactor;
        } else if (distanceToSun >= params.aphelionDistance * 0.9) {
            speedFactor = minSpeedFactor;
        } else {
            const normalizedDistance = (distanceToSun - params.perihelionDistance) / (params.aphelionDistance - params.perihelionDistance);
            speedFactor = maxSpeedFactor - (normalizedDistance * (maxSpeedFactor - minSpeedFactor));
            speedFactor = Math.max(minSpeedFactor, speedFactor);
        }
        
        cometData.currentU += speedFactor * deltaTime;
        if (cometData.currentU >= 1) {
            cometData.currentU = 0; 
        }
        
        const localPositionOnEllipse = cometOrbitCurveRef.current.getPoint(cometData.currentU);
        cometMesh.position.set(localPositionOnEllipse.x, localPositionOnEllipse.y, 0);
        cometMesh.rotation.y += 0.005;
      }

      if (milkyWayParticlesRef.current && milkyWayMaterialRef.current && controlsRef.current) {
        milkyWayParticlesRef.current.rotation.y += 0.00002 * deltaTime * 60; // Very slow rotation
        const distance = controlsRef.current.getDistance();
        let opacity = 0;
        if (distance > GALAXY_VISIBILITY_START_DISTANCE) {
          opacity = Math.min(1, (distance - GALAXY_VISIBILITY_START_DISTANCE) / (GALAXY_VISIBILITY_FULL_DISTANCE - GALAXY_VISIBILITY_START_DISTANCE));
        }
        milkyWayMaterialRef.current.opacity = opacity * 0.4; // Max opacity
      }


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
      
      if (controlsRef.current) controlsRef.current.dispose();
      
      // Dispose Milky Way resources
      if (milkyWayGeometryRef.current) milkyWayGeometryRef.current.dispose();
      if (milkyWayMaterialRef.current) milkyWayMaterialRef.current.dispose();
      if (milkyWayParticlesRef.current && sceneRef.current) sceneRef.current.remove(milkyWayParticlesRef.current);
      milkyWayParticlesRef.current = null;
      milkyWayGeometryRef.current = null;
      milkyWayMaterialRef.current = null;

      // Dispose background stars resources
      if (starGeometryRef.current) starGeometryRef.current.dispose();
      if (starMaterialRef.current) starMaterialRef.current.dispose();
      // The 'stars' THREE.Points object itself is implicitly removed when scene is cleared or parent is.

      if (asteroidsGroupRef.current && sceneRef.current) {
        sceneRef.current.remove(asteroidsGroupRef.current); 
      }
      if (asteroidGeometryRef.current) asteroidGeometryRef.current.dispose();
      if (asteroidMaterialRef.current) asteroidMaterialRef.current.dispose();
      if (asteroidTextureRef.current) asteroidTextureRef.current.dispose();
      asteroidsGroupRef.current = null;
      asteroidGeometryRef.current = null;
      asteroidMaterialRef.current = null;
      asteroidTextureRef.current = null;
      
      if (cometGroupRef.current && sceneRef.current) {
        cometGroupRef.current.traverse(object => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else if (object.material) {
              (object.material as THREE.Material).dispose();
            }
          } else if (object instanceof THREE.Line) {
             if (object.geometry) object.geometry.dispose();
             if (object.material) (object.material as THREE.Material).dispose();
          }
        });
        sceneRef.current.remove(cometGroupRef.current);
      }
      cometMeshRef.current = null;
      cometOrbitCurveRef.current = null; // Curve itself doesn't need dispose
      cometGroupRef.current = null;


      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
           if (object instanceof THREE.Mesh) {
                if (object.geometry) object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else if (object.material) {
                    (object.material as THREE.Material).dispose();
                }
            } else if (object instanceof THREE.Line) {
                 if (object.geometry) object.geometry.dispose();
                 if (object.material) (object.material as THREE.Material).dispose();
            } else if (object instanceof THREE.Points && object !== milkyWayParticlesRef.current && object !== stars) { // Avoid re-disposing manually managed points
                if (object.geometry) object.geometry.dispose();
                if (object.material) (object.material as THREE.Material).dispose();
            }
        });
      }
      planetsRef.current = [];
      if (rendererRef.current) rendererRef.current.dispose(); // Dispose renderer last
      rendererRef.current = null; // clear ref
      sceneRef.current = null; // clear ref
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
      cameraRef.current.position.set(0, 45, 60); 
      controlsRef.current.target.set(0,0,0); 
      controlsRef.current.update();
    }
  }

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] rounded-lg overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
      <div ref={mountRef} className="w-full h-full" data-ai-hint="solar system planets orbit asteroid belt comet milky way galaxy" />
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
            className="absolute top-4 left-4 w-full max-w-xs z-10"
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
                {selectedBody.type === 'Comet' && selectedBody.orbitalParams && (
                  <>
                    <hr className="my-2 border-primary/30" />
                    <p><strong>Perihelion:</strong> {(selectedBody.orbitalParams.perihelionDistance / SOLAR_SYSTEM_SCALE_FACTOR).toFixed(2)} AU</p>
                    <p><strong>Aphelion:</strong> {(selectedBody.orbitalParams.aphelionDistance / SOLAR_SYSTEM_SCALE_FACTOR).toFixed(2)} AU</p>
                    <p><strong>Orbital Period:</strong> ~{selectedBody.orbitalParams.orbitalPeriodYears} Earth years</p>
                    <p><strong>Inclination:</strong> {(selectedBody.orbitalParams.inclination * (180 / Math.PI)).toFixed(1)}°</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

    