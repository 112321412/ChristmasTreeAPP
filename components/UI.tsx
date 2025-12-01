import React from 'react';
import { TreeState, PhotoOrnamentData } from '../../types';
import { PhotoUploader } from './PhotoUploader';

interface UIProps {
  treeState: TreeState;
  onToggle: () => void;
  onPhotoAdd: (photo: PhotoOrnamentData) => void;
}

export const UI: React.FC<UIProps> = ({ treeState, onToggle, onPhotoAdd }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <header className="flex flex-col items-center justify-center mt-4">
        <h1 className="font-['Cinzel'] text-4xl md:text-6xl text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] tracking-widest text-center">
          GRAND LUXURY
        </h1>
        <h2 className="font-['Playfair_Display'] italic text-2xl text-gray-300 mt-2 tracking-wide">
          Interactive Holiday Experience
        </h2>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center mb-12 pointer-events-auto">
        <div className="bg-[#002211]/80 backdrop-blur-md border border-[#FFD700] p-6 rounded-lg shadow-[0_0_30px_rgba(0,66,37,0.8)] max-w-md text-center flex flex-col items-center">
          <p className="font-['Cinzel'] text-[#F7E7CE] mb-4 text-sm uppercase tracking-widest">
            Control Panel
          </p>
          
          <button
            onClick={onToggle}
            className={`
              relative px-8 py-3 w-64 text-lg font-bold tracking-wider transition-all duration-500
              border-2 
              ${treeState === TreeState.FORMED 
                ? 'bg-[#FFD700] text-[#002211] border-[#FFD700] hover:bg-[#FFF] hover:scale-105' 
                : 'bg-transparent text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-[#002211]'}
            `}
            style={{
                boxShadow: treeState === TreeState.FORMED ? '0 0 20px rgba(255, 215, 0, 0.6)' : 'none'
            }}
          >
            {treeState === TreeState.FORMED ? "UNLEASH CHAOS" : "RESTORE ORDER"}
          </button>

          <PhotoUploader onPhotoAdd={onPhotoAdd} isFormed={treeState === TreeState.FORMED} />

          <div className="mt-6 text-xs text-gray-400 font-sans space-y-1">
            <p>✦ Swipe to Spin the Tree ✦</p>
            <p>✦ Move Cursor to Attract Gold Dust ✦</p>
            <p>✦ Add Photos for Personalized Luxury ✦</p>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-4 right-6 text-[#FFD700] opacity-50 font-['Cinzel'] text-xs">
        EST. 2024 • GOLD EDITION
      </div>
    </div>
  );
};