> **[← Back to Root](../CLAUDE.md)** | **Gameplay Module**

# Gameplay Module - `src/gameplay/`

## Overview

Player mechanics and block interaction systems including movement, physics, and block placement/removal.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `PlayerController.ts` | `PlayerController` class | First-person controls, WASD movement, jump, mouse look |
| `BlockInteraction.ts` | `RaycastResult` interface, `BlockInteraction` class | Raycasting, block add/remove, chunk updates |

## Interfaces

```typescript
interface RaycastResult {
  hit: boolean;
  position?: THREE.Vector3;
  normal?: THREE.Vector3;
  blockType?: BlockType;
}
```

## PlayerController

### Controls
| Key | Action |
|-----|--------|
| W/A/S/D | Move forward/left/back/right |
| Space | Jump |
| Mouse | Look around (requires pointer lock) |
| Click | Lock pointer |

### Physics Parameters
```typescript
moveSpeed: number = 0.1;      // Movement speed
jumpPower: number = 0.15;     // Jump force
gravity: number = 0.002;      // Gravity per frame
```

### Key Methods
```typescript
constructor(camera: THREE.Camera, domElement: HTMLElement)
public update(): void              // Apply movement, gravity, collision
public getPosition(): THREE.Vector3
public setPosition(x: number, y: number, z: number): void
```

## BlockInteraction

### Configuration
```typescript
reachDistance: number = 8;  // Max block interaction distance
```

### Key Methods
```typescript
constructor(camera: THREE.Camera, world: VoxelWorld, chunkManager: ChunkManager)
public raycast(): RaycastResult
public addBlock(blockType?: BlockType): void
public removeBlock(): void
public setSelectedBlockType(blockType: BlockType): void
```

### Usage
```typescript
// Initialize with scene dependencies
const blockInteraction = new BlockInteraction(
  camera,
  world,
  chunkManager
);

// Set selected block type
blockInteraction.setSelectedBlockType(BlockType.STONE);

// Add/remove blocks (called from event handlers)
document.addEventListener('mousedown', (e) => {
  if (e.button === 0) blockInteraction.removeBlock();  // Left click
});
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  blockInteraction.addBlock();  // Right click
});
```

## Key Dependencies

- **Three.js**: Camera, Vector3, Raycaster, Euler
- **Internal**: BlockInteraction depends on VoxelWorld and ChunkManager
- **External**: DOM events for keyboard/mouse input

## Integration Points

- `main.ts` creates `PlayerController` and `BlockInteraction` instances
- `PlayerController` updates camera position each frame
- `BlockInteraction` modifies voxels and triggers chunk updates
