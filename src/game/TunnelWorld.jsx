import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Fog } from "three";

// Tunnel dimensions
const TUNNEL_LENGTH = 100;
const TUNNEL_WIDTH = 5;
const TUNNEL_HEIGHT = 4;

// Ceiling light positions spaced along tunnel
const LIGHT_POSITIONS = [5, 15, 25, 35, 45, 55, 65, 75];
// Indices of lights that will flicker
const FLICKER_INDICES = new Set([1, 4, 6]);

function CeilingLight({ x, flicker }) {
  const lightRef = useRef();
  const timeRef = useRef(Math.random() * 100);

  useFrame((_, delta) => {
    if (!lightRef.current || !flicker) return;
    timeRef.current += delta;
    // Irregular flicker using sine + noise
    const noise =
      Math.sin(timeRef.current * 12.3) *
      Math.sin(timeRef.current * 7.1) *
      Math.sin(timeRef.current * 3.7);
    const intensity = noise > 0.1 ? 0.6 + noise * 0.4 : 0.05;
    lightRef.current.intensity = intensity;
  });

  return (
    <group position={[0, TUNNEL_HEIGHT / 2 - 0.1, -x]}>
      {/* Bulb mesh */}
      <mesh>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color="#ffe8b0"
          emissive="#ffe8b0"
          emissiveIntensity={flicker ? 1.5 : 1.2}
        />
      </mesh>
      {/* Light source */}
      <pointLight
        ref={lightRef}
        color="#ffe8b0"
        intensity={0.6}
        distance={12}
        decay={2}
        castShadow={false}
      />
    </group>
  );
}

