import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../lib/gameStore';

// Isometric configuration
const ISO_CONFIG = {
  tileWidth: 64,
  tileHeight: 32,
  gridRows: 9,
  gridCols: 9,
  offsetX: 400,
  offsetY: 200
};

// Convert grid coordinates to isometric screen coordinates
function gridToIso(row, col) {
  const x = ISO_CONFIG.offsetX + (col - row) * (ISO_CONFIG.tileWidth / 2);
  const y = ISO_CONFIG.offsetY + (col + row) * (ISO_CONFIG.tileHeight / 2);
  return { x, y };
}

// Convert screen coordinates to grid coordinates
function isoToGrid(x, y) {
  const adjustedX = x - ISO_CONFIG.offsetX;
  const adjustedY = y - ISO_CONFIG.offsetY;
  
  const col = Math.floor((adjustedX / (ISO_CONFIG.tileWidth / 2) + adjustedY / (ISO_CONFIG.tileHeight / 2)) / 2);
  const row = Math.floor((adjustedY / (ISO_CONFIG.tileHeight / 2) - adjustedX / (ISO_CONFIG.tileWidth / 2)) / 2);
  
  return { row, col };
}

// Draw isometric tile
function drawTile(ctx, x, y, color, highlight = false) {
  ctx.save();
  ctx.translate(x, y);
  
  // Tile path
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ISO_CONFIG.tileWidth / 2, ISO_CONFIG.tileHeight / 2);
  ctx.lineTo(0, ISO_CONFIG.tileHeight);
  ctx.lineTo(-ISO_CONFIG.tileWidth / 2, ISO_CONFIG.tileHeight / 2);
  ctx.closePath();
  
  // Fill
  const gradient = ctx.createLinearGradient(0, 0, 0, ISO_CONFIG.tileHeight);
  if (highlight) {
    gradient.addColorStop(0, '#86efac');
    gradient.addColorStop(1, '#4ade80');
  } else {
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, shadeColor(color, -20));
  }
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Stroke
  ctx.strokeStyle = highlight ? '#22c55e' : shadeColor(color, -40);
  ctx.lineWidth = highlight ? 2 : 1;
  ctx.stroke();
  
  ctx.restore();
}

