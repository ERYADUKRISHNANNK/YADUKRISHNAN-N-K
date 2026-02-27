
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  pollutionLevel: number; // 0 to 1
  isSuccess?: boolean;
}

const Earth = ({ pollutionLevel, isSuccess }: { pollutionLevel: number, isSuccess?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.0005;
    }
  });

  const earthColor = useMemo(() => {
    if (isSuccess) return '#4ade80'; // Clean green
    const r = Math.floor(20 + pollutionLevel * 100);
    const g = Math.floor(100 - pollutionLevel * 60);
    const b = Math.floor(200 - pollutionLevel * 150);
    return `rgb(${r}, ${g}, ${b})`;
  }, [pollutionLevel, isSuccess]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial 
          color={earthColor} 
          speed={isSuccess ? 1 : 3} 
          distort={pollutionLevel * 0.4} 
          roughness={0.5}
          metalness={0.2}
        />
      </Sphere>
    </Float>
  );
};

const PollutionParticles = ({ count, pollutionLevel }: { count: number, pollutionLevel: number }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const light = useRef<THREE.PointLight>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <pointLight ref={light} distance={40} intensity={8} color="orange" />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={pollutionLevel > 0.5 ? "#444" : "#888"} roughness={0.5} transparent opacity={0.6} />
      </instancedMesh>
    </>
  );
};

const Scene = ({ pollutionLevel, isSuccess }: { pollutionLevel: number, isSuccess?: boolean }) => {
  const { viewport } = useThree();
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      <Earth pollutionLevel={pollutionLevel} isSuccess={isSuccess} />
      
      {!isSuccess && (
        <PollutionParticles count={pollutionLevel > 0.5 ? 100 : 40} pollutionLevel={pollutionLevel} />
      )}
      
      <fog attach="fog" args={[isSuccess ? '#87ceeb' : '#1a1a1a', 5, 15]} />
    </>
  );
};

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ pollutionLevel, isSuccess }) => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <Scene pollutionLevel={pollutionLevel} isSuccess={isSuccess} />
      </Canvas>
      
      {/* Overlay Gradient for Atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          background: isSuccess 
            ? 'radial-gradient(circle at center, transparent 0%, rgba(135, 206, 235, 0.2) 100%)'
            : `radial-gradient(circle at center, transparent 0%, rgba(255, 100, 0, ${pollutionLevel * 0.2}) 100%)`
        }}
      />
    </div>
  );
};

export default ThreeBackground;
