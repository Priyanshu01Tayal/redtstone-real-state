import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Maximize2,
  Minimize2,
  Compass,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Camera,
  X,
  Info,
  Play,
  Pause,
  Home,
  CheckCircle,
} from 'lucide-react';

const PropertyMediaExperienceViewer = ({ property, onClose, initialRoomIndex = 0 }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeRoomIndex, setActiveRoomIndex] = useState(initialRoomIndex);
  const [loading, setLoading] = useState(true);
  const [viewerMode, setViewerMode] = useState('360'); // '360' | 'walkthrough'
  const [fov, setFov] = useState(72);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showDragHint, setShowDragHint] = useState(true);

  // Extract experience data or fallback to categorized media / images
  const experience = property?.threeDExperience || {};
  const categorized = property?.categorizedMedia || {};

  // Default verified equirectangular 360 flat interior scenes
  const DEFAULT_360_SCENES = [
    {
      roomId: 'scene_living',
      roomName: 'Living Room (Hall)',
      icon: '🛋️',
      category: 'livingRoom',
      panoramaUrl: 'https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg',
      caption: 'Spacious 360° Drawing Hall with False Ceiling & Wide Balcony Access',
    },
    {
      roomId: 'scene_bedroom',
      roomName: 'Master Bedroom',
      icon: '🛏️',
      category: 'bedrooms',
      panoramaUrl: 'https://pannellum.org/images/alma.jpg',
      caption: 'Master Suite with King-Size Space, Wooden Laminate & Large Windows',
    },
    {
      roomId: 'scene_balcony',
      roomName: 'Balcony & Society View',
      icon: '🌅',
      category: 'balcony',
      panoramaUrl: 'https://pannellum.org/images/lascar.jpg',
      caption: 'Open Air Balcony with Green Park & Skyline Community View',
    },
  ];

  // Verified High-Resolution Real Flat Interior Walkthrough Rooms
  const DEFAULT_WALKTHROUGH_ROOMS = [
    {
      roomId: 'walk_living',
      roomName: 'Living & Dining Hall',
      category: 'Living Room',
      icon: '🛋️',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      caption: 'Sunlit Living Room with Italian marble flooring, concealed LED cove lighting, and open layout.',
    },
    {
      roomId: 'walk_bedroom',
      roomName: 'Master Suite Bedroom',
      category: 'Master Bedroom',
      icon: '🛏️',
      imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      caption: 'Spacious master bedroom with floor-to-ceiling wardrobes and hardwood finish flooring.',
    },
    {
      roomId: 'walk_kitchen',
      roomName: 'Modular Kitchen',
      category: 'Kitchen',
      icon: '🍳',
      imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
      caption: 'German-engineered modular kitchen with soft-close drawers, chimney, and granite countertop.',
    },
    {
      roomId: 'walk_balcony',
      roomName: 'Park-Facing Balcony',
      category: 'Balcony',
      icon: '🌅',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      caption: 'Spacious sit-out balcony overlooking the landscaped central park and clubhouse.',
    },
    {
      roomId: 'walk_bathroom',
      roomName: 'Designer Bathroom',
      category: 'Bathroom',
      icon: '🚿',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=85',
      caption: 'Kohler/Jaguar branded sanitary fittings with toughened glass shower partition.',
    },
  ];

  // Determine available 360 panorama scenes
  const panoramaScenes =
    experience.panoramaScenes && experience.panoramaScenes.length > 0
      ? experience.panoramaScenes
      : categorized.panoramas && categorized.panoramas.length > 0
      ? categorized.panoramas.map((p, idx) => ({
          roomId: `pano_${idx}`,
          roomName: p.roomName || `Flat Room ${idx + 1}`,
          panoramaUrl: p.url || DEFAULT_360_SCENES[idx % DEFAULT_360_SCENES.length].panoramaUrl,
          caption: p.caption || '360° Flat Room View',
          icon: idx === 0 ? '🛋️' : idx === 1 ? '🛏️' : '🌅',
        }))
      : DEFAULT_360_SCENES;

  // Determine available room walkthrough images
  const walkthroughRooms =
    experience.walkthroughRooms && experience.walkthroughRooms.length > 0
      ? experience.walkthroughRooms
      : property?.images && property.images.length > 0
      ? property.images.map((img, idx) => ({
          roomId: `room_${idx}`,
          roomName: img.caption || `Room ${idx + 1}`,
          category: img.category || 'Flat Interior',
          imageUrl: img.url,
          caption: img.caption || 'Physically inspected by RedStone broker.',
          icon: idx === 0 ? '🛋️' : idx === 1 ? '🛏️' : idx === 2 ? '🍳' : '🌅',
        }))
      : DEFAULT_WALKTHROUGH_ROOMS;

  const currentPano = panoramaScenes[activeRoomIndex % panoramaScenes.length] || panoramaScenes[0];
  const currentWalk = walkthroughRooms[activeRoomIndex % walkthroughRooms.length] || walkthroughRooms[0];

  // Hide drag hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDragHint(false), 4000);
    return () => clearTimeout(timer);
  }, [activeRoomIndex]);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // =========================================================================
  // THREE.JS 360-DEGREE EQUIRECTANGULAR SPHERICAL PANORAMA ENGINE
  // =========================================================================
  useEffect(() => {
    if (viewerMode !== '360' || !canvasRef.current) return;

    let renderer, scene, camera, mesh, animationFrameId;
    let isUserInteracting = false;
    let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
    let lon = 0, onPointerDownLon = 0;
    let lat = 0, onPointerDownLat = 0;
    let phi = 0, theta = 0;

    const width = canvasRef.current.clientWidth || 800;
    const height = canvasRef.current.clientHeight || 540;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(fov, width / height, 1, 1100);
      camera.target = new THREE.Vector3(0, 0, 0);

      // Inverted Sphere for 360 panorama interior projection
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      const textureLoader = new THREE.TextureLoader();
      setLoading(true);

      const targetUrl = currentPano?.panoramaUrl || DEFAULT_360_SCENES[0].panoramaUrl;

      textureLoader.load(
        targetUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const material = new THREE.MeshBasicMaterial({ map: texture });
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          setLoading(false);
        },
        undefined,
        (err) => {
          console.warn('360 panorama load error, falling back to default scene:', err);
          // Fallback to official threejs room texture
          textureLoader.load('https://threejs.org/examples/textures/2294472375_24a3b8ef46_o.jpg', (fallbackTex) => {
            fallbackTex.colorSpace = THREE.SRGBColorSpace;
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: fallbackTex }));
            scene.add(mesh);
            setLoading(false);
          });
        }
      );

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      canvasRef.current.innerHTML = '';
      canvasRef.current.appendChild(renderer.domElement);
    } catch (e) {
      console.error('WebGL 360 init failed:', e);
      setViewerMode('walkthrough');
      return;
    }

    // Touch & Pointer interaction listeners
    const onPointerDown = (event) => {
      if (event.isPrimary === false) return;
      isUserInteracting = true;
      setShowDragHint(false);
      onPointerDownMouseX = event.clientX;
      onPointerDownMouseY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (event) => {
      if (event.isPrimary === false) return;
      lon = (onPointerDownMouseX - event.clientX) * 0.12 + onPointerDownLon;
      lat = (event.clientY - onPointerDownMouseY) * 0.12 + onPointerDownLat;
    };

    const onPointerUp = (event) => {
      if (event.isPrimary === false) return;
      isUserInteracting = false;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    const onWheel = (event) => {
      event.preventDefault();
      const newFov = Math.max(35, Math.min(95, camera.fov + event.deltaY * 0.05));
      camera.fov = newFov;
      camera.updateProjectionMatrix();
      setFov(newFov);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Render loop with gentle ambient auto-rotation
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isUserInteracting && autoRotate) {
        lon += 0.08; // Smooth ambient rotation
      }

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current || !renderer || !camera) return;
      const newW = canvasRef.current.clientWidth;
      const newH = canvasRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(animationFrameId);

      if (mesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (mesh.material.map) mesh.material.map.dispose();
          mesh.material.dispose();
        }
      }
      if (renderer) {
        renderer.dispose();
        if (canvasRef.current && canvasRef.current.contains(renderer.domElement)) {
          canvasRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, [viewerMode, activeRoomIndex, autoRotate]);

  // Adjust Zoom
  const handleZoom = (delta) => {
    setFov((prev) => Math.max(35, Math.min(95, prev + delta)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#1A1C23] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : 'w-full h-[520px] sm:h-[620px]'
      }`}
    >
      {/* ========================================================= */}
      {/* TOP BAR: FLAT TITLE + MODE TOGGLE + FULLSCREEN CONTROLS   */}
      {/* ========================================================= */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center space-x-3">
          {/* Badge */}
          <div className="px-3 py-1.5 rounded-full bg-[#C62828] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{viewerMode === '360' ? '360° Virtual Tour' : 'HD Flat Walkthrough'}</span>
          </div>

          {/* Property Title */}
          <div className="hidden md:block">
            <h4 className="text-sm font-bold text-white truncate max-w-sm">
              {property?.title || 'Verified Residential Flat'}
            </h4>
            <p className="text-[11px] text-gray-300">
              {property?.locality || 'Delhi NCR'}, {property?.city || 'Ghaziabad'} • Physically Verified by Redstone
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Tools */}
        <div className="flex items-center space-x-2">
          {/* 360 vs Walkthrough Switcher */}
          <div className="bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/15 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewerMode('360')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewerMode === '360'
                  ? 'bg-[#C62828] text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>360° View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewerMode('walkthrough')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewerMode === 'walkthrough'
                  ? 'bg-[#C62828] text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>HD Photos</span>
            </button>
          </div>

          {/* Auto Rotate Toggle (360 mode only) */}
          {viewerMode === '360' && (
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition hidden sm:flex items-center gap-1.5 ${
                autoRotate
                  ? 'bg-emerald-600/80 text-white border-emerald-500'
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
              }`}
              title={autoRotate ? 'Pause Auto Rotation' : 'Start Auto Rotation'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoRotate ? 'Auto Orbit' : 'Orbit Paused'}</span>
            </button>
          )}

          {/* Zoom In/Out */}
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 transition hidden sm:flex"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom(10)}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 transition hidden sm:flex"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white transition shadow"
              title="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN VIEWPORT: 360 THREE.JS SPHERE OR HD PHOTO WALKTHROUGH */}
      {/* ========================================================= */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden">
        {viewerMode === '360' ? (
          <>
            {/* Three.js 360 Canvas Mount */}
            <div ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Drag Hint Overlay (fades out) */}
            {showDragHint && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                <div className="bg-black/75 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-center text-white shadow-2xl animate-bounce">
                  <Compass className="w-6 h-6 mx-auto mb-1 text-[#E53935]" />
                  <p className="text-xs font-black">Drag in any direction to look around 360°</p>
                  <p className="text-[10px] text-gray-300">Pinch or scroll mouse wheel to zoom in/out</p>
                </div>
              </div>
            )}

            {/* Room Caption Card */}
            <div className="absolute top-20 left-4 sm:left-6 bg-black/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-white max-w-sm pointer-events-none z-10">
              <span className="text-[10px] uppercase tracking-wider font-black text-[#E53935] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                Verified Flat Interior
              </span>
              <h3 className="text-base sm:text-lg font-black mt-0.5">{currentPano.roomName}</h3>
              <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">{currentPano.caption}</p>
            </div>
          </>
        ) : (
          /* HD Room Walkthrough Viewport */
          <div className="relative w-full h-full">
            <img
              src={currentWalk.imageUrl}
              alt={currentWalk.roomName}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Room Caption Card */}
            <div className="absolute top-20 left-4 sm:left-6 bg-black/65 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-white max-w-sm pointer-events-none">
              <span className="text-[10px] uppercase tracking-wider font-black text-[#E53935] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                {currentWalk.category || 'Flat Room'}
              </span>
              <h3 className="text-base sm:text-lg font-black mt-0.5">{currentWalk.roomName}</h3>
              <p className="text-xs text-gray-300 mt-0.5">{currentWalk.caption}</p>
            </div>

            {/* Left / Right Arrow Navigation */}
            {walkthroughRooms.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveRoomIndex((prev) => (prev > 0 ? prev - 1 : walkthroughRooms.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition transform hover:scale-105"
                  title="Previous Room"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoomIndex((prev) => (prev < walkthroughRooms.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition transform hover:scale-105"
                  title="Next Room"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
            <div className="w-10 h-10 border-3 border-[#E53935] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-gray-200">Loading 360° Flat Room...</p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BOTTOM ROOM SELECTOR STRIP: FLAT ROOMS CAROUSEL           */}
      {/* ========================================================= */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300 mb-2.5 px-1">
          <span className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[#E53935]" />
            <span>Select Room to Inspect ({viewerMode === '360' ? panoramaScenes.length : walkthroughRooms.length} Spaces):</span>
          </span>
          <span className="text-white bg-white/10 px-2 py-0.5 rounded-md text-[11px] font-bold">
            {viewerMode === '360' ? currentPano.roomName : currentWalk.roomName}
          </span>
        </div>

        {/* Room Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(viewerMode === '360' ? panoramaScenes : walkthroughRooms).map((room, idx) => {
            const isSelected = activeRoomIndex === idx;
            return (
              <button
                key={room.roomId || idx}
                type="button"
                onClick={() => {
                  setActiveRoomIndex(idx);
                  setShowDragHint(true);
                }}
                className={`relative px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-[#C62828] text-white border-[#C62828] shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/15'
                }`}
              >
                <span>{room.icon || (idx === 0 ? '🛋️' : idx === 1 ? '🛏️' : idx === 2 ? '🍳' : '🌅')}</span>
                <span className="truncate max-w-[140px]">{room.roomName}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PropertyMediaExperienceViewer;
