import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BlockType, CHUNK_HEIGHT, isPassable, isSolid } from "../game/types";
import { useWorldStore } from "../game/useWorldStore";

interface PlayerProps {
  selectedBlock: BlockType;
  onPositionChange: (x: number, z: number) => void;
}

const PLAYER_WIDTH = 0.6;
const PLAYER_HEIGHT = 1.8;
const PLAYER_HALF_W = PLAYER_WIDTH / 2;
const GRAVITY = -22;
const JUMP_VELOCITY = 9;
const MOVE_SPEED = 5;
const WATER_SPEED = 2.5;
const EYE_HEIGHT = 1.62;
const RAY_STEP = 0.05;
const RAY_MAX = 5;

export function Player({ selectedBlock, onPositionChange }: PlayerProps) {
  const { camera, gl } = useThree();
  const getBlock = useWorldStore((s) => s.getBlock);
  const setBlock = useWorldStore((s) => s.setBlock);

  // Player physics state (all refs for game loop perf)
  const pos = useRef(new THREE.Vector3(8, 45, 8));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const onGround = useRef(false);
  const inWater = useRef(false);

  // Camera look
  const yaw = useRef(0);
  const pitch = useRef(0);
  const pointerLocked = useRef(false);

  // Keys
  const keys = useRef<Record<string, boolean>>({});

  // Block targeting
  const targetBlock = useRef<THREE.Vector3 | null>(null);
  const placeBlock = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const canvas = gl.domElement;

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!pointerLocked.current) return;
      yaw.current -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current = Math.max(
        -Math.PI * 0.47,
        Math.min(Math.PI * 0.47, pitch.current),
      );
    };
    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === canvas;
    };
    const onClick = () => {
      if (!pointerLocked.current) {
        canvas.requestPointerLock();
        return;
      }
      // Left click: break block
      if (targetBlock.current) {
        const tb = targetBlock.current;
        setBlock(
          Math.floor(tb.x),
          Math.floor(tb.y),
          Math.floor(tb.z),
          BlockType.Air,
        );
      }
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (!pointerLocked.current) return;
      // Right click: place block
      if (placeBlock.current) {
        const pb = placeBlock.current;
        const bx = Math.floor(pb.x);
        const by = Math.floor(pb.y);
        const bz = Math.floor(pb.z);
        // Don't place inside player
        const px = pos.current.x;
        const py = pos.current.y;
        const pz = pos.current.z;
        const overlap =
          bx < px + PLAYER_HALF_W &&
          bx + 1 > px - PLAYER_HALF_W &&
          by < py + PLAYER_HEIGHT &&
          by + 1 > py &&
          bz < px + PLAYER_HALF_W &&
          bz + 1 > pz - PLAYER_HALF_W;
        if (!overlap) {
          setBlock(bx, by, bz, selectedBlock);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [gl, setBlock, selectedBlock]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = pos.current;
    const v = vel.current;
    const k = keys.current;

    // Check if in water
    const headBlock = getBlock(
      Math.floor(p.x),
      Math.floor(p.y + EYE_HEIGHT),
      Math.floor(p.z),
    );
    const feetBlock = getBlock(
      Math.floor(p.x),
      Math.floor(p.y),
      Math.floor(p.z),
    );
    inWater.current =
      feetBlock === BlockType.Water || headBlock === BlockType.Water;

    const speed = inWater.current ? WATER_SPEED : MOVE_SPEED;

    // Movement direction from keys
    const moveDir = new THREE.Vector3();
    if (k.KeyW) moveDir.z -= 1;
    if (k.KeyS) moveDir.z += 1;
    if (k.KeyA) moveDir.x -= 1;
    if (k.KeyD) moveDir.x += 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      // Rotate by yaw
      const yawRot = new THREE.Euler(0, yaw.current, 0);
      moveDir.applyEuler(yawRot);
      v.x = moveDir.x * speed;
      v.z = moveDir.z * speed;
    } else {
      v.x *= 0.8;
      v.z *= 0.8;
      if (Math.abs(v.x) < 0.01) v.x = 0;
      if (Math.abs(v.z) < 0.01) v.z = 0;
    }

    // Jump
    if (k.Space) {
      if (onGround.current && !inWater.current) {
        v.y = JUMP_VELOCITY;
        onGround.current = false;
      } else if (inWater.current) {
        v.y = WATER_SPEED * 0.8;
      }
    }

    // Gravity
    if (!inWater.current) {
      v.y += GRAVITY * dt;
    } else {
      v.y *= 0.85;
      if (Math.abs(v.y) < 0.1) v.y = 0;
    }

    // Collisions per axis
    const checkAABB = (nx: number, ny: number, nz: number): boolean => {
      const minX = nx - PLAYER_HALF_W;
      const maxX = nx + PLAYER_HALF_W;
      const minY = ny;
      const maxY = ny + PLAYER_HEIGHT;
      const minZ = nz - PLAYER_HALF_W;
      const maxZ = nz + PLAYER_HALF_W;

      for (let bx = Math.floor(minX); bx <= Math.floor(maxX - 0.001); bx++) {
        for (let by = Math.floor(minY); by <= Math.floor(maxY - 0.001); by++) {
          for (
            let bz = Math.floor(minZ);
            bz <= Math.floor(maxZ - 0.001);
            bz++
          ) {
            if (by < 0 || by >= CHUNK_HEIGHT) continue;
            const block = getBlock(bx, by, bz);
            if (isSolid(block)) return true;
          }
        }
      }
      return false;
    };

    // X axis
    p.x += v.x * dt;
    if (checkAABB(p.x, p.y, p.z)) {
      p.x -= v.x * dt;
      v.x = 0;
    }

    // Y axis
    p.y += v.y * dt;
    if (checkAABB(p.x, p.y, p.z)) {
      if (v.y < 0) {
        onGround.current = true;
      }
      p.y -= v.y * dt;
      // Snap to ground
      if (v.y < 0) {
        const stepSize = 0.05;
        while (checkAABB(p.x, p.y, p.z)) {
          p.y += stepSize;
        }
        p.y = Math.floor(p.y * 20) / 20;
      }
      v.y = 0;
    } else {
      if (v.y < -0.1) onGround.current = false;
    }

    // Z axis
    p.z += v.z * dt;
    if (checkAABB(p.x, p.y, p.z)) {
      p.z -= v.z * dt;
      v.z = 0;
    }

    // Keep above y=0
    if (p.y < 0) {
      p.y = 0;
      v.y = 0;
      onGround.current = true;
    }

    // Update camera position
    camera.position.set(p.x, p.y + EYE_HEIGHT, p.z);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    // Raycast for block targeting
    const rayDir = new THREE.Vector3(0, 0, -1);
    rayDir.applyEuler(camera.rotation);
    rayDir.normalize();

    const rayOrigin = camera.position.clone();
    let hit = false;
    let lastEmpty: THREE.Vector3 | null = null;

    for (let t = 0; t < RAY_MAX; t += RAY_STEP) {
      const rx = rayOrigin.x + rayDir.x * t;
      const ry = rayOrigin.y + rayDir.y * t;
      const rz = rayOrigin.z + rayDir.z * t;
      const bx = Math.floor(rx);
      const by = Math.floor(ry);
      const bz = Math.floor(rz);
      const block = getBlock(bx, by, bz);
      if (isSolid(block)) {
        targetBlock.current = new THREE.Vector3(bx, by, bz);
        placeBlock.current = lastEmpty;
        hit = true;
        break;
      }
      lastEmpty = new THREE.Vector3(bx, by, bz);
    }
    if (!hit) {
      targetBlock.current = null;
      placeBlock.current = null;
    }

    onPositionChange(p.x, p.z);
  });

  // Block highlight
  return (
    <>
      <BlockHighlight targetBlock={targetBlock} />
    </>
  );
}

function BlockHighlight({
  targetBlock,
}: {
  targetBlock: React.RefObject<THREE.Vector3 | null>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const tb = targetBlock.current;
    if (tb) {
      mesh.visible = true;
      mesh.position.set(tb.x + 0.5, tb.y + 0.5, tb.z + 0.5);
    } else {
      mesh.visible = false;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.02, 1.02, 1.02]} />
      <meshBasicMaterial color="#000000" wireframe />
    </mesh>
  );
}
