import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InstancedMesh, Object3D, Vector3, Group } from 'three';
import { CONFIG, COLORS } from '../constants';
import { TreeState, DualPosition, PhotoOrnamentData } from '../types';

interface ChristmasTreeProps {
  treeState: TreeState;
  userPhotos: PhotoOrnamentData[];
}

// Helpers to generate geometry data
const generateFoliageData = (count: number): DualPosition[] => {
  const data: DualPosition[] = [];
  const spread = 25; // How far particles scatter in CHAOS

  for (let i = 0; i < count; i++) {
    // Target Position (Conical Spiral)
    const y = (i / count) * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2); // -Height/2 to Height/2
    const progress = (y + CONFIG.TREE_HEIGHT / 2) / CONFIG.TREE_HEIGHT; // 0 to 1
    const radius = CONFIG.TREE_RADIUS * (1 - progress); // Cone shape
    const angle = i * 0.5; // Spiral tightness

    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    const targetY = y;

    // Chaos Position (Random Sphere)
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    const r = spread * Math.cbrt(Math.random()); // Random scatter
    
    const chaosX = r * Math.sin(phi) * Math.cos(theta);
    const chaosY = r * Math.sin(phi) * Math.sin(theta);
    const chaosZ = r * Math.cos(phi);

    data.push({
      target: new Vector3(targetX, targetY, targetZ),
      chaos: new Vector3(chaosX, chaosY, chaosZ),
      scale: Math.random() * 0.3 + 0.1, // Variation in leaf size
      color: Math.random() > 0.8 ? COLORS.GOLD : COLORS.EMERALD // 20% Gold needles
    });
  }
  return data;
};

const generateOrnamentData = (count: number): DualPosition[] => {
  const data: DualPosition[] = [];
  const spread = 30;

  for (let i = 0; i < count; i++) {
    // More random distribution ON the cone surface
    const y = (Math.random()) * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2);
    const progress = (y + CONFIG.TREE_HEIGHT / 2) / CONFIG.TREE_HEIGHT;
    const radius = CONFIG.TREE_RADIUS * (1 - progress) + 0.2; // Slightly outside foliage
    const angle = Math.random() * Math.PI * 2;

    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * radius;
    const targetY = y;

    const chaosX = (Math.random() - 0.5) * spread;
    const chaosY = (Math.random() - 0.5) * spread;
    const chaosZ = (Math.random() - 0.5) * spread;

    const isGold = Math.random() > 0.5;
    const isRuby = Math.random() > 0.8;

    data.push({
      target: new Vector3(targetX, targetY, targetZ),
      chaos: new Vector3(chaosX, chaosY, chaosZ),
      scale: Math.random() * 0.4 + 0.2,
      color: isRuby ? COLORS.RUBY : (isGold ? COLORS.GOLD : COLORS.SILVER)
    });
  }
  return data;
};

