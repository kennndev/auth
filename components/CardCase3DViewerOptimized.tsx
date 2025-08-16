import { useEffect, useRef, useState, memo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Preload } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface CardCase3DViewerProps {
  cardFrontImage: string;
  cardBackImage: string;
  className?: string;
}

// Memoize the model component to prevent unnecessary re-renders
const CardCaseModel = memo(({ cardFrontImage, cardBackImage }: Omit<CardCase3DViewerProps, 'className'>) => {
  // Use useGLTF for better caching
  const gltf = useGLTF('/card-slab-3d-2.glb');
  const modelRef = useRef<THREE.Group>(null);
  const frontTexture = useLoader(TextureLoader, cardFrontImage);
  const backTexture = useLoader(TextureLoader, cardBackImage);
  const namePlateTexture = useLoader(TextureLoader, '/Topper_card_single_v1.jpg');
  
  // Optimize textures on load
  useEffect(() => {
    // Configure texture settings once
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.anisotropy = 16; // Improve texture quality at angles
    frontTexture.generateMipmaps = true; // Better performance for scaled textures
    frontTexture.minFilter = THREE.LinearMipmapLinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;
    
    backTexture.colorSpace = THREE.SRGBColorSpace;
    backTexture.anisotropy = 16;
    backTexture.generateMipmaps = true;
    backTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backTexture.magFilter = THREE.LinearFilter;
    
    namePlateTexture.colorSpace = THREE.SRGBColorSpace;
    namePlateTexture.anisotropy = 16;
    namePlateTexture.generateMipmaps = true;
    namePlateTexture.minFilter = THREE.LinearMipmapLinearFilter;
    namePlateTexture.magFilter = THREE.LinearFilter;
  }, [frontTexture, backTexture, namePlateTexture]);
  
  // Apply materials only once on mount
  useEffect(() => {
    if (gltf) {
      // Cache materials to avoid recreating them
      const materials = {
        cardFront: null as THREE.MeshStandardMaterial | null,
        cardBack: null as THREE.MeshStandardMaterial | null,
        clearPlastic: null as THREE.MeshPhysicalMaterial | null,
        namePlate: null as THREE.MeshStandardMaterial | null,
        namePlateBack: null as THREE.MeshStandardMaterial | null,
      };
      
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          if (child.material && child.material.name === 'Card Front') {
            if (!materials.cardFront) {
              materials.cardFront = new THREE.MeshStandardMaterial({
                map: frontTexture,
                transparent: false,
                side: THREE.DoubleSide,
              });
              
              frontTexture.repeat.set(2.15, 1.400);
              frontTexture.offset.set(0, 0);
              frontTexture.center.set(0.5, 0.5);
              frontTexture.rotation = 0;
              frontTexture.wrapS = THREE.RepeatWrapping;
              frontTexture.wrapT = THREE.RepeatWrapping;
              frontTexture.flipY = false;
              frontTexture.matrixAutoUpdate = true;
            }
            
            child.material = materials.cardFront;
            child.material.needsUpdate = true;
          } 
          else if (child.material && child.material.name === 'Card Back') {
            if (!materials.cardBack) {
              materials.cardBack = new THREE.MeshStandardMaterial({
                map: backTexture,
                transparent: false,
                side: THREE.DoubleSide,
              });
              
              backTexture.repeat.set(-0.42, 0.28);
              backTexture.offset.set(1, 0);
              backTexture.center.set(0.5, 0.5);
              backTexture.rotation = 0;
              backTexture.wrapS = THREE.RepeatWrapping;
              backTexture.wrapT = THREE.RepeatWrapping;
              backTexture.flipY = true;
              backTexture.matrixAutoUpdate = true;
            }
            
            child.material = materials.cardBack;
            child.material.needsUpdate = true;
          } 
          else if (child.material && (
            child.material.name === 'Transparent plastic' || 
            child.material.name === 'TransparentPlastic' ||
            child.material.name === 'Transparent Plastic' ||
            child.material.name === 'transparent plastic' ||
            child.material.name?.toLowerCase().includes('transparent') ||
            child.material.name?.toLowerCase().includes('plastic') ||
            child.name === 'Mesh.012' ||
            child.name === 'Case'
          )) {
            if (!materials.clearPlastic) {
              materials.clearPlastic = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.15,
                roughness: 0.01,
                metalness: 0.0,
                reflectivity: 1.0,
                envMapIntensity: 5.0,
                clearcoat: 1.0,
                clearcoatRoughness: 0.01,
                ior: 1.5,
                transmission: 0.8,
                thickness: 0.2,
                specularIntensity: 1.0,
                specularColor: 0xffffff,
              });
            }
            
            child.material = materials.clearPlastic;
            child.material.needsUpdate = true;
          }
          else if (child.material && child.material.name === 'Name Plate') {
            if (!materials.namePlate) {
              materials.namePlate = new THREE.MeshStandardMaterial({
                map: namePlateTexture,
                transparent: false,
                side: THREE.DoubleSide,
              });
              
              namePlateTexture.repeat.set(1, 1);
              namePlateTexture.offset.set(0, 0);
              namePlateTexture.center.set(0.5, 0.5);
              namePlateTexture.rotation = 0;
              namePlateTexture.wrapS = THREE.RepeatWrapping;
              namePlateTexture.wrapT = THREE.RepeatWrapping;
              namePlateTexture.flipY = false;
              namePlateTexture.matrixAutoUpdate = true;
            }
            
            child.material = materials.namePlate;
            child.material.needsUpdate = true;
          }
          else if (child.material && child.material.name === 'Name Plate Back') {
            if (!materials.namePlateBack) {
              materials.namePlateBack = new THREE.MeshStandardMaterial({
                color: 0x000000,
                transparent: false,
                side: THREE.DoubleSide,
              });
            }
            
            child.material = materials.namePlateBack;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [gltf, frontTexture, backTexture, namePlateTexture]);
  
  // Use a more efficient rotation update
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5; // Use delta for frame-independent rotation
    }
  });
  
  return (
    <primitive 
      ref={modelRef} 
      object={gltf.scene} 
      scale={[1.5, 1.5, 1.5]} 
      position={[0, 0, 0]} 
      rotation={[0, Math.PI, 0]}
    />
  );
});

