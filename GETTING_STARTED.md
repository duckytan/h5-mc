# 🚀 快速上手指南

欢迎来到 MC-H5！本指南将帮助您快速启动和运行这个H5版我的世界游戏。

## 📋 系统要求

### 最低配置
- **浏览器**: Chrome 80+、Firefox 75+、Safari 13+
- **WebGL**: 支持 WebGL 2.0
- **内存**: 至少 2GB RAM
- **网络**: 首次加载需要互联网连接

### 推荐配置
- **浏览器**: 最新版本的 Chrome 或 Edge
- **显卡**: 支持硬件加速
- **内存**: 4GB+ RAM
- **网络**: 稳定的宽带连接

## 🛠️ 安装与运行

### 方法一：直接运行（推荐）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

浏览器将自动打开 `http://localhost:3000`

### 方法二：生产构建

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 方法三：静态托管

将 `dist/` 目录部署到任何静态托管服务：
- Netlify
- Vercel
- GitHub Pages
- 或任何 Web 服务器

## 🎮 游戏操作

### 基础控制

| 按键 | 功能 |
|------|------|
| **W/A/S/D** | 前后左右移动 |
| **空格** | 跳跃 |
| **鼠标移动** | 视角控制 |
| **左键** | 破坏方块 |
| **右键** | 放置方块 |

### 方块选择

| 按键 | 方块类型 |
|------|----------|
| **1** | 草地方块 |
| **2** | 泥土 |
| **3** | 石头 |
| **4** | 木头 |

### 高级操作

- **点击画面** - 锁定鼠标指针
- **ESC** - 释放鼠标指针
- **滚轮** - 缩放视角（可选功能）

## 🎯 快速开始

### 第一次游戏

1. **启动游戏**
   - 运行 `npm run dev`
   - 等待加载完成

2. **开始探索**
   - 使用 WASD 移动
   - 鼠标控制视角
   - 探索生成的地形

3. **建造第一个建筑**
   - 选择方块类型（按数字键）
   - 右键放置方块
   - 左键破坏方块

### 提示与技巧

#### 🏗️ 建造技巧
- 从地面开始建造
- 使用不同方块创建图案
- 利用高度差创造立体效果

#### ⚡ 性能优化
- 避免一次放置太多方块
- 定期清理不需要的方块
- 关闭其他浏览器标签页

#### 🎮 游戏技巧
- 使用十字准星瞄准
- 观察方块高亮提示
- 记住常用的方块快捷键

## 🔧 自定义设置

### 修改游戏参数

编辑 `src/main.ts` 文件：

```typescript
// 修改玩家移动速度
private moveSpeed: number = 0.1;  // 调整移动速度

// 修改跳跃力度
private jumpPower: number = 0.15;  // 调整跳跃高度

// 修改重力
private gravity: number = 0.002;  // 调整重力强度
```

### 添加新方块

1. 编辑 `src/core/VoxelWorld.ts`
2. 在 `BlockType` 枚举中添加新类型
3. 编辑 `src/core/MaterialManager.ts` 添加材质
4. 编辑 `src/main.ts` 添加快捷键

### 自定义地形

编辑 `src/world/TerrainGenerator.ts`：

```typescript
// 修改地形大小
this.terrainGenerator.generateHillsTerrain(128);  // 更大的地图

// 修改树生成数量
for (let i = 0; i < 20; i++) {  // 更多树
  // ...
}
```

## 🐛 常见问题

### Q: 游戏加载很慢？
A: 首次加载需要下载 Three.js 库（约 1MB）。请确保网络连接稳定。

### Q: 游戏卡顿？
A:
- 关闭其他浏览器标签页
- 降低浏览器缩放比例（建议 100%）
- 检查显卡驱动是否最新

### Q: 鼠标指针无法锁定？
A: 确保在游戏画面上点击后再移动鼠标。某些浏览器需要用户交互才能锁定指针。

### Q: 看不见方块？
A:
- 检查 WebGL 支持：访问 `chrome://gpu/`
- 尝试使用不同浏览器
- 更新显卡驱动

### Q: 如何重置世界？
A: 刷新页面（F5）会生成新的随机世界。

## 📚 学习资源

### 官方文档
- [Three.js 手册](https://threejs.org/manual/)
- [WebGL 基础](https://webglfundamentals.org/)
- [TypeScript 指南](https://www.typescriptlang.org/docs/)

### 社区资源
- [Three.js 中文社区](https://threejs.org.cn/)
- [WebGL 中文教程](https://webgl123.com/)
- [游戏开发论坛](https://gamedev.stackexchange.com/)

## 🎓 深入开发

### 项目结构
```
mc-h5/
├── src/
│   ├── core/           # 核心系统
│   ├── gameplay/       # 游戏逻辑
│   └── world/          # 世界生成
├── public/             # 静态资源
└── dist/              # 构建输出
```

### 核心文件
- `VoxelWorld.ts` - 体素数据管理
- `ChunkManager.ts` - 分块系统
- `PlayerController.ts` - 玩家控制
- `BlockInteraction.ts` - 方块交互

## 🤝 获取帮助

### 报告问题
如遇到问题，请提供：
- 浏览器版本
- 操作系统
- 错误信息
- 复现步骤

### 贡献代码
欢迎提交 Pull Request！

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**祝您游戏愉快！** 🎮

**快速链接**:
- [项目主页](../README.md)
- [开发指南](../DEVELOPMENT.md)
- [功能清单](../FEATURES.md)
