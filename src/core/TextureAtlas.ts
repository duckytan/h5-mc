import * as THREE from 'three';
import { BlockType } from './VoxelWorld';
import { BlockRegistry } from './blocks/BlockRegistry';

/**
 * 纹理图集配置
 */
export interface TextureAtlasConfig {
  /** 图集图片 URL */
  url: string;
  /** 单个纹理大小（像素） */
  tileSize: number;
  /** 图集总大小（像素） */
  atlasSize: number;
}

/**
 * 纹理信息
 */
export interface TextureInfo {
  /** UV 坐标起始 U */
  u: number;
  /** UV 坐标起始 V */
  v: number;
  /** UV 坐标结束 U */
  uEnd: number;
  /** UV 坐标结束 V */
  vEnd: number;
}

/**
 * 纹理图集管理器
 * 用于管理和分配纹理图集的 UV 坐标
 */
export class TextureAtlasManager {
  private config: TextureAtlasConfig;
  private textures: Map<string, TextureInfo>;
  private textureAtlas: THREE.Texture | null = null;
  private loaded: boolean = false;
  private loading: boolean = false;

  constructor(config: TextureAtlasConfig) {
    this.config = config;
    this.textures = new Map();
    this.initDefaultTextures();
  }

  /**
   * 初始化默认纹理映射
   */
  private initDefaultTextures(): void {
    // 草方块 - 顶面
    this.textures.set('grass_block_top', {
      u: 0,
      v: 0,
      uEnd: 1 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 草方块 - 侧面
    this.textures.set('grass_block_side', {
      u: 1 / this.config.tileSize,
      v: 0,
      uEnd: 2 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 泥土
    this.textures.set('dirt', {
      u: 2 / this.config.tileSize,
      v: 0,
      uEnd: 3 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 石头
    this.textures.set('stone', {
      u: 3 / this.config.tileSize,
      v: 0,
      uEnd: 4 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 木头/原木
    this.textures.set('wood', {
      u: 4 / this.config.tileSize,
      v: 0,
      uEnd: 5 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 树叶
    this.textures.set('leaves', {
      u: 5 / this.config.tileSize,
      v: 0,
      uEnd: 6 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 沙子
    this.textures.set('sand', {
      u: 6 / this.config.tileSize,
      v: 0,
      uEnd: 7 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });

    // 水
    this.textures.set('water', {
      u: 7 / this.config.tileSize,
      v: 0,
      uEnd: 8 / this.config.tileSize,
      vEnd: 1 / this.config.tileSize
    });
  }

  /**
   * 加载纹理图集
   */
  public async load(): Promise<boolean> {
    if (this.loaded) return true;
    if (this.loading) return false;

    this.loading = true;

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();

      loader.load(
        this.config.url,
        (texture) => {
          this.textureAtlas = texture;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;

          this.loaded = true;
          this.loading = false;
          resolve(true);
        },
        undefined,
        (error) => {
          console.error('加载纹理图集失败:', error);
          this.loading = false;
          resolve(false);
        }
      );
    });
  }

  /**
   * 获取方块的纹理信息
   */
  public getBlockTexture(blockType: BlockType, face: 'top' | 'bottom' | 'side'): TextureInfo | null {
    const blockData = BlockRegistry.getBlockData(blockType);
    if (!blockData) return null;

    // 使用 englishName 作为纹理键
    const textureKey = this.getTextureKey(blockData.englishName, face);
    return this.textures.get(textureKey) || null;
  }

  /**
   * 获取纹理键
   */
  private getTextureKey(blockName: string, face: 'top' | 'bottom' | 'side'): string {
    // 特殊处理草方块
    if (blockName === 'grass_block') {
      if (face === 'top') return 'grass_block_top';
      return 'grass_block_side';
    }

    // 其他方块使用通用名称
    return blockName;
  }

  /**
   * 注册自定义纹理
   */
  public registerTexture(name: string, u: number, v: number): void {
    const tileSize = this.config.tileSize;
    this.textures.set(name, {
      u: u / tileSize,
      v: v / tileSize,
      uEnd: (u + 1) / tileSize,
      vEnd: (v + 1) / tileSize
    });
  }

  /**
   * 获取纹理图集
   */
  public getTextureAtlas(): THREE.Texture | null {
    return this.textureAtlas;
  }

  /**
   * 是否已加载
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 获取配置
   */
  public getConfig(): TextureAtlasConfig {
    return { ...this.config };
  }

  /**
   * 获取所有已注册的纹理
   */
  public getAllTextures(): Map<string, TextureInfo> {
    return new Map(this.textures);
  }

  /**
   * 创建使用此图集的材质
   */
  public createMaterial(opacity: number = 1): THREE.MeshLambertMaterial {
    return new THREE.MeshLambertMaterial({
      map: this.textureAtlas,
      transparent: opacity < 1,
      opacity: opacity
    });
  }

  /**
   * 获取 UV 变换矩阵
   * 用于在着色器中实现纹理图集
   */
  public getUVTransform(textureInfo: TextureInfo): THREE.Matrix4 {
    // 计算 UV 偏移和缩放
    const uScale = textureInfo.uEnd - textureInfo.u;
    const vScale = textureInfo.vEnd - textureInfo.v;

    // 创建变换矩阵
    return new THREE.Matrix4().makeTranslation(
      textureInfo.u,
      textureInfo.v,
      0
    ).scale(new THREE.Vector3(uScale, vScale, 1));
  }
}

/**
 * 纹理分块器
 * 用于从大图中提取单个纹理
 */
export class TexturePacker {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number;
  private cols: number;
  private rows: number;

  constructor(tileSize: number, cols: number = 16, rows: number = 16) {
    this.tileSize = tileSize;
    this.cols = cols;
    this.rows = rows;
    this.canvas = document.createElement('canvas');
    this.canvas.width = tileSize * cols;
    this.canvas.height = tileSize * rows;
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 添加纹理
   */
  public addTexture(name: string, image: HTMLImageElement): void {
    const index = this.textures.size;
    const x = (index % this.cols) * this.tileSize;
    const y = Math.floor(index / this.cols) * this.tileSize;

    this.ctx.drawImage(image, x, y, this.tileSize, this.tileSize);
  }

  /**
   * 获取生成的图集
   */
  public getAtlas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取图集数据 URL
   */
  public getDataURL(): string {
    return this.canvas.toDataURL();
  }

  /**
   * 获取纹理位置
   */
  public getTexturePosition(name: string): { u: number; v: number } | null {
    // 简化实现，实际需要维护 name -> index 的映射
    return null;
  }
}
