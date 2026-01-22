# DEVELOPMENT.md

MC-H5 项目的开发指南，基于 Three.js + TypeScript + Vite 技术栈。

> **参考规范**: [Three.js 官方文档](https://threejs.org/docs/) | [Vite 文档](https://vitejs.dev/) | [TypeScript 手册](https://www.typescriptlang.org/docs/)

---

## 1. 构建命令

```bash
# 开发服务器（热重载）
npm run dev

# 生产构建（输出到 dist/）
npm run build

# 预览生产构建
npm run preview

# 安装依赖
npm install
```

### Vite CLI 选项

```bash
# 自定义端口
vite --port 3000 --host 0.0.0.0 --open

# 生产构建（生成 sourcemap）
vite build --sourcemap

# 构建并指定输出目录
vite build --outDir build --base /my-app/

# 监听模式（自动重建）
vite build --watch
```

---

## 2. TypeScript 配置

### tsconfig.json（严格模式）

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### 严格模式规则

| 规则 | 说明 | 示例 |
|------|------|------|
| `strict: true` | 启用所有严格检查 | - |
| `noImplicitAny` | 禁止隐式 `any` 类型 | `function fn(x) {}` ❌ |
| `noUnusedLocals` | 禁止未使用的局部变量 | `let unused = 1` ❌ |
| `noUnusedParameters` | 禁止未使用的参数 | `fn(x) { return 1; }` ❌ |

### 类型注解要求

```typescript
// ✅ 正确：显式类型注解
class PlayerController {
  private velocity: THREE.Vector3;
  private canJump: boolean = false;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    // ...
  }

  public update(deltaTime: number): void {
    // ...
  }
}

// ❌ 错误：隐式 any
class PlayerController {
  velocity;           // TS7008: 隐式 any
  constructor(camera, domElement) { }  // 参数隐式 any
}
```

---

## 3. 项目结构

```
src/
├── core/                  # 核心游戏系统
│   ├── VoxelWorld.ts      # 体素数据管理（32x32x32 chunks）
│   ├── ChunkManager.ts    # 分块渲染（面剔除优化）
│   ├── SceneManager.ts    # Three.js 场景、相机、渲染器
│   └── MaterialManager.ts # 方块材质管理
├── gameplay/              # 游戏机制
│   ├── PlayerController.ts # WASD 移动、跳跃、物理
│   └── BlockInteraction.ts # 射线检测、方块放置/破坏
├── world/                 # 世界生成
│   └── TerrainGenerator.ts # 地形与树木生成
├── ui/                    # 用户界面
│   └── GameUI.ts          # HUD、准星、方块选择器
└── main.ts                # 入口点、游戏循环
```

---

## 4. 代码风格规范

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 类 | PascalCase | `PlayerController`, `VoxelWorld` |
| 枚举 | PascalCase | `BlockType` |
| 接口 | PascalCase | `VoxelData`, `RaycastResult` |
| 变量/方法 | camelCase | `moveForward`, `getVoxel` |
| 常量 | UPPER_SNAKE_CASE 或 camelCase | `MOVE_SPEED` |
| 私有成员 | `private` 关键字 | `private velocity: THREE.Vector3` |

### 导入规范

```typescript
// 多项命名导入
import { SceneManager, VoxelWorld, BlockType } from './core/SceneManager';

// 默认导入
import GameUI from './ui/GameUI';

// Three.js 命名空间导入
import * as THREE from 'three';
```

### 类成员顺序

```typescript
export class ExampleClass {
  // 1. 静态属性
  static readonly CHUNK_SIZE = 32;

  // 2. 实例属性（带类型注解）
  private property: Type;
  protected property: Type;
  public property: Type;

  // 3. 构造函数
  constructor() { ... }

  // 4. 私有方法
  private helperMethod(): void { ... }

  // 5. 公共方法
  public update(): void { ... }
}
```

### 错误处理

```typescript
// ✅ 正确：永远不要留空 catch 块
try {
  await loadTexture(url);
} catch (error) {
  console.error('纹理加载失败:', error);
  // 设置降级材质或显示错误消息
}

// 使用早返回减少嵌套
public getMaterial(type: BlockType): THREE.MeshLambertMaterial {
  if (!type) {
    console.warn('无效的方块类型');
    return this.getMaterial(BlockType.STONE);
  }
  return this.materials.get(type) || this.getDefaultMaterial();
}
```

---

## 5. Three.js 最佳实践

### 渲染器配置

```typescript
// ✅ 正确：完整的渲染器配置
private setupRenderer(container: HTMLElement): void {
  this.renderer = new THREE.WebGLRenderer({
    antialias: true,        // 抗锯齿
    alpha: false,           // 不透明背景
    powerPreference: 'high-performance'  // 请求高性能 GPU
  });

  this.renderer.setSize(container.clientWidth, container.clientHeight);
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // 限制像素比
  this.renderer.setClearColor(0x87CEEB);  // 天空蓝
  this.renderer.shadowMap.enabled = true;  // 阴影贴图

  container.appendChild(this.renderer.domElement);
}
```

### BufferGeometry 创建与更新

```typescript
// ✅ 正确：使用 BufferAttribute 创建几何体
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
geometry.setIndex(indices);
geometry.computeBoundingSphere();  // 计算包围球
geometry.computeBoundingBox();     // 计算包围盒

// ❌ 避免：频繁创建新的 BufferAttribute
// 正确：复用 TypedArray 或使用 setArray
geometry.attributes.position.setArray(newPositions);
geometry.attributes.position.needsUpdate = true;
```

### 面剔除优化（参考 Three.js 官方示例）

```typescript
// ✅ 正确：只渲染可见面
private static readonly FACES = [
  { dir: [-1, 0, 0], corners: [[0,0,0], [0,1,0], [0,1,1], [0,0,1]] },  // 左
  { dir: [1, 0, 0],  corners: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]] },   // 右
  { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] },   // 下
  { dir: [0, 1, 0],  corners: [[0,1,0], [0,1,1], [1,1,1], [1,1,0]] },   // 上
  { dir: [0, 0, -1], corners: [[0,0,0], [1,0,0], [1,1,0], [0,1,0]] },   // 前
  { dir: [0, 0, 1],  corners: [[0,0,1], [0,1,1], [1,1,1], [1,0,1]] }    // 后
];

// 只为暴露的面生成几何体
for (const face of ChunkManager.FACES) {
  const neighborType = this.world.getVoxel(voxelX + face.dir[0], ...);
  if (neighborType === BlockType.AIR) {
    // 需要渲染这个面
    this.addFaceGeometry(face, x, y, z);
  }
}
```

### 内存管理（重要！）

```typescript
// ✅ 正确：资源清理
public dispose(): void {
  // 1. 清理几何体
  for (const chunk of this.chunks.values()) {
    if (chunk.mesh) {
      chunk.mesh.geometry.dispose();  // 清理几何体
      chunk.mesh.material.dispose();  // 清理材质
    }
  }
  this.chunks.clear();

  // 2. 清理渲染器
  this.renderer.dispose();

  // 3. 清理材质缓存
  this.materials.forEach(material => material.dispose());
  this.materials.clear();
}

// ✅ 正确：移除对象时清理
removeChunk(cellX: number, cellY: number, cellZ: number): void {
  const chunk = this.chunks.get(key);
  if (chunk) {
    if (chunk.mesh) {
      chunk.mesh.geometry.dispose();
      chunk.mesh.material.dispose();
      this.scene.remove(chunk.mesh);
    }
    this.chunks.delete(key);
  }
}
```

### 射线检测优化

```typescript
// ✅ 正确：限制射线检测距离
public raycast(): RaycastResult {
  const direction = new THREE.Vector3();
  this.camera.getWorldDirection(direction);

  this.raycaster.set(this.camera.position, direction);

  // 限制检测距离，避免性能问题
  const intersects = this.raycaster.intersectObjects(
    this.chunkManager.scene.children,
    true  // 递归检测子对象
  );

  if (intersects.length > 0 && intersects[0].distance < this.reachDistance) {
    // 处理命中
  }
  return { hit: false };
}
```

### 资源复用（减少 GC）

```typescript
// ✅ 正确：复用向量对象
export class PlayerController {
  private velocity: THREE.Vector3;
  private direction: THREE.Vector3;
  private euler: THREE.Euler;

  constructor() {
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
  }

  public update(): void {
    // 复用 direction，而不是每次创建新的
    this.direction.set(0, 0, 0);
    if (this.moveForward) this.direction.z -= 1;
    // ...
  }
}

// ❌ 避免：每帧创建新对象
public update(): void {
  const direction = new THREE.Vector3();  // 每帧创建，GC压力大
}
```

---

## 6. Vite 构建配置

### vite.config.js

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/h5-mc/',  // GitHub Pages 部署路径

  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,  // 生产环境不生成 sourcemap

    // 手动代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Three.js 分离到独立 chunk
          'three': ['three']
        }
      }
    },

    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 生产环境移除 console
        drop_debugger: true
      }
    }
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true
  },

  // 预构建优化
  optimizeDeps: {
    include: ['three']
  }
});
```

### 环境变量

```bash
# .env.local（本地开发）
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true

