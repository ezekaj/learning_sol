import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  Stars,
  Float,
  MeshDistortMaterial,
  Environment,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

// Animated Blockchain Visualization
const BlockchainNode: React.FC<{ position: [number, number, number]; color: string }> = ({ 
  position, 
  color 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime) * 0.2;
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        emissive={hovered ? color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
};

const ConnectionLine: React.FC<{ 
  start: [number, number, number]; 
  end: [number, number, number] 
}> = ({ start, end }) => {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00ff88" opacity={0.6} transparent />
    </line>
  );
};

export const BlockchainVisualization: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const nodes = useMemo(() => [
    { position: [-2, 0, 0] as [number, number, number], color: '#ff6b6b' },
    { position: [0, 0, 0] as [number, number, number], color: '#4ecdc4' },
    { position: [2, 0, 0] as [number, number, number], color: '#45b7d1' },
    { position: [0, 2, 0] as [number, number, number], color: '#96ceb4' },
    { position: [0, -2, 0] as [number, number, number], color: '#feca57' }
  ], []);

  const connections = useMemo(() => [
    { start: [-2, 0, 0] as [number, number, number], end: [0, 0, 0] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [2, 0, 0] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [0, 2, 0] as [number, number, number] },
    { start: [0, 0, 0] as [number, number, number], end: [0, -2, 0] as [number, number, number] }
  ], []);

  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {nodes.map((node, index) => (
          <BlockchainNode 
            key={index}
            position={node.position}
            color={node.color}
          />
        ))}
        
        {connections.map((connection, index) => (
          <ConnectionLine
            key={index}
            start={connection.start}
            end={connection.end}
          />
        ))}
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

// Floating Particles Background
const Particle: React.FC<{
  position: [number, number, number];
  id?: number;
  animationDelay?: number;
  animationSpeed?: number;
  renderPriority?: string;
  colorVariant?: number;
  scale?: number;
  movementPattern?: number;
}> = ({
  position,
  id = 0,
  animationDelay = 0,
  animationSpeed = 1,
  renderPriority = 'medium',
  colorVariant = 0,
  scale = 1,
  movementPattern = 0
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Color variants based on index
  const colors = ['#00ff88', '#9945FF', '#14F195', '#FF6B6B', '#FFD93D'];
  const particleColor = colors[colorVariant];

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const delayedTime = Math.max(0, time - animationDelay);

      // Different movement patterns based on index
      switch (movementPattern) {
        case 0: // Original floating motion
          meshRef.current.position.y = position[1] + Math.sin(delayedTime + position[0]) * 0.5;
          break;
        case 1: // Circular motion
          meshRef.current.position.x = position[0] + Math.cos(delayedTime * animationSpeed) * 0.3;
          meshRef.current.position.z = position[2] + Math.sin(delayedTime * animationSpeed) * 0.3;
          break;
        case 2: // Figure-8 motion
          meshRef.current.position.x = position[0] + Math.sin(delayedTime * animationSpeed) * 0.4;
          meshRef.current.position.y = position[1] + Math.sin(delayedTime * animationSpeed * 2) * 0.2;
          break;
      }

      // Rotation based on animation speed and index
      meshRef.current.rotation.x = delayedTime * animationSpeed * 0.5;
      meshRef.current.rotation.y = delayedTime * animationSpeed * 0.3;

      // Performance optimization: reduce updates for low priority particles
      if (renderPriority === 'low' && Math.floor(time * 10) % 3 !== 0) {
        return; // Skip some frames for low priority particles
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      userData={{ id, renderPriority }} // Store metadata for debugging
    >
      <sphereGeometry args={[0.05, renderPriority === 'high' ? 16 : 8, renderPriority === 'high' ? 16 : 8]} />
      <meshStandardMaterial
        color={particleColor}
        emissive={particleColor}
        emissiveIntensity={renderPriority === 'high' ? 0.3 : renderPriority === 'medium' ? 0.2 : 0.1}
        transparent
        opacity={renderPriority === 'high' ? 0.9 : renderPriority === 'medium' ? 0.7 : 0.5}
      />
    </mesh>
  );
};

export const ParticleBackground: React.FC<{
  className?: string;
  particleCount?: number;
}> = ({ className = '', particleCount = 50 }) => {
  const particles = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i, // Unique identifier for each particle
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      // Use index for animation sequencing
      animationDelay: i * 0.1, // Staggered animation start
      animationSpeed: 0.5 + (i % 3) * 0.2, // Varied speeds based on index
      // Use index for performance optimization
      renderPriority: i < 20 ? 'high' : i < 40 ? 'medium' : 'low',
      // Use index for color variation
      colorVariant: i % 5, // 5 different color variants
      // Use index for size variation
      scale: 0.8 + (i % 4) * 0.1, // Size based on index
      // Use index for movement pattern
      movementPattern: i % 3 // 3 different movement patterns
    })), [particleCount]
  );

  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        
        {particles.map((particle, index) => (
          <Particle
            key={index}
            position={particle.position}
            id={particle.id}
            animationDelay={particle.animationDelay}
            animationSpeed={particle.animationSpeed}
            renderPriority={particle.renderPriority}
            colorVariant={particle.colorVariant}
            scale={particle.scale}
            movementPattern={particle.movementPattern}
          />
        ))}
        
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
      </Canvas>
    </div>
  );
};

// Interactive 3D Card
const Card3D: React.FC<{ 
  children: React.ReactNode;
  rotation?: [number, number, number];
}> = ({ children, rotation = [0, 0, 0] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation[0] + (hovered ? Math.sin(state.clock.elapsedTime) * 0.1 : 0);
      meshRef.current.rotation.y = rotation[1] + (hovered ? Math.cos(state.clock.elapsedTime) * 0.1 : 0);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[4, 6, 0.2]} />
        <MeshDistortMaterial
          color={hovered ? "#ff6b6b" : "#4ecdc4"}
          distort={hovered ? 0.3 : 0.1}
          speed={2}
        />
      </mesh>
      
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {children}
      </Text>
    </Float>
  );
};

export const Interactive3DCard: React.FC<{
  title: string;
  className?: string;
}> = ({ title, className = '' }) => {
  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Card3D>
          {title}
        </Card3D>
        
        <Environment preset="sunset" />
        <ContactShadows 
          position={[0, -3, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4} 
        />
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

// Morphing Geometry
const MorphingShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometryType, setGeometryType] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setGeometryType((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderGeometry = () => {
    switch (geometryType) {
      case 0:
        return <boxGeometry args={[2, 2, 2]} />;
      case 1:
        return <sphereGeometry args={[1.5, 32, 32]} />;
      case 2:
        return <octahedronGeometry args={[1.5]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      {renderGeometry()}
      <MeshDistortMaterial
        color="#45b7d1"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

export const MorphingGeometry: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <MorphingShape />
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

// Solana Token Visualization
const SolanaToken: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
      <meshStandardMaterial 
        color="#9945FF" 
        emissive="#9945FF" 
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
      />
      
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        SOL
      </Text>
    </mesh>
  );
};

export const SolanaVisualization: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const tokens = useMemo(() => [
    [-2, 0, 0] as [number, number, number],
    [0, 0, 0] as [number, number, number],
    [2, 0, 0] as [number, number, number]
  ], []);

  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {tokens.map((position, index) => (
          <SolanaToken key={index} position={position} />
        ))}
        
        <Environment preset="warehouse" />
        <ContactShadows 
          position={[0, -1, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2} 
          far={4} 
        />
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default BlockchainVisualization;
