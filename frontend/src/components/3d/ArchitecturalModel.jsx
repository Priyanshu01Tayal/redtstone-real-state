import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ArchitecturalModel = () => {
  const mountRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!checkWebGL()) {
      setHasWebGL(false);
      setIsLoading(false);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 520;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(14, 11, 18);
    camera.lookAt(0, 4.5, 0);

    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed, using fallback:', e);
      setHasWebGL(false);
      setIsLoading(false);
      return;
    }

    // Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Primary Sun Light (Warm Key)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(18, 25, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Fill Soft Blue Light (Atmospheric skylight)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    // Redstone Brand Accent Rim Light (Soft Crimson Rim #E53935)
    const rimLight = new THREE.PointLight(0xe53935, 2.4, 25);
    rimLight.position.set(5, 12, -7);
    scene.add(rimLight);

    // Root Group
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    // Materials Palette
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.35,
      metalness: 0.1,
    });

    const darkBasaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f2428,
      roughness: 0.4,
      metalness: 0.5,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x82b1ff,
      metalness: 0.15,
      roughness: 0.1,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
      ior: 1.52,
    });

    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      emissive: 0xffb74d,
      emissiveIntensity: 0.45,
      roughness: 0.5,
    });

    const crimsonTrimMat = new THREE.MeshStandardMaterial({
      color: 0xc62828,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x8e0000,
      emissiveIntensity: 0.2,
    });

    const metalMullionMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      metalness: 0.85,
      roughness: 0.2,
    });

    // 1. Foundation Podium & Plaza Deck
    const baseGeo = new THREE.BoxGeometry(10, 0.5, 10);
    const baseMesh = new THREE.Mesh(baseGeo, darkBasaltMat);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    buildingGroup.add(baseMesh);

    // Plaza Water / Pool Feature
    const poolGeo = new THREE.BoxGeometry(3.5, 0.05, 3);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x1e88e5, roughness: 0.05, metalness: 0.8 });
    const poolMesh = new THREE.Mesh(poolGeo, poolMat);
    poolMesh.position.set(2.8, 0.05, 2.8);
    buildingGroup.add(poolMesh);

    // Redstone Welcome Portal at Entry
    const portalGeo = new THREE.BoxGeometry(2.2, 1.2, 0.4);
    const portalMesh = new THREE.Mesh(portalGeo, crimsonTrimMat);
    portalMesh.position.set(0, 0.6, 4.8);
    buildingGroup.add(portalMesh);

    // 2. Main High-Rise Core & Tiers (3-Tiered Cantilevered Tower)
    // Tier 1: Ground + Commercial Levels 1-4
    const tier1Geo = new THREE.BoxGeometry(6.4, 3.8, 6.4);
    const tier1Mesh = new THREE.Mesh(tier1Geo, glassMat);
    tier1Mesh.position.y = 1.9;
    tier1Mesh.castShadow = true;
    tier1Mesh.receiveShadow = true;
    buildingGroup.add(tier1Mesh);

    // Core shaft inside Tier 1 (gives realistic structural depth)
    const core1Geo = new THREE.BoxGeometry(3.6, 3.8, 3.6);
    const core1Mesh = new THREE.Mesh(core1Geo, interiorGlowMat);
    core1Mesh.position.y = 1.9;
    buildingGroup.add(core1Mesh);

    // Floor slabs for Tier 1
    for (let i = 0; i < 4; i++) {
      const slabGeo = new THREE.BoxGeometry(6.6, 0.12, 6.6);
      const slab = new THREE.Mesh(slabGeo, concreteMat);
      slab.position.y = 0.5 + i * 0.95;
      buildingGroup.add(slab);
    }

    // Tier 2: Mid-Rise Luxury Residences (Levels 5-9) - Stepped Back with Garden Terrace
    const tier2Geo = new THREE.BoxGeometry(5.2, 4.4, 5.2);
    const tier2Mesh = new THREE.Mesh(tier2Geo, glassMat);
    tier2Mesh.position.set(-0.3, 5.9, -0.3);
    tier2Mesh.castShadow = true;
    buildingGroup.add(tier2Mesh);

    const core2Geo = new THREE.BoxGeometry(2.8, 4.4, 2.8);
    const core2Mesh = new THREE.Mesh(core2Geo, interiorGlowMat);
    core2Mesh.position.set(-0.3, 5.9, -0.3);
    buildingGroup.add(core2Mesh);

    for (let i = 0; i < 5; i++) {
      const slabGeo = new THREE.BoxGeometry(5.4, 0.1, 5.4);
      const slab = new THREE.Mesh(slabGeo, concreteMat);
      slab.position.set(-0.3, 3.8 + i * 0.88, -0.3);
      buildingGroup.add(slab);
    }

    // Garden Terrace Deck on Tier 1 Roof
    const terraceGeo = new THREE.BoxGeometry(2.4, 0.15, 4.2);
    const terraceMat = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.9 });
    const terrace = new THREE.Mesh(terraceGeo, terraceMat);
    terrace.position.set(1.8, 3.82, 0.8);
    buildingGroup.add(terrace);

    // Tier 3: Sky Penthouse & Crown (Levels 10-12)
    const tier3Geo = new THREE.BoxGeometry(3.8, 2.8, 3.8);
    const tier3Mesh = new THREE.Mesh(tier3Geo, glassMat);
    tier3Mesh.position.set(-0.6, 9.4, -0.6);
    tier3Mesh.castShadow = true;
    buildingGroup.add(tier3Mesh);

    // Penthouse Cantilever Canopy Roof
    const canopyGeo = new THREE.BoxGeometry(4.8, 0.25, 4.8);
    const canopy = new THREE.Mesh(canopyGeo, darkBasaltMat);
    canopy.position.set(-0.6, 10.9, -0.6);
    canopy.castShadow = true;
    buildingGroup.add(canopy);

    // Crimson Accent Skyline Spire
    const spireGeo = new THREE.CylinderGeometry(0.04, 0.14, 2.4, 8);
    const spire = new THREE.Mesh(spireGeo, crimsonTrimMat);
    spire.position.set(-0.6, 12.1, -0.6);
    buildingGroup.add(spire);

    // Vertical Mullions & Architectural Fins (Adds signature modern realism)
    const finGeo = new THREE.BoxGeometry(0.12, 10.5, 0.25);
    for (let angle = 0; angle < 4; angle++) {
      const fin = new THREE.Mesh(finGeo, metalMullionMat);
      if (angle === 0) fin.position.set(-3.25, 5.4, 1.2);
      if (angle === 1) fin.position.set(-3.25, 5.4, -1.2);
      if (angle === 2) fin.position.set(1.2, 5.4, -3.25);
      if (angle === 3) fin.position.set(-1.2, 5.4, -3.25);
      buildingGroup.add(fin);
    }

    setIsLoading(false);

    // Interaction & Animation State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let isVisible = true;
    let animationFrameId;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Pause rendering when scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth target rotation based on mouse movement
        targetRotationY = mouseX * 0.45;
        targetRotationX = mouseY * 0.25;

        // Gentle ambient rotation + mouse lerp
        buildingGroup.rotation.y += (targetRotationY + Math.sin(elapsedTime * 0.35) * 0.08 - buildingGroup.rotation.y) * 0.05;
        buildingGroup.rotation.x += (targetRotationX * 0.3 - buildingGroup.rotation.x) * 0.05;
        
        // Subtle floating breathing effect
        buildingGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12;
      } else {
        buildingGroup.rotation.y = 0.4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full min-h-[440px] flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* Fallback Graphic */}
        <div className="text-center space-y-4 relative z-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-950/80 border border-[#C62828] flex items-center justify-center text-[#E53935] shadow-lg">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-black text-xl">Architectural Intelligence</h4>
            <p className="text-gray-400 text-xs max-w-xs mx-auto mt-1">
              Engineered high-rise & luxury residential portfolios with institutional-grade verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] flex items-center justify-center select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Status Badges for Architectural Credibility */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-gray-200/80 shadow-md flex items-center space-x-2.5 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-ping" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] absolute" />
        <div className="text-left">
          <span className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Spatial Engine</span>
          <span className="block text-xs font-bold text-[#222222]">3D Verified Asset</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 bg-[#222222]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-700/80 shadow-xl flex items-center space-x-3 pointer-events-none">
        <div className="w-7 h-7 rounded-lg bg-[#C62828] flex items-center justify-center text-white text-xs font-black">
          R
        </div>
        <div className="text-left text-white">
          <span className="block text-[10px] text-gray-400 font-medium">Redstone Standard</span>
          <span className="block text-xs font-black text-white">100% On-Site Inspected</span>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm rounded-3xl">
          <div className="w-8 h-8 border-3 border-[#E53935] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ArchitecturalModel;
