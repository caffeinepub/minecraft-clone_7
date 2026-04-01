import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { BLOCK_ATLAS, getAtlasTexture, tileUV } from "../game/textures";
import { BlockType, CHUNK_HEIGHT, CHUNK_SIZE } from "../game/types";
import { useWorldStore } from "../game/useWorldStore";

interface ChunkProps {
  chunkX: number;
  chunkZ: number;
}

const FACES = [
  {
    dir: [1, 0, 0] as [number, number, number],
    normal: [1, 0, 0] as [number, number, number],
    verts: [
      [1, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ] as [number, number, number][],
    faceKey: "side" as const,
  },
  {
    dir: [-1, 0, 0] as [number, number, number],
    normal: [-1, 0, 0] as [number, number, number],
    verts: [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
      [0, 0, 0],
    ] as [number, number, number][],
    faceKey: "side" as const,
  },
  {
    dir: [0, 1, 0] as [number, number, number],
    normal: [0, 1, 0] as [number, number, number],
    verts: [
      [0, 1, 0],
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ] as [number, number, number][],
    faceKey: "top" as const,
  },
  {
    dir: [0, -1, 0] as [number, number, number],
    normal: [0, -1, 0] as [number, number, number],
    verts: [
      [0, 0, 1],
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
    ] as [number, number, number][],
    faceKey: "bottom" as const,
  },
  {
    dir: [0, 0, 1] as [number, number, number],
    normal: [0, 0, 1] as [number, number, number],
    verts: [
      [1, 0, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
    ] as [number, number, number][],
    faceKey: "side" as const,
  },
  {
    dir: [0, 0, -1] as [number, number, number],
    normal: [0, 0, -1] as [number, number, number],
    verts: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ] as [number, number, number][],
    faceKey: "side" as const,
  },
];

function buildChunkGeometry(
  data: Uint8Array,
  getBlock: (wx: number, wy: number, wz: number) => BlockType,
  chunkX: number,
  chunkZ: number,
  waterOnly: boolean,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const worldOffX = chunkX * CHUNK_SIZE;
  const worldOffZ = chunkZ * CHUNK_SIZE;

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      for (let y = 0; y < CHUNK_HEIGHT; y++) {
        const blockType = data[
          x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE
        ] as BlockType;

        if (blockType === BlockType.Air) continue;

        const isWaterBlock = blockType === BlockType.Water;
        if (waterOnly !== isWaterBlock) continue;

        const atlasConfig = BLOCK_ATLAS[blockType];
        if (!atlasConfig) continue;

        for (const face of FACES) {
          const [dx, dy, dz] = face.dir;
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;

          let neighborType: BlockType;
          if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
            neighborType = getBlock(worldOffX + nx, ny, worldOffZ + nz);
          } else if (ny < 0 || ny >= CHUNK_HEIGHT) {
            neighborType = BlockType.Air;
          } else {
            neighborType = data[
              nx + nz * CHUNK_SIZE + ny * CHUNK_SIZE * CHUNK_SIZE
            ] as BlockType;
          }

          const showFace = isWaterBlock
            ? neighborType === BlockType.Air
            : neighborType === BlockType.Air ||
              neighborType === BlockType.Water;

          if (!showFace) continue;

          const tilePos = atlasConfig[face.faceKey];
          const [col, row] = tilePos;
          const [u0, u1, vBot, vTop] = tileUV(col, row);

          const base = positions.length / 3;

          for (const [vx, vy, vz] of face.verts) {
            positions.push(x + vx, y + vy, z + vz);
            normals.push(...face.normal);
          }

          uvs.push(u0, vBot, u0, vTop, u1, vTop, u1, vBot);
          indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

export function Chunk({ chunkX, chunkZ }: ChunkProps) {
  const chunks = useWorldStore((s) => s.chunks);
  const chunkVersion = useWorldStore((s) => s.chunkVersion);
  const getBlock = useWorldStore((s) => s.getBlock);

  const key = `${chunkX},${chunkZ}`;
  const data = chunks.get(key);
  const version = chunkVersion.get(key) ?? 0;

  const atlas = useMemo(() => getAtlasTexture(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getBlock is stable reference
  const solidGeo = useMemo(() => {
    if (!data) return null;
    return buildChunkGeometry(data, getBlock, chunkX, chunkZ, false);
  }, [data, version, chunkX, chunkZ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getBlock is stable reference
  const waterGeo = useMemo(() => {
    if (!data) return null;
    return buildChunkGeometry(data, getBlock, chunkX, chunkZ, true);
  }, [data, version, chunkX, chunkZ]);

  useEffect(() => {
    return () => {
      solidGeo?.dispose();
      waterGeo?.dispose();
    };
  }, [solidGeo, waterGeo]);

  if (!data) return null;

  return (
    <group position={[chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE]}>
      {(solidGeo?.index?.count ?? 0) > 0 && (
        <mesh geometry={solidGeo!} castShadow receiveShadow>
          <meshLambertMaterial map={atlas} />
        </mesh>
      )}
      {(waterGeo?.index?.count ?? 0) > 0 && (
        <mesh geometry={waterGeo!}>
          <meshLambertMaterial
            map={atlas}
            transparent
            opacity={0.75}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
