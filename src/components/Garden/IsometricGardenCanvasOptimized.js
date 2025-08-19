import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../lib/gameStore';

// Isometric configuration
const ISO_CONFIG = {
  tileWidth: 64,
  tileHeight: 32,
  gridRows: 10,
  gridCols: 10,
};

// Convert grid coordinates to isometric screen coordinates
function gridToIso(row, col) {
  const x = (col - row) * (ISO_CONFIG.tileWidth / 2);
  const y = (col + row) * (ISO_CONFIG.tileHeight / 2);
  return { x, y };
}

// Convert screen coordinates to grid coordinates
function isoToGrid(x, y) {
  const row = Math.round((y / ISO_CONFIG.tileHeight) - (x / ISO_CONFIG.tileWidth));
  const col = Math.round((x / ISO_CONFIG.tileWidth) + (y / ISO_CONFIG.tileHeight));
  return { row, col };
}

// Draw isometric tile with mode-based highlighting
function drawTileWithMode(ctx, x, y, color, isHovered = false, mode = false) {
  ctx.save();
  ctx.translate(x, y);
  
  // Tile path
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(ISO_CONFIG.tileWidth / 2, ISO_CONFIG.tileHeight / 2);
  ctx.lineTo(0, ISO_CONFIG.tileHeight);
  ctx.lineTo(-ISO_CONFIG.tileWidth / 2, ISO_CONFIG.tileHeight / 2);
  ctx.closePath();
  
  // Fill based on mode and hover state
  const gradient = ctx.createLinearGradient(0, 0, 0, ISO_CONFIG.tileHeight);
  
  if (mode === 'movement' && isHovered) {
    // Movement mode highlight - blue-ish
    gradient.addColorStop(0, '#93c5fd');
    gradient.addColorStop(1, '#60a5fa');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
  } else if (mode === 'plant' && isHovered) {
    // Plant mode highlight - green-ish
    gradient.addColorStop(0, '#86efac');
    gradient.addColorStop(1, '#4ade80');
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
  } else if (isHovered) {
    // Generic hover
    gradient.addColorStop(0, '#86efac');
    gradient.addColorStop(1, '#4ade80');
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
  } else {
    // Normal tile
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, shadeColor(color, -20));
    ctx.strokeStyle = shadeColor(color, -40);
    ctx.lineWidth = 1;
  }
  
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.stroke();
  
  // Add mode indicator for hovered tiles
  if (isHovered && mode) {
    ctx.fillStyle = mode === 'movement' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.3)';
    ctx.fill();
  }
  
  ctx.restore();
}

// Keep the original drawTile for compatibility
function drawTile(ctx, x, y, color, highlight = false) {
  drawTileWithMode(ctx, x, y, color, highlight, highlight ? 'plant' : false);
}

