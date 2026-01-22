import * as THREE from 'three';
import { BlockType } from '../VoxelWorld';

/**
 * 方块元数据接口
 * 存储方块的物理属性和渲染属性
 */
export interface BlockData {
  /** 方块类型 */
  readonly type: BlockType;
  /** 方块名称（中文） */
  readonly name: string;
  /** 英文名称（用于材质映射） */
  readonly englishName: string;
  /** 挖掘硬度（秒为单位） */
  readonly hardness: number;
  /** 是否不透明（影响光照） */
  readonly isOpaque: boolean;
  /** 是否透明（影响渲染顺序） */
  readonly isTransparent: boolean;
  /** 是否固体（影响碰撞） */
  readonly isSolid: boolean;
  /** 自发光强度（0-15） */
  readonly emitsLight: number;
  /** 阻挡光线强度（0-15） */
  readonly blocksLight: number;
  /** 默认材质颜色 */
  readonly defaultColor: number;
  /** 纹理图集UV坐标（可选） */
  readonly textureUV?: { u: number; v: number };
}

/**
 * 方块状态接口
 * 存储方块的动态状态（如水位、旋转等）
 */
export interface BlockState {
  /** 方块类型 */
  readonly type: BlockType;
  /** 元数据值（0-15） */
  readonly meta: number;
}

/**
 * 方块注册表
 * 管理所有方块的元数据
 */
export class BlockRegistry {
  /** 存储所有方块数据的映射 */
  private static readonly blocks = new Map<BlockType, BlockData>();

  /** 默认状态映射 */
  private static readonly defaultStates = new Map<BlockType, BlockState>();

  /**
   * 初始化所有方块数据
   */
  public static init(): void {
    // 空气（特殊方块）
    this.register({
      type: BlockType.AIR,
      name: '空气',
      englishName: 'air',
      hardness: 0,
      isOpaque: false,
      isTransparent: true,
      isSolid: false,
      emitsLight: 0,
      blocksLight: 0,
      defaultColor: 0x000000
    });

    // 草方块
    this.register({
      type: BlockType.GRASS,
      name: '草方块',
      englishName: 'grass_block',
      hardness: 0.6,
      isOpaque: true,
      isTransparent: false,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 15,
      defaultColor: 0x4a7c59,
      textureUV: { u: 0, v: 0 }
    });

    // 泥土
    this.register({
      type: BlockType.DIRT,
      name: '泥土',
      englishName: 'dirt',
      hardness: 0.5,
      isOpaque: true,
      isTransparent: false,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 15,
      defaultColor: 0x8b4513
    });

    // 石头
    this.register({
      type: BlockType.STONE,
      name: '石头',
      englishName: 'stone',
      hardness: 1.5,
      isOpaque: true,
      isTransparent: false,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 15,
      defaultColor: 0x808080
    });

    // 木头（原木）
    this.register({
      type: BlockType.WOOD,
      name: '木头',
      englishName: 'log',
      hardness: 2.0,
      isOpaque: true,
      isTransparent: false,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 15,
      defaultColor: 0x9b7653
    });

    // 树叶
    this.register({
      type: BlockType.LEAVES,
      name: '树叶',
      englishName: 'leaves',
      hardness: 0.2,
      isOpaque: false,
      isTransparent: true,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 1,
      defaultColor: 0x228b22
    });

    // 沙子
    this.register({
      type: BlockType.SAND,
      name: '沙子',
      englishName: 'sand',
      hardness: 0.5,
      isOpaque: true,
      isTransparent: false,
      isSolid: true,
      emitsLight: 0,
      blocksLight: 15,
      defaultColor: 0xf4a460
    });

    // 水
    this.register({
      type: BlockType.WATER,
      name: '水',
      englishName: 'water',
      hardness: 0,
      isOpaque: false,
      isTransparent: true,
      isSolid: false,
      emitsLight: 0,
      blocksLight: 3,
      defaultColor: 0x4169e1
    });

    // 初始化默认状态
    this.initDefaultStates();
  }

  /**
   * 初始化所有方块的默认状态
   */
  private static initDefaultStates(): void {
    for (const type of this.blocks.keys()) {
      this.defaultStates.set(type, {
        type,
        meta: 0
      });
    }
  }

  /**
   * 注册方块数据
   */
  public static register(data: BlockData): void {
    if (this.blocks.has(data.type)) {
      console.warn(`方块类型 ${data.type} 已存在，将被覆盖`);
    }
    this.blocks.set(data.type, data);
  }

