# MC-H5 - 我的世界浏览器版

一个基于 WebGL 和 Three.js 开发的H5版我的世界游戏。

## 🎮 功能特性

### ✅ 已实现功能
- ✅ 3D体素世界渲染
- ✅ 玩家第一人称控制（WASD移动，空格跳跃）
- ✅ 方块放置与破坏（左键破坏，右键放置）
- ✅ 地形生成（山丘地形）
- ✅ 分块系统优化性能
- ✅ 面剔除优化（只渲染可见面）
- ✅ 基础物理系统（重力、跳跃、碰撞）
- ✅ HUD界面（FPS、坐标显示）
- ✅ 方块类型切换（数字键1-4）

### 🔄 可扩展功能
- 🔄 更多方块类型（树叶、水、岩浆等）
- 🔄 材质和纹理系统
- 🔄 物品栏系统
- 🔄 生物生成
- 🔄 多人联机
- 🔄 存档系统
- 🔄 更多工具和武器
- 🔄 合成系统

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

## 🎯 游戏操作

### 基本控制
- **W/A/S/D** - 移动
- **空格** - 跳跃
- **鼠标移动** - 视角控制
- **左键** - 破坏方块
- **右键** - 放置方块
- **数字键1-4** - 切换方块类型

### 方块类型
- **1** - 草地方块
- **2** - 泥土
- **3** - 石头
- **4** - 木头

## 🏗️ 技术架构

### 核心技术栈
- **Three.js** - 3D渲染引擎
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **WebGL** - 底层图形API

### 核心模块
- **VoxelWorld** - 体素世界管理
- **ChunkManager** - 分块系统
- **PlayerController** - 玩家控制
- **BlockInteraction** - 方块交互
- **TerrainGenerator** - 地形生成

## 📦 项目结构

```
src/
├── core/
│   ├── VoxelWorld.ts      # 体素世界核心
│   ├── ChunkManager.ts    # 分块管理
│   └── SceneManager.ts    # 场景管理
├── gameplay/
│   ├── PlayerController.ts # 玩家控制器
│   └── BlockInteraction.ts # 方块交互
└── world/
    └── TerrainGenerator.ts # 地形生成
```

## 🎨 视觉效果

- 实时光影渲染
- 物理光照
- 面剔除优化
- 分块动态加载

## 🔧 开发说明

### 扩展新方块类型
在 `VoxelWorld.ts` 中的 `BlockType` 枚举添加新类型：
```typescript
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  // 添加新方块...
}
```

### 添加新地形生成算法
在 `TerrainGenerator.ts` 中扩展地形生成方法。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开发者**: Claude Code
**版本**: 1.0.0
**最后更新**: 2026-01-22
