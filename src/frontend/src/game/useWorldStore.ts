import { create } from "zustand";
import { BlockType, CHUNK_HEIGHT, CHUNK_SIZE } from "./types";
import { generateChunk } from "./worldGen";

interface WorldState {
  chunks: Map<string, Uint8Array>;
  chunkVersion: Map<string, number>;
  loadChunk: (cx: number, cz: number) => void;
  getBlock: (worldX: number, worldY: number, worldZ: number) => BlockType;
  setBlock: (
    worldX: number,
    worldY: number,
    worldZ: number,
    type: BlockType,
  ) => void;
}

const chunkKey = (cx: number, cz: number) => `${cx},${cz}`;

const worldToChunk = (worldX: number, worldZ: number) => ({
  cx: Math.floor(worldX / CHUNK_SIZE),
  cz: Math.floor(worldZ / CHUNK_SIZE),
  lx: ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
  lz: ((worldZ % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
});

export const useWorldStore = create<WorldState>((set, get) => ({
  chunks: new Map(),
  chunkVersion: new Map(),

  loadChunk: (cx: number, cz: number) => {
    const key = chunkKey(cx, cz);
    if (get().chunks.has(key)) return;
    const data = generateChunk(cx, cz);
    set((state) => {
      const newChunks = new Map(state.chunks);
      const newVersions = new Map(state.chunkVersion);
      newChunks.set(key, data);
      newVersions.set(key, 1);
      return { chunks: newChunks, chunkVersion: newVersions };
    });
  },

  getBlock: (worldX: number, worldY: number, worldZ: number): BlockType => {
    if (worldY < 0 || worldY >= CHUNK_HEIGHT) return BlockType.Air;
    const { cx, cz, lx, lz } = worldToChunk(worldX, worldZ);
    const key = chunkKey(cx, cz);
    const data = get().chunks.get(key);
    if (!data) return BlockType.Air;
    return data[
      lx + lz * CHUNK_SIZE + worldY * CHUNK_SIZE * CHUNK_SIZE
    ] as BlockType;
  },

  setBlock: (
    worldX: number,
    worldY: number,
    worldZ: number,
    type: BlockType,
  ) => {
    if (worldY < 0 || worldY >= CHUNK_HEIGHT) return;
    const { cx, cz, lx, lz } = worldToChunk(worldX, worldZ);
    const key = chunkKey(cx, cz);
    set((state) => {
      const data = state.chunks.get(key);
      if (!data) return {};
      const newData = new Uint8Array(data);
      newData[lx + lz * CHUNK_SIZE + worldY * CHUNK_SIZE * CHUNK_SIZE] = type;
      const newChunks = new Map(state.chunks);
      const newVersions = new Map(state.chunkVersion);
      newChunks.set(key, newData);
      newVersions.set(key, (state.chunkVersion.get(key) ?? 0) + 1);
      return { chunks: newChunks, chunkVersion: newVersions };
    });
  },
}));
