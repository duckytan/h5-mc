> **[← Back to Root](../CLAUDE.md)** | **Core Module**

# Core Module - `src/core/`

## Overview

Core game systems for voxel data management, chunk rendering, scene setup, and material management.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `VoxelWorld.ts` | `BlockType` enum, `VoxelData` interface, `VoxelWorld` class | Voxel data storage and retrieval (32x32x32 chunks) |
| `ChunkManager.ts` | `ChunkData` interface, `ChunkManager` class | Face culling, geometry generation, chunk caching |
| `SceneManager.ts` | `SceneManager` class | Three.js scene, camera, renderer, lighting setup |
| `MaterialManager.ts` | `MaterialManager` class | Block material management, texture loading |

## Interfaces

```typescript
interface VoxelData {
  type: BlockType;
  x: number;
  y: number;
  z: number;
}

interface ChunkData {
  mesh: THREE.Mesh | null;
  geometry: THREE.BufferGeometry | null;
  cellX: number;
  cellY: number;
  cellZ: number;
}
```

## BlockType Enum

```typescript
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  SAND = 6,
  WATER = 7
}
```

## Key Dependencies

- **Three.js**: Scene, camera, renderer, geometries, materials
- **Internal**: VoxelWorld ↔ ChunkManager (bidirectional)

## Usage Examples

```typescript
// Create voxel world with 32x32x32 chunks
const world = new VoxelWorld(32);

// Set and get voxels
world.setVoxel(10, 20, 30, BlockType.GRASS);
const type = world.getVoxel(10, 20, 30);

// Generate chunk mesh
const mesh = chunkManager.generateChunk(0, 0, 0);
scene.add(mesh);

// Update chunk after voxel changes
chunkManager.updateChunk(cellX, cellY, cellZ);
```

## Performance Notes

- **Chunk size**: 32x32x32 voxels
- **Voxel storage**: `Uint8Array` per chunk
- **Face culling**: Reduces geometry by ~60%
- **Chunk caching**: Map-based lookup by `"x,y,z"` key
- **Memory**: Dispose geometries/materials on cleanup

## Integration Points

- `SceneManager` creates and owns `VoxelWorld` and `ChunkManager`
- `BlockInteraction` calls `world.getVoxel()` / `world.setVoxel()`
- `TerrainGenerator` calls `world.setVoxel()` for terrain generation
- `main.ts` initializes via `SceneManager`
