import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { PhotoOrnamentData, TreeState } from '../types';
import { CONFIG } from '../constants';

interface PhotoUploaderProps {
  onPhotoAdd: (photoData: PhotoOrnamentData) => void;
  isFormed: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoAdd, isFormed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    try {
      // 1. Create Image Bitmap
      const bitmap = await createImageBitmap(file);
      
      // 2. Resize logic (Max 1024x1024)
      const MAX_SIZE = 1024;
      let width = bitmap.width;
      let height = bitmap.height;
      
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
        width *= ratio;
        height *= ratio;
      }

      // 3. Draw to Canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Context failed');
      
      ctx.drawImage(bitmap, 0, 0, width, height);
      
      // 4. Create Texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipMapLinearFilter;
      texture.generateMipmaps = true;

      // 5. Calculate Positions
      // Random position on the cone surface
      const y = (Math.random() * 0.6 + 0.2) * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2); // Keep in middle 60% of tree
      const progress = (y + CONFIG.TREE_HEIGHT / 2) / CONFIG.TREE_HEIGHT;
      const radius = CONFIG.TREE_RADIUS * (1 - progress) + 0.4; // +0.4 to sit on top of foliage
      const angle = Math.random() * Math.PI * 2;

      const targetPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      // Random Chaos Position
      const spread = 35;
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );

      const newPhoto: PhotoOrnamentData = {
        id: Math.random().toString(36).substr(2, 9),
        texture,
        aspectRatio: width / height,
        chaosPos,
        targetPos
      };

      onPhotoAdd(newPhoto);

    } catch (error) {
      console.error("Failed to process image", error);
    } finally {
      setProcessing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className={`
          mt-4 relative px-6 py-2 w-64 text-sm font-bold tracking-widest transition-all duration-300
          border border-[#FFD700] bg-[#051a12] text-[#FFD700]
          hover:bg-[#FFD700] hover:text-[#002211] hover:shadow-[0_0_15px_rgba(255,215,0,0.4)]
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {processing ? "ENGRAVING..." : "ADD MEMORY"}
      </button>
    </>
  );
};