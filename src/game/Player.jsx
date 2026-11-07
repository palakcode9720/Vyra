import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

const WALK_SPEED = 4.5;
const RUN_SPEED = 9;
const CROUCH_SPEED = 2;
const STAND_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.9;

// Tunnel boundary (keep player inside)
const BOUND_X = 1.8;
const BOUND_Z_MIN = -98;
const BOUND_Z_MAX = 1.5;

export default function Player({ onPositionChange, onInteract }) {
  const controlsRef = useRef();
  const flashlightRef = useRef();
  const targetRef = useRef();
  const { camera, scene } = useThree();

  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const isCrouching = useRef(false);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [locked, setLocked] = useState(false);

  // Set initial camera position (tunnel entrance) and attach light target
  useEffect(() => {
    camera.position.set(0, STAND_HEIGHT, 0);
    if (targetRef.current && flashlightRef.current) {
      scene.add(targetRef.current);
      flashlightRef.current.target = targetRef.current;
    }
    return () => {
      if (targetRef.current) {
        scene.remove(targetRef.current);
      }
    };
  }, [camera, scene]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e) => {
      keys.current[e.code] = true;

      // Interact key
      if (e.code === "KeyE" && onInteract) {
        onInteract();
      }

      // Flashlight toggle
      if (e.code === "KeyF") {
        setFlashlightOn((prev) => !prev);
      }

      // Crouch
      if (e.code === "ControlLeft" || e.code === "ControlRight") {
        isCrouching.current = true;
      }
    };

    const onKeyUp = (e) => {
      keys.current[e.code] = false;
      if (e.code === "ControlLeft" || e.code === "ControlRight") {
        isCrouching.current = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    const k = keys.current;

    // Determine speed
    let speed = WALK_SPEED;
    if (k["ShiftLeft"] || k["ShiftRight"]) speed = RUN_SPEED;
    if (isCrouching.current) speed = CROUCH_SPEED;

    // Direction vector
    const dir = new THREE.Vector3();
    if (k["KeyW"]) dir.z -= 1;
    if (k["KeyS"]) dir.z += 1;
    if (k["KeyA"]) dir.x -= 1;
    if (k["KeyD"]) dir.x += 1;

    if (dir.length() > 0) {
      dir.normalize();
      dir.applyEuler(
        new THREE.Euler(0, camera.rotation.y, 0, "YXZ")
      );
    }

    // Apply movement
    camera.position.x += dir.x * speed * delta;
    camera.position.z += dir.z * speed * delta;

    // Clamp to tunnel bounds
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      -BOUND_X,
      BOUND_X
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      BOUND_Z_MIN,
      BOUND_Z_MAX
    );

    // Camera height (crouch smoothly)
    const targetY = isCrouching.current ? CROUCH_HEIGHT : STAND_HEIGHT;
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      delta * 8
    );

    // Flashlight follows camera exactly
    if (flashlightRef.current && targetRef.current) {
      flashlightRef.current.position.copy(camera.position);
      const targetPos = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);
      targetRef.current.position.copy(targetPos);
    }

    if (onPositionChange) {
      onPositionChange(camera.position);
    }
  });

  return (
    <>
      <PointerLockControls
        ref={controlsRef}
        onLock={() => setLocked(true)}
        onUnlock={() => setLocked(false)}
      />

      {/* Flashlight — spot attached to camera direction */}
      <spotLight
        ref={flashlightRef}
        visible={flashlightOn}
        color="#e8f0ff"
        intensity={flashlightOn ? 18 : 0}
        distance={22}
        angle={Math.PI / 10}
        penumbra={0.4}
        decay={2}
        castShadow
      />

      {/* Target object for spotlight */}
      <object3D ref={targetRef} />
    </>
  );
}
