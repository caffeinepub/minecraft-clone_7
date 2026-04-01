import * as THREE from "three";

// Atlas layout: 4 columns x 4 rows, each tile 16x16, total 64x64
// Row 0: grassTop(0,0), grassSide(1,0), dirt(2,0), stone(3,0)
// Row 1: woodTop(0,1), woodSide(1,1), sand(2,1), water(3,1)
// Row 2: leaves(0,2)

function rnd(max: number): number {
  return Math.floor(Math.random() * max);
}

function drawGrassTop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#5a9e3a";
  ctx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = "#4a8a2a";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "#6ab84a";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
}

function drawGrassSide(ctx: CanvasRenderingContext2D) {
  // Top 4 rows: green
  ctx.fillStyle = "#5a9e3a";
  ctx.fillRect(0, 0, 16, 4);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#4a8a2a" : "#6ab84a";
    ctx.fillRect(rnd(16), rnd(4), 1, 1);
  }
  // Bottom 12 rows: dirt
  ctx.fillStyle = "#8B6040";
  ctx.fillRect(0, 4, 16, 12);
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#7a5535" : "#9c7050";
    ctx.fillRect(rnd(16), 4 + rnd(12), 1, 1);
  }
}

function drawDirt(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#8B6040";
  ctx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#7a5535" : "#9c7050";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
}

function drawStone(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#888888";
  ctx.fillRect(0, 0, 16, 16);
  // Crack lines
  ctx.fillStyle = "#666666";
  ctx.fillRect(3, 0, 1, 6);
  ctx.fillRect(3, 5, 5, 1);
  ctx.fillRect(10, 8, 1, 8);
  ctx.fillRect(7, 8, 4, 1);
  // Lighter patches
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
}

function drawWoodSide(ctx: CanvasRenderingContext2D) {
  // Vertical wood grain stripes
  for (let x = 0; x < 16; x++) {
    ctx.fillStyle =
      x % 3 === 0 ? "#7a5c10" : x % 3 === 1 ? "#8B6914" : "#9c7a1a";
    ctx.fillRect(x, 0, 1, 16);
  }
  // Knot pixels
  const knots = [
    [4, 5],
    [4, 6],
    [5, 5],
    [11, 10],
    [11, 11],
    [12, 10],
  ];
  for (const [kx, ky] of knots) {
    ctx.fillStyle = "#5a4010";
    ctx.fillRect(kx, ky, 1, 1);
  }
}

function drawWoodTop(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#a07820";
  ctx.fillRect(0, 0, 16, 16);
  // Concentric rings
  ctx.fillStyle = "#8B6914";
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    for (const r of [3, 5, 7]) {
      const px = Math.round(8 + Math.cos(angle) * r);
      const py = Math.round(8 + Math.sin(angle) * r);
      if (px >= 0 && px < 16 && py >= 0 && py < 16) {
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
}

function drawSand(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#e8d080";
  ctx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 25; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#d4bc6c" : "#f0e090";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
}

function drawWater(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#1a6eb5";
  ctx.fillRect(0, 0, 16, 16);
  // Wavy lines
  ctx.fillStyle = "#2a88d5";
  for (let x = 0; x < 16; x++) {
    ctx.fillRect(x, 4 + Math.round(Math.sin(x * 0.8) * 1.5), 1, 2);
    ctx.fillRect(x, 11 + Math.round(Math.sin(x * 0.8 + 2) * 1.5), 1, 2);
  }
  // Highlights
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = "#4aaae8";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
}

function drawLeaves(ctx: CanvasRenderingContext2D) {
  // Some transparent holes
  ctx.clearRect(0, 0, 16, 16);
  ctx.fillStyle = "#2d8a1a";
  ctx.fillRect(0, 0, 16, 16);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle =
      i % 3 === 0 ? "#1e6e10" : i % 3 === 1 ? "#3aaa22" : "#2d8a1a";
    ctx.fillRect(rnd(16), rnd(16), 1, 1);
  }
  // Dark holes
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(rnd(14), rnd(14), 2, 2);
  }
}

function makeCanvas(
  draw: (ctx: CanvasRenderingContext2D) => void,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  return canvas;
}

let _atlasTexture: THREE.CanvasTexture | null = null;

export function getAtlasTexture(): THREE.CanvasTexture {
  if (_atlasTexture) return _atlasTexture;

  const atlas = document.createElement("canvas");
  atlas.width = 64;
  atlas.height = 64;
  const ctx = atlas.getContext("2d")!;

  const tiles: Array<[number, number, (c: CanvasRenderingContext2D) => void]> =
    [
      [0, 0, drawGrassTop],
      [1, 0, drawGrassSide],
      [2, 0, drawDirt],
      [3, 0, drawStone],
      [0, 1, drawWoodTop],
      [1, 1, drawWoodSide],
      [2, 1, drawSand],
      [3, 1, drawWater],
      [0, 2, drawLeaves],
    ];

  for (const [col, row, drawFn] of tiles) {
    const tileCanvas = makeCanvas(drawFn);
    ctx.drawImage(tileCanvas, col * 16, row * 16);
  }

  const tex = new THREE.CanvasTexture(atlas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  _atlasTexture = tex;
  return tex;
}

// Tile UV: [u0, u1, v_bot, v_top]
// In canvas: row 0 is top. In Three.js UV: v=1 is top.
// v_top = 1 - row/4, v_bot = 1 - (row+1)/4
export function tileUV(
  col: number,
  row: number,
): [number, number, number, number] {
  const S = 4;
  return [col / S, (col + 1) / S, 1 - (row + 1) / S, 1 - row / S];
}

// Atlas tile coords [col, row] for each block face
import { BlockType } from "./types";

export type AtlasFaceConfig = {
  top: [number, number];
  bottom: [number, number];
  side: [number, number];
};

export const BLOCK_ATLAS: Partial<Record<BlockType, AtlasFaceConfig>> = {
  [BlockType.Grass]: { top: [0, 0], bottom: [2, 0], side: [1, 0] },
  [BlockType.Dirt]: { top: [2, 0], bottom: [2, 0], side: [2, 0] },
  [BlockType.Stone]: { top: [3, 0], bottom: [3, 0], side: [3, 0] },
  [BlockType.Wood]: { top: [0, 1], bottom: [0, 1], side: [1, 1] },
  [BlockType.Sand]: { top: [2, 1], bottom: [2, 1], side: [2, 1] },
  [BlockType.Water]: { top: [3, 1], bottom: [3, 1], side: [3, 1] },
  [BlockType.Leaves]: { top: [0, 2], bottom: [0, 2], side: [0, 2] },
};
