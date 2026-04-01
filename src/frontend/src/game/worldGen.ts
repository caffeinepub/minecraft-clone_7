import { createNoise2D } from "simplex-noise";
import { BlockType, CHUNK_HEIGHT, CHUNK_SIZE } from "./types";

const noise2D = createNoise2D();
const noise2D2 = createNoise2D();

export function generateChunk(chunkX: number, chunkZ: number): Uint8Array {
  const data = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_HEIGHT);

  const setBlock = (x: number, y: number, z: number, type: BlockType) => {
    if (
      x < 0 ||
      x >= CHUNK_SIZE ||
      y < 0 ||
      y >= CHUNK_HEIGHT ||
      z < 0 ||
      z >= CHUNK_SIZE
    )
      return;
    data[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE] = type;
  };

  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      const worldX = chunkX * CHUNK_SIZE + x;
      const worldZ = chunkZ * CHUNK_SIZE + z;

      const n1 = noise2D(worldX * 0.05, worldZ * 0.05);
      const n2 = noise2D2(worldX * 0.01, worldZ * 0.01) * 0.5;
      const noise = (n1 + n2) / 1.5;

      const surfaceHeight = Math.floor(20 + noise * 15);
      const clampedSurface = Math.max(
        1,
        Math.min(CHUNK_HEIGHT - 2, surfaceHeight),
      );

      const isBeach = clampedSurface <= 18;
      const isWater = clampedSurface < 17;

      // Fill terrain
      for (let y = 0; y <= clampedSurface; y++) {
        let blockType: BlockType;
        if (y === 0) {
          blockType = BlockType.Stone;
        } else if (isBeach) {
          if (y === clampedSurface) {
            blockType = BlockType.Sand;
          } else if (y >= clampedSurface - 3) {
            blockType = BlockType.Sand;
          } else {
            blockType = BlockType.Stone;
          }
        } else {
          if (y === clampedSurface) {
            blockType = BlockType.Grass;
          } else if (y >= clampedSurface - 4) {
            blockType = BlockType.Dirt;
          } else {
            blockType = BlockType.Stone;
          }
        }
        setBlock(x, y, z, blockType);
      }

      // Fill water
      if (isWater) {
        for (let y = clampedSurface + 1; y <= 17; y++) {
          setBlock(x, y, z, BlockType.Water);
        }
      }

      // Trees: ~5% chance on grassland
      if (
        !isBeach &&
        clampedSurface > 18 &&
        clampedSurface < CHUNK_HEIGHT - 12
      ) {
        const treeNoise = Math.abs(
          noise2D(worldX * 0.3 + 100, worldZ * 0.3 + 100),
        );
        if (treeNoise > 0.92) {
          const trunkBase = clampedSurface + 1;
          const trunkHeight = 4;
          // Trunk
          for (let y = trunkBase; y < trunkBase + trunkHeight; y++) {
            setBlock(x, y, z, BlockType.Wood);
          }
          // Leaves canopy 3x3x2
          const leafBase = trunkBase + trunkHeight - 1;
          for (let ly = leafBase; ly <= leafBase + 2; ly++) {
            for (let lx = x - 1; lx <= x + 1; lx++) {
              for (let lz = z - 1; lz <= z + 1; lz++) {
                if (
                  lx >= 0 &&
                  lx < CHUNK_SIZE &&
                  lz >= 0 &&
                  lz < CHUNK_SIZE &&
                  ly < CHUNK_HEIGHT
                ) {
                  const idx =
                    lx + lz * CHUNK_SIZE + ly * CHUNK_SIZE * CHUNK_SIZE;
                  if (data[idx] === BlockType.Air) {
                    data[idx] = BlockType.Leaves;
                  }
                }
              }
            }
          }
          // Top leaf
          if (leafBase + 3 < CHUNK_HEIGHT)
            setBlock(x, leafBase + 3, z, BlockType.Leaves);
        }
      }
    }
  }

  return data;
}

export function getBlockInChunk(
  data: Uint8Array,
  x: number,
  y: number,
  z: number,
): BlockType {
  if (
    x < 0 ||
    x >= CHUNK_SIZE ||
    y < 0 ||
    y >= CHUNK_HEIGHT ||
    z < 0 ||
    z >= CHUNK_SIZE
  )
    return BlockType.Air;
  return data[x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE] as BlockType;
}
