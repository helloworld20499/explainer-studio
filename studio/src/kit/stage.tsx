// Sets, camera and panels (1920 x 1080 world).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, SANS} from './lib';
import {realSrc} from './chars';

export const SvgLayer: React.FC<{children: React.ReactNode; z?: number}> = ({children, z}) => (
  <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, overflow: 'visible', zIndex: z}}>{children}</svg>
);

// Camera: zoom z on world point (cx, cy); sx/sy = small shake in px. The view never leaves the world (no empty border).
export const Cam: React.FC<{z: number; cx: number; cy: number; sx?: number; sy?: number; children: React.ReactNode}> = ({z, cx: cx0, cy: cy0, sx = 0, sy = 0, children}) => {
  const cx = Math.min(Math.max(cx0, 960 / z), 1920 - 960 / z), cy = Math.min(Math.max(cy0, 540 / z), 1080 - 540 / z);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${960 + sx}px,${540 + sy}px) scale(${z}) translate(${-cx}px,${-cy}px)`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// A set = background image brand/locations/<name>.png (made 1920x1080 by prep_assets.py) or a flat wall + floor.
// After a new background arrives, measure its floor line and furniture and write them into SETS.
export const SETS: Record<string, {floor: number}> = {
  studio: {floor: 1000},   // default flat set: feet of characters at y = 1000
};
export const SetBG: React.FC<{name?: string}> = ({name = 'studio'}) => {
  const bg = realSrc(name);
  const floor = SETS[name]?.floor ?? 1000;
  return bg ? <Img src={staticFile(bg)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover'}} /> : (
    <SvgLayer>
      <rect width={1920} height={1080} fill={C.wall} />
      <rect y={floor - 70} width={1920} height={1080 - floor + 70} fill={C.floor} />
      <line x1={0} x2={1920} y1={floor - 70} y2={floor - 70} stroke={C.ink} strokeWidth={5} />
    </SvgLayer>
  );
};

// Picture-in-picture panel (16:9) with an optional label at the bottom-left
export const Panel: React.FC<{x: number; y: number; w: number; s?: number; label?: string; color?: string; children: React.ReactNode}> = ({x, y, w, s = 1, label, color = C.yellow, children}) => {
  const h = (w * 9) / 16;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${s})`, transformOrigin: '50% 100%', zIndex: 8,
      border: `8px solid ${C.ink}`, borderRadius: 26, overflow: 'hidden', background: C.bg, boxShadow: '10px 12px 0 rgba(30,42,68,0.15)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${(w - 16) / 1920})`, transformOrigin: '0 0'}}>{children}</div>
      {label && <div style={{position: 'absolute', left: 16, bottom: 12, background: color, color: C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 28, padding: '4px 16px', borderRadius: 14, border: `3px solid ${C.ink}`}}>{label}</div>}
    </div>
  );
};
