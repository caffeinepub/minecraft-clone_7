# Minecraft Clone — Full Upgrade

## Current State
Working voxel game with flat-colored blocks, WASD first-person controls, chunk system, block place/break, toolbar. No textures, no animals, no player model.

## Requested Changes (Diff)

### Add
- Pixel-art Minecraft-style textures on all block types (generated via canvas 16x16 pixel art)
- Animals with 3D body models made from R3F boxes: Cow (black+white), Pig (pink), Chicken (white+red), Sheep (grey/white)
- Animal wandering AI: each animal picks random direction, walks, then stops, on a timer
- Animal collision: animals don't walk off cliffs, stay on ground
- Player right hand visible in first-person view (animated slightly)
- Health bar HUD (hearts display, top-left)
- Hotbar scroll wheel support
- Animals spawn naturally on grass blocks across loaded chunks
- Animal name tags floating above them
- Day/night cycle: sun moves, ambient light gradually changes

### Modify
- Chunk renderer: use canvas-generated textures per block type instead of flat MeshLambertMaterial color
- Start screen: update title to "VoxelCraft" with animal icons preview
- Toolbar: add scroll-wheel slot cycling

### Remove
- Flat color-only rendering (replace with textured)

## Implementation Plan
1. Create `src/game/textures.ts` - generates 16x16 canvas pixel-art textures for each face of each block type, returns THREE.Texture
2. Create `src/components/Animals.tsx` - renders all animals with wandering AI using useFrame
3. Create `src/components/PlayerHand.tsx` - first-person hand rendered in a separate camera layer
4. Update `Chunk.tsx` to use textures instead of flat color
5. Add health bar and day/night to App.tsx / HUD
6. Wire animals into WorldManager with spawn logic
