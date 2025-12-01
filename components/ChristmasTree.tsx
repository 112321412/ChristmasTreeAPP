import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InstancedMesh, Object3D, Vector3 } from 'three';
import { CONFIG, COLORS } from '../../constants';
import { TreeState, DualPosition, PhotoOrnamentData } from '../../types';
import { PhotoOrnaments } from './PhotoOrnaments';

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

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({ treeState, userPhotos }) => {
  const foliageRef = useRef<InstancedMesh>(null);
  const ornamentsRef = useRef<InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);

  // Generate static data once
  const foliageData = useMemo(() => generateFoliageData(CONFIG.PARTICLE_COUNT), []);
  const ornamentData = useMemo(() => generateOrnamentData(CONFIG.ORNAMENT_COUNT), []);

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
    // Treat TREE and GALLERY as "Formed" states for the base tree
    const isFormed = treeState !== TreeState.CHAOS;
    const lerpFactor = THREE.MathUtils.clamp(delta * 2.5, 0, 1);

    // Animate Foliage
    if (foliageRef.current) {
      foliageData.forEach((data, i) => {
        foliageRef.current!.getMatrixAt(i, dummy.matrix);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        const dest = isFormed ? data.target : data.chaos;
        dummy.position.lerp(dest, lerpFactor);
        
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
        
        const targetScale = isFormed ? 1.5 : 0.1;
        starRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), lerpFactor);
    }
  });

  return (
    // Raised tree to 0,0,0 (originally -2) to give spiral more room and center it better
    <group position={[0, 0, 0]}>
      {/* Foliage */}
      <instancedMesh ref={foliageRef} args={[undefined, undefined, CONFIG.PARTICLE_COUNT]} castShadow receiveShadow>
        <tetrahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial 
          roughness={0.4} 
          metalness={0.6} 
          emissive={COLORS.EMERALD}
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Standard Ornaments */}
      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          roughness={0.1} 
          metalness={1.0} 
          envMapIntensity={2} 
        />
      </instancedMesh>

      {/* New Photo Ornament System */}
      <PhotoOrnaments photos={userPhotos} treeState={treeState} />

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