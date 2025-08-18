import { useMemo } from 'react';
import * as THREE from 'three';

// Create a procedural plant texture
export function createPlantTexture(type, growth) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, 128, 128);
  
  const size = Math.min(64 + (growth / 100) * 32, 96);
  const centerX = 64;
  const centerY = 64;
  
  if (type === 'flower') {
    // Draw stem
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + size/2);
    ctx.lineTo(centerX, centerY);
    ctx.stroke();
    
    // Draw petals
    const petalCount = 6;
    const petalSize = size * 0.3;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * petalSize * 0.8;
      const y = centerY - 20 + Math.sin(angle) * petalSize * 0.8;
      
      // Petal gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, petalSize);
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(0.5, '#ec4899');
      gradient.addColorStop(1, '#db2777');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, petalSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw center
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (type === 'tree') {
    // Draw trunk
    ctx.fillStyle = '#92400e';
    ctx.fillRect(centerX - 4, centerY, 8, size/2);
    
    // Draw tree crown (multiple circles for fluffy look)
    const positions = [
      { x: 0, y: -size * 0.4, r: size * 0.35 },
      { x: -size * 0.2, y: -size * 0.3, r: size * 0.25 },
      { x: size * 0.2, y: -size * 0.3, r: size * 0.25 },
    ];
    
    positions.forEach(pos => {
      const gradient = ctx.createRadialGradient(
        centerX + pos.x, 
        centerY + pos.y, 
        0, 
        centerX + pos.x, 
        centerY + pos.y, 
        pos.r
      );
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(0.7, '#22c55e');
      gradient.addColorStop(1, '#15803d');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX + pos.x, centerY + pos.y, pos.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
  } else {
    // Draw generic plant (leaf)
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 10, size * 0.2, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw leaf veins
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 10);
    ctx.lineTo(centerX, centerY - 30);
    ctx.stroke();
  }
  
  return canvas;
}

// Plant growth stages
export const GROWTH_STAGES = {
  seed: { min: 0, max: 20, scale: 0.3 },
  sprout: { min: 21, max: 40, scale: 0.5 },
  young: { min: 41, max: 60, scale: 0.7 },
  mature: { min: 61, max: 80, scale: 0.9 },
  bloom: { min: 81, max: 100, scale: 1.0 }
};

// Get growth stage from growth value
export function getGrowthStage(growth) {
  for (const [stage, values] of Object.entries(GROWTH_STAGES)) {
    if (growth >= values.min && growth <= values.max) {
      return { stage, scale: values.scale };
    }
  }
  return { stage: 'bloom', scale: 1.0 };
}

// Create decorative elements (rocks, grass patches)
export function createDecorationTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  if (type === 'rock') {
    // Draw a rock
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 20);
    gradient.addColorStop(0, '#9ca3af');
    gradient.addColorStop(1, '#4b5563');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(32, 32, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (type === 'grass_patch') {
    // Draw grass blades
    ctx.strokeStyle = '#22c55e';
    for (let i = 0; i < 10; i++) {
      const x = 10 + Math.random() * 44;
      const height = 10 + Math.random() * 20;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.quadraticCurveTo(x + Math.random() * 10 - 5, 40, x + Math.random() * 10 - 5, 50 - height);
      ctx.stroke();
    }
  }
  
  return canvas;
}

// Hook to use plant texture
export function usePlantTexture(type, growth) {
  return useMemo(() => {
    const canvas = createPlantTexture(type, growth);
    return new THREE.CanvasTexture(canvas);
  }, [type, growth]);
}