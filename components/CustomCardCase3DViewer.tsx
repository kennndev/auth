import { useEffect, useRef, useState, memo, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Preload } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';

interface CustomCardCase3DViewerProps {
  cardFrontImage: string;
  cardBackImage: string;
  className?: string;
  modelPath?: string;
}

// Error boundary for 3D viewer
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('3D Viewer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full text-cyber-purple">
          <p>Unable to load 3D preview</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Completely independent model component for custom cards
const CustomCardCaseModel = memo(({ 
  cardFrontImage, 
  cardBackImage,
  modelPath = '/card-slab-3d-custom.glb'
}: Omit<CustomCardCase3DViewerProps, 'className'>) => {
  // Use custom GLB file with proper path - ensure it's a relative path
  const cleanPath = modelPath.startsWith('http') || modelPath.startsWith('/Users') 
    ? '/card-slab-3d-custom.glb' 
    : (modelPath.startsWith('/') ? modelPath : `/${modelPath}`);
  const gltf = useGLTF(cleanPath);
  const modelRef = useRef<THREE.Group>(null);
  // Clean texture paths to ensure they're proper URLs
  const cleanFrontImage = cardFrontImage.startsWith('blob:') || cardFrontImage.startsWith('http') 
    ? cardFrontImage 
    : (cardFrontImage.startsWith('/') ? cardFrontImage : `/${cardFrontImage}`);
  const cleanBackImage = cardBackImage.startsWith('blob:') || cardBackImage.startsWith('http')
    ? cardBackImage
    : (cardBackImage.startsWith('/') ? cardBackImage : `/${cardBackImage}`);
    
  const frontTexture = useLoader(TextureLoader, cleanFrontImage);
  const backTexture = useLoader(TextureLoader, cleanBackImage);
  const namePlateTexture = useLoader(TextureLoader, '/Topper_card_single_v2.webp');
  
  // Configure textures
  useEffect(() => {
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.anisotropy = 16;
    frontTexture.generateMipmaps = true;
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
  
  // Apply materials to the custom card model
  useEffect(() => {
    if (gltf) {
      const customMaterials = {
        cardFront: null as THREE.MeshStandardMaterial | null,
        cardBack: null as THREE.MeshStandardMaterial | null,
        clearPlastic: null as THREE.MeshPhysicalMaterial | null,
        namePlate: null as THREE.MeshStandardMaterial | null,
        namePlateBack: null as THREE.MeshStandardMaterial | null,
      };
      
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          // Apply front texture to card front mesh
          if (child.material && child.material.name === 'Card Front') {
            if (!customMaterials.cardFront) {
              customMaterials.cardFront = new THREE.MeshStandardMaterial({
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
            
            child.material = customMaterials.cardFront;
            child.material.needsUpdate = true;
          } 
          // Apply back texture to card back mesh
          else if (child.material && child.material.name === 'Card Back') {
            if (!customMaterials.cardBack) {
              customMaterials.cardBack = new THREE.MeshStandardMaterial({
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
            
            child.material = customMaterials.cardBack;
            child.material.needsUpdate = true;
          }
          // Apply clear plastic material
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
            if (!customMaterials.clearPlastic) {
              customMaterials.clearPlastic = new THREE.MeshPhysicalMaterial({
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
            
            child.material = customMaterials.clearPlastic;
            child.material.needsUpdate = true;
          }
          // Apply nameplate material
          else if (child.material && child.material.name === 'Name Plate') {
            if (!customMaterials.namePlate) {
              customMaterials.namePlate = new THREE.MeshStandardMaterial({
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
            
            child.material = customMaterials.namePlate;
            child.material.needsUpdate = true;
          }
          else if (child.material && child.material.name === 'Name Plate Back') {
            if (!customMaterials.namePlateBack) {
              customMaterials.namePlateBack = new THREE.MeshStandardMaterial({
                color: 0x000000,
                transparent: false,
                side: THREE.DoubleSide,
              });
            }
            
            child.material = customMaterials.namePlateBack;
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

CustomCardCaseModel.displayName = 'CustomCardCaseModel';

// Preload the custom model
if (typeof window !== 'undefined') {
  useGLTF.preload('/card-slab-3d-custom.glb');
  useGLTF.preload('/card-slab-3d-2.glb'); // Also preload the standard model as fallback
}

// Loading component matching limited edition style
const CustomLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-cyber-dark/20 z-10">
    <div className="text-center p-4">
      <div className="relative">
        <span className="text-sm font-mono text-cyber-purple/80 tracking-wider animate-pulse">
          Loading custom 3D preview...
        </span>
        <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-purple to-transparent w-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Completely independent viewer component for custom cards
const CustomCardCase3DViewer = memo(({ 
  cardFrontImage, 
  cardBackImage, 
  className = '',
  modelPath = '/card-slab-3d-custom.glb'
}: CustomCardCase3DViewerProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative w-full max-w-sm mx-auto font-mono ${className}`}>
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "2.5 / 3.5",
        }}
      >
        {!isLoaded && <CustomLoader />}
        <ErrorBoundary>
          <Canvas 
          camera={{ position: [0, 0, 20], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          className="absolute inset-0"
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          onCreated={() => setIsLoaded(true)}
        >
          {/* Lighting setup matching limited edition */}
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
            <CustomCardCaseModel 
              cardFrontImage={cardFrontImage} 
              cardBackImage={cardBackImage}
              modelPath={modelPath}
            />
            <Environment preset="city" background={false} />
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={1}
              minPolarAngle={Math.PI / 2.8}
              maxPolarAngle={Math.PI / 1.8}
              minDistance={15}
              maxDistance={25}
            />
            <Preload all />
          </Suspense>
        </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
});

CustomCardCase3DViewer.displayName = 'CustomCardCase3DViewer';

export default CustomCardCase3DViewer;