import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';
import { TreeState, PhotoOrnamentData } from './types';
import { Loader } from '@react-three/drei';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);
  const [userPhotos, setUserPhotos] = useState<PhotoOrnamentData[]>([]);

  const toggleTreeState = () => {
    setTreeState((prev) => (prev === TreeState.FORMED ? TreeState.CHAOS : TreeState.FORMED));
  };

  const handlePhotoAdd = (photo: PhotoOrnamentData) => {
    setUserPhotos((prev) => [...prev, photo]);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#02100a] to-[#000000]">
      <Canvas
        shadows
        dpr={[1, 2]} // Optimize for pixel ratio
        camera={{ position: [0, 4, 20], fov: 45 }}
        gl={{ antialias: false, alpha: false }} // Post-processing handles AA
      >
        <Suspense fallback={null}>
          <Scene treeState={treeState} userPhotos={userPhotos} />
        </Suspense>
      </Canvas>
      
      <UI 
        treeState={treeState} 
        onToggle={toggleTreeState} 
        onPhotoAdd={handlePhotoAdd}
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