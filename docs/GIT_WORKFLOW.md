# Git 工作流规范

## 分支策略

### 主要分支

- **main**: 生产环境代码，仅接受经过审查和测试的代码
- **develop**: 开发主分支，集成所有功能分支

### 功能分支

- **feature/xxx**: 新功能开发，从 `develop` 分出，完成后合并回 `develop`
- **fix/xxx**: Bug 修复，从 `develop` 分出，完成后合并回 `develop`
- **hotfix/xxx**: 紧急修复，从 `main` 分出，完成后合并回 `main` 和 `develop`

## 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- **feat**: 新功能
- **fix**: Bug 修复
- **docs**: 文档更新
- **style**: 代码格式（不影响功能）
- **refactor**: 重构（既不是新功能也不是 Bug 修复）
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动

### 示例

```
feat(core): 添加 VoxelWorld 类实现

- 实现世界坐标与块坐标转换
- 添加边界检测
- 支持 Int8Array 存储优化

Closes #1
```

## Code Review 流程

1. 创建 Pull Request 到 `develop` 分支
2. 自动运行 CI 检查（Lint、Type Check、Build）
3. 至少需要 1 人 Review
4. 通过后合并到 `develop`

## CI/CD

### CI 检查

- ESLint 代码检查
- Prettier 格式检查
- TypeScript 类型检查
- 构建测试

### CD 部署

- `main` 分支自动部署到 GitHub Pages
