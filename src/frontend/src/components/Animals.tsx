import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useReducer, useRef } from "react";
import { BlockType } from "../game/types";
import { useWorldStore } from "../game/useWorldStore";

interface Animal {
  id: number;
  type: "cow" | "pig" | "chicken" | "sheep";
  position: [number, number, number];
  rotation: number;
  moveDir: [number, number];
  moveTimer: number;
  isMoving: boolean;
}

function getGroundY(
  getBlock: (wx: number, wy: number, wz: number) => BlockType,
  x: number,
  z: number,
): number {
  const wx = Math.floor(x);
  const wz = Math.floor(z);
  for (let y = 50; y >= 0; y--) {
    const b = getBlock(wx, y, wz);
    if (b !== BlockType.Air && b !== BlockType.Water) {
      return y + 1;
    }
  }
  return 20;
}

function initAnimals(): Animal[] {
  const animals: Animal[] = [];
  let id = 0;

  const spawnTypes: Array<{ type: Animal["type"]; count: number }> = [
    { type: "cow", count: 3 },
    { type: "pig", count: 4 },
    { type: "chicken", count: 5 },
    { type: "sheep", count: 3 },
  ];

  for (const { type, count } of spawnTypes) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 24;
      const x = 8 + Math.cos(angle) * radius;
      const z = 8 + Math.sin(angle) * radius;
      animals.push({
        id: id++,
        type,
        position: [x, 35, z],
        rotation: Math.random() * Math.PI * 2,
        moveDir: [0, 0],
        moveTimer: Math.random() * 3,
        isMoving: false,
      });
    }
  }
  return animals;
}

function CowModel() {
  return (
    <group>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.7]} />
        <meshLambertMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0.3, 1.15, 0.36]}>
        <boxGeometry args={[0.5, 0.6, 0.02]} />
        <meshLambertMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 1.65, 0.55]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshLambertMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[0, 1.52, 0.87]}>
        <boxGeometry args={[0.35, 0.22, 0.15]} />
        <meshLambertMaterial color="#e8d0c0" />
      </mesh>
      {/* Legs: fl, fr, bl, br */}
      <mesh position={[-0.45, 0.35, 0.2]}>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshLambertMaterial color="#7a5a2a" />
      </mesh>
      <mesh position={[0.45, 0.35, 0.2]}>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshLambertMaterial color="#7a5a2a" />
      </mesh>
      <mesh position={[-0.45, 0.35, -0.2]}>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshLambertMaterial color="#7a5a2a" />
      </mesh>
      <mesh position={[0.45, 0.35, -0.2]}>
        <boxGeometry args={[0.25, 0.7, 0.25]} />
        <meshLambertMaterial color="#7a5a2a" />
      </mesh>
    </group>
  );
}

function PigModel() {
  return (
    <group>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.0, 0.7, 0.6]} />
        <meshLambertMaterial color="#f4a460" />
      </mesh>
      <mesh position={[0, 1.3, 0.42]}>
        <boxGeometry args={[0.55, 0.55, 0.5]} />
        <meshLambertMaterial color="#f4a460" />
      </mesh>
      <mesh position={[0, 1.2, 0.69]}>
        <boxGeometry args={[0.3, 0.2, 0.15]} />
        <meshLambertMaterial color="#ffb6c1" />
      </mesh>
      <mesh position={[-0.22, 1.62, 0.42]}>
        <boxGeometry args={[0.18, 0.18, 0.1]} />
        <meshLambertMaterial color="#e8907a" />
      </mesh>
      <mesh position={[0.22, 1.62, 0.42]}>
        <boxGeometry args={[0.18, 0.18, 0.1]} />
        <meshLambertMaterial color="#e8907a" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.3, 0.18, 0.18]}>
        <boxGeometry args={[0.2, 0.35, 0.2]} />
        <meshLambertMaterial color="#e8956a" />
      </mesh>
      <mesh position={[0.3, 0.18, 0.18]}>
        <boxGeometry args={[0.2, 0.35, 0.2]} />
        <meshLambertMaterial color="#e8956a" />
      </mesh>
      <mesh position={[-0.3, 0.18, -0.18]}>
        <boxGeometry args={[0.2, 0.35, 0.2]} />
        <meshLambertMaterial color="#e8956a" />
      </mesh>
      <mesh position={[0.3, 0.18, -0.18]}>
        <boxGeometry args={[0.2, 0.35, 0.2]} />
        <meshLambertMaterial color="#e8956a" />
      </mesh>
    </group>
  );
}