// Component for Individual Photo Ornament
const FramedPhoto: React.FC<{ data: PhotoOrnamentData; treeState: TreeState }> = ({ data, treeState }) => {
  const groupRef = useRef<Group>(null);
  const position = useRef(new Vector3().copy(data.targetPos));
  const randomOffset = useRef(Math.random() * 100);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isFormed = treeState === TreeState.FORMED;
    const lerpFactor = THREE.MathUtils.clamp(delta * 2.0, 0, 1);
    
    // Position Lerp
    const dest = isFormed ? data.targetPos : data.chaosPos;
    position.current.lerp(dest, lerpFactor);
    groupRef.current.position.copy(position.current);

    // Orientation Logic
    if (isFormed) {
      // Look away from center when formed
      groupRef.current.lookAt(0, position.current.y, 0);
      // Flip so photo faces out (lookAt points Z towards target, we want Z away)
      groupRef.current.rotateY(Math.PI);
      
      // Gentle Sway animation
      const t = state.clock.elapsedTime + randomOffset.current;
      groupRef.current.rotation.z += Math.sin(t) * 0.005; 
      groupRef.current.rotation.x += Math.cos(t * 0.8) * 0.005;
    } else {
      // Random rotation in chaos
      groupRef.current.rotation.x += delta * 0.5;
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  // Calculate Frame dimensions
  const frameWidth = 1.2;
  const frameHeight = frameWidth / data.aspectRatio + 0.2; // Add some bezel height
  const photoHeight = frameWidth / data.aspectRatio;

  return (
    <group ref={groupRef}>
      {/* Gold Frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, 0.1]} />
        <meshStandardMaterial 
          color={COLORS.GOLD} 
          metalness={1.0} 
          roughness={0.1}
          emissive={COLORS.GOLD}
          emissiveIntensity={0.2} // Bloom effect
        />
      </mesh>

      {/* The Photo */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[frameWidth - 0.1, photoHeight - 0.1]} />
        <meshBasicMaterial map={data.texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ treeState, userPhotos }) => {
  const foliageRef = useRef<InstancedMesh>(null);
  const ornamentsRef = useRef<InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);

  // Generate static data once
  const foliageData = useMemo(() => generateFoliageData(CONFIG.PARTICLE_COUNT), []);
  const ornamentData = useMemo(() => generateOrnamentData(CONFIG.ORNAMENT_COUNT), []);

  // Temporary object for matrix calculations
  const dummy = useMemo(() => new Object3D(), []);

  // Initialize Colors
  useLayoutEffect(() => {
    if (foliageRef.current) {
      foliageData.forEach((d, i) => {
        foliageRef.current!.setColorAt(i, d.color);
      });
      foliageRef.current.instanceColor!.needsUpdate = true;
    }
    if (ornamentsRef.current) {
      ornamentData.forEach((d, i) => {
        ornamentsRef.current!.setColorAt(i, d.color);
      });
      ornamentsRef.current.instanceColor!.needsUpdate = true;
    }
  }, [foliageData, ornamentData]);

  // Animation Loop
  useFrame((state, delta) => {
    const isFormed = treeState === TreeState.FORMED;
    const lerpFactor = THREE.MathUtils.clamp(delta * 2.5, 0, 1); // Speed of transition

    // Animate Foliage
    if (foliageRef.current) {
      foliageData.forEach((data, i) => {
        // Get current matrix
        foliageRef.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        // Calculate destination
        const dest = isFormed ? data.target : data.chaos;
        
        // Lerp position
        dummy.position.lerp(dest, lerpFactor);
        
        // Add subtle rotation for sparkle effect
        if (isFormed) {
            dummy.rotation.x += Math.sin(state.clock.elapsedTime + i) * 0.002;
            dummy.rotation.y += Math.cos(state.clock.elapsedTime + i) * 0.002;
        } else {
            dummy.rotation.x += 0.01;
            dummy.rotation.y += 0.01;
        }

        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        foliageRef.current!.setMatrixAt(i, dummy.matrix);
      });
      foliageRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Ornaments
    if (ornamentsRef.current) {
      ornamentData.forEach((data, i) => {
        ornamentsRef.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
        
        const dest = isFormed ? data.target : data.chaos;
        // Ornaments move slightly slower/heavier
        dummy.position.lerp(dest, lerpFactor * 0.8);
        
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        ornamentsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ornamentsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Animate Top Star
    if (starRef.current) {
        const starTarget = new Vector3(0, CONFIG.TREE_HEIGHT / 2 + 1, 0);
        const starChaos = new Vector3(0, 30, 0);
        
        const dest = isFormed ? starTarget : starChaos;
        starRef.current.position.lerp(dest, lerpFactor * 0.5);
        starRef.current.rotation.y += 0.01;
        
        // Scale down if chaos
        const targetScale = isFormed ? 1.5 : 0.1;
        starRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), lerpFactor);
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Foliage: Tetrahedron gives a nice "needle" look vs Box */}
      <instancedMesh ref={foliageRef} args={[undefined, undefined, CONFIG.PARTICLE_COUNT]} castShadow receiveShadow>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
          roughness={0.4} 
          metalness={0.6} 
          emissive={COLORS.EMERALD}
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Ornaments: Spheres */}
      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={1.0} 
          envMapIntensity={2} 
        />
      </instancedMesh>

      {/* User Uploaded Photos */}
      {userPhotos.map((photo) => (
        <FramedPhoto key={photo.id} data={photo} treeState={treeState} />
      ))}

      {/* The Star */}
      <group ref={starRef}>
        <mesh castShadow>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={COLORS.GOLD} emissive={COLORS.GOLD} emissiveIntensity={2} toneMapped={false} />
        </mesh>
        <pointLight intensity={2} color={COLORS.GOLD} distance={10} decay={2} />
      </group>
    </group>
  );
};