function KeyItem({ collected }) {
  const keyRef = useRef();

  useFrame((_, delta) => {
    if (keyRef.current) {
      keyRef.current.rotation.y += delta * 1.8;
      keyRef.current.position.y = -TUNNEL_HEIGHT / 2 + 0.95 + Math.sin(Date.now() * 0.003) * 0.06;
    }
  });

  if (collected) return null;

  return (
    <group ref={keyRef} position={[1.5, -TUNNEL_HEIGHT / 2 + 0.95, -8.2]}>
      {/* Key head */}
      <mesh>
        <torusGeometry args={[0.08, 0.02, 8, 16]} />
        <meshStandardMaterial color="#f0c242" metalness={0.9} roughness={0.2} emissive="#f0c242" emissiveIntensity={0.6} />
      </mesh>
      {/* Key shaft */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
        <meshStandardMaterial color="#f0c242" metalness={0.9} roughness={0.2} emissive="#f0c242" emissiveIntensity={0.6} />
      </mesh>
      {/* Key tooth */}
      <mesh position={[0.04, -0.16, 0]}>
        <boxGeometry args={[0.06, 0.03, 0.02]} />
        <meshStandardMaterial color="#f0c242" metalness={0.9} roughness={0.2} emissive="#f0c242" emissiveIntensity={0.6} />
      </mesh>
      {/* Golden aura light */}
      <pointLight color="#ffe066" intensity={1.5} distance={2.5} decay={2} />
    </group>
  );
}

export default function TunnelWorld({ hasKey, doorOpen }) {
  const wallMaterial = {
    color: "#1c1a1f",
    roughness: 0.95,
    metalness: 0.05,
  };

  const floorMaterial = {
    color: "#141217",
    roughness: 1,
    metalness: 0,
  };

  return (
    <>
      {/* Scene fog */}
      <fogExp2 attach="fog" color="#09060f" density={0.038} />

      {/* Very dim ambient */}
      <ambientLight intensity={0.03} color="#1a0a2a" />

      {/* ── TUNNEL GEOMETRY ── */}

      {/* Floor */}
      <mesh
        position={[0, -TUNNEL_HEIGHT / 2, -TUNNEL_LENGTH / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TUNNEL_WIDTH, TUNNEL_LENGTH]} />
        <meshStandardMaterial {...floorMaterial} />
      </mesh>

      {/* Ceiling */}
      <mesh
        position={[0, TUNNEL_HEIGHT / 2, -TUNNEL_LENGTH / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[TUNNEL_WIDTH, TUNNEL_LENGTH]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Left wall */}
      <mesh
        position={[-TUNNEL_WIDTH / 2, 0, -TUNNEL_LENGTH / 2]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[TUNNEL_LENGTH, TUNNEL_HEIGHT]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Right wall */}
      <mesh
        position={[TUNNEL_WIDTH / 2, 0, -TUNNEL_LENGTH / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[TUNNEL_LENGTH, TUNNEL_HEIGHT]} />
        <meshStandardMaterial {...wallMaterial} />
      </mesh>

      {/* Back wall — the door Nora approaches */}
      <mesh position={[0, 0, -TUNNEL_LENGTH]} receiveShadow>
        <planeGeometry args={[TUNNEL_WIDTH, TUNNEL_HEIGHT]} />
        <meshStandardMaterial color="#161014" roughness={1} />
      </mesh>

      {/* Entrance wall (behind player start) */}
      <mesh position={[0, 0, 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[TUNNEL_WIDTH, TUNNEL_HEIGHT]} />
        <meshStandardMaterial color="#0f0d12" roughness={1} />
      </mesh>

      {/* ── CEILING LIGHTS ── */}
      {LIGHT_POSITIONS.map((x, i) => (
        <CeilingLight key={i} x={x} flicker={FLICKER_INDICES.has(i)} />
      ))}

      {/* ── PROPS — scattered obstacles ── */}

      {/* Crate cluster near entrance */}
      <mesh position={[1.5, -TUNNEL_HEIGHT / 2 + 0.3, -8]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.9} />
      </mesh>
      <mesh position={[1.6, -TUNNEL_HEIGHT / 2 + 0.9, -8.2]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#231a14" roughness={0.9} />
      </mesh>

      {/* Barrel mid-tunnel */}
      <mesh position={[-1.8, -TUNNEL_HEIGHT / 2 + 0.5, -38]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 1, 10]} />
        <meshStandardMaterial color="#1f1a10" roughness={0.85} />
      </mesh>

      {/* Fallen beam */}
      <mesh
        position={[0.3, -TUNNEL_HEIGHT / 2 + 0.1, -55]}
        rotation={[0, 0.3, 0.15]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.15, 0.15, 3]} />
        <meshStandardMaterial color="#1a160f" roughness={1} />
      </mesh>

      {/* Key placed on top of crate */}
      <KeyItem collected={hasKey} />

      {/* Door frame at end */}
      {/* Top bar */}
      <mesh position={[0, TUNNEL_HEIGHT / 2 - 0.15, -99.5]} castShadow>
        <boxGeometry args={[1.8, 0.3, 0.2]} />
        <meshStandardMaterial color="#2d1a1a" roughness={0.9} />
      </mesh>
      {/* Left post */}
      <mesh position={[-0.9, 0, -99.5]} castShadow>
        <boxGeometry args={[0.2, TUNNEL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#2d1a1a" roughness={0.9} />
      </mesh>
      {/* Right post */}
      <mesh position={[0.9, 0, -99.5]} castShadow>
        <boxGeometry args={[0.2, TUNNEL_HEIGHT, 0.2]} />
        <meshStandardMaterial color="#2d1a1a" roughness={0.9} />
      </mesh>
      {/* Door surface — slides open or shows green light when unlocked */}
      <mesh position={[doorOpen ? -1.8 : 0, 0, -99.6]}>
        <planeGeometry args={[1.6, TUNNEL_HEIGHT - 0.4]} />
        <meshStandardMaterial color={doorOpen ? "#052211" : "#1a0505"} roughness={0.8} />
      </mesh>
      {doorOpen && (
        <pointLight position={[0, 0, -99.2]} color="#00ff88" intensity={2} distance={8} decay={2} />
      )}
    </>
  );
}
