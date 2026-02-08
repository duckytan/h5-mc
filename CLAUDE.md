# CLAUDE.md

AI assistant guidance for MC-H5 project.

## Quick Links

| Document                                                         | Purpose                                       |
| ---------------------------------------------------------------- | --------------------------------------------- |
| [README.md](./README.md)                                         | Project overview                              |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)                     | Code style, project structure, build commands |
| [docs/FEATURES.md](./docs/FEATURES.md)                           | Feature list and roadmap                      |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)                       | GitHub Pages deployment                       |
| [docs/DOCUMENT_CONSTITUTION.md](./docs/DOCUMENT_CONSTITUTION.md) | **文档宪法**：创建/维护规范                   |
| [docs/PROJECT_ANALYSIS.md](./docs/PROJECT_ANALYSIS.md)           | **项目分析**：功能对比、架构设计、扩展规划    |

## Architecture

```
src/
├── core/           # VoxelWorld, ChunkManager, SceneManager, MaterialManager
├── gameplay/       # PlayerController, BlockInteraction
├── world/          # TerrainGenerator
├── ui/             # GameUI
└── main.ts         # Entry point
```

## Build Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview build
```

## Key Conventions

- **Strict TypeScript**: No `as any`, `@ts-ignore`
- **Naming**: Classes PascalCase, methods camelCase
- **Three.js**: Use `THREE.` prefix, dispose resources
- **Chunk size**: 32x32x32 voxels with face culling

## Testing

No test framework configured. Use Vitest when adding tests.

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)

---

## 📜 文档宪法（强制执行）

> **创建新文档前必须遵守的规则**。详见 [docs/DOCUMENT_CONSTITUTION.md](./docs/DOCUMENT_CONSTITUTION.md)

### 创建新文档前检查清单

```bash
# 1. 扫描现有 Markdown 文件
ls *.md

# 2. 搜索相关主题
grep -l "关键词" *.md
```

### 同类文档判定

当新文档与现有文档满足以下任一条件时，**必须在原有文档添加内容**，而非创建新文档：

| 条件           | 说明                 |
| -------------- | -------------------- |
| 主题重叠 ≥ 50% | 讨论相同领域或功能   |
| 目标读者相同   | 都面向开发者或用户   |
| 生命周期重叠   | 有效期内会被同时更新 |
| 章节可合并     | 内容可无缝拼接       |

### 强关联规则

每个文档**至少**要有：

1. **入口关联**：`README.md` 的链接
2. **延伸关联**：指向更详细或相关的文档
3. **双向引用**：被引用者添加反向引用

**标准格式**（文档末尾）：

```markdown
## 相关文档

- [文档名称](./文档路径.md) - 一句话说明关系
```

### 文档分类体系

| 类别     | 文件                            | 说明               |
| -------- | ------------------------------- | ------------------ |
| 入口文档 | `README.md`                     | 项目概览           |
| 开发规范 | `docs/DEVELOPMENT.md`           | 代码风格、构建     |
| 功能文档 | `docs/FEATURES.md`              | 特性清单           |
| 部署文档 | `docs/DEPLOYMENT.md`            | 部署流程           |
| AI指南   | `CLAUDE.md`                     | AI助手指令         |
| 文档规范 | `docs/DOCUMENT_CONSTITUTION.md` | 文档创建规则       |
| 项目分析 | `docs/PROJECT_ANALYSIS.md`      | 功能对比、架构设计 |

**每个类别只保留一份主文档。**

---

## 🤖 Skills 使用指南

> **核心原则**：能用 Skills 就用 Skills，不要重复造轮子！

### 为什么使用 Skills？

Skills 是专门针对特定领域预置的专家知识，包含：

- ✅ 经过验证的最佳实践
- ✅ 常用模式和处理流程
- ✅ 避免了从零开始摸索的时间

**使用 Skills 不是偷懒，而是站在巨人的肩膀上。**

---

### 项目相关 Skills

#### 🎮 Three.js 开发（核心相关）

| Skill                    | 何时使用                      | 触发方式             |
| ------------------------ | ----------------------------- | -------------------- |
| `threejs-fundamentals`   | 场景设置、相机、渲染器基础    | 设置3D场景时         |
| `threejs-geometry`       | 体素几何体创建、自定义形状    | 创建3D模型时         |
| `threejs-materials`      | 材质、PBR纹理、ShaderMaterial | 需要着色效果时       |
| `threejs-lighting`       | 光源、阴影、环境光            | 添加光照时           |
| `threejs-animation`      | 关键帧、骨骼动画、动画混合    | 任何动画需求         |
| `threejs-interaction`    | 射线检测、鼠标交互、控制器    | 点击检测、玩家控制   |
| `threejs-loaders`        | GLTF模型、纹理、HDR加载       | 加载外部资源时       |
| `threejs-textures`       | UV映射、纹理设置              | 处理纹理时           |
| `threejs-shaders`        | 自定义GLSL着色器              | 需要自定义渲染效果时 |
| `threejs-postprocessing` | Bloom、DOF、屏幕特效          | 添加后期处理时       |

**触发示例**：

```
"添加玩家跳跃动画" → 使用 threejs-animation
"实现点击方块选中" → 使用 threejs-interaction
"添加水面反射效果" → 使用 threejs-postprocessing
```

#### 🖥️ 开发辅助

| Skill             | 何时使用                 | 触发方式                 |
| ----------------- | ------------------------ | ------------------------ |
| `playwright`      | 浏览器测试、验证渲染结果 | 任何需要浏览器自动化测试 |
| `dev-browser`     | 持久状态的浏览器交互     | 需要保持页面状态的测试   |
| `frontend-design` | 游戏UI设计、界面改进     | 需要设计HUD、物品栏等    |
| `release-skills`  | 项目构建、版本发布       | 需要打包、发布时         |
| `frontend-ui-ux`  | UI/UX改进、动画效果      | 改善用户体验时           |

---

### 使用流程

```
任务 → 识别领域 → 检查相关Skills → 使用对应Skill → 验证结果
```

### 任务委派格式

```typescript
task(
  (category = 'unspecified-low'), // 或对应领域
  (load_skills = ['threejs-animation']), // 关键：传入相关Skills
  (prompt = '...') // 具体任务描述
);
```

**重要**：必须通过 `load_skills` 参数传入相关Skills，否则子Agent无法获取专家知识！

---

### 决策流程图

```
开始任务
    ↓
