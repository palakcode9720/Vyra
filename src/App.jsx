
import { useState, lazy, Suspense } from "react";
import "./App.css";

const GameScene = lazy(() => import("./game/GameScene"));

const characters = [
  {
    id: "nora",
    name: "NORA",
    role: "THE OBSERVER",
    description: "She notices what everyone else overlooks.",
    status: "FREE",
    unlocked: true,
  },
  {
    id: "kai",
    name: "KAI",
    role: "THE UNKNOWN",
    description: "A friendly face can hide the darkest secrets.",
    status: "DIAMOND UNLOCK",
    unlocked: false,
  },
  {
    id: "mira",
    name: "MIRA",
    role: "THE STRATEGIST",
    description: "Every move has a reason. Every silence has a meaning.",
    status: "DIAMOND UNLOCK",
    unlocked: false,
  },
  {
    id: "ren",
    name: "REN",
    role: "THE REMEMBERED",
    description: "He knows something about this world. Something he shouldn't.",
    status: "PREMIUM",
    unlocked: false,
  },
];

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedCharacter, setSelectedCharacter] = useState("nora");

  const chooseCharacter = (character) => {
    if (!character.unlocked) {
      alert(`${character.name} is currently locked.`);
      return;
    }

    setSelectedCharacter(character.id);
  };

  return (
    <main className="game-container">

      {/* Full-screen 3D game — render outside normal flow */}
      {screen === "game" && (
        <Suspense fallback={null}>
          <GameScene onExit={() => setScreen("intro")} />
        </Suspense>
      )}

      {screen !== "game" && screen === "home" && (
        <section className="home-screen">
          <div className="background-overlay"></div>

          <div className="home-content">
            <p className="eyebrow">WELCOME TO THE INTERVAL</p>
            <h1 className="game-title">VYRA</h1>

            <p className="tagline">
              EVERY GAME HAS A PRICE.
              <br />
              EVERY SECRET HAS A COST.
            </p>

            <div className="home-buttons">
              <button
                className="game-button primary"
                onClick={() => setScreen("characters")}
              >
                NEW GAME
              </button>

              <button
                className="game-button"
                onClick={() => alert("No saved game found yet.")}
              >
                CONTINUE
              </button>

              <button
                className="game-button"
                onClick={() => setScreen("settings")}
              >
                SETTINGS
              </button>
            </div>
          </div>

          <p className="bottom-text">
            SEVEN GAMES. FOUR STORIES. ONE TRUTH.
          </p>
        </section>
      )}

      {screen === "characters" && (
        <section className="character-screen">
          <div className="character-overlay"></div>

          <div className="character-content">
            <p className="chapter-label">THE INTERVAL AWAITS</p>
            <h1>CHOOSE YOUR STORY</h1>

            <p className="character-subtitle">
              FOUR PEOPLE. FOUR DIFFERENT TRUTHS.
              <br />
              WHOSE STORY WILL YOU DISCOVER?
            </p>

            <div className="character-grid">
              {characters.map((character) => (
                <button
                  key={character.id}
                  className={`character-card ${selectedCharacter === character.id ? "selected" : ""
                    } ${!character.unlocked ? "locked" : ""}`}
                  onClick={() => chooseCharacter(character)}
                >
                  <span className="character-status">
                    {character.status}
                  </span>

                  <span className="character-symbol">
                    {character.id === "nora" && "◇"}
                    {character.id === "kai" && "♠"}
                    {character.id === "mira" && "♢"}
                    {character.id === "ren" && "♜"}
                  </span>

                  <span className="character-name">
                    {character.name}
                  </span>

                  <span className="character-role">
                    {character.role}
                  </span>

                  <span className="character-description">
                    {character.description}
                  </span>

                  {selectedCharacter === character.id && (
                    <span className="selected-label">
                      SELECTED
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="game-button primary continue-button"
              onClick={() => setScreen("intro")}
            >
              BEGIN STORY
            </button>

            <button
              className="game-button back-button"
              onClick={() => setScreen("home")}
            >
              BACK
            </button>
          </div>
        </section>
      )}

      {screen === "intro" && (
        <section className="intro-screen">
          <p className="chapter-label">PROLOGUE</p>
          <h2>11:11 PM</h2>

          <div className="story-text">
            <p>The city was unusually quiet that night.</p>
            <p>
              Nora walked through the empty streets,
              unaware that her life was about to change.
            </p>
            <p>A strange tunnel stood ahead.</p>
            <p className="highlight">
              And then, the world went dark.
            </p>
          </div>

          <button
            className="game-button primary"
            onClick={() => setScreen("game")}
          >
            ENTER THE INTERVAL
          </button>

          <button
            className="game-button"
            onClick={() => setScreen("characters")}
          >
            BACK
          </button>
        </section>
      )}

      {screen === "settings" && (
        <section className="intro-screen">
          <p className="chapter-label">VYRA</p>
          <h2>SETTINGS</h2>
          <p className="story-text">
            Audio, display and gameplay settings will be available here.
          </p>

          <button
            className="game-button"
            onClick={() => setScreen("home")}
          >
            BACK
          </button>
        </section>
      )}

    </main>
  );
}

export default App;
