import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { BLOCK_ATLAS, getAtlasTexture, tileUV } from "../game/textures";
import type { BlockType } from "../game/types";

interface PlayerHandProps {
  selectedBlock: BlockType;
}

export function PlayerHand({ selectedBlock }: PlayerHandProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const atlas = getAtlasTexture();

  // Create a small block texture from atlas for the held block
  const atlasConfig = BLOCK_ATLAS[selectedBlock];
  const topTile = atlasConfig?.top ?? [0, 0];
  const [u0, u1, vBot, vTop] = tileUV(topTile[0], topTile[1]);

  // Build a simple colored material using atlas
  const blockMat = useRef<THREE.MeshLambertMaterial | null>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const bob = Math.sin(Date.now() * 0.003) * 0.015;

    // Position the group in camera space
    const offset = new THREE.Vector3(0.38, -0.32 + bob, -0.6);
    offset.applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.rotation.copy(camera.rotation);
    groupRef.current.rotateX(0.2);
    groupRef.current.rotateY(-0.3);
    groupRef.current.rotateZ(0.05);
  });

  // UV region for block face display
  const uvOffset = new THREE.Vector2(u0, vBot);
  const uvRepeat = new THREE.Vector2(u1 - u0, vTop - vBot);

  return (
    <group ref={groupRef}>
      {/* Arm */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshLambertMaterial color="#d4956a" />
      </mesh>
      {/* Block in hand */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshLambertMaterial
          ref={blockMat}
          map={atlas}
          map-offset={uvOffset}
          map-repeat={uvRepeat}
        />
      </mesh>
    </group>
  );
}
