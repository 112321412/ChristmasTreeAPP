import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, Vector3, AdditiveBlending, BufferAttribute } from 'three';
import { PHYSICS, COLORS } from '../constants';

interface GoldDustProps {
  count: number;
}

export const GoldDust: React.FC<GoldDustProps> = ({ count }) => {
  const pointsRef = useRef<Points>(null);
  const { viewport, mouse } = useThree();

  // Create random positions inside a large box
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
      spd[i] = Math.random() * 0.02 + 0.005;
    }
    return [pos, spd];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    // Convert normalized mouse (-1 to 1) to world coordinates (roughly)
    // We project mouse to a plane at z=0 (middle of tree)
    const vec = new Vector3(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);

    const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let x = positionsArray[idx];
      let y = positionsArray[idx + 1];
      let z = positionsArray[idx + 2];

      // 1. Natural floating movement (Sine wave drift)
      y -= speeds[i]; // Gravity down
      x += Math.sin(state.clock.elapsedTime * speeds[i] * 10) * 0.01;

      // Reset if too low
      if (y < -15) {
        y = 15;
        x = (Math.random() - 0.5) * 30;
        z = (Math.random() - 0.5) * 30;
      }

      // 2. Mouse Attraction Logic ("Magical Gravity")
      const dx = vec.x - x;
      const dy = vec.y - y;
      const dz = vec.z - z; // Attract towards z=0 plane where mouse is projected
      
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (dist < PHYSICS.ATTRACTION_RADIUS) {
        // Stronger force when closer
        const force = (1 - dist / PHYSICS.ATTRACTION_RADIUS) * PHYSICS.ATTRACTION_STRENGTH;
        
        x += dx * force;
        y += dy * force;
        z += dz * force;
      }

      positionsArray[idx] = x;
      positionsArray[idx + 1] = y;
      positionsArray[idx + 2] = z;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={COLORS.GOLD}
        transparent
        opacity={0.8}
        blending={AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};
