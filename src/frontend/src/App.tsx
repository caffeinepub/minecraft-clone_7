import { Sky, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { Animals } from "./components/Animals";
import { Crosshair } from "./components/Crosshair";
import { HealthBar } from "./components/HealthBar";
import { Player } from "./components/Player";
import { PlayerHand } from "./components/PlayerHand";
import { Toolbar } from "./components/Toolbar";
import { World } from "./components/World";
import { BlockType } from "./game/types";

function DayNight() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const timeRef = useRef(0.25); // start at noon

  useFrame((_, delta) => {
    timeRef.current = (timeRef.current + delta * 0.004) % 1;
    if (!lightRef.current || !ambientRef.current) return;
    const angle = timeRef.current * Math.PI * 2;
    const sunX = Math.cos(angle) * 100;
    const sunY = Math.sin(angle) * 100;
    lightRef.current.position.set(sunX, sunY, 50);
    const dayFactor = Math.max(0, Math.sin(angle));
    lightRef.current.intensity = dayFactor * 1.5;
    ambientRef.current.intensity = 0.15 + dayFactor * 0.5;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />
      <directionalLight
        ref={lightRef}
        position={[100, 80, 50]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function WorldManager({ selectedBlock }: { selectedBlock: BlockType }) {
  const [playerPos, setPlayerPos] = useState({ x: 8, z: 8 });

  return (
    <>
      <World playerX={playerPos.x} playerZ={playerPos.z} />
      <Player
        selectedBlock={selectedBlock}
        onPositionChange={(x, z) => setPlayerPos({ x, z })}
      />
      <Animals />
      <PlayerHand selectedBlock={selectedBlock} />
    </>
  );
}

function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(180deg, #0d1117 0%, #1a2a1a 50%, #0f2d0f 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "white",
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h1
          style={{
            fontSize: 58,
            fontWeight: 900,
            letterSpacing: 4,
            margin: 0,
            textShadow: "4px 4px 0 #2d5a27, 8px 8px 0 #1a3316",
            color: "#6bde5a",
          }}
        >
          VOXELCRAFT
        </h1>
        <p
          style={{
            color: "#88aa88",
            fontSize: 13,
            marginTop: 8,
            letterSpacing: 2,
          }}
        >
          3D Blocks • Animals • Day/Night Cycle
        </p>
      </div>

      {/* Block preview */}
      <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
        {[
          { color: "#5a9e3a", label: "Grass" },
          { color: "#8B6040", label: "Dirt" },
          { color: "#888888", label: "Stone" },
          { color: "#8B6914", label: "Wood" },
          { color: "#e8d080", label: "Sand" },
          { color: "#1a6eb5", label: "Water" },
        ].map(({ color, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: color,
                borderRadius: 4,
                border: "2px solid rgba(255,255,255,0.25)",
                boxShadow: `0 0 10px ${color}55`,
                imageRendering: "pixelated",
              }}
            />
            <span style={{ fontSize: 9, color: "#88aa88", letterSpacing: 1 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Animal icons */}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 28,
          marginBottom: 4,
        }}
      >
        <span title="Cow">🐄</span>
        <span title="Pig">🐷</span>
        <span title="Chicken">🐔</span>
        <span title="Sheep">🐑</span>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "14px 26px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 24px",
          fontSize: 12,
          color: "#aaccaa",
          maxWidth: 340,
        }}
      >
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            WASD
          </kbd>{" "}
          Move
        </span>
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            Mouse
          </kbd>{" "}
          Look
        </span>
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            Space
          </kbd>{" "}
          Jump
        </span>
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            LMB
          </kbd>{" "}
          Break
        </span>
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            RMB
          </kbd>{" "}
          Place
        </span>
        <span>
          <kbd
            style={{
              background: "rgba(255,255,255,0.12)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            1–6
          </kbd>{" "}
          Select
        </span>
      </div>

      <button
        type="button"
        data-ocid="start.primary_button"
        onClick={onStart}
        style={{
          marginTop: 8,
          padding: "14px 52px",
          fontSize: 18,
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: 3,
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          boxShadow: "0 4px 0 #2d7a32, 0 0 24px #4CAF5066",
          transition: "all 0.1s ease",
          textTransform: "uppercase",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 6px 0 #2d7a32, 0 0 32px #4CAF5088";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 4px 0 #2d7a32, 0 0 24px #4CAF5066";
        }}
      >
        Play Now
      </button>

      <p style={{ color: "#446644", fontSize: 11, marginTop: 4 }}>
        Click Play — then click canvas to lock mouse cursor
      </p>

      <footer
        style={{
          position: "absolute",
          bottom: 16,
          color: "#334433",
          fontSize: 11,
        }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          style={{ color: "#446644" }}
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(
    BlockType.Grass,
  );
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const blockMap: Record<string, BlockType> = {
      "1": BlockType.Grass,
      "2": BlockType.Dirt,
      "3": BlockType.Stone,
      "4": BlockType.Wood,
      "5": BlockType.Sand,
      "6": BlockType.Water,
    };
    const handler = (e: KeyboardEvent) => {
      if (blockMap[e.key] !== undefined) setSelectedBlock(blockMap[e.key]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#87CEEB",
        overflow: "hidden",
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ fov: 75, near: 0.1, far: 500 }}
        gl={{ antialias: false }}
      >
        <Sky sunPosition={[100, 80, 100]} turbidity={0.5} rayleigh={0.5} />
        <Stars radius={300} depth={50} count={3000} factor={4} fade />
        <fog attach="fog" args={["#87CEEB", 60, 220]} />
        <DayNight />
        <WorldManager selectedBlock={selectedBlock} />
      </Canvas>

      <Crosshair />
      <HealthBar health={20} />
      <Toolbar selectedBlock={selectedBlock} onSelect={setSelectedBlock} />

      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          color: "rgba(255,255,255,0.8)",
          fontSize: 11,
          fontFamily: "monospace",
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: 6,
          lineHeight: 1.8,
          pointerEvents: "none",
          zIndex: 100,
          backdropFilter: "blur(4px)",
        }}
      >
        <div>WASD — Move</div>
        <div>Space — Jump</div>
        <div>LMB — Break Block</div>
        <div>RMB — Place Block</div>
        <div>1-6 — Select Block</div>
        <div
          style={{ marginTop: 4, color: "rgba(255,255,255,0.4)", fontSize: 9 }}
        >
          Click canvas to lock cursor
        </div>
      </div>

      <footer
        style={{
          position: "fixed",
          bottom: 4,
          right: 12,
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          fontFamily: "monospace",
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          style={{ color: "rgba(255,255,255,0.5)", pointerEvents: "auto" }}
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