  /**
   * 获取方块数据
   */
  public static getBlockData(type: BlockType): BlockData | undefined {
    return this.blocks.get(type);
  }

  /**
   * 获取方块名称
   */
  public static getBlockName(type: BlockType): string {
    const data = this.blocks.get(type);
    return data?.name ?? '未知方块';
  }

  /**
   * 获取方块硬度
   */
  public static getHardness(type: BlockType): number {
    const data = this.blocks.get(type);
    return data?.hardness ?? 0;
  }

  /**
   * 检查方块是否不透明
   */
  public static isOpaque(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.isOpaque ?? false;
  }

  /**
   * 检查方块是否透明
   */
  public static isTransparent(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.isTransparent ?? false;
  }

  /**
   * 检查方块是否为固体
   */
  public static isSolid(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.isSolid ?? true;
  }

  /**
   * 检查方块是否阻挡光线
   */
  public static blocksLight(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.blocksLight ? data.blocksLight > 0 : false;
  }

  /**
   * 获取方块阻挡光线的强度
   */
  public static getLightBlocking(type: BlockType): number {
    const data = this.blocks.get(type);
    return data?.blocksLight ?? 0;
  }

  /**
   * 检查方块是否需要渲染
     * 空气和完全透明方块不需要渲染
   */
  public static needsRender(type: BlockType): boolean {
    const data = this.blocks.get(type);
    if (!data) return false;
    // 不渲染空气
    if (data.type === BlockType.AIR) return false;
    return true;
  }

  /**
   * 获取所有注册的方块类型
   */
  public static getAllBlockTypes(): BlockType[] {
    return Array.from(this.blocks.keys());
  }

  /**
   * 获取方块的默认状态
   */
  public static getDefaultState(type: BlockType): BlockState {
    const state = this.defaultStates.get(type);
    if (state) {
      return state;
    }
    // 如果没有默认状态，创建一个
    return {
      type,
      meta: 0
    };
  }

  /**
   * 根据名称查找方块类型
   */
  public static getBlockTypeByName(name: string): BlockType | undefined {
    for (const [type, data] of this.blocks.entries()) {
      if (data.name === name || data.englishName === name) {
        return type;
      }
    }
    return undefined;
  }

  /**
   * 检查方块是否可以放置
   */
  public static canPlace(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.isSolid ?? true;
  }

  /**
   * 检查方块是否可以破坏
   */
  public static canBreak(type: BlockType): boolean {
    const data = this.blocks.get(type);
    return data?.hardness ?? 0 >= 0;
  }

  /**
   * 获取所有不透明方块类型
   */
  public static getOpaqueBlocks(): BlockType[] {
    const opaqueBlocks: BlockType[] = [];
    for (const [type, data] of this.blocks.entries()) {
      if (data.isOpaque) {
        opaqueBlocks.push(type);
      }
    }
    return opaqueBlocks;
  }

  /**
   * 获取所有透明方块类型
   */
  public static getTransparentBlocks(): BlockType[] {
    const transparentBlocks: BlockType[] = [];
    for (const [type, data] of this.blocks.entries()) {
      if (data.isTransparent) {
        transparentBlocks.push(type);
      }
    }
    return transparentBlocks;
  }

  /**
   * 创建方块的材质颜色
   * 返回用于 Three.js 材质的颜色配置
   */
  public static getMaterialConfig(type: BlockType): { color: number; transparent: boolean; opacity?: number } {
    const data = this.blocks.get(type);
    if (!data) {
      return { color: 0x808080, transparent: false };
    }
    return {
      color: data.defaultColor,
      transparent: data.isTransparent,
      opacity: data.isTransparent ? 0.7 : undefined
    };
  }

  /**
   * 验证方块数据完整性
   * 用于调试和测试
   */
  public static validate(): { valid: boolean; missingBlocks: BlockType[] } {
    const missingBlocks: BlockType[] = [];
    const requiredTypes = [
      BlockType.GRASS,
      BlockType.DIRT,
      BlockType.STONE,
      BlockType.WOOD,
      BlockType.LEAVES,
      BlockType.SAND,
      BlockType.WATER
    ];

    for (const type of requiredTypes) {
      if (!this.blocks.has(type)) {
        missingBlocks.push(type);
      }
    }

    return {
      valid: missingBlocks.length === 0,
      missingBlocks
    };
  }
}

// 初始化注册表
BlockRegistry.init();
