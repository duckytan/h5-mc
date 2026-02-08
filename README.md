# Minecraft H5 Web版

> 基于 Three.js 的高性能体素沙盒游戏

## 项目状态

**版本**：2.0（重构中）  
**技术栈**：Three.js + TypeScript + Vite  
**状态**：[需求规划完成 → 开发中]

## 快速开始

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建
npm run preview
```

## 文档

| 文档                                   | 说明               |
| -------------------------------------- | ------------------ |
| [需求文档](./docs/PRD.md)              | 产品需求与功能规划 |
| [开发规范](./docs/DEVELOPMENT.md)      | 代码风格、构建命令 |
| [部署文档](./docs/DEPLOYMENT.md)       | GitHub Pages 部署  |
| [功能特性](./docs/FEATURES.md)         | 已完成/计划功能    |
| [项目分析](./docs/PROJECT_ANALYSIS.md) | 架构设计与扩展规划 |

## 核心功能

- 体素世界生成与渲染
- 玩家控制与交互
- 多生物群系地形
- 光照与天气系统
- 多人联机支持

## 架构

```
src/
├── core/           # 核心引擎
├── gameplay/       # 游戏玩法
├── world/          # 世界生成
└── ui/             # 用户界面
```

## 历史版本

- [v1.0 (备份)](./backup/project_1.0/) - 原始实现
