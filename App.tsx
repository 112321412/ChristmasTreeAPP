import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { TreeState, PhotoOrnamentData } from './types';
import { Loader } from '@react-three/drei';
import { GALLERY_CONFIG } from './constants';
import { InteractiveRotatorRef } from './components/InteractiveRotator';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE);
  const [userPhotos, setUserPhotos] = useState<PhotoOrnamentData[]>([]);
  const rotatorRef = useRef<InteractiveRotatorRef>(null);

  const toggleChaos = () => {
    setTreeState((prev) => (prev === TreeState.CHAOS ? TreeState.TREE : TreeState.CHAOS));
  };

  const toggleGallery = () => {
    setTreeState((prev) => (prev === TreeState.GALLERY ? TreeState.TREE : TreeState.GALLERY));
  };

  const handleRotate = (amount: number) => {
    rotatorRef.current?.addVelocity(amount);
  };

  const handlePhotosProcessed = (newPhotos: PhotoOrnamentData[]) => {
    setUserPhotos((prev) => {
      const updatedList = [...prev, ...newPhotos];
      
      // Recalculate Spiral Positions for ALL photos to ensure a perfect sequence
      const count = updatedList.length;
      return updatedList.map((photo, index) => {
        // Spiral Math
        const progress = index / Math.max(count, 1);
        const y = (progress - 0.5) * GALLERY_CONFIG.SPIRAL_HEIGHT;
        const angle = index * (Math.PI * 2 / 5); // spacing
        const radius = THREE.MathUtils.lerp(
            GALLERY_CONFIG.SPIRAL_RADIUS_BOTTOM, 
            GALLERY_CONFIG.SPIRAL_RADIUS_TOP, 
            progress
        );

        const spiralPos = new Vector3(
            Math.cos(angle) * radius,
            y,
            Math.sin(angle) * radius
        );
        
        return { ...photo, spiralPos };
      });
    });

    // Auto switch to Gallery if many photos added? Optional.
    if (treeState === TreeState.CHAOS) {
        setTreeState(TreeState.TREE);
    }
  };

  // Import Three for math utils in helper
  const THREE = { MathUtils: { lerp: (a:number, b:number, t:number) => a + (b - a) * t } };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#02100a] to-[#000000]">
      <Canvas
        shadows
        dpr={[1, 2]} 
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ antialias: false, alpha: false }} 
      >
        <Suspense fallback={null}>
          <Scene 
            treeState={treeState} 
            userPhotos={userPhotos} 
            rotatorRef={rotatorRef}
          />
        </Suspense>
      </Canvas>
      
      <UI 
        treeState={treeState} 
        onToggleChaos={toggleChaos}
        onToggleGallery={toggleGallery}
        onPhotosProcessed={handlePhotosProcessed}
        onRotate={handleRotate}
      />
      <Loader 
        containerStyles={{ background: '#02100a' }}
        innerStyles={{ width: '400px', height: '10px', background: '#333' }}
        barStyles={{ background: '#FFD700', height: '10px' }}
        dataStyles={{ color: '#FFD700', fontFamily: 'Cinzel' }}
      />
    </div>
  );
};

export default App;