// Draw a plant sprite
function drawPlant(ctx, x, y, type, growth, time) {
  const size = 25 + (growth / 100) * 35; // Made plants larger
  const swayOffset = Math.sin(time * 0.001 + x) * 3;
  
  ctx.save();
  ctx.translate(x + swayOffset, y + size/2);
  
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

// Create Fito SVG based on mood
function createFitoSVG(mood = 'happy') {
  const moodColors = {
    happy: '#0085FF',
    excited: '#5AD3FB',
    neutral: '#3385FA',
    sad: '#6B7280',
    worried: '#FD8987',
  };

  const eyeExpressions = {
    happy: { leftEye: { cx: 21.35, cy: 19.96, rx: 3, ry: 4.2 }, rightEye: { cx: 40.81, cy: 19.96, rx: 3, ry: 4.2 } },
    excited: { leftEye: { cx: 21.35, cy: 19.96, rx: 3.5, ry: 5 }, rightEye: { cx: 40.81, cy: 19.96, rx: 3.5, ry: 5 } },
    neutral: { leftEye: { cx: 21.35, cy: 19.96, rx: 2.5, ry: 3 }, rightEye: { cx: 40.81, cy: 19.96, rx: 2.5, ry: 3 } },
    sad: { leftEye: { cx: 21.35, cy: 21, rx: 2.5, ry: 3.5 }, rightEye: { cx: 40.81, cy: 21, rx: 2.5, ry: 3.5 } },
    worried: { leftEye: { cx: 21.35, cy: 19, rx: 2.8, ry: 3.8 }, rightEye: { cx: 40.81, cy: 19, rx: 2.8, ry: 3.8 } },
  };

  const mouthPaths = {
    happy: "M39.4932 34.5435C39.48 34.6601 39.4593 34.7763 39.4312 34.8902C39.114 36.0281 38.5216 37.0698 37.7061 37.9244C36.8905 38.779 35.8767 39.4196 34.7549 39.7896C33.0007 40.3642 31.1091 40.3642 29.355 39.7896C28.233 39.4197 27.2195 38.779 26.4038 37.9244C25.5881 37.0698 24.9955 36.0282 24.6782 34.8902C24.6433 34.7779 24.6228 34.661 24.6172 34.5435C24.6012 34.2745 24.954 34.1063 25.354 34.3433C27.4074 35.4593 29.7177 36.0176 32.0542 35.9624H32.062C34.3947 36.018 36.701 35.4595 38.75 34.3433C39.155 34.1053 39.5082 34.2745 39.4932 34.5435Z",
    excited: "M38.5 33C38.5 33 37.5 39 32 39C26.5 39 25.5 33 25.5 33C25.5 33 28 36.5 32 36.5C36 36.5 38.5 33 38.5 33Z",
    neutral: "M26 35 L38 35",
    sad: "M26 37C26 37 28 34 32 34C36 34 38 37 38 37",
    worried: "M28 35.5C28 35.5 30 34.5 32 34.5C34 34.5 36 35.5 36 35.5",
  };

  const eyeExp = eyeExpressions[mood];
  const mouthPath = mouthPaths[mood];
  const bodyColor = moodColors[mood];

  return `
    <svg width="32" height="28" viewBox="0 0 60 51" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50.3238C3.486 50.6078 9.16923 49.5623 12.5322 48.8023C16.0112 48.0193 14.5589 47.5883 18.1069 48.6333C20.1055 49.1969 22.1475 49.5932 24.2119 49.8169C31.7679 50.7389 43.4119 50.4387 49.8359 47.6587C57.3769 44.3947 59.2362 37.1314 59.6362 29.2144C60.1662 18.6784 58.9981 7.46738 50.0601 3.09038C42.2351 -0.725623 27.3 -0.571483 19.083 1.20952C17.277 1.6185 15.5173 2.21081 13.8311 2.97612C4.86205 7.03812 3.95601 19.056 4.70801 29.231C5.30801 37.347 6.87384 34.7203 4.71484 40.8023C4.07784 42.6023 3.44807 44.1338 2.72607 45.8238C1.25907 49.2948 0.3 49.4098 0 50.3238Z" fill="${bodyColor}"/>
      <ellipse cx="${eyeExp.leftEye.cx}" cy="${eyeExp.leftEye.cy}" rx="${eyeExp.leftEye.rx}" ry="${eyeExp.leftEye.ry}" fill="white"/>
      <ellipse cx="${eyeExp.leftEye.cx}" cy="${eyeExp.leftEye.cy + 1}" rx="${eyeExp.leftEye.rx * 0.6}" ry="${eyeExp.leftEye.ry * 0.6}" fill="#1F2937"/>
      <ellipse cx="${eyeExp.rightEye.cx}" cy="${eyeExp.rightEye.cy}" rx="${eyeExp.rightEye.rx}" ry="${eyeExp.rightEye.ry}" fill="white"/>
      <ellipse cx="${eyeExp.rightEye.cx}" cy="${eyeExp.rightEye.cy + 1}" rx="${eyeExp.rightEye.rx * 0.6}" ry="${eyeExp.rightEye.ry * 0.6}" fill="#1F2937"/>
      ${mood === 'worried' ? '<path d="M18 15 L24 17" stroke="#1F2937" stroke-width="1.5" stroke-linecap="round"/><path d="M44 17 L38 15" stroke="#1F2937" stroke-width="1.5" stroke-linecap="round"/>' : ''}
      <path d="${mouthPath}" fill="${mood === 'neutral' || mood === 'sad' || mood === 'worried' ? 'none' : 'white'}" stroke="${mood === 'neutral' || mood === 'sad' || mood === 'worried' ? '#1F2937' : 'none'}" stroke-width="${mood === 'neutral' || mood === 'sad' || mood === 'worried' ? '2' : '0'}" stroke-linecap="round"/>
      ${(mood === 'happy' || mood === 'excited') ? '<circle cx="14" cy="28" r="3" fill="#FF8C8A" opacity="0.3"/><circle cx="46" cy="28" r="3" fill="#FF8C8A" opacity="0.3"/>' : ''}
      ${mood === 'excited' ? '<path d="M10,10 L11,8 L12,10 L14,11 L12,12 L11,14 L10,12 L8,11 Z" fill="#FFD700"/><path d="M48,8 L49,6 L50,8 L52,9 L50,10 L49,12 L48,10 L46,9 Z" fill="#FFD700"/>' : ''}
    </svg>
  `;
}

// Cache for Fito images by mood - moved inside component to allow updates
// const fitoImageCache = {}; // Moved inside component

// Draw Fito with SVG and mood
function drawFitoWithMood(ctx, x, y, mood = 'happy', time = 0, imageCache = {}) {
  if (!imageCache[mood]) {
    // Create image from SVG
    const svgString = createFitoSVG(mood);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      imageCache[mood] = img;
      URL.revokeObjectURL(url);
    };
    img.src = url;
    
    // Fallback to basic drawing while image loads
    console.log('🎨 Creating SVG for mood:', mood);
    drawFitoBasic(ctx, x, y, mood);
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  // Add gentle swaying animation
  const swayX = Math.sin(time * 0.002) * 2;
  const swayY = Math.sin(time * 0.003) * 1;
  
  ctx.translate(swayX, swayY);

  // Draw shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Fito SVG
  ctx.drawImage(imageCache[mood], -16, -14, 32, 28);
  
  // Add position indicator (glow effect)
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Fallback basic drawing for Fito
function drawFitoBasic(ctx, x, y, mood = 'happy') {
  const moodColors = {
    happy: '#0085FF',
    excited: '#5AD3FB', 
    neutral: '#3385FA',
    sad: '#6B7280',
    worried: '#FD8987',
  };

  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.fillStyle = moodColors[mood];
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Eyes based on mood
  ctx.fillStyle = '#ffffff';
  if (mood === 'sad') {
    // Sad eyes (smaller)
    ctx.beginPath();
    ctx.arc(-5, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'excited') {
    // Excited eyes (larger)
    ctx.beginPath();
    ctx.arc(-5, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -5, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Normal eyes
    ctx.beginPath();
    ctx.arc(-5, -5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pupils
  ctx.fillStyle = '#1F2937';
  const pupilSize = mood === 'excited' ? 2.5 : 2;
  ctx.beginPath();
  ctx.arc(-5, -5, pupilSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5, -5, pupilSize, 0, Math.PI * 2);
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

function IsometricGardenCanvasOptimized() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef();
  const particlesRef = useRef([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const hoveredTileRef = useRef(null);
  const { garden, addPlant, fito, updateFitoPosition, toggleMovementMode, getCurrentFitoMood, updateFitoMood } = useGameStore();
  const fitoRef = useRef(fito);
  const [currentFitoMood, setCurrentFitoMood] = useState(() => {
    // Initialize with actual mood from store
    return getCurrentFitoMood ? getCurrentFitoMood() : 'happy';
  });
  const fitoImageCacheRef = useRef({});
  
  // Debug: Component lifecycle
  useEffect(() => {
    console.log('🎨 IsometricGardenCanvas mounted');
    return () => {
      console.log('🎨 IsometricGardenCanvas unmounted');
    };
  }, []);

  useEffect(() => {
    // Only update fitoRef when gridPosition actually changes to avoid unnecessary updates
    if (!fitoRef.current || 
        fitoRef.current.gridPosition?.row !== fito?.gridPosition?.row ||
        fitoRef.current.gridPosition?.col !== fito?.gridPosition?.col) {
      fitoRef.current = fito;
    }
  }, [fito?.gridPosition?.row, fito?.gridPosition?.col, fito]);

  // Update Fito mood dynamically
  useEffect(() => {
    const newMood = getCurrentFitoMood();
    if (newMood !== currentFitoMood) {
      console.log('🎭 Mood changed from', currentFitoMood, 'to', newMood);
      setCurrentFitoMood(newMood);
      // Clear image cache for old mood to force recreation
      if (fitoImageCacheRef.current[currentFitoMood]) {
        delete fitoImageCacheRef.current[currentFitoMood];
      }
    }
  }, [garden.plants.length, getCurrentFitoMood]); // Removed currentFitoMood from deps to avoid infinite loop

  // Update mood every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newMood = getCurrentFitoMood();
      if (newMood !== currentFitoMood) {
        setCurrentFitoMood(newMood);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentFitoMood, getCurrentFitoMood]);

  // Simplified Fito position management without react-spring for canvas
  const fitoStateRef = useRef({
    targetPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    gridPosition: fito?.gridPosition || { row: 0, col: 0 },
    velocity: { x: 0, y: 0 },
    isAnimating: false
  });
  
  // Initialize position
  useEffect(() => {
    if (fito?.gridPosition && !fitoStateRef.current.isAnimating) {
      const { x, y } = gridToIso(fito.gridPosition.row, fito.gridPosition.col);
      fitoStateRef.current.targetPosition = { x, y };
      fitoStateRef.current.currentPosition = { x, y };
      fitoStateRef.current.gridPosition = fito.gridPosition;
    }
  }, []); // Only on mount

  // Update Fito position when grid position changes
  useEffect(() => {
    if (fito?.gridPosition) {
      const { x, y } = gridToIso(fito.gridPosition.row, fito.gridPosition.col);
      
      // Only update if position actually changed
      if (fitoStateRef.current.gridPosition.row !== fito.gridPosition.row || 
          fitoStateRef.current.gridPosition.col !== fito.gridPosition.col) {
        console.log('🎯 Fito position updated:', { 
          from: fitoStateRef.current.gridPosition,
          to: fito.gridPosition, 
          targetPos: { x, y },
          currentMood: currentFitoMood 
        });
        
        fitoStateRef.current.targetPosition = { x, y };
        fitoStateRef.current.gridPosition = fito.gridPosition;
        fitoStateRef.current.isAnimating = true;
      }
    }
  }, [fito?.gridPosition?.row, fito?.gridPosition?.col, currentFitoMood]);
  
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
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.3 + 0.2,
        color: Math.random() > 0.5 ? '#fbbf24' : '#ffffff',
        baseX: Math.random() * window.innerWidth
      });
    }
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only allow keyboard movement in movement mode
      if (!garden.isMovementMode) return;
      
      console.log('fitoRef.current', fitoRef.current);
      if (fitoRef.current && fitoRef.current.gridPosition) {
        let { row, col } = fitoRef.current.gridPosition;
        console.log('current position', { row, col });
        switch (e.key.toLowerCase()) {
          case 'arrowup':
          case 'w':
            // Isometric up: move diagonally up-left (north-west)
            row--;
            col--;
            break;
          case 'arrowdown':
          case 's':
            // Isometric down: move diagonally down-right (south-east)
            row++;
            col++;
            break;
          case 'arrowleft':
          case 'a':
            // Isometric left: move diagonally down-left (south-west)
            row++;
            col--;
            break;
          case 'arrowright':
          case 'd':
            // Isometric right: move diagonally up-right (north-east)
            row--;
            col++;
            break;
          default:
            return;
        }
        console.log('new position', { row, col });

        if (row >= 0 && row < ISO_CONFIG.gridRows && col >= 0 && col < ISO_CONFIG.gridCols) {
          updateFitoPosition(row, col);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [garden.isMovementMode, updateFitoPosition]);
  
  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - (canvas.height / 2 - ISO_CONFIG.gridRows * ISO_CONFIG.tileHeight / 4);
    
    const { row, col } = isoToGrid(x, y);
    
    if (row >= 0 && row < ISO_CONFIG.gridRows && col >= 0 && col < ISO_CONFIG.gridCols) {
      const newHoveredTile = { row, col };
      setHoveredTile(newHoveredTile);
      hoveredTileRef.current = newHoveredTile;
    } else {
      setHoveredTile(null);
      hoveredTileRef.current = null;
    }
  }, []);
  
  // Handle click
  const handleClick = useCallback((e) => {
    if (hoveredTile) {
      const tileKey = `${hoveredTile.row}-${hoveredTile.col}`;
      const hasPlant = garden.plants.some(p => p.gridPosition === tileKey);
      
      if (garden.isMovementMode) {
        // Movement mode: Move Fito to clicked tile
        if (hoveredTile.row >= 0 && hoveredTile.row < ISO_CONFIG.gridRows && 
            hoveredTile.col >= 0 && hoveredTile.col < ISO_CONFIG.gridCols) {
          updateFitoPosition(hoveredTile.row, hoveredTile.col);
        }
      } else {
        // Plant mode: Add plant if tile is empty and Fito is not there
        const fitoTile = `${fitoRef.current?.gridPosition?.row || 0}-${fitoRef.current?.gridPosition?.col || 0}`;
        if (!hasPlant && tileKey !== fitoTile) {
          addPlant({
            type: ['flower', 'tree', 'leaf'][Math.floor(Math.random() * 3)],
            growth: 30,
            gridPosition: tileKey
          });
        }
      }
    }
  }, [hoveredTile, garden.plants, garden.isMovementMode, addPlant, updateFitoPosition]);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
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
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 - ISO_CONFIG.gridRows * ISO_CONFIG.tileHeight / 4);

      // Draw tiles
      for (let row = 0; row < ISO_CONFIG.gridRows; row++) {
        for (let col = 0; col < ISO_CONFIG.gridCols; col++) {
          const { x, y } = gridToIso(row, col);
          const isHovered = hoveredTileRef.current && hoveredTileRef.current.row === row && hoveredTileRef.current.col === col;
          const isFitoTile = fitoRef.current?.gridPosition?.row === row && fitoRef.current?.gridPosition?.col === col;
          
          let tileColor = (row + col) % 2 === 0 ? '#4ade80' : '#22c55e';
          
          // Highlight Fito's current position
          if (isFitoTile) {
            tileColor = garden.isMovementMode ? '#fbbf24' : '#60a5fa';
          }
          
          // Special highlight for hovered tile based on mode
          let specialHighlight = false;
          if (isHovered) {
            if (garden.isMovementMode) {
              specialHighlight = 'movement'; // Blue-ish highlight for movement
            } else {
              const tileKey = `${row}-${col}`;
              const hasPlant = garden.plants.some(p => p.gridPosition === tileKey);
              const fitoTile = `${fitoRef.current?.gridPosition?.row || 0}-${fitoRef.current?.gridPosition?.col || 0}`;
              if (!hasPlant && tileKey !== fitoTile) {
                specialHighlight = 'plant'; // Green highlight for planting
              }
            }
          }
          
          drawTileWithMode(ctx, x, y, tileColor, isHovered, specialHighlight);
        }
      }

      // Draw plants and decorations
      for (let row = 0; row < ISO_CONFIG.gridRows; row++) {
        for (let col = 0; col < ISO_CONFIG.gridCols; col++) {
          const { x, y } = gridToIso(row, col);
          const tileKey = `${row}-${col}`;
          const plant = garden.plants.find(p => p.gridPosition === tileKey);

          if (plant) {
            drawPlant(ctx, x, y, plant.type, plant.growth || 50, time);
          }
        }
      }

      // Animate Fito position with smooth interpolation
      if (fitoStateRef.current.isAnimating) {
        const dx = fitoStateRef.current.targetPosition.x - fitoStateRef.current.currentPosition.x;
        const dy = fitoStateRef.current.targetPosition.y - fitoStateRef.current.currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.5) {
          // Smooth interpolation
          const speed = 0.15; // Adjust for animation speed
          fitoStateRef.current.currentPosition.x += dx * speed;
          fitoStateRef.current.currentPosition.y += dy * speed;
        } else {
          // Snap to final position
          fitoStateRef.current.currentPosition = { ...fitoStateRef.current.targetPosition };
          fitoStateRef.current.isAnimating = false;
        }
      }
      
      // Draw Fito with mood and animation
      const currentX = fitoStateRef.current.currentPosition.x;
      const currentY = fitoStateRef.current.currentPosition.y;
      
      // Log only occasionally to reduce spam
      if (time % 1000 < 16) {
        console.log('🦊 Drawing Fito:', { 
          pos: { x: currentX.toFixed(1), y: currentY.toFixed(1) }, 
          mood: currentFitoMood,
          gridPos: fitoStateRef.current.gridPosition 
        });
      }
      
      drawFitoWithMood(ctx, currentX, currentY, currentFitoMood, time, fitoImageCacheRef.current);
      
      ctx.restore();

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
  }, [garden.plants]); // Removed api and fitoSpring from dependencies to prevent resets
  
  return (
    <motion.canvas
      ref={canvasRef}
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

// Memoize the component to prevent unnecessary re-renders
export default memo(IsometricGardenCanvasOptimized);