# .env.production（生产环境）
VITE_API_URL=https://api.example.com
```

```typescript
// 使用环境变量
const apiUrl = import.meta.env.VITE_API_URL;
const isDebug = import.meta.env.VITE_DEBUG === 'true';
```

---

## 7. 性能优化指南

### 核心优化策略

| 策略 | 效果 | 实现方式 |
|------|------|---------|
| 面剔除 | 减少 ~60% 几何体 | 只渲染暴露的面 |
| 分块加载 | 内存优化 | 32x32x32 体素块 |
| 代码分割 | 减少初始加载 | Three.js 分离 |
| 资源复用 | 减少 GC | 复用 Vector3 |
| 资源清理 | 防止内存泄漏 | dispose() 调用 |
| 限制像素比 | 移动端优化 | `Math.min(dpr, 2)` |

### 渲染优化

```typescript
// ✅ 正确：限制像素比，优化移动端性能
const pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(pixelRatio);

// ✅ 正确：使用 requestAnimationFrame 模式
let renderRequested = false;

function render() {
  renderRequested = false;
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
}

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

controls.addEventListener('change', requestRenderIfNotRequested);
```

### 地形生成优化

```typescript
// ✅ 正确：使用简单的噪声函数
private getHeight(x: number, z: number): number {
  const scale1 = 0.05;
  const scale2 = 0.1;
  const scale3 = 0.02;

  const noise1 = Math.sin(x * scale1) * Math.cos(z * scale1);
  const noise2 = Math.sin(x * scale2) * Math.cos(z * scale2);
  const noise3 = Math.sin(x * scale3) * Math.cos(z * scale3);

  const baseHeight = 8;
  const amplitude = 6;

  return Math.floor(
    baseHeight +
    noise1 * amplitude * 0.5 +
    noise2 * amplitude * 0.3 +
    noise3 * amplitude * 0.2
  );
}
```

---

## 8. 测试规范

当前项目未配置测试框架。建议添加 Vitest：

```bash
npm install -D vitest @vitest/ui
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts']
  }
});
```

```bash
# 运行测试
npx vitest run src/core/VoxelWorld.test.ts

