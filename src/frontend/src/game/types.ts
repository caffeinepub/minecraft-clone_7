export enum BlockType {
  Air = 0,
  Grass = 1,
  Dirt = 2,
  Stone = 3,
  Wood = 4,
  Sand = 5,
  Water = 6,
  Leaves = 7,
}

export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.Air]: "transparent",
  [BlockType.Grass]: "#4CAF50",
  [BlockType.Dirt]: "#795548",
  [BlockType.Stone]: "#9E9E9E",
  [BlockType.Wood]: "#6D4C41",
  [BlockType.Sand]: "#FDD835",
  [BlockType.Water]: "#1565C0",
  [BlockType.Leaves]: "#2E7D32",
};

export const BLOCK_THREE_COLORS: Record<BlockType, number> = {
  [BlockType.Air]: 0x000000,
  [BlockType.Grass]: 0x4caf50,
  [BlockType.Dirt]: 0x795548,
  [BlockType.Stone]: 0x9e9e9e,
  [BlockType.Wood]: 0x6d4c41,
  [BlockType.Sand]: 0xfdd835,
  [BlockType.Water]: 0x1565c0,
  [BlockType.Leaves]: 0x2e7d32,
};

export const BLOCK_NAMES: Record<BlockType, string> = {
  [BlockType.Air]: "Air",
  [BlockType.Grass]: "Grass",
  [BlockType.Dirt]: "Dirt",
  [BlockType.Stone]: "Stone",
  [BlockType.Wood]: "Wood",
  [BlockType.Sand]: "Sand",
  [BlockType.Water]: "Water",
  [BlockType.Leaves]: "Leaves",
};

export const PLACEABLE_BLOCKS: BlockType[] = [
  BlockType.Grass,
  BlockType.Dirt,
  BlockType.Stone,
  BlockType.Wood,
  BlockType.Sand,
  BlockType.Water,
];

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 64;
export const RENDER_DISTANCE = 3;

export const isSolid = (type: BlockType): boolean => {
  return type !== BlockType.Air && type !== BlockType.Water;
};

export const isPassable = (type: BlockType): boolean => {
  return type === BlockType.Air || type === BlockType.Water;
};
