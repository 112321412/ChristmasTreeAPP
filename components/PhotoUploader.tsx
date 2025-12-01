import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { PhotoOrnamentData } from '../types';
import { CONFIG, GALLERY_CONFIG } from '../constants';

interface PhotoUploaderProps {
  onPhotosProcessed: (photos: PhotoOrnamentData[]) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotosProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setProcessing(true);
    const newPhotos: PhotoOrnamentData[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const bitmap = await createImageBitmap(file);
        
        const MAX_SIZE = 1024;
        let width = bitmap.width;
        let height = bitmap.height;
        
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width *= ratio;
          height *= ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        
        ctx.drawImage(bitmap, 0, 0, width, height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.generateMipmaps = true;

        const y = (Math.random() * 0.7 + 0.1) * CONFIG.TREE_HEIGHT - (CONFIG.TREE_HEIGHT / 2); 
        const progress = (y + CONFIG.TREE_HEIGHT / 2) / CONFIG.TREE_HEIGHT;
        const radius = CONFIG.TREE_RADIUS * (1 - progress) + 0.5; 
        const angle = Math.random() * Math.PI * 2;

        const treePos = new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        );

        const spread = 40;
        const chaosPos = new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        );

        const spiralPos = new THREE.Vector3(0, 0, 0);

        newPhotos.push({
          id: Math.random().toString(36).substr(2, 9),
          texture,
          aspectRatio: width / height,
          chaosPos,
          treePos,
          spiralPos,
          // Base scale randomized slightly, multiplied by constant
          scale: GALLERY_CONFIG.PHOTO_SCALE_BASE * (0.9 + Math.random() * 0.2)
        });
      }

      onPhotosProcessed(newPhotos);

    } catch (error) {
      console.error("Failed to process images", error);
    } finally {
      setProcessing(false);
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
        multiple
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={processing}
        className={`
          flex flex-col items-center justify-center
          w-16 h-16 rounded-lg 
          border border-[#FFD700] bg-[#051a12]/80 text-[#FFD700] 
          hover:bg-[#FFD700] hover:text-[#002211] hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]
          transition-all duration-300 backdrop-blur-sm
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        title="Add Memories"
      >
        {processing ? (
             <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
        ) : (
            <>
                <span className="text-2xl leading-none mb-1">+</span>
                <span className="text-[8px] font-bold tracking-widest uppercase">ADD</span>
            </>
        )}
      </button>
    </>
  );
};