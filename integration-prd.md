# MC-H5 集成任务

## 项目概述
H5 版《我的世界》克隆项目。当前已完成基础架构（BlockRegistry、ItemSystem、Inventory、PhysicsSystem），但尚未集成到主游戏中。

## 当前状态

### 已完成的核心模块
- ✅ `src/core/blocks/BlockRegistry.ts` - 方块注册表
- ✅ `src/core/items/Item.ts` - 物品系统
- ✅ `src/gameplay/Inventory.ts` - 物品栏系统
- ✅ `src/core/physics/PhysicsSystem.ts` - AABB 碰撞检测

### 待集成到主游戏
- ❌ PlayerController 还在使用简单的地面检测
- ❌ MaterialManager 没有使用 BlockRegistry
- ❌ 没有物品栏 UI

## 任务目标

### 优先级 P0（立即完成）

#### 任务 1：集成 PhysicsSystem 到 PlayerController

**文件**: `src/gameplay/PlayerController.ts`

**需求**:
1. 导入 PhysicsSystem
2. 在构造函数中创建 PhysicsSystem 实例
3. 替换 `update()` 方法中的简单地面检测：
   ```typescript
   // 当前（需要替换）
   if (this.camera.position.y < 5) {
     this.velocity.y = 0;
     this.camera.position.y = 5;
     this.canJump = true;
   }
   
   // 应该改为
   const result = this.physicsSystem.update(this.camera.position.clone(), 1);
   this.camera.position.copy(result.position);
   this.canJump = result.onGround;
   ```
4. 保留 WASD 控制逻辑，更新位置计算方式
5. 支持水平碰撞检测（不再穿墙）

**验收标准**:
- 玩家不再能穿过固体方块
- 玩家可以站在方块顶部
- 玩家可以跳跃
- `npm run build` 通过

#### 任务 2：集成 BlockRegistry 到 MaterialManager

**文件**: `src/core/MaterialManager.ts`

**需求**:
1. 导入 BlockRegistry
2. 修改 `getMaterial()` 方法：
   ```typescript
   // 应该使用 BlockRegistry 的配置
   public getMaterial(type: BlockType): THREE.MeshLambertMaterial {
     const config = BlockRegistry.getMaterialConfig(type);
     // 使用 config.color 和 config.transparent
   }
   ```
3. 在 `initMaterials()` 中使用 BlockRegistry 注册的方块数据
4. 添加 `dispose()` 方法清理材质

**验收标准**:
- MaterialManager 使用 BlockRegistry 的方块颜色
- 透明方块（树叶、水）正确设置透明度
- `npm run build` 通过

### 优先级 P1（完成 P0 后）

#### 任务 3：创建物品栏 UI

**文件**: `src/ui/InventoryUI.ts` (新建)

**需求**:
1. 创建 InventoryUI 类
2. 显示 27 格主物品栏（3行 x 9列）
3. 显示 9 格快捷栏（底部）
4. 键盘 1-9 切换快捷栏选中
5. 滚轮切换快捷栏
6. 显示当前选中物品名称
7. 样式参考 Minecraft：
   - 深灰色背景槽位
   - 物品图标（使用颜色块）
   - 数量标签（右上角）
   - 选中高亮（白色边框）

**验收标准**:
- 物品栏可见
- 快捷栏可选中
- 物品显示数量

#### 任务 4：集成 Inventory 到 Game

**文件**: `src/main.ts`

**需求**:
1. 创建 PlayerInventory 实例
2. 在破坏方块时掉落物品到物品栏
3. 在放置方块时从物品栏消耗物品
4. 按 E 打开/关闭物品栏 UI

**验收标准**:
- 破坏方块获得物品
- 放置方块消耗物品
- 物品栏正确更新

## 技术约束

1. **严格 TypeScript**：不使用 `as any`、`@ts-ignore`
2. **命名规范**：类 PascalCase，变量/方法 camelCase
3. **Three.js**：使用 `THREE.` 前缀，正确 dispose 资源
4. **代码风格**：遵循 `docs/DEVELOPMENT.md` 中的规范

## 验收标准

当以下全部完成时任务结束：

### P0 任务
- [ ] PlayerController 使用 PhysicsSystem 进行碰撞检测
- [ ] MaterialManager 使用 BlockRegistry 的方块颜色
- [ ] `npm run build` 运行成功
- [ ] 玩家可以站在方块上，不再穿墙

### P1 任务（可选）
- [ ] 物品栏 UI 可见
- [ ] 快捷栏可选中
- [ ] 破坏/放置方块与物品栏交互

## 成功定义

当玩家可以：
1. 在世界中自由移动
2. 不再穿过固体方块
3. 正确站在方块顶部
4. 跳跃时有重力效果

任务结束。

## 参考代码

### PhysicsSystem 使用示例

```typescript
// 创建 PhysicsSystem
const physics = new PhysicsSystem(world);

// 更新物理
const result = physics.update(position, 1.0);
if (result.onGround) {
  canJump = true;
}
if (result.collision) {
  console.log('碰撞方向:', result.collision.normal);
}
```

### BlockRegistry 使用示例

```typescript
// 获取方块颜色配置
const config = BlockRegistry.getMaterialConfig(BlockType.GRASS);
// config: { color: 0x4a7c59, transparent: false }

// 检查方块属性
if (BlockRegistry.isSolid(BlockType.WATER)) {
  // 水不是固体，不能站在上面
}
```

### PlayerInventory 使用示例

```typescript
// 创建物品栏
const inventory = new PlayerInventory();

// 添加物品
const item = ItemRegistry.createItemStack('minecraft:grass_block', 64);
inventory.addItem(item);

// 获取选中的物品
const selected = inventory.getSelectedItem();

// 切换快捷栏
inventory.selectHotbarSlot(0); // 选中第一个
inventory.scrollHotbar(1);     // 下一个
```

---

## 输出要求

每完成一个任务：
1. 运行 `npm run build` 验证无编译错误
2. 确保代码符合 `docs/DEVELOPMENT.md` 规范
3. 在 `docs/FEATURES.md` 中更新完成状态
