# CLAUDE.md

AI assistant guidance for MC-H5 project.

## Quick Links

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Code style, project structure, build commands |
| [docs/FEATURES.md](./docs/FEATURES.md) | Feature list and roadmap |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | GitHub Pages deployment |
| [docs/DOCUMENT_CONSTITUTION.md](./docs/DOCUMENT_CONSTITUTION.md) | **文档宪法**：创建/维护规范 |
| [docs/PROJECT_ANALYSIS.md](./docs/PROJECT_ANALYSIS.md) | **项目分析**：功能对比、架构设计、扩展规划 |

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

| 条件 | 说明 |
|------|------|
| 主题重叠 ≥ 50% | 讨论相同领域或功能 |
| 目标读者相同 | 都面向开发者或用户 |
| 生命周期重叠 | 有效期内会被同时更新 |
| 章节可合并 | 内容可无缝拼接 |

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

| 类别 | 文件 | 说明 |
|------|------|------|
| 入口文档 | `README.md` | 项目概览 |
| 开发规范 | `docs/DEVELOPMENT.md` | 代码风格、构建 |
| 功能文档 | `docs/FEATURES.md` | 特性清单 |
| 部署文档 | `docs/DEPLOYMENT.md` | 部署流程 |
| AI指南 | `CLAUDE.md` | AI助手指令 |
| 文档规范 | `docs/DOCUMENT_CONSTITUTION.md` | 文档创建规则 |
| 项目分析 | `docs/PROJECT_ANALYSIS.md` | 功能对比、架构设计 |

**每个类别只保留一份主文档。**
