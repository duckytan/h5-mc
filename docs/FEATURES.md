# FEATURES.md

Feature list and development roadmap for MC-H5.

## ✅ Completed Features

### World System
| Feature | Status | Notes |
|---------|--------|-------|
| Voxel World | ✅ | 32x32x32 chunks, Uint8Array storage |
| Chunk System | ✅ | Face culling (~60% geometry reduction) |
| Terrain Generation | ✅ | Flat and hills with noise |
| Trees | ✅ | Procedural generation |

### Gameplay
| Feature | Status | Notes |
|---------|--------|-------|
| First-Person Controls | ✅ | WASD + Mouse look |
| Movement | ✅ | Walk, jump with gravity |
| Block Placement | ✅ | Right-click to place |
| Block Breaking | ✅ | Left-click to break |
| Block Switching | ✅ | Keys 1-4 |
| **Block Registry** | ✅ | BlockData interface, metadata system |
| **Item System** | ✅ | ItemData, ItemStack, ItemRegistry |
| **Inventory System** | ✅ | 27 main slots + 9 hotbar slots |
| **Collision Detection** | ✅ | AABB physics, wall/floor/ceiling |

### Rendering
| Feature | Status | Notes |
|---------|--------|-------|
| Three.js WebGL | ✅ | 3D rendering |
| Lighting | ✅ | Ambient + Directional |
| Sky | ✅ | Blue background |

### UI
| Feature | Status | Notes |
|---------|--------|-------|
| HUD | ✅ | FPS, coordinates |
| Crosshair | ✅ | Center screen |
| Block Selector | ✅ | Bottom toolbar |

## 🔄 In Progress

| Feature | Priority | Notes |
|---------|----------|-------|
| Texture Atlas | Medium | Material system enhancement |
| Biomes | Medium | Desert, snow, etc. |
| Crafting System | Medium | Workbench recipes |
| Tools | Low | Pickaxe, axe, etc. |
| Mobs | Low | Animals and monsters |

## 📋 Planned

| Feature | Category |
|---------|----------|
| Experience & Enchanting | Gameplay |
| Multiplayer | Networking |
| Save/Load System | Data |
| Nether/End Dimensions | World |
| Redstone System | Gameplay |
| Advanced Visuals | Rendering |

## Completion Status

| System | Complete |
|--------|----------|
| Core World | ~90% |
| Player Controls | ~90% |
| Block System | ~95% |
| Terrain | ~70% |
| Item & Inventory | ~40% |
| Physics & Collision | ~50% |
| Mobs | ~5% |
| Multiplayer | 0% |

## Roadmap Priority

### High Priority
1. Inventory UI (integrate PlayerInventory)
2. Crafting system
3. Save/load system
4. Network sync (multiplayer foundation)

### Medium Priority
1. Texture atlas support
2. Biome system
3. Enchanting
4. Tool durability

### Long-term
1. Nether/End dimensions
2. Boss mobs
3. Advanced visuals
4. Full mod support

## Files Added in This Update

### Core Systems
- `src/core/blocks/BlockRegistry.ts` - 方块注册表和元数据
- `src/core/items/Item.ts` - 物品系统和 ItemStack
- `src/core/physics/PhysicsSystem.ts` - AABB 碰撞检测系统

### Gameplay
- `src/gameplay/Inventory.ts` - 物品栏系统（27格+9格快捷栏）

### Key Interfaces Added

```typescript
// BlockRegistry - 方块元数据
BlockRegistry.getBlockData(type)      // 获取方块数据
BlockRegistry.isSolid(type)           // 检查是否固体
BlockRegistry.isOpaque(type)          // 检查是否不透明

// ItemSystem - 物品系统
ItemRegistry.getItemById(id)          // 通过ID获取物品
ItemStack                             // 物品堆叠类
ItemCategory                          // 物品类别枚举

// Inventory - 物品栏
PlayerInventory                       // 玩家物品栏类
addItem(itemStack)                    // 添加物品
removeItem(itemId, amount)            // 移除物品
selectHotbarSlot(index)               // 选择快捷栏槽位

// PhysicsSystem - 物理系统
PhysicsSystem.update()                // 更新物理状态
PhysicsSystem.raycast()               // 射线检测
AABB                                  // 碰撞盒类
```

## Related Documents

- [README.md](../README.md) - 项目概览
- [DEVELOPMENT.md](./DEVELOPMENT.md) - How to implement features
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploying completed features
- [DOCUMENT_CONSTITUTION.md](./DOCUMENT_CONSTITUTION.md) - **文档宪法**：创建/维护规范
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - **项目分析**：功能对比、架构设计、扩展规划
