
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

interface MoonInfo {
  name: string;
  textureUrl: string;
  dataAiHint?: string;
  actualRadiusKm: number; // Actual radius of the moon in km
  actualOrbitalRadiusKm: number; // Actual average orbital radius around its planet in km
  orbitalSpeedFactor: number; // Relative speed for animation
  inclination?: number; // Optional orbital inclination in radians relative to planet's equator
}

interface CelestialBodyInfo {
  name: string;
  type: 'Star' | 'Planet' | 'Dwarf Planet' | 'Comet' | 'Distant Star' | 'Moon' | 'Satellite';
  gravity: string;
  resources: string[];
  terrain: string;
  biome: string;
  color: number;
  size: number; // Visual size in the scene
  position: [number, number, number];
  textureUrl: string;
  dataAiHint?: string;
  orbitalSpeed?: number; // For planets & simple orbits around the sun
  ringTextureUrl?: string;
  orbitalParams?: OrbitalParams; // For comets or complex orbits (Pluto, Eris)
  description?: string; // For info card
  actualRadiusKm?: number; // Actual radius of the planet in km, used for moon scaling
  moons?: MoonInfo[];
}


const SOLAR_SYSTEM_SCALE_FACTOR = 20; // 1 AU = 20 units in the scene
const EARTH_RADIUS_KM = 6371; // Approximate radius of Earth in km
const MOON_SIZE_DISPLAY_SCALE = 15; // Multiplier to make moons more visible
const MOON_ORBIT_DISPLAY_SCALE = 2.5; // Multiplier to make moon orbits more visible relative to planet size

