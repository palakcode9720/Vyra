import { useState, useEffect, useRef } from "react";

const COUNTDOWN_START = 3 * 60; // 3 minutes in seconds

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function HUD({ onExit, interactionPrompt, messageBanner, hasKey, gameOver, victory, onRestart }) {
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_START);
  const [flashlightPct] = useState(100);
  const [showClickPrompt, setShowClickPrompt] = useState(true);

  // Countdown timer
  const intervalRef = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Hide click prompt once pointer is locked
  useEffect(() => {
    const onLock = () => setShowClickPrompt(false);
    const onUnlock = () => setShowClickPrompt(true);
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("pointerlockchange", onUnlock);
    return () => {
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("pointerlockchange", onUnlock);
    };
  }, []);

  const timerDanger = timeLeft < 60;
  const timerCritical = timeLeft < 20;

  return (
    <div className="hud-overlay">

      {/* Vignette */}
      <div className="hud-vignette" />

      {/* Top-left — flashlight battery & Key Item */}
      <div className="hud-flashlight">
        <span className="hud-label">FLASHLIGHT</span>
        <div className="hud-battery-bar">
          <div
            className="hud-battery-fill"
            style={{ width: `${flashlightPct}%` }}
          />
        </div>
        <span className="hud-label">{flashlightPct}%</span>
        {hasKey && (
          <div className="hud-inventory-key">
            <span>🔑 TUNNEL KEY</span>
          </div>
        )}
      </div>

      {/* Top-right — countdown */}
      <div
        className={`hud-timer ${timerDanger ? "danger" : ""} ${timerCritical ? "critical" : ""}`}
      >
        <span className="hud-label">ESCAPE IN</span>
        <span className="hud-time">{formatTime(timeLeft)}</span>
      </div>

      {/* Interactive prompt banner (e.g. Press E to pick up key) */}
      {interactionPrompt && !gameOver && !victory && (
        <div className="hud-interact-prompt">
          <span className="hud-key-badge">E</span>
          <span>{interactionPrompt}</span>
        </div>
      )}

      {/* Temporary narrative message notification */}
      {messageBanner && !gameOver && !victory && (
        <div className="hud-message-banner">
          <p>{messageBanner}</p>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="hud-modal gameover">
          <h2 className="hud-modal-title">THE INTERVAL CLAIMED YOU</h2>
          <p className="hud-modal-desc">You couldn't escape before it found you.</p>
          <div className="hud-modal-buttons">
            <button className="game-button primary" onClick={onRestart}>RETRY</button>
            <button className="game-button" onClick={onExit}>EXIT TO MENU</button>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {victory && (
        <div className="hud-modal victory">
          <h2 className="hud-modal-title">LEVEL 1 COMPLETE</h2>
          <p className="hud-modal-desc">Nora escaped the tunnel... but The Interval has only just begun.</p>
          <div className="hud-modal-buttons">
            <button className="game-button primary" onClick={onExit}>CONTINUE TO LEVEL 2</button>
          </div>
        </div>
      )}

      {/* Centre — click to play prompt */}
      {showClickPrompt && !gameOver && !victory && (
        <div className="hud-click-prompt">
          <p className="hud-prompt-title">THE INTERVAL</p>
          <p className="hud-prompt-sub">CLICK TO ENTER</p>
          <p className="hud-prompt-hint">W A S D — MOVE &nbsp;|&nbsp; MOUSE — LOOK &nbsp;|&nbsp; E — INTERACT &nbsp;|&nbsp; F — FLASHLIGHT &nbsp;|&nbsp; SHIFT — RUN &nbsp;|&nbsp; CTRL — CROUCH</p>
        </div>
      )}

      {/* Bottom-left — controls reminder (faint) */}
      {!showClickPrompt && !gameOver && !victory && (
        <div className="hud-controls">
          <span>E — INTERACT</span>
          <span>F — FLASHLIGHT</span>
          <span>SHIFT — RUN</span>
          <span>CTRL — CROUCH</span>
        </div>
      )}

      {/* ESC hint */}
      <button className="hud-exit-btn" onClick={onExit}>
        ← EXIT
      </button>
    </div>
  );
}
