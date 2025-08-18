import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, Plane, Sprite, SpriteMaterial, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import useGameStore from '../../lib/gameStore';
import { usePlantTexture, getGrowthStage } from './PlantSprites';

// Grid configuration
const GRID_SIZE = { rows: 6, cols: 9 };
const TILE_SIZE = { width: 1, height: 0.5 }; // 2:1 ratio for isometric
const GRID_OFFSET = { x: -4, z: -2 };

// Isometric Tile Component
function IsometricTile({ position, index, onHover, onClick, hasPlant }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(index, true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(index, false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(index);
        }}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[TILE_SIZE.width, TILE_SIZE.height]} />
        <meshBasicMaterial 
          color={hasPlant ? '#4ade80' : (hovered ? '#86efac' : '#22c55e')}
          transparent
          opacity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      
      {/* Grid lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(TILE_SIZE.width, TILE_SIZE.height)]} />
        <lineBasicMaterial color="#166534" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}

// 2D Plant Sprite Component
function PlantSprite({ type, growth, position, index }) {
  const spriteRef = useRef();
  const plantTexture = usePlantTexture(type, growth);
  const { stage, scale: stageScale } = getGrowthStage(growth);
  
  // Gentle swaying animation
  useFrame((state) => {
    if (spriteRef.current) {
      const time = state.clock.elapsedTime;
      spriteRef.current.rotation.z = Math.sin(time * 0.5 + index) * 0.02;
      spriteRef.current.position.y = 0.4 + Math.sin(time + index) * 0.01;
    }
  });

  return (
    <group position={position}>
      {/* Plant sprite with texture */}
      <sprite ref={spriteRef} scale={[stageScale * 0.8, stageScale * 1, 1]}>
        <spriteMaterial map={plantTexture} transparent opacity={0.95} />
      </sprite>
      
      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[stageScale * 0.4, stageScale * 0.2]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
      
      {/* Growth indicator when young */}
      {growth < 50 && (
        <sprite position={[0, stageScale + 0.2, 0]} scale={[0.3, 0.3, 1]}>
          <spriteMaterial color="#fbbf24" transparent opacity={0.7} />
        </sprite>
      )}
    </group>
  );
}

// Floating Particle System
function ParticleSystem() {
  const particlesRef = useRef();
  const particleCount = 30;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 3 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        // Gentle floating motion
        positions[i * 3 + 1] += Math.sin(time + i) * 0.001;
        
        // Reset if too high
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = 0.5;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#fbbf24" 
        transparent 
        opacity={0.4}
        sizeAttenuation={false}
      />
    </points>
  );
}

// Background layers for depth
function BackgroundLayers() {
  return (
    <>
      {/* Sky gradient plane */}
      <mesh position={[0, 3, -5]} scale={[20, 10, 1]}>
        <planeGeometry />
        <meshBasicMaterial>
          <canvasTexture
            attach="map"
            image={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 256;
              canvas.height = 256;
              const ctx = canvas.getContext('2d');
              const gradient = ctx.createLinearGradient(0, 0, 0, 256);
              gradient.addColorStop(0, '#60a5fa');
              gradient.addColorStop(1, '#dbeafe');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 256, 256);
              return canvas;
            })()}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Cloud sprites */}
      <sprite position={[-3, 2.5, -3]} scale={[2, 1, 1]}>
        <spriteMaterial color="#ffffff" opacity={0.6} transparent />
      </sprite>
      <sprite position={[3, 2, -2.5]} scale={[1.5, 0.8, 1]}>
        <spriteMaterial color="#ffffff" opacity={0.5} transparent />
      </sprite>
    </>
  );
}

// Main Scene Component
function Scene() {
  const { garden, addPlant } = useGameStore();
  const [hoveredTile, setHoveredTile] = useState(null);
  const [gridState, setGridState] = useState(() => {
    const state = {};
    for (let row = 0; row < GRID_SIZE.rows; row++) {
      for (let col = 0; col < GRID_SIZE.cols; col++) {
        state[`${row}-${col}`] = null;
      }
    }
    return state;
  });

  // Generate grid positions
  const gridTiles = useMemo(() => {
    const tiles = [];
    for (let row = 0; row < GRID_SIZE.rows; row++) {
      for (let col = 0; col < GRID_SIZE.cols; col++) {
        const x = GRID_OFFSET.x + col * TILE_SIZE.width;
        const z = GRID_OFFSET.z + row * TILE_SIZE.height;
        tiles.push({
          position: [x, 0, z],
          index: `${row}-${col}`,
          row,
          col
        });
      }
    }
    return tiles;
  }, []);

  // Place plants on grid
  useEffect(() => {
    const newGridState = { ...gridState };
    garden.plants.forEach((plant, index) => {
      const row = Math.floor(index / GRID_SIZE.cols);
      const col = index % GRID_SIZE.cols;
      if (row < GRID_SIZE.rows) {
        newGridState[`${row}-${col}`] = plant;
      }
    });
    setGridState(newGridState);
  }, [garden.plants]);

  const handleTileClick = (index) => {
    if (!gridState[index]) {
      // Add a new plant at this position
      const [row, col] = index.split('-').map(Number);
      addPlant({ 
        type: ['flower', 'tree', 'leaf'][Math.floor(Math.random() * 3)], 
        growth: 30,
        gridPosition: { row, col }
      });
    }
  };

  return (
    <>
      {/* Orthographic camera for isometric view */}
      <OrthographicCamera
        makeDefault
        position={[5, 5, 5]}
        zoom={80}
        near={0.1}
        far={1000}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow />
      
      {/* Background */}
      <BackgroundLayers />
      
      {/* Ground base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial color="#15803d" />
      </mesh>
      
      {/* Isometric grid */}
      {gridTiles.map((tile) => (
        <IsometricTile
          key={tile.index}
          position={tile.position}
          index={tile.index}
          onHover={setHoveredTile}
          onClick={handleTileClick}
          hasPlant={!!gridState[tile.index]}
        />
      ))}
      
      {/* Plants */}
      {Object.entries(gridState).map(([key, plant]) => {
        if (!plant) return null;
        const [row, col] = key.split('-').map(Number);
        const x = GRID_OFFSET.x + col * TILE_SIZE.width;
        const z = GRID_OFFSET.z + row * TILE_SIZE.height;
        
        return (
          <PlantSprite
            key={plant.id}
            type={plant.type}
            growth={plant.growth}
            position={[x, 0, z]}
            index={parseInt(key.replace('-', ''))}
          />
        );
      })}
      
      {/* Particles for atmosphere */}
      <ParticleSystem />
      
      {/* Post-processing */}
      <EffectComposer>
        <Bloom 
          intensity={0.3}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.9}
        />
        <Vignette offset={0.1} darkness={0.2} />
      </EffectComposer>
    </>
  );
}

// Main Component
export default function IsometricGarden() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(to bottom, #60a5fa, #86efac)' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}