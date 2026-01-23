import * as THREE from 'three';
import { BlockType } from './VoxelWorld';
import { BlockRegistry } from './blocks/BlockRegistry';

/**
 * 材质管理器
 * 集成 BlockRegistry 使用方块配置生成材质
 */
export class MaterialManager {
  /** 材质映射 */
  private materials: Map<BlockType, THREE.MeshLambertMaterial>;
  /** 纹理加载器 */
  private textureLoader: THREE.TextureLoader;
  /** 纹理图集 */
  private textureAtlas: THREE.Texture | null = null;

  /**
   * 创建材质管理器
   * 自动初始化所有方块的材质
   */
  constructor() {
    this.materials = new Map();
    this.textureLoader = new THREE.TextureLoader();

    // 初始化材质（使用 BlockRegistry 的配置）
    this.initMaterials();
  }

  /**
   * 初始化所有方块的材质
   * 使用 BlockRegistry 的方块数据
   */
  private initMaterials(): void {
    // 注册所有 BlockType 的材质
    const blockTypes = BlockRegistry.getAllBlockTypes();

    for (const blockType of blockTypes) {
      // 跳过空气（不需要渲染）
      if (blockType === BlockType.AIR) continue;

      // 获取方块配置
      const config = BlockRegistry.getMaterialConfig(blockType);

      // 创建材质
      const materialOptions: THREE.MeshLambertMaterialParameters = {
        color: config.color
      };

      // 如果是透明方块，设置透明度
      if (config.transparent) {
        materialOptions.transparent = true;
        materialOptions.opacity = config.opacity ?? 0.7;
      }

      const material = new THREE.MeshLambertMaterial(materialOptions);

      // 设置材质名称（用于调试）
      material.name = `material_${BlockRegistry.getBlockName(blockType)}`;

      this.materials.set(blockType, material);
    }
  }

  /**
   * 获取方块材质
   * @param type 方块类型
   * @returns 对应的材质
   */
  public getMaterial(type: BlockType): THREE.MeshLambertMaterial {
    const material = this.materials.get(type);

    if (material) {
      return material;
    }

    // 如果找不到，返回石头材质作为回退
    const stoneMaterial = this.materials.get(BlockType.STONE);
    if (stoneMaterial) {
      return stoneMaterial;
    }

    // 极端情况：创建默认材质
    console.warn(`未找到方块 ${type} 的材质，使用默认材质`);
    return new THREE.MeshLambertMaterial({ color: 0x808080 });
  }

  /**
   * 异步加载纹理
   * @param url 纹理 URL
   * @returns 加载的纹理
   */
  public async loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture: THREE.Texture) => {
          // 设置纹理过滤为最近邻（像素风格）
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        (error: unknown) => reject(error as Error)
      );
    });
  }

  /**
   * 设置方块的纹理
   * @param type 方块类型
   * @param url 纹理 URL
   */
  public setTextureForBlock(type: BlockType, url: string): void {
    this.loadTexture(url)
      .then((texture: THREE.Texture) => {
        const material = this.getMaterial(type);
        material.map = texture;
        material.needsUpdate = true;
      })
      .catch((error: Error) => {
        console.error(`加载纹理失败 (${url}):`, error);
      });
  }

  /**
   * 加载纹理图集
   * @param url 纹理图集 URL
   * @param tileSize 单个瓦片大小
   */
  public async loadTextureAtlas(url: string, tileSize: number = 16): Promise<void> {
    try {
      this.textureAtlas = await this.loadTexture(url);

      // 设置纹理图集属性
      if (this.textureAtlas) {
        this.textureAtlas.magFilter = THREE.NearestFilter;
        this.textureAtlas.minFilter = THREE.NearestFilter;

        // 计算图集的列数和行数
        const image = this.textureAtlas.image;
        if (image) {
          const textureSize = Math.max(image.width, image.height);
          // 设置纹理重复（每个方块占据 1/tileCount）
          const tileCount = textureSize / tileSize;
          this.textureAtlas.repeat.set(1 / tileCount, 1 / tileCount);
        }
      }
    } catch (error) {
      console.error('加载纹理图集失败:', error);
    }
  }

  /**
   * 设置所有方块的纹理图集 UV
   * 需要在 loadTextureAtlas 之后调用
   */
  public applyTextureAtlasToAll(): void {
    if (!this.textureAtlas) {
      console.warn('纹理图集未加载');
      return;
    }

    for (const [blockType, material] of this.materials) {
      const blockData = BlockRegistry.getBlockData(blockType);
      if (blockData?.textureUV) {
        // 注意：这里简化处理，实际应该为每个方块创建独立的材质
        material.map = this.textureAtlas;
        material.needsUpdate = true;
      }
    }
  }

  /**
   * 获取透明方块列表
   */
  public getTransparentBlocks(): BlockType[] {
    return BlockRegistry.getTransparentBlocks();
  }

  /**
   * 获取不透明方块列表
   */
  public getOpaqueBlocks(): BlockType[] {
    return BlockRegistry.getOpaqueBlocks();
  }

  /**
   * 更新所有材质的颜色
   * @param type 方块类型
   * @param color 新颜色
   */
  public updateBlockColor(type: BlockType, color: number): void {
    const material = this.materials.get(type);
    if (material) {
      material.color.setHex(color);
    }
  }

  /**
   * 清理资源
   * 释放所有材质
   */
  public dispose(): void {
    for (const material of this.materials.values()) {
      material.dispose();
    }
    this.materials.clear();

    if (this.textureAtlas) {
      this.textureAtlas.dispose();
      this.textureAtlas = null;
    }
  }

  /**
   * 获取材质数量
   */
  public getMaterialCount(): number {
    return this.materials.size;
  }

  /**
   * 检查材质是否存在
   */
  public hasMaterial(type: BlockType): boolean {
    return this.materials.has(type);
  }

  /**
   * 验证材质完整性
   */
  public validate(): { valid: boolean; missingBlocks: BlockType[] } {
    const missingBlocks: BlockType[] = [];
    const requiredBlocks = [
      BlockType.GRASS,
      BlockType.DIRT,
      BlockType.STONE,
      BlockType.WOOD,
      BlockType.LEAVES,
      BlockType.SAND,
      BlockType.WATER
    ];

    for (const blockType of requiredBlocks) {
      if (!this.materials.has(blockType)) {
        missingBlocks.push(blockType);
      }
    }

    return {
      valid: missingBlocks.length === 0,
      missingBlocks
    };
  }
}
