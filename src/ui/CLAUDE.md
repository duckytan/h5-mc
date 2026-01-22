> **[← Back to Root](../CLAUDE.md)** | **UI Module**

# UI Module - `src/ui/`

## Overview

User interface components including HUD (heads-up display), crosshair, block selector, and in-game messages.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `GameUI.ts` | `GameUI` interface, `GameUIImpl` class, `BlockSelectorUI` class | HUD elements, crosshair, FPS counter, position display, block selector |

## Interfaces

```typescript
interface GameUI {
  showCrosshair(): void;
  hideCrosshair(): void;
  updateFPS(fps: number): void;
  updatePosition(x: number, y: number, z: number): void;
  updateSelectedBlock(blockName: string): void;
  showMessage(message: string, duration: number): void;
}
```

## GameUIImpl

### DOM Elements Used

| Element ID | Purpose |
|------------|---------|
| `crosshair` | Center screen crosshair |
| `fps` | FPS counter display |
| `coords` | Player position display |
| `selected-block` | Currently selected block name |

### Methods

```typescript
constructor()
public showCrosshair(): void
public hideCrosshair(): void
public updateFPS(fps: number): void
public updatePosition(x: number, y: number, z: number): void
public updateSelectedBlock(blockName: string): void
public showMessage(message: string, duration?: number): void
```

## BlockSelectorUI

### Block Types

```typescript
blockTypes = [
  { type: 1, name: '草地方块' },
  { type: 2, name: '泥土' },
  { type: 3, name: '石头' },
  { type: 4, name: '木头' }
];
```

### Methods

```typescript
constructor()
public selectBlock(index: number): void
public getSelectedBlockType(): number
public dispose(): void
```

### Features
- Bottom-center fixed slot display
- Click to select block
- Visual border highlight for selected slot
- Currently hardcoded to 4 block types

## Usage

```typescript
// Create UI implementation
const gameUI = new GameUIImpl();
gameUI.updateFPS(60);
gameUI.updatePosition(10.5, 5.2, 20.3);
gameUI.updateSelectedBlock('草地方块');
gameUI.showMessage('Game Saved!', 3000);

// Block selector UI (if used)
const selector = new BlockSelectorUI();
const selectedType = selector.getSelectedBlockType();
selector.dispose();  // Cleanup when game ends
```

## DOM Structure (Injected)

```
BlockSelectorUI creates:
└── div.container (fixed, bottom center)
    ├── div.slot (×4)
    │   ├── 草方块
    │   ├── 泥土
    │   ├── 石头
    │   └── 木头
```

## Key Dependencies

- **External**: DOM APIs (document.getElementById, createElement, etc.)
- **No internal dependencies**

## Integration Points

- `main.ts` can create `GameUIImpl` and `BlockSelectorUI` instances
- HUD elements referenced by ID in `index.html`
- Block selector UI injects DOM elements dynamically