CardCaseModel.displayName = 'CardCaseModel';

// Loading component with cyberpunk theme
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      {/* Animated loading spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-2 border-cyber-cyan/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Loading text with animated gradient */}
      <div className="relative">
        <span className="text-sm font-mono text-cyber-cyan/80 tracking-wider animate-pulse">
          Loading 3D preview...
        </span>
        <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent w-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Memoize the entire 3D viewer to prevent unnecessary re-renders
const CardCase3DViewer = memo(({ cardFrontImage, cardBackImage, className = "" }: CardCase3DViewerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className={`relative w-full max-w-sm mx-auto font-mono ${className}`}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "2.5 / 3.5",
        }}
      >
        {!isLoaded && <Loader />}
        <Canvas 
          camera={{ position: [0, 0, 20], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          className="absolute inset-0"
          dpr={[1, 2]} // Limit pixel ratio for performance
          performance={{ min: 0.5 }} // Allow frame rate to drop to 30fps if needed
          onCreated={() => setIsLoaded(true)}
        >
          {/* Optimized lighting setup */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 5, 3]} intensity={0.8} />
          <directionalLight position={[0, 2, -8]} intensity={0.6} />
          <pointLight position={[3, 3, 8]} intensity={0.5} />
          <pointLight position={[-3, -2, 6]} intensity={0.4} />
          <spotLight 
            position={[0, 8, 8]} 
            angle={0.3} 
            penumbra={0.5} 
            intensity={0.8}
            castShadow
          />
          
          <Suspense fallback={null}>
            <CardCaseModel cardFrontImage={cardFrontImage} cardBackImage={cardBackImage} />
            <Environment preset="city" background={false} />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enableDamping={true} // Smooth controls
            dampingFactor={0.05}
          />
          
          {/* Preload assets */}
          <Preload all />
        </Canvas>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-400 tracking-wide">Display case preview</p>
      </div>
    </div>
  );
});

CardCase3DViewer.displayName = 'CardCase3DViewer';

// Preload the GLB file
useGLTF.preload('/card-slab-3d-2.glb');

export default CardCase3DViewer;