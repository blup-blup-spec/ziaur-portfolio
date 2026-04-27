import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GlobeWireframe() {
  const meshRef = useRef<any>(null);
  const pointsRef = useRef<any>(null);

  const connectionLines = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 60; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 2.2;
      pts.push([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)]);
    }
    const linePositions: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.sqrt((pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2 + (pts[i][2] - pts[j][2]) ** 2);
        if (d < 1.8) {
          linePositions.push(...pts[i], ...pts[j]);
        }
      }
    }
    return { pts, linePositions: new Float32Array(linePositions) };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
      meshRef.current.rotation.x += delta * 0.02;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.2, 2]} />
        <meshBasicMaterial wireframe color="#EAE2DD" transparent opacity={0.14} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[2.15, 1]} />
        <meshBasicMaterial wireframe color="#EAE2DD" transparent opacity={0.07} />
      </mesh>
      <group ref={pointsRef}>
        {connectionLines.pts.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#EAE2DD" transparent opacity={0.5} />
          </mesh>
        ))}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[connectionLines.linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#EAE2DD" transparent opacity={0.1} />
        </lineSegments>
      </group>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#EAE2DD" transparent opacity={0.7} />
      </mesh>
      <mesh>
        <ringGeometry args={[3.0, 3.05, 64]} />
        <meshBasicMaterial color="#EAE2DD" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function HeroGlobe() {
  return (
    <div className="hero-globe-container">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} style={{ width: "100%", height: "100%" }}>
        <GlobeWireframe />
      </Canvas>
    </div>
  );
}
