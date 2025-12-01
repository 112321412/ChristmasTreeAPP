import { Color } from 'three';

export const COLORS = {
  EMERALD: new Color('#004225'),
  GOLD: new Color('#FFD700'),
  CHAMPAGNE: new Color('#F7E7CE'),
  RUBY: new Color('#800020'),
  SILVER: new Color('#C0C0C0'),
};

export const CONFIG = {
  TREE_HEIGHT: 14,
  TREE_RADIUS: 5,
  PARTICLE_COUNT: 2500, // Foliage
  ORNAMENT_COUNT: 400,
  GIFT_COUNT: 50,
  CAMERA_POS: [0, 4, 22] as [number, number, number],
};

export const GALLERY_CONFIG = {
  SPIRAL_HEIGHT: 16,
  SPIRAL_RADIUS_TOP: 3, // Wider spiral for visibility
  SPIRAL_RADIUS_BOTTOM: 9,
  SPIRAL_TURNS: 2.5,
  PHOTO_SCALE_BASE: 3.5, // 2-3x larger as requested
};

// Physics constants for interaction
export const PHYSICS = {
  FRICTION: 0.96, // Decay factor for spin
  SENSITIVITY: 0.005, // Mouse delta to rotation speed
  ATTRACTION_RADIUS: 4, // Mouse attraction radius for gold dust
  ATTRACTION_STRENGTH: 0.15,
};