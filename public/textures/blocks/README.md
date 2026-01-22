# 纹理资源目录

## 使用说明

此目录用于存放游戏中的纹理资源。

### 方块纹理

建议使用 16x16 或 32x32 像素的 PNG 格式纹理：

- `grass.png` - 草地方块
- `dirt.png` - 泥土
- `stone.png` - 石头
- `wood.png` - 木头
- `leaves.png` - 树叶
- `sand.png` - 沙子
- `water.png` - 水

### 纹理要求

- 格式：PNG (支持透明度)
- 尺寸：16x16 或 32x32 像素
- 命名：使用小写字母和下划线
- 颜色空间：sRGB

### 使用方法

在代码中使用 `MaterialManager` 加载纹理：

```typescript
materialManager.setTextureForBlock(BlockType.GRASS, '/textures/blocks/grass.png');
```

### 注意事项

1. 纹理文件不会被提交到版本控制中
2. 可以从公共纹理包中获取 Minecraft 风格的纹理
3. 确保纹理符合版权要求

## 版权信息

请确保所有纹理资源符合版权要求，避免使用有版权保护的材料。
