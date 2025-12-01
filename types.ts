import { Vector3, Color, Texture } from 'three';

export interface ParticleData {
  chaosPos: Vector3;
  targetPos: Vector3;
  color: Color;
  size: number;
  speed: number;
}

export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface DualPosition {
  chaos: Vector3;
  target: Vector3;
  scale: number;
  color: Color;
  rotationSpeed?: number;
}

export interface PhotoOrnamentData {
  id: string;
  texture: Texture;
  aspectRatio: number;
  chaosPos: Vector3;
  targetPos: Vector3;
}