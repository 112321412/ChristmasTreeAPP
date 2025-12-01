import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { PHYSICS } from '../../constants';

interface InteractiveRotatorProps {
  children: React.ReactNode;
}

export interface InteractiveRotatorRef {
  addVelocity: (amount: number) => void;
}

export const InteractiveRotator = forwardRef<InteractiveRotatorRef, InteractiveRotatorProps>(({ children }, ref) => {
  const groupRef = useRef<Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const { gl } = useThree();

  useImperativeHandle(ref, () => ({
    addVelocity: (amount: number) => {
      velocity.current += amount;
    }
  }));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation(); // Prevent hitting objects behind
    setIsDragging(true);
    lastX.current = e.clientX;
    velocity.current = 0; // Stop auto-spin on grab
    // Change cursor style
    gl.domElement.style.cursor = 'grabbing';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !groupRef.current) return;
    
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;
    
    // Apply immediate rotation while dragging
    groupRef.current.rotation.y += deltaX * PHYSICS.SENSITIVITY;
    
    // Store velocity for release inertia
    velocity.current = deltaX * PHYSICS.SENSITIVITY;
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    gl.domElement.style.cursor = 'grab';
  };

  const handlePointerLeave = () => {
      setIsDragging(false);
      gl.domElement.style.cursor = 'grab';
  }

  // Set initial cursor
  useEffect(() => {
      gl.domElement.style.cursor = 'grab';
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;

    if (!isDragging) {
      // Apply momentum
      groupRef.current.rotation.y += velocity.current;
      
      // Friction decay
      velocity.current *= PHYSICS.FRICTION;

      // Minimal auto-spin if stopped, for cinematic feel
      if (Math.abs(velocity.current) < 0.0001) {
         groupRef.current.rotation.y += 0.001; 
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </group>
  );
});

InteractiveRotator.displayName = 'InteractiveRotator';
