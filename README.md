# MC-H5 🎮

Browser-based Minecraft clone built with **Three.js** and **TypeScript**.

## ✨ Features

| Category | Status |
|----------|--------|
| 3D Voxel World | ✅ Complete |
| First-Person Controls (WASD + Mouse) | ✅ Complete |
| Block Place/Break | ✅ Complete |
| Terrain Generation (Hills + Trees) | ✅ Complete |
| Chunk System with Face Culling | ✅ Complete |
| HUD (FPS + Coordinates) | ✅ Complete |
| Inventory System | 🔄 In Progress |
| Multiplayer | 📋 Planned |
| Biomes & Structures | 📋 Planned |

## 🚀 Quick Start

```bash
npm install
npm run dev     # Development server
npm run build   # Production build
```

**Online Demo**: [https://duckytan.github.io/h5-mc/](https://duckytan.github.io/h5-mc/)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Code style, project structure, build commands |
| [docs/FEATURES.md](./docs/FEATURES.md) | Feature list and roadmap |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | GitHub Pages deployment guide |
| [docs/DOCUMENT_CONSTITUTION.md](./docs/DOCUMENT_CONSTITUTION.md) | **文档宪法**：创建/维护规范 |
| [docs/PROJECT_ANALYSIS.md](./docs/PROJECT_ANALYSIS.md) | **项目分析**：功能对比、架构设计、扩展规划 |

## 🗂️ Project Structure

```
src/
├── core/           # VoxelWorld, ChunkManager, SceneManager
├── gameplay/       # PlayerController, BlockInteraction
├── world/          # TerrainGenerator
├── ui/             # GameUI
└── main.ts         # Entry point
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Mouse | Look |
| Left Click | Break block |
| Right Click | Place block |
| 1-4 | Select block type |

## 🛠️ Tech Stack

- **Three.js** - 3D rendering
- **TypeScript** - Type safety
- **Vite** - Build tool
- **WebGL** - Graphics

## 📄 License

MIT License
