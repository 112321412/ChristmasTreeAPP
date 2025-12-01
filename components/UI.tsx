import React from 'react';
import { TreeState, PhotoOrnamentData } from '../../types';
import { PhotoUploader } from './PhotoUploader';

interface UIProps {
  treeState: TreeState;
  onToggleChaos: () => void;
  onToggleGallery: () => void;
  onPhotosProcessed: (photos: PhotoOrnamentData[]) => void;
  onRotate: (direction: number) => void;
}

export const UI: React.FC<UIProps> = ({ treeState, onToggleChaos, onToggleGallery, onPhotosProcessed, onRotate }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-10">
      
      {/* Header */}
      <header className="absolute top-0 w-full flex flex-col items-center justify-center mt-6 pointer-events-none">
        <h1 className="font-['Cinzel'] text-3xl md:text-5xl text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] tracking-[0.2em] text-center">
          GRAND LUXURY
        </h1>
        <div className="h-[1px] w-24 bg-[#FFD700] my-2 opacity-50"></div>
        <h2 className="font-['Playfair_Display'] italic text-lg text-gray-300 tracking-wide">
          Interactive Christmas Edition
        </h2>
      </header>

      {/* Vertical Sidebar - Right Side */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 items-end pointer-events-auto">
        
        {/* ADD MEMORIES */}
        <div className="flex flex-col items-end group">
           <PhotoUploader onPhotosProcessed={onPhotosProcessed} />
        </div>

        {/* Separator */}
        <div className="w-[1px] h-8 bg-[#FFD700]/30 mr-6 my-2"></div>

        {/* Mode Controls */}
        <button
          onClick={onToggleChaos}
          className={`
            w-12 h-12 flex items-center justify-center rounded-lg border border-[#FFD700] transition-all duration-300 backdrop-blur-md
            ${treeState === TreeState.CHAOS 
              ? 'bg-[#FFD700] text-[#051a12] shadow-[0_0_15px_rgba(255,215,0,0.6)]' 
              : 'bg-[#001108]/60 text-[#FFD700] hover:bg-[#FFD700]/20'}
          `}
          title="Chaos Mode"
        >
          <span className="font-bold text-[10px] tracking-widest rotate-[-90deg]">CHAOS</span>
        </button>

        <button
          onClick={onToggleGallery}
          className={`
            w-12 h-12 flex items-center justify-center rounded-lg border border-[#FFD700] transition-all duration-300 backdrop-blur-md
            ${treeState === TreeState.GALLERY 
              ? 'bg-[#FFD700] text-[#051a12] shadow-[0_0_15px_rgba(255,215,0,0.6)]' 
              : 'bg-[#001108]/60 text-[#FFD700] hover:bg-[#FFD700]/20'}
          `}
          title="Expand/Collapse"
        >
           <span className="font-bold text-[10px] tracking-widest rotate-[-90deg]">EXPAND</span>
        </button>

        {/* Separator */}
        <div className="w-[1px] h-8 bg-[#FFD700]/30 mr-6 my-2"></div>

        {/* Rotation Controls */}
        <div className="flex flex-col gap-2 items-center mr-1">
            <button 
                onClick={() => onRotate(0.3)}
                className="w-10 h-10 rounded-full border border-[#FFD700]/50 bg-[#002211]/80 text-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#002211] transition-all active:scale-95 shadow-lg"
            >
                ←
            </button>
            <span className="text-[9px] text-[#FFD700]/70 font-['Cinzel'] tracking-widest text-center w-20 leading-tight">
                SWIPE TO SPIN
            </span>
            <button 
                onClick={() => onRotate(-0.3)}
                className="w-10 h-10 rounded-full border border-[#FFD700]/50 bg-[#002211]/80 text-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#002211] transition-all active:scale-95 shadow-lg"
            >
                →
            </button>
        </div>

      </div>
      
    </div>
  );
};