是否有匹配Skills？
    ├── 否 → 自行解决 / 搜索外部资料
    └── 是 → 使用对应Skill
              ↓
          任务是否复杂？
              ├── 简单 → 直接使用Skill完成任务
              └── 复杂 → 委派给子Agent + 传入Skills
```

---

### ❌ 禁止行为

- 明知有相关Skill却不使用
- 从零实现已有成熟方案的功能
- 重复造轮子

---

### ✅ 正确做法

- 实现新功能前，先问："这个领域有相关Skill吗？"
- 委派任务时，必须传入 `load_skills=[...]`
- 遇到不确定的实现方式，优先查看官方文档 + Skills

---

## 🔀 模型分工策略

> **手动切换模式**：当需要切换模型时，暂停任务等待用户确认后再继续

### 可用模型

| 模型         | 优势                                     | 适用场景                     |
| ------------ | ---------------------------------------- | ---------------------------- |
| GLM-4.7      | 代码生成稳定、架构设计能力强、中文理解好 | 架构设计、性能优化、复杂逻辑 |
| GPT-5 Nano   | 英文代码质量高、开源生态熟悉             | 核心算法、第三方库、英文文档 |
| Kimi K2.5    | 长上下文、中文优化                       | 中文文档、代码注释           |
| MiniMax M2.1 | 成本低、响应快                           | 简单修改、快速原型           |

### 任务分类与模型匹配

| 任务类型 | 推荐模型     | 触发关键词                            |
| -------- | ------------ | ------------------------------------- |
| 架构设计 | GLM-4.7      | "架构"、"模块划分"、"重构"、"设计"    |
| 性能优化 | GLM-4.7      | "性能"、"优化"、"LOD"、"渲染"、"卡顿" |
| 核心算法 | GPT-5 Nano   | "算法"、"地形生成"、"噪声"、"物理"    |
| 第三方库 | GPT-5 Nano   | "npm"、"import"、"API"、"配置"        |
| UI/UX    | GPT-5 Nano   | "界面"、"交互"、"动画"、"样式"        |
| 简单修改 | MiniMax M2.1 | "修改"、"修复"、"调整"、"改动"        |
| Bug修复  | MiniMax M2.1 | "修复"、"错误"、"异常"、"报错"        |
| 中文文档 | Kimi K2.5    | "文档"、"注释"、"说明"                |
| 代码审查 | 交叉验证     | "审查"、"检查"、"验证"                |

### 使用流程

```
1. 接收任务
   ↓
2. 分析任务类型
   ↓
3. 识别所需模型
   ↓
4. [如需切换模型]
   ├── 暂停任务
   ├── 提示用户切换模型
   └── 等待用户确认后继续
   ↓
5. 使用指定模型执行任务
```

### 切换提示模板

当需要切换模型时，使用以下格式提示：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 模型切换请求

当前任务：[任务描述]
推荐模型：[模型名称]
原因：[简要说明]

请切换到 [模型名称] 后，回复「继续」或「ok」

当前暂停，等待中...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 任务执行优先级

1. **高优先级**（必须用指定模型）
   - 架构设计 → GLM-4.7
   - 核心算法（地形生成、噪声算法）→ GPT-5 Nano

2. **中优先级**（推荐模型）
   - 性能优化 → GLM-4.7
   - 第三方库使用 → GPT-5 Nano
   - UI/UX 实现 → GPT-5 Nano

3. **低优先级**（灵活选择）
   - 简单修改 → MiniMax M2.1
   - 文档编写 → Kimi K2.5

---

### 快速参考：常见任务模型选择

| 场景                                            | 使用模型           |
| ----------------------------------------------- | ------------------ |
| 创建新的核心模块（VoxelWorld、ChunkManager 等） | GLM-4.7            |
| 实现地形生成算法（Perlin Noise、Simplex Noise） | GPT-5 Nano         |
| 添加玩家控制（移动、跳跃、视角）                | GLM-4.7            |
| 实现光照系统（阴影、环境光）                    | GLM-4.7            |
| 优化渲染性能（LOD、Instancing）                 | GLM-4.7            |
| 集成第三方库（Three.js 插件、物理引擎）         | GPT-5 Nano         |
| 编写用户界面（HUD、物品栏）                     | GPT-5 Nano         |
| 修复简单 Bug                                    | MiniMax M2.1       |
| 编写中文注释/文档                               | Kimi K2.5          |
| 审查已实现的代码                                | 交叉验证（多模型） |
