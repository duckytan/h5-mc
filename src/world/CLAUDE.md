> **[← Back to Root](../CLAUDE.md)** | **World Module**

# World Module - `src/world/`

## Overview

Terrain and tree generation systems including flat terrain, hills terrain with noise-based height maps, and procedural tree generation.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `TerrainGenerator.ts` | `TerrainGenerator` class | Terrain generation algorithms, tree placement |

## TerrainGenerator

### Methods

```typescript
constructor(world: VoxelWorld)

public generateFlatTerrain(size?: number): void
// Generates flat terrain with grass surface, dirt layer, stone below

public generateHillsTerrain(size?: number): void
// Generates terrain using simple noise-based height calculation

private getHeight(x: number, z: number, size: number): number
// Noise function combining 3 frequency scales

public addTree(x: number, y: number, z: number): void
// Generates procedural tree (4-block trunk + spherical leaves)
```

### Usage

```typescript
// Create generator with world reference
const terrainGenerator = new TerrainGenerator(world);

// Generate terrain
terrainGenerator.generateHillsTerrain(64);

// Add trees at specific positions
for (let i = 0; i < 10; i++) {
  const x = Math.floor(Math.random() * 50);
  const z = Math.floor(Math.random() * 50);
  const y = getGroundHeight(x, z);  // Find surface height
  terrainGenerator.addTree(x, y, z);
}
```

### Terrain Structure

```
Height-based block distribution:
- Top layer: GRASS
- Below surface (1-4 blocks): DIRT
- Below dirt: STONE
```

### Noise Function

```typescript
// Combines 3 sine/cosine waves at different scales
getHeight(x, z, size):
  - scale1 = 0.05 (large hills)
  - scale2 = 0.1  (medium features)
  - scale3 = 0.02 (large rolling terrain)
```

### Tree Generation

```
Trunk: 4 blocks high (WOOD)
Leaves: 3 layers, radius 2, spherical prune (LEAVES)
```

## Key Dependencies

- **Internal**: Depends on VoxelWorld for setting voxels
- **No external dependencies**

## Integration Points

- `main.ts` creates `TerrainGenerator` and calls `generateInitialWorld()`
- `generateInitialWorld()` calls `generateHillsTerrain()` and `addTree()` in a loop