// Draw a plant sprite
function drawPlant(ctx, x, y, type, growth, time) {
  const size = 25 + (growth / 100) * 35; // Made plants larger
  const swayOffset = Math.sin(time * 0.001 + x) * 3;
  
  ctx.save();
  ctx.translate(x + swayOffset, y - size / 2);
  
  if (type === 'flower') {
    // Stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 0.6);
    ctx.stroke();
    
    // Petals
    const petalCount = 5;
    const petalSize = size * 0.3;
    ctx.fillStyle = '#ec4899';
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const px = Math.cos(angle) * petalSize * 0.5;
      const py = -size * 0.6 + Math.sin(angle) * petalSize * 0.5;
      
      ctx.beginPath();
      ctx.arc(px, py, petalSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -size * 0.6, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (type === 'tree') {
    // Trunk
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.4);
    
    // Leaves
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -size * 0.5, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(-size * 0.2, -size * 0.4, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.2, -size * 0.4, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
  } else {
    // Generic plant
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.3, size * 0.2, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 5, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

// Draw decoration (rocks, flowers)
function drawDecoration(ctx, x, y, type) {
  ctx.save();
  ctx.translate(x, y);
  
  if (type === 'rock') {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    gradient.addColorStop(0, '#9ca3af');
    gradient.addColorStop(1, '#6b7280');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'grass') {
    ctx.strokeStyle = '#15803d';
    for (let i = 0; i < 5; i++) {
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(i * 3 - 6, 0);
      ctx.quadraticCurveTo(i * 3 - 6 + Math.random() * 4 - 2, -5, i * 3 - 6 + Math.random() * 4 - 2, -10);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

// Helper function to shade color
function shadeColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

export default function IsometricGardenCanvasOptimized() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const particlesRef = useRef([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const { garden, addPlant, updatePlant } = useGameStore();
  
  // Debug: log garden plants to console
  useEffect(() => {
    console.log('Garden plants:', garden.plants);
  }, [garden.plants]);
  
  // Migrate existing plants without gridPosition to new grid system
  useEffect(() => {
    const plantsNeedingMigration = garden.plants.filter(plant => !plant.gridPosition);
    if (plantsNeedingMigration.length > 0) {
      console.log('Migrating plants to grid system:', plantsNeedingMigration);
      plantsNeedingMigration.forEach((plant, index) => {
        const row = Math.floor(index / ISO_CONFIG.gridCols);
        const col = index % ISO_CONFIG.gridCols;
        const gridPosition = `${row}-${col}`;
        
        // Update plant with grid position
        if (updatePlant) {
          updatePlant(plant.id, { gridPosition });
        }
      });
    }
  }, [garden.plants, updatePlant]);
  
  // Static decorations for each tile (generated once)
  const decorationsRef = useRef(null);
  if (!decorationsRef.current) {
    const decorations = {};
    for (let row = 0; row < ISO_CONFIG.gridRows; row++) {
      for (let col = 0; col < ISO_CONFIG.gridCols; col++) {
        const random = Math.random();
        if (random > 0.85) {
          decorations[`${row}-${col}`] = random > 0.92 ? 'rock' : 'grass';
        }
      }
    }
    decorationsRef.current = decorations;
  }

  // Initialize particles once
  useEffect(() => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.2,
        color: Math.random() > 0.5 ? '#fbbf24' : '#ffffff',
        baseX: Math.random() * 800
      });
    }
  }, []);
  
  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const { row, col } = isoToGrid(x, y);
    
    if (row >= 0 && row < ISO_CONFIG.gridRows && col >= 0 && col < ISO_CONFIG.gridCols) {
      setHoveredTile({ row, col });
    } else {
      setHoveredTile(null);
    }
  }, []);
  
  // Handle click
  const handleClick = useCallback((e) => {
    if (hoveredTile) {
      // Check if tile is empty
      const tileKey = `${hoveredTile.row}-${hoveredTile.col}`;
      const hasPlant = garden.plants.some(p => p.gridPosition === tileKey);
      
      if (!hasPlant) {
        addPlant({
          type: ['flower', 'tree', 'leaf'][Math.floor(Math.random() * 3)],
          growth: 30,
          gridPosition: tileKey
        });
      }
    }
  }, [hoveredTile, garden.plants, addPlant]);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    const animate = () => {
      time += 16;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, '#60a5fa');
      skyGradient.addColorStop(0.5, '#93c5fd');
      skyGradient.addColorStop(1, '#dbeafe');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      const cloudOffset = Math.sin(time * 0.0001) * 20;
      ctx.arc(100 + cloudOffset, 100, 30, 0, Math.PI * 2);
      ctx.arc(130 + cloudOffset, 100, 40, 0, Math.PI * 2);
      ctx.arc(170 + cloudOffset, 100, 35, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw tiles and plants
      for (let row = ISO_CONFIG.gridRows - 1; row >= 0; row--) {
        for (let col = 0; col < ISO_CONFIG.gridCols; col++) {
          const { x, y } = gridToIso(row, col);
          
          // Check if tile is hovered
          const isHovered = hoveredTile && hoveredTile.row === row && hoveredTile.col === col;
          
          // Alternate tile colors for pattern
          const tileColor = (row + col) % 2 === 0 ? '#4ade80' : '#22c55e';
          
          // Draw tile
          drawTile(ctx, x, y, tileColor, isHovered);
          
          // Find plant for this position
          const tileKey = `${row}-${col}`;
          let plant = garden.plants.find(p => p.gridPosition === tileKey);
          
          // Backward compatibility: if no plant found by gridPosition, try by index
          if (!plant) {
            const plantIndex = row * ISO_CONFIG.gridCols + col;
            plant = garden.plants[plantIndex];
          }
          
          // Draw plant if found
          if (plant) {
            drawPlant(ctx, x, y - 10, plant.type, plant.growth || 50, time);
            
            // Debug: draw a red dot to mark plant positions
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Draw static decorations only if no plant
          const decorationType = decorationsRef.current[tileKey];
          if (!plant && decorationType) {
            drawDecoration(ctx, x, y - 5, decorationType);
          }
        }
      }
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.y -= particle.speed;
        particle.x = particle.baseX + Math.sin(time * 0.001 + particle.id) * 30;
        
        // Reset particle if it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
        }
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [garden.plants, hoveredTile]);
  
  return (
    <motion.canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  );
}