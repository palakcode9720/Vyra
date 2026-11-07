import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Enemy({ playerPos, onCatch }) {
  const groupRef = useRef();
  const speed = 2.4; // Slightly slower than walk speed (4.5) to give player escape chances

  useFrame((_, delta) => {
    if (!groupRef.current || !playerPos) return;

    const enemyPos = groupRef.current.position;
    const dx = playerPos.x - enemyPos.x;
    const dz = playerPos.z - enemyPos.z;
    const dist = Math.hypot(dx, dz);

    // If close enough, trigger catch/death
    if (dist < 1.4 && onCatch) {
      onCatch();
      return;
    }

    // Creature starts stalking once player advances deeper into the tunnel (z < -15)
    if (playerPos.z < -15) {
      // Look toward player
      groupRef.current.rotation.y = Math.atan2(dx, dz);

      // Move toward player along tunnel
      const moveX = (dx / dist) * speed * delta;
      const moveZ = (dz / dist) * speed * delta;

      enemyPos.x = THREE.MathUtils.clamp(enemyPos.x + moveX, -1.7, 1.7);
      enemyPos.z = THREE.MathUtils.clamp(enemyPos.z + moveZ, -98, 1);
    }

    // Slight eerie vertical breathing/floating oscillation
    groupRef.current.position.y = -0.3 + Math.sin(Date.now() * 0.004) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.3, -80]}>
      {/* Tall shadowy silhouette / torso */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.12, 1.8, 12]} />
        <meshStandardMaterial
          color="#070508"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial
          color="#0d080f"
          roughness={0.8}
        />
      </mesh>

      {/* Menacing glowing red eyes */}
      <mesh position={[-0.07, 2.05, 0.16]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#ff1133" />
      </mesh>
      <mesh position={[0.07, 2.05, 0.16]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="#ff1133" />
      </mesh>

      {/* Point light cast from eyes to illuminate surroundings red */}
      <pointLight
        position={[0, 2.0, 0.3]}
        color="#ff1a33"
        intensity={1.2}
        distance={4.5}
        decay={2}
      />
    </group>
  );
}
