# MC-H5 项目开发任务

## 项目概述
H5 版《我的世界》克隆项目，基于 Three.js + TypeScript + Vite 技术栈。当前已完成基础体素系统（25%功能），需要扩展核心功能以接近原版 Minecraft。

## 当前状态
- ✅ 体素世界、分块系统、面剔除
- ✅ 基础地形生成（丘陵+树木）
- ✅ 第一人称控制（WASD+鼠标）
- ✅ 方块放置/破坏
- ❌ 缺少 BlockRegistry（方块元数据）
- ❌ 缺少 Item/ItemStack 系统
- ❌ 缺少 Inventory 物品栏
- ❌ 碰撞检测过于简单

## 任务目标

### 优先级 P0（本周完成）

#### 1. 创建 BlockRegistry（方块注册表）
文件：`src/core/BlockRegistry.ts`

需求：
- 定义 `BlockData` 接口（name, hardness, isOpaque, isTransparent, emitsLight 等）
- 实现 `BlockRegistry` 类，管理所有方块数据
- 迁移现有 8 种方块到注册表
- 保持向后兼容 `BlockType` 枚举

#### 2. 创建 Item/ItemStack 系统
文件：`src/core/items/Item.ts` 和 `ItemStack.ts`

需求：
- 定义 `ItemData` 接口（id, name, maxStack, category）
- 实现 `ItemStack` 类（物品堆叠，maxStack 默认 64）
- 定义 `ItemCategory` 枚举（BLOCK, TOOL, WEAPON, FOOD, ARMOR, MATERIAL）
- 创建基础物品（与方块对应的物品）

#### 3. 创建 Inventory 系统
文件：`src/gameplay/Inventory.ts`

需求：
- 实现 27 格主物品栏 + 9 格快捷栏
- 支持物品拖拽（概念层，暂不实现 UI）
- 实现 `addItem()`, `removeItem()`, `getItem()`, `hasItem()` 方法
- 实现物品堆叠逻辑

#### 4. 改进碰撞检测
文件：`src/core/physics/PhysicsSystem.ts`

需求：
- 实现 AABB（轴对齐包围盒）碰撞检测
- 替换 PlayerController 中简单的地面检测
- 支持墙壁碰撞检测
- 支持方块顶部/侧面检测

### 优先级 P1（下周完成）

#### 5. 材质系统改进
文件：`src/core/MaterialManager.ts`

需求：
- 支持纹理图集（Texture Atlas）
- 为每个方块配置正确的纹理坐标
- 保持纯色材质作为回退

## 技术约束

1. **严格 TypeScript**：不使用 `as any`、`@ts-ignore`
2. **命名规范**：类 PascalCase，变量/方法 camelCase
3. **Three.js**：使用 `THREE.` 前缀，正确 dispose 资源
4. **代码风格**：遵循 `docs/DEVELOPMENT.md` 中的规范

## 验收标准

每个功能必须满足：
1. TypeScript 编译无错误（运行 `npm run build`）
2. 单元测试覆盖核心逻辑（使用 Vitest）
3. 代码符合 `docs/DEVELOPMENT.md` 规范
4. 在 `docs/PROJECT_ANALYSIS.md` 中更新实现状态

## 输出要求

每完成一个任务：
1. 更新 `docs/FEATURES.md` 中的完成状态
2. 如果创建新文件，确保有完整的类型注解
3. 运行 `npm run build` 验证无编译错误
4. 在 `README.md` 中更新功能列表

## 成功定义

当以下全部完成时任务结束：
- [ ] `src/core/BlockRegistry.ts` 存在且通过编译
- [ ] `src/core/items/` 目录存在且包含 Item.ts 和 ItemStack.ts
- [ ] `src/gameplay/Inventory.ts` 存在且通过编译
- [ ] `src/core/physics/PhysicsSystem.ts` 存在且通过编译
- [ ] `npm run build` 运行成功
- [ ] `docs/FEATURES.md` 中对应功能状态更新