const solarSystemData: CelestialBodyInfo[] = [
  { name: 'Sun', type: 'Star', gravity: '274.0 m/s²', resources: ['Helium', 'Hydrogen'], terrain: 'Plasma', biome: 'Star', color: 0xFFD700, size: 4.0, position: [0,0,0], textureUrl: 'https://placehold.co/256x256/FFA500/DC143C.png?text=Sun+Surface', dataAiHint: 'sun plasma', actualRadiusKm: 695000 },
  { name: 'Mercury', type: 'Planet', gravity: '0.38 G', resources: ['Iron', 'Nickel'], terrain: 'Cratered', biome: 'Rocky', color: 0x8C8C8C, size: 0.5, position: [0.39 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/A0A0A0/333333.png?text=Mercury', orbitalSpeed: 0.47, dataAiHint: 'planet texture rocky', actualRadiusKm: 2440, moons: [] },
  { name: 'Venus', type: 'Planet', gravity: '0.91 G', resources: ['Sulfuric Acid', 'CO2'], terrain: 'Volcanic Plains', biome: 'Hot House', color: 0xE6D2A8, size: 0.9, position: [0.72 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/E6D2A9/6B4F34.png?text=Venus', orbitalSpeed: 0.35, dataAiHint: 'planet texture cloudy', actualRadiusKm: 6052, moons: [] },
  { 
    name: 'Earth', type: 'Planet', gravity: '1.0 G', resources: ['Water', 'Oxygen', 'Life'], terrain: 'Varied', biome: 'Temperate', color: 0x6B93D6, size: 1.0, position: [1.00 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/6B93D6/1F5C2F.png?text=Earth', orbitalSpeed: 0.29, dataAiHint: 'planet texture earth-like', actualRadiusKm: EARTH_RADIUS_KM,
    moons: [
      { name: 'Moon', textureUrl: 'https://placehold.co/128x128/CCCCCC/888888.png?text=Moon', dataAiHint: 'moon surface', actualRadiusKm: 1737, actualOrbitalRadiusKm: 384400, orbitalSpeedFactor: 0.5 }
    ]
  },
  { 
    name: 'Mars', type: 'Planet', gravity: '0.38 G', resources: ['Iron Oxide', 'Water Ice'], terrain: 'Canyons, Deserts', biome: 'Cold Desert', color: 0xD97C57, size: 0.7, position: [1.52 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/D97C57/80381F.png?text=Mars', orbitalSpeed: 0.24, dataAiHint: 'planet texture mars', actualRadiusKm: 3390,
    moons: [
      { name: 'Phobos', textureUrl: 'https://placehold.co/64x64/A0A0A0/505050.png?text=Ph', dataAiHint: 'small moon asteroid', actualRadiusKm: 11, actualOrbitalRadiusKm: 9378, orbitalSpeedFactor: 1.2 },
      { name: 'Deimos', textureUrl: 'https://placehold.co/64x64/C0C0C0/606060.png?text=De', dataAiHint: 'small moon asteroid', actualRadiusKm: 6, actualOrbitalRadiusKm: 23459, orbitalSpeedFactor: 0.8 }
    ]
  },
  { name: 'Ceres', type: 'Dwarf Planet', gravity: '0.029 G', resources: ['Water Ice', 'Rock'], terrain: 'Cratered, Icy Mantle', biome: 'Rocky/Icy', color: 0xAAAAAA, size: 0.2, position: [2.77 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/128x128/BBBBBB/555555.png?text=Ceres', orbitalSpeed: 0.18, dataAiHint: 'dwarf planet texture rock ice', description: "Largest object in the asteroid belt, composed of rock and ice. Orbits between Mars and Jupiter.", actualRadiusKm: 473 },
  { 
    name: 'Jupiter', type: 'Planet', gravity: '2.53 G', resources: ['Hydrogen', 'Helium'], terrain: 'Gas Layers', biome: 'Gas Giant', color: 0xC9A78A, size: 2.8, position: [5.20 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/C9A78A/835F43.png?text=Jupiter', orbitalSpeed: 0.13, dataAiHint: 'planet texture jupiter', actualRadiusKm: 69911,
    moons: [
      { name: 'Io', textureUrl: 'https://placehold.co/128x128/FFFACD/FF8C00.png?text=Io', dataAiHint: 'moon volcanic sulfur', actualRadiusKm: 1821, actualOrbitalRadiusKm: 421700, orbitalSpeedFactor: 1.0 },
      { name: 'Europa', textureUrl: 'https://placehold.co/128x128/ADD8E6/87CEEB.png?text=Eu', dataAiHint: 'moon icy cracks', actualRadiusKm: 1560, actualOrbitalRadiusKm: 671034, orbitalSpeedFactor: 0.8 },
      { name: 'Ganymede', textureUrl: 'https://placehold.co/128x128/D2B48C/A0522D.png?text=Ga', dataAiHint: 'moon large icy', actualRadiusKm: 2634, actualOrbitalRadiusKm: 1070412, orbitalSpeedFactor: 0.6 },
      { name: 'Callisto', textureUrl: 'https://placehold.co/128x128/A9A9A9/696969.png?text=Ca', dataAiHint: 'moon cratered dark', actualRadiusKm: 2410, actualOrbitalRadiusKm: 1882709, orbitalSpeedFactor: 0.4 }
    ]
  },
  { 
    name: 'Saturn', type: 'Planet', gravity: '1.07 G', resources: ['Hydrogen', 'Helium', 'Ice'], terrain: 'Gas Layers, Rings', biome: 'Gas Giant', color: 0xF0E6C6, size: 2.4, position: [9.54 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/F0E6C6/736A50.png?text=Saturn', orbitalSpeed: 0.09, dataAiHint: 'planet texture saturn', ringTextureUrl: 'https://placehold.co/512x64/D3CBB6/A9A086.png?text=Rings', actualRadiusKm: 58232,
    moons: [
        { name: 'Mimas', textureUrl: 'https://placehold.co/64x64/B0C4DE/778899.png?text=Mi', dataAiHint: 'moon small crater', actualRadiusKm: 198, actualOrbitalRadiusKm: 185539, orbitalSpeedFactor: 1.5 },
        { name: 'Enceladus', textureUrl: 'https://placehold.co/64x64/F0FFFF/ADD8E6.png?text=En', dataAiHint: 'moon icy geyser', actualRadiusKm: 252, actualOrbitalRadiusKm: 237948, orbitalSpeedFactor: 1.3 },
        { name: 'Tethys', textureUrl: 'https://placehold.co/64x64/D3D3D3/A9A9A9.png?text=Te', dataAiHint: 'moon icy valley', actualRadiusKm: 531, actualOrbitalRadiusKm: 294619, orbitalSpeedFactor: 1.1 },
        { name: 'Dione', textureUrl: 'https://placehold.co/64x64/C0C0C0/808080.png?text=Di', dataAiHint: 'moon icy cliffs', actualRadiusKm: 561, actualOrbitalRadiusKm: 377396, orbitalSpeedFactor: 0.9 },
        { name: 'Rhea', textureUrl: 'https://placehold.co/128x128/BEBEBE/708090.png?text=Rh', dataAiHint: 'moon icy bright', actualRadiusKm: 764, actualOrbitalRadiusKm: 527108, orbitalSpeedFactor: 0.7 },
        { name: 'Titan', textureUrl: 'https://placehold.co/128x128/FFDEAD/D2691E.png?text=Ti', dataAiHint: 'moon hazy orange', actualRadiusKm: 2575, actualOrbitalRadiusKm: 1221870, orbitalSpeedFactor: 0.5 },
        { name: 'Iapetus', textureUrl: 'https://placehold.co/128x128/FAF0E6/463E34.png?text=Ia', dataAiHint: 'moon two-tone', actualRadiusKm: 735, actualOrbitalRadiusKm: 3560820, orbitalSpeedFactor: 0.3, inclination: 0.26 } // ~15 degrees
    ]
  },
  { 
    name: 'Uranus', type: 'Planet', gravity: '0.9 G', resources: ['Methane', 'Ammonia', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0xAEEEEE, size: 1.8, position: [19.2 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/AEEEEE/45B3B3.png?text=Uranus', orbitalSpeed: 0.06, dataAiHint: 'planet texture uranus', actualRadiusKm: 25362,
    moons: [
        { name: 'Miranda', textureUrl: 'https://placehold.co/64x64/DCDCDC/A9A9A9.png?text=Mr', dataAiHint: 'moon chaotic terrain', actualRadiusKm: 236, actualOrbitalRadiusKm: 129390, orbitalSpeedFactor: 1.2 },
        { name: 'Ariel', textureUrl: 'https://placehold.co/64x64/F0F8FF/B0E0E6.png?text=Ar', dataAiHint: 'moon bright canyons', actualRadiusKm: 579, actualOrbitalRadiusKm: 191020, orbitalSpeedFactor: 1.0 },
        { name: 'Umbriel', textureUrl: 'https://placehold.co/64x64/A9A9A9/696969.png?text=Um', dataAiHint: 'moon dark cratered', actualRadiusKm: 585, actualOrbitalRadiusKm: 266000, orbitalSpeedFactor: 0.8 },
        { name: 'Titania', textureUrl: 'https://placehold.co/128x128/E6E6FA/C0C0C0.png?text=Tt', dataAiHint: 'moon large faults', actualRadiusKm: 789, actualOrbitalRadiusKm: 435910, orbitalSpeedFactor: 0.6 },
        { name: 'Oberon', textureUrl: 'https://placehold.co/128x128/D8BFD8/8B008B.png?text=Ob', dataAiHint: 'moon reddish craters', actualRadiusKm: 761, actualOrbitalRadiusKm: 583520, orbitalSpeedFactor: 0.4 }
    ]
  },
  { 
    name: 'Neptune', type: 'Planet', gravity: '1.14 G', resources: ['Methane', 'Hydrogen', 'Ice'], terrain: 'Ice Layers', biome: 'Ice Giant', color: 0x3A7CEC, size: 1.7, position: [30.06 * SOLAR_SYSTEM_SCALE_FACTOR, 0, 0], textureUrl: 'https://placehold.co/256x256/3A7CEC/2A588F.png?text=Neptune', orbitalSpeed: 0.05, dataAiHint: 'planet texture neptune', actualRadiusKm: 24622,
    moons: [
        { name: 'Proteus', textureUrl: 'https://placehold.co/64x64/808080/505050.png?text=Pr', dataAiHint: 'moon irregular dark', actualRadiusKm: 210, actualOrbitalRadiusKm: 117647, orbitalSpeedFactor: 1.0 },
        { name: 'Triton', textureUrl: 'https://placehold.co/128x128/FFE4C4/F5DEB3.png?text=Tr', dataAiHint: 'moon cantaloupe terrain', actualRadiusKm: 1353, actualOrbitalRadiusKm: 354759, orbitalSpeedFactor: 0.6, inclination: 2.76 }, // ~158 degrees (retrograde), simplified here
        { name: 'Nereid', textureUrl: 'https://placehold.co/64x64/ADD8E6/87CEFA.png?text=Nr', dataAiHint: 'moon distant eccentric', actualRadiusKm: 170, actualOrbitalRadiusKm: 5513818, orbitalSpeedFactor: 0.2, inclination: 0.12 } // ~7 degrees
    ]
  },
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
  },
  {
    name: "Pluto", type: 'Dwarf Planet', gravity: '0.063 G', resources: ['Nitrogen Ice', 'Methane Ice', 'Rock'], terrain: 'Mountains, Plains, Glaciers', biome: 'Icy/Rocky', color: 0xDEB887, size: 0.35, position: [0,0,0], // Dynamic
    textureUrl: 'https://placehold.co/128x128/DEB887/8B4513.png?text=Pluto', dataAiHint: 'dwarf planet texture icy rock',
    description: "Famous dwarf planet with a heart-shaped glacier, thin nitrogen atmosphere, and five known moons. Orbits in the Kuiper Belt.", actualRadiusKm: 1188,
    orbitalParams: {
      semiMajorAxis: 39.48 * SOLAR_SYSTEM_SCALE_FACTOR,
      semiMinorAxis: 39.48 * SOLAR_SYSTEM_SCALE_FACTOR * Math.sqrt(1 - 0.2488**2),
      eccentricity: 0.2488,
      inclination: 17.16 * (Math.PI / 180),
      perihelionDistance: 29.66 * SOLAR_SYSTEM_SCALE_FACTOR,
      aphelionDistance: 49.30 * SOLAR_SYSTEM_SCALE_FACTOR,
      ellipseCX: -(39.48 * SOLAR_SYSTEM_SCALE_FACTOR * 0.2488),
      orbitalPeriodYears: 248,
    }
  },
  {
    name: "Eris", type: 'Dwarf Planet', gravity: '0.084 G (est.)', resources: ['Methane Ice', 'Rock'], terrain: 'Highly Reflective Surface', biome: 'Icy/Rocky', color: 0xF5F5F5, size: 0.34, position: [0,0,0], // Dynamic
    textureUrl: 'https://placehold.co/128x128/F5F5F5/808080.png?text=Eris', dataAiHint: 'dwarf planet texture icy bright',
    description: "One of the most massive known dwarf planets, located in the scattered disc beyond the Kuiper Belt. Has one known moon, Dysnomia.", actualRadiusKm: 1163,
    orbitalParams: {
      semiMajorAxis: 67.78 * SOLAR_SYSTEM_SCALE_FACTOR,
      semiMinorAxis: 67.78 * SOLAR_SYSTEM_SCALE_FACTOR * Math.sqrt(1 - 0.4359**2),
      eccentricity: 0.4359,
      inclination: 44.04 * (Math.PI / 180),
      perihelionDistance: 38.23 * SOLAR_SYSTEM_SCALE_FACTOR,
      aphelionDistance: 97.33 * SOLAR_SYSTEM_SCALE_FACTOR,
      ellipseCX: -(67.78 * SOLAR_SYSTEM_SCALE_FACTOR * 0.4359),
      orbitalPeriodYears: 559,
    }
  },
  {
    name: 'Proxima Centauri', type: 'Distant Star', gravity: 'N/A (Stellar)', resources: ['Hydrogen', 'Helium'], terrain: 'Red Dwarf Star', biome: 'Star System', color: 0xFF6347, size: 5.0, position: [5000, 500, 0],
    textureUrl: 'https://placehold.co/64x64/FF6347/8B0000.png?text=P', dataAiHint: 'red dwarf star',
    description: "Closest known star to the Sun (approx. 4.24 light-years away). A red dwarf, part of the Alpha Centauri triple star system."
  },
];

const ASTEROID_COUNT = 1000;
const ASTEROID_BELT_INNER_RADIUS = 2.2 * SOLAR_SYSTEM_SCALE_FACTOR;
const ASTEROID_BELT_OUTER_RADIUS = 3.2 * SOLAR_SYSTEM_SCALE_FACTOR;
const ASTEROID_BELT_THICKNESS = 1.5 * (SOLAR_SYSTEM_SCALE_FACTOR / 20);

const EXISTING_STAR_COUNT = 5000;

const GALAXY_PARTICLE_COUNT = 35000;
const GALAXY_RADIUS = 1500;
const GALAXY_CORE_BULGE_RADIUS = GALAXY_RADIUS * 0.15;
const GALAXY_BAR_LENGTH = GALAXY_RADIUS * 0.5;
const GALAXY_BAR_WIDTH = GALAXY_RADIUS * 0.1;
const GALAXY_THICKNESS = 70;
const GALAXY_PARTICLE_SIZE = 4.5;
const GALAXY_VISIBILITY_START_DISTANCE = 300;
const GALAXY_VISIBILITY_FULL_DISTANCE = 900;
const CONTROLS_MAX_DISTANCE = 7000;
const CAMERA_FAR_PLANE = 10000;

interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  timestamp: number;
  units: string;
}

export function GalaxyMap() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedBody, setSelectedBody] = useState<CelestialBodyInfo | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const planetsRef = useRef<THREE.Mesh[]>([]); // Holds planet meshes
  const planetMoonGroupsRef = useRef<Record<string, THREE.Group[]>>({}); // Holds moon groups, keyed by planet name

  const asteroidsGroupRef = useRef<THREE.Group | null>(null);

  const cometMeshRef = useRef<THREE.Mesh | null>(null);
  const cometOrbitCurveRef = useRef<THREE.EllipseCurve | null>(null);
  const cometGroupRef = useRef<THREE.Group | null>(null);

  const plutoMeshRef = useRef<THREE.Mesh | null>(null);
  const plutoOrbitCurveRef = useRef<THREE.EllipseCurve | null>(null);
  const plutoGroupRef = useRef<THREE.Group | null>(null);

  const erisMeshRef = useRef<THREE.Mesh | null>(null);
  const erisOrbitCurveRef = useRef<THREE.EllipseCurve | null>(null);
  const erisGroupRef = useRef<THREE.Group | null>(null);

  const clockRef = useRef<THREE.Clock | null>(null);

  const asteroidGeometryRef = useRef<THREE.DodecahedronGeometry | null>(null);
  const asteroidTextureRef = useRef<THREE.Texture | null>(null);
  const asteroidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const starGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const starMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  let backgroundStars: THREE.Points | null = null;


  const milkyWayParticlesRef = useRef<THREE.Points | null>(null);
  const milkyWayGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const milkyWayMaterialRef = useRef<THREE.PointsMaterial | null>(null);

  // ISS specific refs and state
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const issMeshRef = useRef<THREE.Mesh | null>(null);
  const [issData, setIssData] = useState<ISSData | null>(null);
  const [issError, setIssError] = useState<string | null>(null);
  const issFetchIntervalIdRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    planetsRef.current = [];
    planetMoonGroupsRef.current = {};


    clockRef.current = new THREE.Clock();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050005);

    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, CAMERA_FAR_PLANE);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 4.5, SOLAR_SYSTEM_SCALE_FACTOR * 10); // Sun light
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    if (!starGeometryRef.current) starGeometryRef.current = new THREE.BufferGeometry();
    if (!starMaterialRef.current) starMaterialRef.current = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true, transparent: true, opacity: 0.7 });

    const neptuneData = solarSystemData.find(body => body.name === 'Neptune');
    const neptuneOrbitRadius = neptuneData ? neptuneData.position[0] : (30 * SOLAR_SYSTEM_SCALE_FACTOR);


    const starVertices = [];
    for (let i = 0; i < EXISTING_STAR_COUNT; i++) {
      const x = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2.5);
      const y = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2.5);
      const z = (Math.random() - 0.5) * (CONTROLS_MAX_DISTANCE * 2.5);
      const dist = Math.sqrt(x*x + y*y + z*z);
      if (dist > (neptuneOrbitRadius * 1.2) && dist < CAMERA_FAR_PLANE * 0.9) {
         starVertices.push(x, y, z);
      }
    }
    starGeometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    backgroundStars = new THREE.Points(starGeometryRef.current, starMaterialRef.current);
    scene.add(backgroundStars);

    const textureLoader = new THREE.TextureLoader();

    const galaxyVerticesArray: number[] = [];
    const galaxyColorsArray: number[] = [];
    const galaxyColor = new THREE.Color();

    for (let i = 0; i < GALAXY_PARTICLE_COUNT; i++) {
        let x_pos, y_pos, z_pos;
        const randVal = Math.random();
        let isArmParticle = false;

        if (randVal < 0.2) {
          const r = Math.random() * GALAXY_CORE_BULGE_RADIUS;
          const theta_core = Math.random() * 2 * Math.PI;
          const phi_core = Math.acos(2 * Math.random() - 1);
          x_pos = r * Math.sin(phi_core) * Math.cos(theta_core);
          z_pos = r * Math.sin(phi_core) * Math.sin(theta_core);
          y_pos = r * Math.cos(phi_core) * 0.5;
          galaxyColor.setHSL( (0.07 + Math.random() * 0.06), (0.95 + Math.random() * 0.1), (0.65 + Math.random() * 0.1) );

        } else if (randVal < 0.45) {
          x_pos = (Math.random() - 0.5) * GALAXY_BAR_LENGTH;
          const barTaperFactorX = 1 - Math.pow(Math.abs(x_pos) / (GALAXY_BAR_LENGTH / 2 + 1e-6), 1.2);
          z_pos = (Math.random() - 0.5) * GALAXY_BAR_WIDTH * Math.max(0.1, barTaperFactorX);

          const currentMaxZAtX = (GALAXY_BAR_WIDTH / 2) * Math.max(0.1, barTaperFactorX);
          const normalizedZInBar = Math.min(1.0, Math.abs(z_pos) / (currentMaxZAtX + 1e-6));
          const barTaperFactorZ_forYthickness = 1 - Math.pow(normalizedZInBar, 1.5);

          const combinedTaperForY = barTaperFactorX * barTaperFactorZ_forYthickness;
          y_pos = (Math.random() - 0.5) * GALAXY_THICKNESS * 0.35 * Math.max(0.05, combinedTaperForY);

          galaxyColor.setHSL( (0.09 + Math.random() * 0.05), (0.90 + Math.random() * 0.1), (0.75 + Math.random() * 0.08) );

        } else {
          isArmParticle = true;
          let r_disk = Math.pow(Math.random(), 0.7) * GALAXY_RADIUS;
          let theta_disk = Math.random() * 2 * Math.PI;

          const numArms = 2;
          const armTightness = 2.0;
          let armPhase = (r_disk / GALAXY_RADIUS) * numArms * Math.PI * armTightness;

          const barInfluenceFactor = Math.max(0, 1 - (r_disk / (GALAXY_BAR_LENGTH * 0.75)));
          const angleOffsetFromBar = Math.PI / numArms;

          theta_disk += armPhase + (Math.floor(theta_disk / (Math.PI / numArms)) % numArms) * angleOffsetFromBar * barInfluenceFactor;

          const disturbanceMagnitudeBase = (r_disk / GALAXY_RADIUS) * (GALAXY_RADIUS * 0.045);
          const disturbanceMagnitudeRandom = Math.random() * GALAXY_RADIUS * 0.01;
          const disturbanceMagnitude = disturbanceMagnitudeBase + disturbanceMagnitudeRandom;
          x_pos = r_disk * Math.cos(theta_disk) + (Math.random() - 0.5) * disturbanceMagnitude;
          z_pos = r_disk * Math.sin(theta_disk) + (Math.random() - 0.5) * disturbanceMagnitude;

          const diskThicknessFactor = 0.15 + 0.35 * (1 - r_disk / GALAXY_RADIUS) + 0.1 * barInfluenceFactor;
          y_pos = (Math.random() - 0.5) * GALAXY_THICKNESS * diskThicknessFactor;

          const phaseSegment = (armPhase / (Math.PI * 0.5)) % 2;
          const localColorTypeRand = Math.random();
          const saturation = 0.95 + Math.random() * 0.1;
          const lightnessMod = (Math.random() - 0.5) * 0.15;

          if (phaseSegment < 1) {
            if (localColorTypeRand < 0.65) {
              galaxyColor.setHSL(0.58 + Math.random() * 0.12, saturation, 0.70 + lightnessMod * 0.9);
            } else if (localColorTypeRand < 0.90) {
              galaxyColor.setHSL(0.83 + Math.random() * 0.12, saturation, 0.65 + lightnessMod * 0.9);
            } else {
              galaxyColor.setHSL(0.10 + Math.random() * 0.1, saturation, 0.90 + Math.random() * 0.15);
            }
          } else {
            if (localColorTypeRand < 0.25) {
              galaxyColor.setHSL(0.58 + Math.random() * 0.12, saturation, 0.70 + lightnessMod * 0.9);
            } else if (localColorTypeRand < 0.90) {
              galaxyColor.setHSL(0.83 + Math.random() * 0.12, saturation, 0.65 + lightnessMod * 0.9);
            } else {
              galaxyColor.setHSL(0.10 + Math.random() * 0.1, saturation, 0.90 + Math.random() * 0.15);
            }
          }
        }

        y_pos += (Math.random() - 0.5) * GALAXY_THICKNESS * 0.05;

        const distSq = x_pos * x_pos + z_pos * z_pos;
        if (distSq > GALAXY_RADIUS * GALAXY_RADIUS && isArmParticle) {
          const dist = Math.sqrt(distSq);
          const scale = (GALAXY_RADIUS / dist) * (0.95 + Math.random() * 0.05);
          x_pos *= scale;
          z_pos *= scale;
        }

        galaxyVerticesArray.push(x_pos, y_pos, z_pos);
        galaxyColorsArray.push(galaxyColor.r, galaxyColor.g, galaxyColor.b);
      }

    if (!milkyWayGeometryRef.current) milkyWayGeometryRef.current = new THREE.BufferGeometry();
    milkyWayGeometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(galaxyVerticesArray, 3));
    milkyWayGeometryRef.current.setAttribute('color', new THREE.Float32BufferAttribute(galaxyColorsArray, 3));

    if (!milkyWayMaterialRef.current) {
        milkyWayMaterialRef.current = new THREE.PointsMaterial({
        size: GALAXY_PARTICLE_SIZE,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        });
    }

    const milkyWay = new THREE.Points(milkyWayGeometryRef.current, milkyWayMaterialRef.current);
    scene.add(milkyWay);
    milkyWayParticlesRef.current = milkyWay;

    const createOrbitalBody = (bodyData: CelestialBodyInfo, meshRefObj: React.MutableRefObject<THREE.Mesh | null>, curveRefObj: React.MutableRefObject<THREE.EllipseCurve | null>, groupRefObj: React.MutableRefObject<THREE.Group | null>) => {
      if (!bodyData.orbitalParams) return;
      const params = bodyData.orbitalParams;
      const nucleusGeo = new THREE.SphereGeometry(bodyData.size, 16, 16);
      const nucleusMat = new THREE.MeshStandardMaterial({
        map: textureLoader.load(bodyData.textureUrl),
        emissive: bodyData.color,
        emissiveIntensity: 0.3,
        roughness: 0.8,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(nucleusGeo, nucleusMat);
      mesh.userData = { ...bodyData, currentU: Math.random() };
      mesh.name = bodyData.name;
      meshRefObj.current = mesh;

      const curve = new THREE.EllipseCurve(
        params.ellipseCX, 0,
        params.semiMajorAxis, params.semiMinorAxis,
        0, 2 * Math.PI, false, 0
      );
      curveRefObj.current = curve;

      const points = curve.getPoints(256);
      const orbitPoints3D = points.map(p => new THREE.Vector3(p.x, p.y, 0));
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints3D);
      const orbitMat = new THREE.LineBasicMaterial({ color: bodyData.color, transparent: true, opacity: 0.3 });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);

      const group = new THREE.Group();
      group.add(mesh);
      group.add(orbitLine);
      group.rotation.x = params.inclination;
      scene.add(group);
      groupRefObj.current = group;
    };


    solarSystemData.forEach(bodyData => {
      if ((bodyData.type === 'Comet' || (bodyData.type === 'Dwarf Planet' && bodyData.name !== 'Ceres' && bodyData.orbitalParams) ) && bodyData.orbitalParams) {
        if (bodyData.name === "Halley's Comet") {
          createOrbitalBody(bodyData, cometMeshRef, cometOrbitCurveRef, cometGroupRef);
        } else if (bodyData.name === "Pluto") {
          createOrbitalBody(bodyData, plutoMeshRef, plutoOrbitCurveRef, plutoGroupRef);
        } else if (bodyData.name === "Eris") {
          createOrbitalBody(bodyData, erisMeshRef, erisOrbitCurveRef, erisGroupRef);
        }
      } else { // Planets, Sun, Ceres (simple orbit), Distant Stars
        const geometry = new THREE.SphereGeometry(bodyData.size, 32, 32);
        const bodyTexture = textureLoader.load(bodyData.textureUrl);
        let material;

        if (bodyData.type === 'Star' || bodyData.type === 'Distant Star') {
          material = new THREE.MeshBasicMaterial({ map: bodyTexture, emissive: bodyData.color, emissiveIntensity: bodyData.type === 'Distant Star' ? 5.0 : 1.5 });
        } else {
          material = new THREE.MeshStandardMaterial({
            map: bodyTexture,
            roughness: 0.8,
            metalness: 0.1
          });
        }
        const bodyMesh = new THREE.Mesh(geometry, material);
        bodyMesh.position.set(...bodyData.position);
        bodyMesh.userData = { ...bodyData, moonsMeshes: [] }; // Initialize moonsMeshes array for planets
        bodyMesh.name = bodyData.name;
        scene.add(bodyMesh);

        if (bodyData.name === 'Earth') {
          earthMeshRef.current = bodyMesh; // Store reference to Earth mesh
        }

        if (bodyData.name === 'Saturn' && bodyData.ringTextureUrl) {
          const ringTexture = textureLoader.load(bodyData.ringTextureUrl);
          const ringGeometry = new THREE.RingGeometry(bodyData.size * 1.2, bodyData.size * 2.2, 64);
          const ringMaterial = new THREE.MeshBasicMaterial({ map: ringTexture, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
          const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
          ringMesh.rotation.x = Math.PI * 0.45;
          ringMesh.userData.dataAiHint = "planet rings";
          bodyMesh.add(ringMesh);
        }

        if ((bodyData.type === 'Planet' || (bodyData.type === 'Dwarf Planet' && bodyData.name === 'Ceres')) && bodyData.orbitalSpeed) {
          bodyMesh.userData.orbitalRadius = Math.sqrt(bodyData.position[0]**2 + bodyData.position[2]**2);
          bodyMesh.userData.initialY = bodyData.position[1];
          bodyMesh.userData.initialAngle = Math.atan2(bodyData.position[2], bodyData.position[0]);
          planetsRef.current.push(bodyMesh);

          const orbitRadius = bodyMesh.userData.orbitalRadius;
          const orbitPointsArr = [];
          const segments = 128;
          for (let i = 0; i <= segments; i++) {
              const theta = (i / segments) * Math.PI * 2;
              orbitPointsArr.push(new THREE.Vector3(Math.cos(theta) * orbitRadius, bodyData.position[1], Math.sin(theta) * orbitRadius));
          }
          const orbitLineGeometry = new THREE.BufferGeometry().setFromPoints(orbitPointsArr);
          const orbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
          const orbitLine = new THREE.Line(orbitLineGeometry, orbitLineMaterial);
          scene.add(orbitLine);
        }

        // Create moons for this planet
        if (bodyData.moons && bodyData.moons.length > 0 && bodyData.actualRadiusKm) {
          if (!planetMoonGroupsRef.current[bodyData.name]) {
            planetMoonGroupsRef.current[bodyData.name] = [];
          }
          bodyData.moons.forEach(moonData => {
            const moonSceneSize = (bodyData.size * (moonData.actualRadiusKm / bodyData.actualRadiusKm)) * MOON_SIZE_DISPLAY_SCALE;
            const moonOrbitSceneRadius = (bodyData.size * (moonData.actualOrbitalRadiusKm / bodyData.actualRadiusKm)) * MOON_ORBIT_DISPLAY_SCALE;

            const moonGeometry = new THREE.SphereGeometry(Math.max(0.02, moonSceneSize), 16, 16); // Min size for visibility
            const moonTexture = textureLoader.load(moonData.textureUrl);
            const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture, roughness: 0.9, metalness: 0.1 });
            const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
            moonMesh.name = moonData.name;
            moonMesh.userData = { // Store data for animation
              ...moonData,
              orbitalRadius: moonOrbitSceneRadius,
              initialAngle: Math.random() * Math.PI * 2, // Random start angle
              orbitalSpeedFactor: moonData.orbitalSpeedFactor,
              inclination: moonData.inclination || 0,
            };

            // Create orbit line for the moon (around the planet)
            const moonOrbitPointsArr = [];
            const moonOrbitSegments = 64;
            for (let i = 0; i <= moonOrbitSegments; i++) {
                const theta = (i / moonOrbitSegments) * Math.PI * 2;
                moonOrbitPointsArr.push(new THREE.Vector3(Math.cos(theta) * moonOrbitSceneRadius, 0, Math.sin(theta) * moonOrbitSceneRadius));
            }
            const moonOrbitLineGeometry = new THREE.BufferGeometry().setFromPoints(moonOrbitPointsArr);
            const moonOrbitLineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.1 });
            const moonOrbitLine = new THREE.Line(moonOrbitLineGeometry, moonOrbitLineMaterial);
            
            // Moon group to handle inclination
            const moonGroup = new THREE.Group();
            moonGroup.add(moonMesh);
            moonGroup.add(moonOrbitLine);
            moonGroup.rotation.x = moonData.inclination || 0; // Apply inclination to the whole orbit group

            bodyMesh.add(moonGroup); // Add moon group as a child of the planet mesh
            (bodyMesh.userData.moonsMeshes as THREE.Mesh[]).push(moonMesh); // Keep track of moon mesh itself for direct access if needed
            planetMoonGroupsRef.current[bodyData.name].push(moonGroup);
          });
        }
      }
    });

    if (!asteroidsGroupRef.current) asteroidsGroupRef.current = new THREE.Group();
    if (!asteroidGeometryRef.current) asteroidGeometryRef.current = new THREE.DodecahedronGeometry(1, 0);
    if (!asteroidTextureRef.current) asteroidTextureRef.current = textureLoader.load('https://placehold.co/128x128/A9A9A9/696969.png?text=Rock');
    if (!asteroidMaterialRef.current) asteroidMaterialRef.current = new THREE.MeshStandardMaterial({
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
      asteroidsGroupRef.current.add(asteroidMesh);
    }
    scene.add(asteroidsGroupRef.current);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (event: MouseEvent) => {
      if (!currentMount) return;
      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / currentMount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / currentMount.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersectableObjects = scene.children.filter(obj =>
        (obj.userData.name && obj instanceof THREE.Mesh && obj.name !== "ISS") || // Exclude clicking ISS mesh for info card for now
        (obj instanceof THREE.Group && [cometGroupRef.current, plutoGroupRef.current, erisGroupRef.current].includes(obj as THREE.Group))
      );
      const intersects = raycaster.intersectObjects(intersectableObjects, true);

      if (intersects.length > 0) {
        let clickedObjectOrGroup = intersects[0].object;
        // Traverse up to find the main celestial body or orbital group that has the userData
        while (clickedObjectOrGroup.parent && clickedObjectOrGroup.parent !== scene && !clickedObjectOrGroup.userData.name) {
            if (cometGroupRef.current && cometGroupRef.current.children.includes(clickedObjectOrGroup) && cometMeshRef.current) {
                 clickedObjectOrGroup = cometMeshRef.current; break;
            }
            if (plutoGroupRef.current && plutoGroupRef.current.children.includes(clickedObjectOrGroup) && plutoMeshRef.current) {
                 clickedObjectOrGroup = plutoMeshRef.current; break;
            }
            if (erisGroupRef.current && erisGroupRef.current.children.includes(clickedObjectOrGroup) && erisMeshRef.current) {
                 clickedObjectOrGroup = erisMeshRef.current; break;
            }
            clickedObjectOrGroup = clickedObjectOrGroup.parent as THREE.Object3D;
        }

        if (clickedObjectOrGroup.userData.name && clickedObjectOrGroup.userData.type !== "Moon") { // Don't show info card for moons for now
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
        if(obj.userData.name && obj instanceof THREE.Mesh && ![cometMeshRef.current, plutoMeshRef.current, erisMeshRef.current, issMeshRef.current].includes(obj)) {
           // Only apply self-rotation to planets, not sun or distant stars (or moons directly, they rotate with their group)
           if (obj.userData.type === 'Planet' || (obj.userData.type === 'Dwarf Planet' && obj.name ==='Ceres')) {
             obj.rotation.y += 0.002;
           }
        }
      });

      planetsRef.current.forEach(planetMesh => {
        const P = planetMesh.userData;
        if (P.orbitalSpeed && P.orbitalRadius !== undefined && P.initialAngle !== undefined) {
          const currentAngle = P.initialAngle + elapsedTime * P.orbitalSpeed * 0.1;
          planetMesh.position.x = Math.cos(currentAngle) * P.orbitalRadius;
          planetMesh.position.y = P.initialY;
          planetMesh.position.z = Math.sin(currentAngle) * P.orbitalRadius;
        }

        // Animate moons of this planet
        const planetMoonsGroups = planetMoonGroupsRef.current[planetMesh.name];
        if (planetMoonsGroups) {
          planetMoonsGroups.forEach(moonGroup => {
            // The moon mesh is the first child of the moonGroup
            const moonMesh = moonGroup.children[0] as THREE.Mesh;
            if (moonMesh) {
                const M = moonMesh.userData;
                const currentMoonAngle = M.initialAngle + elapsedTime * M.orbitalSpeedFactor * 0.2; // Adjust speed factor as needed
                moonMesh.position.x = Math.cos(currentMoonAngle) * M.orbitalRadius;
                moonMesh.position.z = Math.sin(currentMoonAngle) * M.orbitalRadius;
                moonMesh.rotation.y += 0.005; // Self-rotation for moon
            }
          });
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
                asteroid.rotation.x += P.rotationSpeed.x * deltaTime * 20;
                asteroid.rotation.y += P.rotationSpeed.y * deltaTime * 20;
                asteroid.rotation.z += P.rotationSpeed.z * deltaTime * 20;
              }
            }
          }
        });
      }

      const animateComplexOrbit = (meshRefObj: React.MutableRefObject<THREE.Mesh | null>, curveRefObj: React.MutableRefObject<THREE.EllipseCurve | null>, groupRefObj: React.MutableRefObject<THREE.Group | null>) => {
        if (meshRefObj.current && curveRefObj.current && meshRefObj.current.userData.orbitalParams && groupRefObj.current) {
          const mesh = meshRefObj.current;
          const data = mesh.userData as CelestialBodyInfo & { currentU: number };
          const params = data.orbitalParams!;

          const sunPosition = new THREE.Vector3(0,0,0);
          const localPositionOnEllipse2D = curveRefObj.current.getPoint(data.currentU);
          const localPositionOnEllipse = new THREE.Vector3(localPositionOnEllipse2D.x, localPositionOnEllipse2D.y, 0);

          groupRefObj.current.updateMatrixWorld(true); // Ensure matrix is up-to-date
          // This gives the position of the mesh *relative to the sun* if the group is at origin and only rotated.
          // If the group itself was translated, this would be relative to the group's origin in world space.
          // Here, group is at origin, rotated by inclination. Mesh position is on the ellipse within that rotated plane.
          
          // To get world position *of the mesh*:
          const worldPositionOfMesh = new THREE.Vector3();
          mesh.getWorldPosition(worldPositionOfMesh); // This considers the group's rotation.

          const distanceToSun = worldPositionOfMesh.distanceTo(sunPosition); // Correctly use world position for distance calculation.

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

          data.currentU += speedFactor * deltaTime * 0.5;
          if (data.currentU >= 1) {
              data.currentU = 0;
          }

          mesh.position.set(localPositionOnEllipse.x, localPositionOnEllipse.y, 0);
          mesh.rotation.y += 0.005;
        }
      };

      animateComplexOrbit(cometMeshRef, cometOrbitCurveRef, cometGroupRef);
      animateComplexOrbit(plutoMeshRef, plutoOrbitCurveRef, plutoGroupRef);
      animateComplexOrbit(erisMeshRef, erisOrbitCurveRef, erisGroupRef);


      if (milkyWayParticlesRef.current && milkyWayMaterialRef.current && controlsRef.current) {
        milkyWayParticlesRef.current.rotation.y += 0.00002 * deltaTime * 60;
        const distance = controlsRef.current.getDistance();
        let opacity = 0;
        if (distance > GALAXY_VISIBILITY_START_DISTANCE) {
          opacity = Math.min(1, (distance - GALAXY_VISIBILITY_START_DISTANCE) / (GALAXY_VISIBILITY_FULL_DISTANCE - GALAXY_VISIBILITY_START_DISTANCE));
        }
        milkyWayMaterialRef.current.opacity = opacity * 0.7;
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

    // ISS Data Fetching
    const fetchIssData = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ISSData = await response.json();
        setIssData(data);
        setIssError(null);
      } catch (error) {
        console.error("Failed to fetch ISS data:", error);
        setIssError(error instanceof Error ? error.message : "Unknown error fetching ISS data");
      }
    };

    fetchIssData(); // Initial fetch
    issFetchIntervalIdRef.current = setInterval(fetchIssData, 5000); // Fetch every 5 seconds


    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeEventListener('click', onClick);
      if (issFetchIntervalIdRef.current) {
        clearInterval(issFetchIntervalIdRef.current);
      }

      if (issMeshRef.current && earthMeshRef.current && earthMeshRef.current.children.includes(issMeshRef.current)) {
        earthMeshRef.current.remove(issMeshRef.current);
      }
      issMeshRef.current?.geometry?.dispose();
      (issMeshRef.current?.material as THREE.Material)?.dispose();
      issMeshRef.current = null;
      // earthMeshRef is disposed with other planets


      if (rendererRef.current && currentMount.contains(rendererRef.current.domElement)) {
        currentMount.removeChild(rendererRef.current.domElement);
      }

      if (controlsRef.current) controlsRef.current.dispose();

      const disposeGroup = (groupRefObj: React.MutableRefObject<THREE.Group | null>) => {
        if (groupRefObj.current && sceneRef.current) {
          groupRefObj.current.traverse(object => {
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
          sceneRef.current.remove(groupRefObj.current);
        }
        groupRefObj.current = null;
      };

      disposeGroup(cometGroupRef);
      cometMeshRef.current = null;
      cometOrbitCurveRef.current = null;

      disposeGroup(plutoGroupRef);
      plutoMeshRef.current = null;
      plutoOrbitCurveRef.current = null;

      disposeGroup(erisGroupRef);
      erisMeshRef.current = null;
      erisOrbitCurveRef.current = null;

      if (milkyWayGeometryRef.current) milkyWayGeometryRef.current.dispose();
      if (milkyWayMaterialRef.current) milkyWayMaterialRef.current.dispose();
      if (milkyWayParticlesRef.current && sceneRef.current) sceneRef.current.remove(milkyWayParticlesRef.current);
      milkyWayParticlesRef.current = null;


      if (starGeometryRef.current) starGeometryRef.current.dispose();
      if (starMaterialRef.current) starMaterialRef.current.dispose();
      if (backgroundStars && sceneRef.current) sceneRef.current.remove(backgroundStars);
      backgroundStars = null;


      if (asteroidsGroupRef.current && sceneRef.current) {
        asteroidsGroupRef.current.traverse(object => {
            if (object instanceof THREE.Mesh) {
                 if (object.geometry) object.geometry.dispose();
                 if (object.material && (object.material as THREE.MeshStandardMaterial).map) {
                    (object.material as THREE.MeshStandardMaterial).map?.dispose();
                 }
                 if (object.material) (object.material as THREE.Material).dispose();
            }
        });
        sceneRef.current.remove(asteroidsGroupRef.current);
      }
      asteroidsGroupRef.current = null;
      if (asteroidGeometryRef.current) asteroidGeometryRef.current.dispose();
      asteroidGeometryRef.current = null;
      if (asteroidTextureRef.current) asteroidTextureRef.current.dispose();
      asteroidTextureRef.current = null;
      if (asteroidMaterialRef.current) asteroidMaterialRef.current.dispose();
      asteroidMaterialRef.current = null;


      if (sceneRef.current) {
        sceneRef.current.traverse(object => {
           if (object instanceof THREE.Mesh && ![cometMeshRef.current, plutoMeshRef.current, erisMeshRef.current, issMeshRef.current].includes(object)) {
                if (object.geometry) object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => {
                        if ((material as THREE.MeshStandardMaterial).map) (material as THREE.MeshStandardMaterial).map?.dispose();
                        material.dispose();
                    });
                } else if (object.material) {
                    if ((object.material as THREE.MeshStandardMaterial).map) (object.material as THREE.MeshStandardMaterial).map?.dispose();
                    (object.material as THREE.Material).dispose();
                }
                // Dispose moons attached to this planet
                if (planetMoonGroupsRef.current[object.name]) {
                    planetMoonGroupsRef.current[object.name].forEach(moonGroup => {
                        moonGroup.traverse(moonObject => {
                            if (moonObject instanceof THREE.Mesh) {
                                if (moonObject.geometry) moonObject.geometry.dispose();
                                if (moonObject.material && (moonObject.material as THREE.MeshStandardMaterial).map) {
                                    (moonObject.material as THREE.MeshStandardMaterial).map?.dispose();
                                }
                                if (moonObject.material) (moonObject.material as THREE.Material).dispose();
                            } else if (moonObject instanceof THREE.Line) {
                                if (moonObject.geometry) moonObject.geometry.dispose();
                                if (moonObject.material) (moonObject.material as THREE.Material).dispose();
                            }
                        });
                        object.remove(moonGroup); // Remove from parent before scene removal
                    });
                }

            } else if (object instanceof THREE.Line) {
                 if (object.geometry) object.geometry.dispose();
                 if (object.material) (object.material as THREE.Material).dispose();
            } else if (object instanceof THREE.Points && object !== milkyWayParticlesRef.current && object !== backgroundStars) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) (object.material as THREE.Material).dispose();
            }
        });
      }
      planetsRef.current = [];
      planetMoonGroupsRef.current = {};
      earthMeshRef.current = null; // Clear Earth ref specifically
      if (rendererRef.current) rendererRef.current.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, []); 

  useEffect(() => {
    if (issData && earthMeshRef.current && sceneRef.current) {
      if (!issMeshRef.current) {
        const issGeometry = new THREE.SphereGeometry(0.03, 16, 16); 
        const issMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 2, toneMapped: false });
        issMeshRef.current = new THREE.Mesh(issGeometry, issMaterial);
        issMeshRef.current.name = "ISS";
        issMeshRef.current.userData = { name: "ISS", type: "Satellite", dataAiHint: "satellite space station" };
        earthMeshRef.current.add(issMeshRef.current); 
      }

      const earthModelRadius = earthMeshRef.current.userData.size || 1.0; 
      const altitudeInSceneUnits = (issData.altitude / EARTH_RADIUS_KM) * earthModelRadius;
      const totalRadius = earthModelRadius + altitudeInSceneUnits;

      const latRad = issData.latitude * (Math.PI / 180);
      const lonRad = issData.longitude * (Math.PI / 180);

      const x = totalRadius * Math.cos(latRad) * Math.sin(lonRad);
      const y = totalRadius * Math.sin(latRad);
      const z = totalRadius * Math.cos(latRad) * Math.cos(lonRad);

      issMeshRef.current.position.set(x, y, z);
      issMeshRef.current.visible = true;

    } else if (issMeshRef.current) {
      issMeshRef.current.visible = false;
    }
  }, [issData]); 


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
      <div ref={mountRef} className="w-full h-full" data-ai-hint="solar system planets moons dwarf planets comet proxima centauri milky way galaxy international space station" />
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
              <CardContent className="space-y-2 text-sm max-h-[calc(100vh-18rem)] overflow-y-auto">
                <p><strong>Type:</strong> {selectedBody.type}</p>
                {selectedBody.description && <p>{selectedBody.description}</p>}
                <p><strong>Surface Gravity:</strong> {selectedBody.gravity}</p>
                <p><strong>Key Resources:</strong> {selectedBody.resources && selectedBody.resources.length > 0 ? selectedBody.resources.join(', ') : 'N/A'}</p>
                <p><strong>Terrain Type:</strong> {selectedBody.terrain}</p>
                <p><strong>Primary Biome:</strong> {selectedBody.biome}</p>
                {(selectedBody.type === 'Comet' || (selectedBody.type === 'Dwarf Planet' && selectedBody.name !== 'Ceres' && selectedBody.orbitalParams)) && selectedBody.orbitalParams && (
                  <>
                    <hr className="my-2 border-primary/30" />
                    <p><strong>Perihelion:</strong> {(selectedBody.orbitalParams.perihelionDistance / SOLAR_SYSTEM_SCALE_FACTOR).toFixed(2)} AU</p>
                    <p><strong>Aphelion:</strong> {(selectedBody.orbitalParams.aphelionDistance / SOLAR_SYSTEM_SCALE_FACTOR).toFixed(2)} AU</p>
                    <p><strong>Orbital Period:</strong> ~{selectedBody.orbitalPeriodYears} Earth years</p>
                    <p><strong>Inclination:</strong> {(selectedBody.orbitalParams.inclination * (180 / Math.PI)).toFixed(1)}°</p>
                  </>
                )}
                 {selectedBody.type === 'Dwarf Planet' && selectedBody.name === 'Ceres' && !selectedBody.orbitalParams && selectedBody.orbitalSpeed && (
                    <>
                     <hr className="my-2 border-primary/30" />
                     <p><strong>Avg Orbital Distance:</strong> {(selectedBody.position[0] / SOLAR_SYSTEM_SCALE_FACTOR).toFixed(2)} AU</p>
                    </>
                 )}
                  {selectedBody.type === 'Planet' && selectedBody.moons && selectedBody.moons.length > 0 && (
                    <>
                        <hr className="my-2 border-primary/30" />
                        <p><strong>Major Moons:</strong> {selectedBody.moons.map(m => m.name).join(', ')}</p>
                    </>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {issError && (
        <div className="absolute bottom-4 left-4 bg-destructive/80 text-destructive-foreground p-3 rounded-md text-xs shadow-lg">
          ISS Data Error: {issError}
        </div>
      )}
    </div>
  );
}

