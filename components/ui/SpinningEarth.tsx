// components/ui/SpinningEarth.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface SpinningEarthProps {
  isChecking?: boolean;
  latitude?: number;
  longitude?: number;
  showMarker?: boolean;
}

export function SpinningEarth({ 
  isChecking = false, 
  latitude = 0, 
  longitude = 0,
  showMarker = false 
}: SpinningEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const cloudsRef = useRef<THREE.Mesh | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const markerRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>();
  const starsRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with better background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03030a); // Darker space blue
    sceneRef.current = scene;

    // Camera setup with better perspective
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 18); // Slightly elevated view
    cameraRef.current = camera;

    // Renderer setup with better quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.shadowMap.enabled = false; // Disable shadows for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = !isChecking;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2; // Limit rotation
    controls.minDistance = 10;
    controls.maxDistance = 25;
    controlsRef.current = controls;

    // Enhanced lighting
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    sunLight.position.set(10, 5, 10);
    sunLight.castShadow = false;
    scene.add(sunLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x446688, 0.6);
    fillLight.position.set(-10, 0, -10);
    scene.add(fillLight);

    // Add a subtle blue backlight
    const backLight = new THREE.PointLight(0x3366aa, 0.3);
    backLight.position.set(0, 0, -15);
    scene.add(backLight);

    // Enhanced stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 4000;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount; i++) {
      // Random positions in a sphere
      const r = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      starsPositions[i * 3] = x;
      starsPositions[i * 3 + 1] = y;
      starsPositions[i * 3 + 2] = z;
      
      // Random star colors (mostly white, some blue/red)
      const colorVal = 0.8 + Math.random() * 0.4;
      if (Math.random() > 0.9) {
        // Occasional colored star
        starsColors[i * 3] = Math.random(); // R
        starsColors[i * 3 + 1] = Math.random() * 0.5; // G
        starsColors[i * 3 + 2] = Math.random() * 0.5; // B
      } else {
        starsColors[i * 3] = colorVal;
        starsColors[i * 3 + 1] = colorVal;
        starsColors[i * 3 + 2] = colorVal;
      }
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({ 
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // Create Earth with high-res textures
    const earthGeometry = new THREE.SphereGeometry(5, 128, 128); // Higher resolution
    
    const textureLoader = new THREE.TextureLoader();
    
    // Load all textures with error handling
    const loadTexture = (url: string) => {
      return textureLoader.load(url, undefined, undefined, 
        (err) => console.error(`Failed to load texture: ${url}`, err)
      );
    };

    const earthTexture = loadTexture('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecularMap = loadTexture('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormalMap = loadTexture('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
    const cloudTexture = loadTexture('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    
    // Earth material with better shading
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: earthSpecularMap,
      specular: new THREE.Color(0x333333),
      shininess: 10,
      normalMap: earthNormalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      emissive: new THREE.Color(0x000022),
      emissiveIntensity: 0.1
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = false;
    earth.receiveShadow = false;
    scene.add(earth);
    earthRef.current = earth;

    // Add clouds layer with better blending
    const cloudsGeometry = new THREE.SphereGeometry(5.03, 128, 128);
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(clouds);
    cloudsRef.current = clouds;

    // Add atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(5.1, 64, 64);
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x2288ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      emissive: 0x113366,
      emissiveIntensity: 0.5
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
    glowRef.current = glow;

    // Add a subtle ring around Earth (atmosphere effect)
    const ringGeometry = new THREE.TorusGeometry(5.15, 0.02, 32, 200);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x3399ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      emissive: 0x113366
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = 0.3;
    scene.add(ring);

    // Add a second ring at different angle
    const ring2Geometry = new THREE.TorusGeometry(5.2, 0.01, 16, 200);
    const ring2Material = new THREE.MeshStandardMaterial({
      color: 0x66aaff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.z = 0.5;
    scene.add(ring2);

    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      // Rotate Earth and clouds at different speeds
      if (earthRef.current) {
        earthRef.current.rotation.y += isChecking ? 0.015 : 0.002;
      }
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += isChecking ? 0.02 : 0.0025;
      }
      if (glowRef.current) {
        glowRef.current.rotation.y += 0.0005;
      }

      // Rotate rings
      ring.rotation.y += 0.001;
      ring2.rotation.y += 0.0015;

      // Slowly rotate stars
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.0001;
      }

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.autoRotate = !isChecking;
        controlsRef.current.update();
      }

      // Add subtle camera movement when checking
      if (isChecking && cameraRef.current) {
        cameraRef.current.position.x = Math.sin(Date.now() * 0.002) * 2;
        cameraRef.current.lookAt(0, 0, 0);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      frameRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose geometries and materials to prevent memory leaks
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      
      rendererRef.current?.dispose();
    };
  }, [isChecking]);

  // Add marker when location is found
  useEffect(() => {
    if (!sceneRef.current || !earthRef.current || !showMarker) return;

    // Remove existing marker
    if (markerRef.current) {
      sceneRef.current.remove(markerRef.current);
    }
    if (ringRef.current) {
      sceneRef.current.remove(ringRef.current);
    }

    // Convert lat/long to 3D position on sphere
    const lat = latitude * Math.PI / 180;
    const lon = longitude * Math.PI / 180;
    
    const radius = 5.2; // Slightly above earth surface
    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    // Create glowing marker
    const markerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff0000,
      emissiveIntensity: 2.0
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(x, y, z);
    sceneRef.current.add(marker);
    markerRef.current = marker;

    // Create pulsing ring
    const ringGeometry = new THREE.TorusGeometry(0.3, 0.02, 16, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff0000,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(x, y, z);
    
    // Orient ring to face camera
    ring.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(x, y, z).normalize()
    );
    
    sceneRef.current.add(ring);
    ringRef.current = ring;

    // Add a beam of light
    const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.3
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(x * 1.5, y * 1.5, z * 1.5);
    beam.lookAt(new THREE.Vector3(x * 2, y * 2, z * 2));
    sceneRef.current.add(beam);

    // Animate the ring pulsing
    let pulseTime = 0;
    const pulseInterval = setInterval(() => {
      if (ringRef.current && sceneRef.current) {
        pulseTime += 0.1;
        const scale = 1 + Math.sin(pulseTime) * 0.2;
        ringRef.current.scale.set(scale, scale, scale);
        
        if (ringRef.current.material) {
          (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 
            0.5 + Math.sin(pulseTime) * 0.3;
        }
      }
    }, 50);

    return () => {
      clearInterval(pulseInterval);
    };
  }, [showMarker, latitude, longitude]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] bg-gradient-to-b from-[#03030a] via-[#08081a] to-[#0a0a20] rounded-xl overflow-hidden relative"
    >
      {/* Loading Overlay */}
      {isChecking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Scanning global networks...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}