# 监听模式
npx vitest
```

---

## 9. 提交规范

```
feat:     新功能
fix:      Bug 修复
perf:     性能优化
refactor: 重构
docs:     文档更新
style:    代码格式（不影响功能）
chore:    构建工具或辅助工具
```

```bash
# 示例
git commit -m "feat: Add inventory system UI"
git commit -m "fix: Resolve block placement collision bug"
git commit -m "perf: Optimize chunk face culling algorithm"
```

---

## 10. 关键文件参考

| 文件 | 职责 | 核心类/函数 |
|------|------|------------|
| `src/main.ts` | 游戏入口、事件绑定、游戏循环 | `Game` 类 |
| `src/core/VoxelWorld.ts` | 体素数据存储与检索 | `VoxelWorld`, `BlockType` |
| `src/core/ChunkManager.ts` | 面剔除、几何体生成、分块缓存 | `ChunkManager` |
| `src/core/SceneManager.ts` | Three.js 场景、相机、渲染器 | `SceneManager` |
| `src/core/MaterialManager.ts` | 方块材质管理、纹理加载 | `MaterialManager` |
| `src/gameplay/PlayerController.ts` | WASD 移动、跳跃、鼠标视角 | `PlayerController` |
| `src/gameplay/BlockInteraction.ts` | 射线检测、方块操作 | `BlockInteraction` |
| `src/world/TerrainGenerator.ts` | 地形与树木生成 | `TerrainGenerator` |
| `src/ui/GameUI.ts` | HUD、准星、方块选择器 | `GameUIImpl`, `BlockSelectorUI` |

---

## 11. 扩展指南

### 添加新方块类型

1. 在 `src/core/VoxelWorld.ts` 添加枚举值：
```typescript
export enum BlockType {
  AIR = 0,
  GRASS = 1,
  // 添加新类型
  NEW_BLOCK = 8
}
```

2. 在 `src/core/MaterialManager.ts` 添加材质：
```typescript
this.materials.set(BlockType.NEW_BLOCK, new THREE.MeshLambertMaterial({
  color: 0xff0000,
  transparent: false
}));
```

3. 在 `src/main.ts` 添加快捷键：
```typescript
case 'Digit5':
  this.blockInteraction.setSelectedBlockType(BlockType.NEW_BLOCK);
  break;
```

### 修改地形生成

编辑 `src/world/TerrainGenerator.ts`：
- `generateFlatTerrain(size)` - 平坦地形
- `generateHillsTerrain(size)` - 丘陵地形
- `addTree(x, y, z)` - 生成树木

---

## 相关文档

- [README.md](../README.md) - 项目概览
- [FEATURES.md](./FEATURES.md) - 功能清单与路线图
- [DEPLOYMENT.md](./DEPLOYMENT.md) - GitHub Pages 部署指南
- [DOCUMENT_CONSTITUTION.md](./DOCUMENT_CONSTITUTION.md) - **文档宪法**：创建/维护规范
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - **项目分析**：功能对比、架构设计、扩展规划
