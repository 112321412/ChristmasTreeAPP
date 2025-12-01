import React from 'react';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ChristmasTree } from './ChristmasTree';
import { GoldDust } from './GoldDust';
import { InteractiveRotator } from './InteractiveRotator';
import { TreeState, PhotoOrnamentData } from '../../types';
import { COLORS } from '../../constants';

interface SceneProps {
  treeState: TreeState;
  userPhotos: PhotoOrnamentData[];
}

export const Scene: React.FC<SceneProps> = ({ treeState, userPhotos }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 4, 22]} />
      
      {/* Luxurious Environment */}
      <Environment preset="lobby" background={false} blur={0.6} />
      
      {/* Dynamic Lights */}
      <ambientLight intensity={0.2} color={COLORS.EMERALD} />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color={COLORS.CHAMPAGNE} 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color={COLORS.GOLD} />
      <pointLight position={[0, -5, 5]} intensity={0.5} color={COLORS.RUBY} />

      {/* Interactive Container for the Tree */}
      <InteractiveRotator>
        <ChristmasTree treeState={treeState} userPhotos={userPhotos} />
      </InteractiveRotator>

      {/* Magical Ambient Effects */}
      <GoldDust count={1500} />

      {/* Post Processing for the "Golden Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* Floor Reflection - Simple plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#010a05" 
          roughness={0.1} 
          metalness={0.8} 
        />
      </mesh>
    </>
  );
};