# 🚀 GitHub Pages 部署指南

本指南将帮助您将 H5 Minecraft 项目部署到 GitHub Pages，让任何人都可以通过浏览器访问您的游戏！

## 📋 部署方式

### 方式一：GitHub Actions 自动部署（推荐）

**优点：**
- ✅ 自动部署，每次 push 都自动更新
- ✅ 免费，无需额外配置
- ✅ 支持自定义域名
- ✅ HTTPS 自动配置

#### 步骤详解

##### 1️⃣ 创建仓库（如果还没创建）

访问 [GitHub](https://github.com) 并创建新仓库：

```
仓库名: h5-mc
描述: H5版本我的世界 - 浏览器版 Minecraft
设为 Public
```

##### 2️⃣ 推送代码到 GitHub

```bash
# 如果还未推送，运行：
git add .
git commit -m "🚀 Add GitHub Actions deployment"
git push -u origin main
```

##### 3️⃣ 启用 GitHub Pages

1. 进入仓库 Settings 页面
2. 点击左侧 "Pages" 选项
3. 在 Source 中选择 "GitHub Actions"
4. 点击 "Save"

##### 4️⃣ 等待部署完成

- GitHub Actions 会自动运行
- 部署完成后显示：`https://duckytan.github.io/h5-mc/`
- 通常需要 2-3 分钟

#### 查看部署状态

1. 进入仓库的 "Actions" 页面
2. 查看工作流运行状态
3. 点击最新的工作流查看详情

---

### 方式二：手动部署

#### 步骤1：构建项目

```bash
# 本地构建
npm run build
```

这会在 `dist/` 目录生成生产版本。

#### 步骤2：启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "main"
4. Folder 选择 "/ (root)" 或 "/docs"

#### 步骤3：上传 dist 目录

**方法A：直接上传**

```bash
# 将 dist 目录内容复制到仓库根目录
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push
```

**方法B：使用 gh-pages 工具**

```bash
# 安装 gh-pages
npm install -g gh-pages

# 部署
gh-pages -d dist
```

---

## ⚙️ GitHub Actions 工作流说明

### 文件位置
`.github/workflows/deploy.yml`

### 工作流程

```mermaid
graph LR
    A[Push to main] --> B[GitHub Actions 触发]
    B --> C[Checkout 代码]
    C --> D[Setup Node.js]
    D --> E[Install 依赖]
    E --> F[构建项目]
    F --> G[部署到 Pages]
```

### 自动化流程

1. **代码检出** - 从 main 分支获取最新代码
2. **环境准备** - 安装 Node.js 18
3. **依赖安装** - 运行 `npm ci`
4. **项目构建** - 运行 `npm run build`
5. **部署发布** - 自动部署到 GitHub Pages

---

## 🔧 配置说明

### Vite 配置更新

已更新 `vite.config.js`：

```javascript
export default defineConfig({
  base: '/h5-mc/', // 仓库名
  build: {
    outDir: 'dist'
  }
})
```

**重要：** 确保 `base` 路径与您的仓库名一致！

### 自定义域名（可选）

如果您有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件：
```
yourdomain.com
```

2. 在域名提供商处设置 CNAME 记录：
```
类型: CNAME
名称: www
值: duckytan.github.io
```

---

## 🎮 访问游戏

### 部署成功后，访问地址：

**GitHub Pages:**
```
https://duckytan.github.io/h5-mc/
```

**自定义域名:**
```
https://yourdomain.com/
```

### 游戏操作

- **W/A/S/D** - 移动
- **鼠标** - 视角
- **空格** - 跳跃
- **左键** - 破坏方块
- **右键** - 放置方块
- **1-4** - 切换方块

---

## 🐛 常见问题

### Q1: 页面空白或加载失败？

**解决方案：**

1. 检查 Vite 配置中的 `base` 路径是否正确
2. 确认仓库名是 `h5-mc`，不是其他名称
3. 清除浏览器缓存
4. 等待 5-10 分钟让部署完全生效

### Q2: 资源加载 404？

**解决方案：**

```bash
# 检查 dist 目录内容
ls -la dist/

# 确保 index.html 在根目录
cat dist/index.html | grep -o 'src="[^"]*"'
```

### Q3: GitHub Actions 构建失败？

**检查点：**

1. Node.js 版本是否为 18+
2. package.json 依赖是否正确
3. TypeScript 编译是否有错误

**查看错误日志：**
```
仓库 → Actions → 点击失败的工作流 → 查看日志
```

### Q4: 部署很慢？

**优化建议：**

1. 使用 GitHub Actions（自动优化）
2. 减少项目文件大小
3. 启用资源压缩

---

## 📊 性能优化

### GitHub Pages 限制

- **带宽**: 100GB/月
- **存储**: 1GB
- **文件大小**: 单文件不超过 100MB

### 优化建议

1. **压缩资源**
   ```bash
   # 构建时自动压缩
   npm run build
   ```

2. **使用 CDN**
   - GitHub Pages 自带 Cloudflare CDN
   - 全球访问加速

3. **缓存策略**
   - 静态资源长期缓存
   - HTML 文件短缓存

---

## 🎯 最佳实践

### ✅ 推荐做法

- ✅ 使用 GitHub Actions 自动部署
- ✅ 保持 main 分支稳定
- ✅ 使用语义化提交信息
- ✅ 定期更新依赖

### ❌ 避免事项

- ❌ 直接在 main 分支开发
- ❌ 手动上传 dist 目录
- ❌ 忽略 GitHub Actions 日志
- ❌ 使用过大的资源文件

---

## 📚 相关链接

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

---

## 🆘 获取帮助

### 问题排查

1. **GitHub Actions 日志** - 查看详细错误信息
2. **浏览器控制台** - F12 查看资源加载错误
3. **Network 面板** - 检查 404 资源

### 联系支持

- GitHub Issues
- 社区论坛
- 官方文档

---

## 相关链接

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

---

## 相关文档

- [README.md](../README.md) - 项目概览
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发规范
- [FEATURES.md](./FEATURES.md) - 功能清单
- [DOCUMENT_CONSTITUTION.md](./DOCUMENT_CONSTITUTION.md) - **文档宪法**：创建/维护规范
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - **项目分析**：功能对比、架构设计、扩展规划

---

**部署成功后，记得分享给朋友们一起玩！** 🎮✨

---

**最后更新**: 2026-01-22
