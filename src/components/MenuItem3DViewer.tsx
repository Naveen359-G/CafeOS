import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, RotateCw, Layers, Wind, Sparkles, Plus, Check, Info, Coffee } from 'lucide-react';
import { MenuItem } from '../data/menu';

interface MenuItem3DViewerProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
}

export const MenuItem3DViewer: React.FC<MenuItem3DViewerProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [showSteam, setShowSteam] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!isOpen || !item || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf6f0);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5eb, 1.8);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc67d3e, 1.5, 10);
    pointLight.position.set(-3, 2, -3);
    scene.add(pointLight);

    // Create 3D Model Group
    const group = new THREE.Group();
    scene.add(group);

    // Base saucer / plate
    const saucerGeo = new THREE.CylinderGeometry(2.2, 1.8, 0.15, 32);
    const saucerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    });
    const saucer = new THREE.Mesh(saucerGeo, saucerMat);
    saucer.position.y = -1.0;
    saucer.receiveShadow = true;
    group.add(saucer);

    const isBakeryOrSavory = item.type === 'bakery' || item.type === 'savory';

    let cupOrItemMesh: THREE.Group = new THREE.Group();

    if (!isBakeryOrSavory) {
      // Coffee / Tea Mug
      const mugGroup = new THREE.Group();

      // Outer Ceramic Cup
      const cupGeo = new THREE.CylinderGeometry(1.3, 1.0, 2.2, 32, 1, true);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xf3ede2,
        roughness: 0.3,
        side: THREE.DoubleSide,
      });
      const cupBody = new THREE.Mesh(cupGeo, cupMat);
      cupBody.castShadow = true;
      mugGroup.add(cupBody);

      // Cup Bottom
      const bottomGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 32);
      const bottomMesh = new THREE.Mesh(bottomGeo, cupMat);
      bottomMesh.position.y = -1.05;
      mugGroup.add(bottomMesh);

      // Handle
      const handleCurve = new THREE.EllipseCurve(
        0, 0,
        0.6, 0.8,
        -Math.PI / 2, Math.PI / 2,
        false,
        0
      );
      const handlePoints = handleCurve.getPoints(50);
      const handleGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(handlePoints.map(p => new THREE.Vector3(1.3, p.y, p.x * 0.4))),
        20,
        0.12,
        8,
        false
      );
      const handleMesh = new THREE.Mesh(handleGeo, cupMat);
      mugGroup.add(handleMesh);

      // Liquid inside (Coffee / Matcha / Latte)
      const liquidGeo = new THREE.CylinderGeometry(1.25, 0.95, 1.8, 32);
      const liquidColor = item.name.toLowerCase().includes('matcha')
        ? 0x4d7c0f
        : item.name.toLowerCase().includes('cold brew') || item.name.toLowerCase().includes('americano')
        ? 0x3e2723
        : 0x3e2723;
      const liquidMat = new THREE.MeshStandardMaterial({
        color: liquidColor,
        roughness: 0.1,
        metalness: 0.2,
      });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = -0.1;
      mugGroup.add(liquid);

      // Foam / Latte Art Swirl on top
      const foamGeo = new THREE.CircleGeometry(1.22, 32);
      const foamMat = new THREE.MeshStandardMaterial({
        color: 0xfffbeb,
        roughness: 0.4,
      });
      const foam = new THREE.Mesh(foamGeo, foamMat);
      foam.rotation.x = -Math.PI / 2;
      foam.position.y = 0.81;
      mugGroup.add(foam);

      cupOrItemMesh = mugGroup;
    } else {
      // Pastry / Savory Item (e.g. Croissant / Toast)
      const pastryGroup = new THREE.Group();
      const bodyGeo = new THREE.TorusGeometry(1.2, 0.5, 16, 32, Math.PI * 1.5);
      const pastryMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.6,
      });
      const pastry = new THREE.Mesh(bodyGeo, pastryMat);
      pastry.rotation.x = Math.PI / 2;
      pastry.position.y = -0.6;
      pastryGroup.add(pastry);

      cupOrItemMesh = pastryGroup;
    }

    group.add(cupOrItemMesh);

    // Steam particles
    const steamParticles: THREE.Mesh[] = [];
    if (!isBakeryOrSavory) {
      const steamGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const steamMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.9,
      });

      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(steamGeo, steamMat);
        p.position.set(
          (Math.random() - 0.5) * 0.6,
          1.2 + i * 0.35,
          (Math.random() - 0.5) * 0.6
        );
        scene.add(p);
        steamParticles.push(p);
      }
    }

    // Mouse interactivity for 3D rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotation.y += deltaX * 0.01;
      targetRotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        group.rotation.y += 0.006;
      } else {
        group.rotation.y += (targetRotation.y - group.rotation.y) * 0.1;
        group.rotation.x += (targetRotation.x - group.rotation.x) * 0.1;
      }

      // Exploded View animation
      if (isExploded) {
        cupOrItemMesh.position.y = THREE.MathUtils.lerp(cupOrItemMesh.position.y, 0.8, 0.08);
      } else {
        cupOrItemMesh.position.y = THREE.MathUtils.lerp(cupOrItemMesh.position.y, 0, 0.08);
      }

      // Steam animation
      if (showSteam && steamParticles.length > 0) {
        steamParticles.forEach((p, idx) => {
          p.position.y += 0.015;
          p.position.x += Math.sin(elapsedTime * 2 + idx) * 0.003;
          if (p.position.y > 3.2) {
            p.position.y = 1.0;
            p.position.x = (Math.random() - 0.5) * 0.6;
          }
        });
        steamParticles.forEach(p => p.visible = true);
      } else {
        steamParticles.forEach(p => p.visible = false);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isOpen, item, isExploded, showSteam, isRotating]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E6DDD4] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: 3D Interactive Canvas */}
        <div className="relative w-full md:w-3/5 h-80 sm:h-96 md:h-[520px] bg-[#FAF6F0] flex items-center justify-center">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Floating HUD overlay on 3D Canvas */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E6DDD4] shadow-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C67D3E]" />
            <span className="text-xs font-serif font-bold text-[#261B16]">Interactive 3D Model</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-[#E6DDD4] shadow-md">
            <button
              type="button"
              onClick={() => setIsRotating(!isRotating)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isRotating ? 'bg-[#261B16] text-white' : 'bg-[#FAF6F0] text-[#261B16] hover:bg-[#F0EAE1]'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span>{isRotating ? 'Auto Rotating' : 'Rotate 360°'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExploded(!isExploded)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isExploded ? 'bg-[#C67D3E] text-white' : 'bg-[#FAF6F0] text-[#261B16] hover:bg-[#F0EAE1]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Assembled' : 'Exploded Layers'}</span>
            </button>

            {item.type !== 'bakery' && item.type !== 'savory' && (
              <button
                type="button"
                onClick={() => setShowSteam(!showSteam)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showSteam ? 'bg-[#261B16] text-white' : 'bg-[#FAF6F0] text-[#261B16] hover:bg-[#F0EAE1]'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>{showSteam ? 'Steam On' : 'Steam Off'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Item Details & Tasting Notes */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#A86226] uppercase tracking-wider bg-[#F9F4EE] px-2.5 py-0.5 rounded-full border border-[#EAE2DA]">
                {item.vibeTag}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#F0EAE1] text-[#6B5A50] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-2xl font-serif font-bold text-[#261B16] mb-1">
              {item.name}
            </h2>
            <div className="text-xl font-bold text-[#A86226] mb-4">
              ₹{item.price}
            </div>

            <p className="text-sm text-[#6B5A50] leading-relaxed mb-6">
              {item.description}
            </p>

            <div className="space-y-3 mb-6 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6DDD4]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#261B16] mb-1">
                <Coffee className="w-4 h-4 text-[#C67D3E]" />
                <span>Craft & Ingredients Spec</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#6B5A50]">
                <div>
                  <span className="text-[#8C7A70] block">Category:</span>
                  <span className="font-semibold capitalize text-[#261B16]">{item.category}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Temperature:</span>
                  <span className="font-semibold capitalize text-[#261B16]">{item.temperature}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Caffeine Level:</span>
                  <span className="font-semibold capitalize text-[#261B16]">{item.caffeineLevel}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] block">Dietary:</span>
                  <span className="font-semibold capitalize text-[#261B16]">{item.dietaryTags.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#F0EAE1]">
            <button
              type="button"
              onClick={() => {
                onAddToCart(item);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
              className="w-full py-3.5 bg-[#261B16] hover:bg-[#3D2C25] active:scale-98 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-[#4E6B58]" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#C67D3E]" />
                  <span>Add {item.name} (₹{item.price})</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-[#8C7A70]">
              ✨ 3D Model rendered in real-time via Three.js WebGL.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