function ChickenModel() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshLambertMaterial color="#f8f8f8" />
      </mesh>
      <mesh position={[-0.28, 0.6, 0]}>
        <boxGeometry args={[0.05, 0.25, 0.4]} />
        <meshLambertMaterial color="#e8e0c8" />
      </mesh>
      <mesh position={[0.28, 0.6, 0]}>
        <boxGeometry args={[0.05, 0.25, 0.4]} />
        <meshLambertMaterial color="#e8e0c8" />
      </mesh>
      <mesh position={[0, 0.9, 0.28]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshLambertMaterial color="#f8f8f8" />
      </mesh>
      <mesh position={[0, 0.87, 0.46]}>
        <boxGeometry args={[0.1, 0.1, 0.15]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0, 1.1, 0.28]}>
        <boxGeometry args={[0.12, 0.15, 0.1]} />
        <meshLambertMaterial color="#cc0000" />
      </mesh>
      <mesh position={[-0.1, 0.18, 0]}>
        <boxGeometry args={[0.08, 0.36, 0.08]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
      <mesh position={[0.1, 0.18, 0]}>
        <boxGeometry args={[0.08, 0.36, 0.08]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

function SheepModel() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.0, 0.8, 0.65]} />
        <meshLambertMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[0, 1.4, 0.42]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshLambertMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 1.65, 0.38]}>
        <boxGeometry args={[0.38, 0.2, 0.3]} />
        <meshLambertMaterial color="#e0e0e0" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.3, 0.23, 0.18]}>
        <boxGeometry args={[0.15, 0.45, 0.15]} />
        <meshLambertMaterial color="#777777" />
      </mesh>
      <mesh position={[0.3, 0.23, 0.18]}>
        <boxGeometry args={[0.15, 0.45, 0.15]} />
        <meshLambertMaterial color="#777777" />
      </mesh>
      <mesh position={[-0.3, 0.23, -0.18]}>
        <boxGeometry args={[0.15, 0.45, 0.15]} />
        <meshLambertMaterial color="#777777" />
      </mesh>
      <mesh position={[0.3, 0.23, -0.18]}>
        <boxGeometry args={[0.15, 0.45, 0.15]} />
        <meshLambertMaterial color="#777777" />
      </mesh>
    </group>
  );
}

const ANIMAL_SPEED: Record<Animal["type"], number> = {
  cow: 1.5,
  pig: 1.5,
  sheep: 1.4,
  chicken: 1.0,
};

const ANIMAL_LABELS: Record<Animal["type"], string> = {
  cow: "Cow",
  pig: "Pig",
  chicken: "Chicken",
  sheep: "Sheep",
};

function AnimalModel({ type }: { type: Animal["type"] }) {
  if (type === "cow") return <CowModel />;
  if (type === "pig") return <PigModel />;
  if (type === "chicken") return <ChickenModel />;
  return <SheepModel />;
}

export function Animals() {
  const animalsRef = useRef<Animal[]>(initAnimals());
  const getBlock = useWorldStore((s) => s.getBlock);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const frameCount = useRef(0);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.05);
    for (const animal of animalsRef.current) {
      animal.moveTimer -= dt;
      if (animal.moveTimer <= 0) {
        const r = Math.random();
        if (r < 0.3) {
          animal.isMoving = false;
          animal.moveDir = [0, 0];
          animal.moveTimer = 1 + Math.random() * 2;
        } else {
          animal.isMoving = true;
          const angle = Math.random() * Math.PI * 2;
          animal.moveDir = [Math.cos(angle), Math.sin(angle)];
          animal.rotation = angle;
          animal.moveTimer = 2 + Math.random() * 3;
        }
      }

      if (animal.isMoving) {
        const speed = ANIMAL_SPEED[animal.type];
        const [mx, mz] = animal.moveDir;
        animal.position[0] += mx * speed * dt;
        animal.position[2] += mz * speed * dt;
        animal.position[0] = Math.max(-80, Math.min(80, animal.position[0]));
        animal.position[2] = Math.max(-80, Math.min(80, animal.position[2]));
      }

      const groundY = getGroundY(
        getBlock,
        animal.position[0],
        animal.position[2],
      );
      animal.position[1] = groundY;
    }

    frameCount.current++;
    if (frameCount.current % 3 === 0) forceUpdate();
  });

  return (
    <>
      {animalsRef.current.map((animal) => (
        <group
          key={animal.id}
          position={animal.position}
          rotation={[0, animal.rotation, 0]}
        >
          <AnimalModel type={animal.type} />
          <Html position={[0, 2.4, 0]} center distanceFactor={10} occlude>
            <div
              style={{
                color: "white",
                background: "rgba(0,0,0,0.55)",
                padding: "2px 7px",
                borderRadius: 3,
                fontSize: 11,
                whiteSpace: "nowrap",
                fontFamily: "monospace",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {ANIMAL_LABELS[animal.type]}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}
