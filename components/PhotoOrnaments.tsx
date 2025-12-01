import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Group, Vector3 } from 'three';
import { PhotoOrnamentData, TreeState } from '../types';
import { COLORS } from '../../constants';

interface PhotoOrnamentsProps {
  photos: PhotoOrnamentData[];
  treeState: TreeState;
}

const FramedPhoto: React.FC<{ data: PhotoOrnamentData; treeState: TreeState }> = ({ data, treeState }) => {
  const groupRef = useRef<Group>(null);
  const position = useRef(new Vector3().copy(data.chaosPos));
  const randomOffset = useRef(Math.random() * 100);
  const { camera } = useThree();

  // Dimensions
  const frameWidth = data.scale; // Scale base is now larger (~3.5)
  const frameHeight = frameWidth / data.aspectRatio;
  const border = 0.2;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const lerpSpeed = 2.5;
    const lerpFactor = THREE.MathUtils.clamp(delta * lerpSpeed, 0, 1);
    
    let targetPos: Vector3;

    if (treeState === TreeState.CHAOS) {
      targetPos = data.chaosPos;
    } else if (treeState === TreeState.GALLERY) {
      targetPos = data.spiralPos;
    } else {
      // TREE state
      targetPos = data.treePos;
    }

    // Interpolate Position
    position.current.lerp(targetPos, lerpFactor);
    groupRef.current.position.copy(position.current);

    // Orientation Logic
    if (treeState === TreeState.GALLERY) {
      // GALLERY Mode: Billboard effect - Always face the camera
      // We calculate the rotation needed to look at camera in world space
      // Since the parent group rotates, we must offset that or just use world-space lookAt manually.
      // But simple lookAt(camera.position) inside a rotating group works if we update every frame.
      
      // We need to look at the camera's world position.
      // However, the object is inside 'InteractiveRotator' -> 'ChristmasTree' group.
      // The easiest way to billboard in a complex hierarchy is to copy camera quaternion and invert parent rotation, 
      // OR just lookAt if the hierarchy is simple enough. 
      // Let's try lookAt camera position transformed into local space?
      // No, simpler: lookAt world position of camera.
      
      // NOTE: R3F lookAt usually works in local space. 
      // To force it to look at camera (world), we can just orient it to camera.
      groupRef.current.lookAt(camera.position);

      // Sway up and down gently
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5 + randomOffset.current) * 0.003;

    } else if (treeState === TreeState.TREE) {
      // TREE Mode: Face outward from center (Normal of the cone)
      // Look at the central axis (0, y, 0), then rotate 180 to face OUT.
      groupRef.current.lookAt(0, position.current.y, 0);
      groupRef.current.rotateY(Math.PI); 
      
      // Simulate "hanging" weight - slightly loose rotation
      const t = state.clock.elapsedTime + randomOffset.current;
      groupRef.current.rotation.z += Math.sin(t) * 0.03; 
      
    } else {
      // CHAOS: Tumble
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Extruded Gold Frame */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[frameWidth + border, frameHeight + border, 0.2]} />
        <meshStandardMaterial 
          color={COLORS.GOLD} 
          metalness={1.0} 
          roughness={0.2}
          emissive={COLORS.GOLD}
          emissiveIntensity={0.4} // Bloom participation
        />
      </mesh>

      {/* The Photo */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshBasicMaterial map={data.texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Backing - Brushed Metal */}
      <mesh position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial 
          color="#B8860B"
          metalness={0.9}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
};

export const PhotoOrnaments: React.FC<PhotoOrnamentsProps> = ({ photos, treeState }) => {
  return (
    <group>
      {photos.map((photo) => (
        <FramedPhoto key={photo.id} data={photo} treeState={treeState} />
      ))}
    </group>
  );
};