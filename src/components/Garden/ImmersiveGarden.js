import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Float, Cloud, Sky, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing';
import { useRef, useMemo, useState, Suspense } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import useGameStore from '../../lib/gameStore';

// Animated grass blade component with wind effect
function GrassBlade({ position, delay = 0 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Wind effect
      meshRef.current.rotation.z = Math.sin(time * 0.5 + delay) * 0.1;
      meshRef.current.rotation.x = Math.sin(time * 0.3 + delay * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.05, 0.3]} />
      <meshBasicMaterial color="#4ade80" side={THREE.DoubleSide} transparent opacity={0.9} />
    </mesh>
  );
}

// Grass field with multiple blades
function GrassField() {
  const grassBlades = useMemo(() => {
    const blades = [];
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      const y = -1.5;
      blades.push({ position: [x, y, z], delay: Math.random() * Math.PI * 2 });
    }
    return blades;
  }, []);

  return (
    <group>
      {grassBlades.map((blade, index) => (
        <GrassBlade key={index} position={blade.position} delay={blade.delay} />
      ))}
    </group>
  );
}

// 2D-style plant that grows in 3D space
function Plant3D({ type, growth, position, index }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Animate plant swaying
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.z = Math.sin(time + index) * 0.02;
      meshRef.current.scale.y = 1 + Math.sin(time * 2 + index) * 0.02;
    }
  });

  const size = Math.min(0.3 + (growth / 100), 1.2);
  const color = type === 'flower' ? '#ec4899' : type === 'tree' ? '#22c55e' : '#84cc16';

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group position={position}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={hovered ? size * 1.2 : size}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.3 : 0.1}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        
        {/* Stem */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 0.6, 8]} />
          <meshStandardMaterial color="#4ade80" />
        </mesh>
        
        {/* Glow effect */}
        {hovered && (
          <pointLight color={color} intensity={2} distance={2} />
        )}
      </group>
    </Float>
  );
}

// Floating particles for atmosphere
function Particles() {
  const particlesRef = useRef();
  const particleCount = 50;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 5 - 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.elapsedTime;
      particlesRef.current.rotation.y = time * 0.05;
      
      // Animate particles floating up
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.002;
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = -1;
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
        opacity={0.6}
        emissive="#fbbf24"
        emissiveIntensity={0.5}
      />
    </points>
  );
}

// Main 3D Scene
function Scene() {
  const { garden } = useGameStore();
  
  // Generate plant positions in 3D space
  const plants3D = useMemo(() => {
    return garden.plants.map((plant, index) => {
      const angle = (index / garden.plants.length) * Math.PI * 2;
      const radius = 1.5 + (index % 3) * 0.5;
      return {
        ...plant,
        position: [
          Math.cos(angle) * radius,
          -0.8,
          Math.sin(angle) * radius - 2
        ]
      };
    });
  }, [garden.plants]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#fbbf24" />
      
      {/* Sky and atmosphere */}
      <Sky 
        distance={450000}
        sunPosition={[100, 20, 100]}
        inclination={0.6}
        azimuth={0.25}
      />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      
      {/* Clouds */}
      <Cloud
        position={[-4, 3, -5]}
        speed={0.2}
        opacity={0.5}
        color="#ffffff"
      />
      <Cloud
        position={[4, 2.5, -3]}
        speed={0.3}
        opacity={0.4}
        color="#ffffff"
      />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>
      
      {/* Grass field */}
      <GrassField />
      
      {/* Plants */}
      {plants3D.map((plant, index) => (
        <Plant3D
          key={plant.id}
          type={plant.type}
          growth={plant.growth}
          position={plant.position}
          index={index}
        />
      ))}
      
      {/* Floating particles */}
      <Particles />
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom 
          intensity={0.5}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.9}
        />
        <Vignette offset={0.1} darkness={0.3} />
        <DepthOfField 
          focusDistance={0.01}
          focalLength={0.05}
          bokehScale={2}
          height={480}
        />
        <ChromaticAberration offset={[0.0005, 0.0005]} />
      </EffectComposer>
    </>
  );
}

// Main component
export default function ImmersiveGarden() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}