import { Suspense, useState, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import TunnelWorld from "./TunnelWorld";
import Player from "./Player";
import Enemy from "./Enemy";
import HUD from "./HUD";
import "./game.css";

// Key position on top of the crates
const KEY_POS = { x: 1.5, z: -8.2 };
// Door position at the end of the tunnel
const DOOR_POS = { x: 0, z: -98.5 };

export default function GameScene({ onExit }) {
  const [hasKey, setHasKey] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [messageBanner, setMessageBanner] = useState("Find the tunnel key to unlock the emergency exit.");
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameKey, setGameKey] = useState(0); // For clean restart

  const playerPosRef = useRef({ x: 0, y: 1.7, z: 0 });

  // Handle position tracking and contextual prompts
  const handlePositionChange = useCallback((pos) => {
    playerPosRef.current = { x: pos.x, y: pos.y, z: pos.z };

    if (gameOver || victory) return;

    // Check distance to key
    const distToKey = Math.hypot(pos.x - KEY_POS.x, pos.z - KEY_POS.z);
    if (!hasKey && distToKey < 2.5) {
      setInteractionPrompt("PICK UP KEY");
      return;
    }

    // Check distance to door
    const distToDoor = Math.hypot(pos.x - DOOR_POS.x, pos.z - DOOR_POS.z);
    if (distToDoor < 3.2) {
      if (!hasKey) {
        setInteractionPrompt("DOOR IS LOCKED (REQUIRES KEY)");
      } else if (!doorOpen) {
        setInteractionPrompt("UNLOCK DOOR");
      } else {
        setInteractionPrompt("ESCAPE TUNNEL");
      }
      return;
    }

    setInteractionPrompt(null);
  }, [hasKey, doorOpen, gameOver, victory]);

  // Handle player pressing E
  const handleInteract = useCallback(() => {
    const pos = playerPosRef.current;

    // Interacting with Key
    const distToKey = Math.hypot(pos.x - KEY_POS.x, pos.z - KEY_POS.z);
    if (!hasKey && distToKey < 2.5) {
      setHasKey(true);
      setMessageBanner("Acquired: EMERGENCY TUNNEL KEY. Proceed to the exit.");
      setInteractionPrompt(null);
      setTimeout(() => setMessageBanner(null), 4000);
      return;
    }

    // Interacting with Door
    const distToDoor = Math.hypot(pos.x - DOOR_POS.x, pos.z - DOOR_POS.z);
    if (distToDoor < 3.2) {
      if (!hasKey) {
        setMessageBanner("The heavy steel door is locked tightly.");
        setTimeout(() => setMessageBanner(null), 3000);
      } else if (!doorOpen) {
        setDoorOpen(true);
        setMessageBanner("The lock clicks open. The passage beyond is clear.");
        setTimeout(() => setMessageBanner(null), 3000);
      } else {
        // Player escapes through the door
        setVictory(true);
      }
    }
  }, [hasKey, doorOpen]);

  const handleCatch = useCallback(() => {
    if (!victory) {
      setGameOver(true);
    }
  }, [victory]);

  const handleRestart = () => {
    setHasKey(false);
    setDoorOpen(false);
    setGameOver(false);
    setVictory(false);
    setInteractionPrompt(null);
    setMessageBanner("Find the tunnel key to unlock the emergency exit.");
    setGameKey((k) => k + 1);
  };

  return (
    <div className="game-scene" key={gameKey}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <TunnelWorld hasKey={hasKey} doorOpen={doorOpen} />
          <Player
            onPositionChange={handlePositionChange}
            onInteract={handleInteract}
          />
          {!victory && !gameOver && (
            <Enemy
              playerPos={playerPosRef.current}
              onCatch={handleCatch}
            />
          )}
        </Suspense>
      </Canvas>

      {/* 2D overlay */}
      <HUD
        onExit={onExit}
        interactionPrompt={interactionPrompt}
        messageBanner={messageBanner}
        hasKey={hasKey}
        gameOver={gameOver}
        victory={victory}
        onRestart={handleRestart}
      />
    </div>
  );
}
