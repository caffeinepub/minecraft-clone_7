import { useEffect } from "react";
import { CHUNK_SIZE, RENDER_DISTANCE } from "../game/types";
import { useWorldStore } from "../game/useWorldStore";
import { Chunk } from "./Chunk";

interface WorldProps {
  playerX: number;
  playerZ: number;
}

export function World({ playerX, playerZ }: WorldProps) {
  const loadChunk = useWorldStore((s) => s.loadChunk);
  const chunks = useWorldStore((s) => s.chunks);

  const playerChunkX = Math.floor(playerX / CHUNK_SIZE);
  const playerChunkZ = Math.floor(playerZ / CHUNK_SIZE);

  useEffect(() => {
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        loadChunk(playerChunkX + dx, playerChunkZ + dz);
      }
    }
  }, [playerChunkX, playerChunkZ, loadChunk]);

  const visibleChunks: [number, number][] = [];
  for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
    for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
      const cx = playerChunkX + dx;
      const cz = playerChunkZ + dz;
      if (chunks.has(`${cx},${cz}`)) {
        visibleChunks.push([cx, cz]);
      }
    }
  }

  return (
    <>
      {visibleChunks.map(([cx, cz]) => (
        <Chunk key={`${cx},${cz}`} chunkX={cx} chunkZ={cz} />
      ))}
    </>
  );
}
