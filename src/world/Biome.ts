import { BlockType } from '../core/VoxelWorld';

/**
 * 生物群系类型
 */
export enum BiomeType {
  /** 平原 - 默认地形 */
  PLAINS = 'plains',
  /** 森林 - 更多的树 */
  FOREST = 'forest',
  /** 沙漠 - 沙子和沙石 */
  DESERT = 'desert',
  /** 雪原 - 雪和冰 */
  SNOW = 'snow',
  /** 山地 - 高海拔 */
  MOUNTAIN = 'mountain',
  /** 沼泽 - 水和枯萎的灌木 */
  SWAMP = 'swamp',
  /** 海洋 - 水下 */
  OCEAN = 'ocean',
  /** 丛林 - 密集的树木 */
  JUNGLE = 'jungle'
}

/**
 * 生物群系配置
 */
export interface BiomeConfig {
  /** 生物群系类型 */
  type: BiomeType;
  /** 显示名称 */
  name: string;
  /** 基础高度 */
  baseHeight: number;
  /** 高度变化幅度 */
  heightVariation: number;
  /** 湿度 (0-1) */
  humidity: number;
  /** 温度 (0-1) */
  temperature: number;
  /** 表面方块 */
  topBlock: BlockType;
  /** 地下方块 */
  subsurfaceBlock: BlockType;
  /** 石头方块 */
  stoneBlock: BlockType;
  /** 树密度 (0-1) */
  treeDensity: number;
  /** 是否生成水 */
  hasWater: boolean;
  /** 水位高度 */
  waterLevel: number;
  /** 颜色 (用于小地图等) */
  color: number;
}

/**
 * 生物群系管理器
 * 管理不同生物群系的生成和转换
 */
export class BiomeManager {
  private biomes: Map<BiomeType, BiomeConfig>;
  private biomeNoiseScale: number = 0.02;
  private humidityNoiseScale: number = 0.03;
  private temperatureNoiseScale: number = 0.02;

  constructor() {
    this.biomes = new Map();
    this.initBiomes();
  }

  /**
   * 初始化所有生物群系配置
   */
  private initBiomes(): void {
    // 平原
    this.biomes.set(BiomeType.PLAINS, {
      type: BiomeType.PLAINS,
      name: '平原',
      baseHeight: 8,
      heightVariation: 6,
      humidity: 0.5,
      temperature: 0.7,
      topBlock: BlockType.GRASS,
      subsurfaceBlock: BlockType.DIRT,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.05,
      hasWater: true,
      waterLevel: 4,
      color: 0x4a7c59
    });

    // 森林
    this.biomes.set(BiomeType.FOREST, {
      type: BiomeType.FOREST,
      name: '森林',
      baseHeight: 10,
      heightVariation: 8,
      humidity: 0.7,
      temperature: 0.6,
      topBlock: BlockType.GRASS,
      subsurfaceBlock: BlockType.DIRT,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.15,
      hasWater: true,
      waterLevel: 4,
      color: 0x228b22
    });

    // 沙漠
    this.biomes.set(BiomeType.DESERT, {
      type: BiomeType.DESERT,
      name: '沙漠',
      baseHeight: 12,
      heightVariation: 4,
      humidity: 0.1,
      temperature: 0.95,
      topBlock: BlockType.SAND,
      subsurfaceBlock: BlockType.SAND,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.0,
      hasWater: false,
      waterLevel: 0,
      color: 0xf4a460
    });

    // 雪原
    this.biomes.set(BiomeType.SNOW, {
      type: BiomeType.SNOW,
      name: '雪原',
      baseHeight: 14,
      heightVariation: 10,
      humidity: 0.6,
      temperature: 0.1,
      topBlock: BlockType.GRASS,
      subsurfaceBlock: BlockType.DIRT,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.02,
      hasWater: true,
      waterLevel: 3,
      color: 0xffffff
    });

    // 山地
    this.biomes.set(BiomeType.MOUNTAIN, {
      type: BiomeType.MOUNTAIN,
      name: '山地',
      baseHeight: 20,
      heightVariation: 20,
      humidity: 0.4,
      temperature: 0.3,
      topBlock: BlockType.STONE,
      subsurfaceBlock: BlockType.STONE,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.01,
      hasWater: false,
      waterLevel: 0,
      color: 0x808080
    });

    // 沼泽
    this.biomes.set(BiomeType.SWAMP, {
      type: BiomeType.SWAMP,
      name: '沼泽',
      baseHeight: 5,
      heightVariation: 3,
      humidity: 0.9,
      temperature: 0.6,
      topBlock: BlockType.GRASS,
      subsurfaceBlock: BlockType.DIRT,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.08,
      hasWater: true,
      waterLevel: 6,
      color: 0x4a6741
    });

    // 丛林
    this.biomes.set(BiomeType.JUNGLE, {
      type: BiomeType.JUNGLE,
      name: '丛林',
      baseHeight: 10,
      heightVariation: 7,
      humidity: 0.8,
      temperature: 0.85,
      topBlock: BlockType.GRASS,
      subsurfaceBlock: BlockType.DIRT,
      stoneBlock: BlockType.STONE,
      treeDensity: 0.25,
      hasWater: true,
      waterLevel: 4,
      color: 0x006400
    });
  }

  /**
   * 根据坐标获取生物群系
   */
  public getBiome(x: number, z: number): BiomeConfig {
    // 使用噪声函数生成生物群系
    const biomeNoise = this.getBiomeNoise(x, z);
    const humidity = this.getHumidity(x, z);
    const temperature = this.getTemperature(x, z);

    // 根据温度和湿度选择生物群系
    if (temperature < 0.2) {
      return this.biomes.get(BiomeType.SNOW)!;
    } else if (humidity < 0.2 && temperature > 0.7) {
      return this.biomes.get(BiomeType.DESERT)!;
    } else if (humidity > 0.75 && temperature > 0.7) {
      return this.biomes.get(BiomeType.JUNGLE)!;
    } else if (humidity > 0.7) {
      return this.biomes.get(BiomeType.FOREST)!;
    } else if (humidity > 0.5) {
      return this.biomes.get(BiomeType.PLAINS)!;
    } else if (biomeNoise > 0.5) {
      return this.biomes.get(BiomeType.MOUNTAIN)!;
    } else if (humidity < 0.3) {
      return this.biomes.get(BiomeType.PLAINS)!;
    } else {
      return this.biomes.get(BiomeType.SWAMP)!;
    }
  }

  /**
   * 获取生物群系噪声值
   */
  private getBiomeNoise(x: number, z: number): number {
    const scale = this.biomeNoiseScale;
    const noise1 = Math.sin(x * scale) * Math.cos(z * scale);
    const noise2 = Math.sin(x * scale * 2 + 1) * Math.cos(z * scale * 2 + 1) * 0.5;
    const noise3 = Math.sin(x * scale * 4 + 2) * Math.cos(z * scale * 4 + 2) * 0.25;
    return (noise1 + noise2 + noise3) / 1.75;
  }

  /**
   * 获取湿度值
   */
  private getHumidity(x: number, z: number): number {
    const scale = this.humidityNoiseScale;
    const noise = Math.sin(x * scale) * Math.cos(z * scale);
    return (noise + 1) / 2;
  }

  /**
   * 获取温度值
   */
  private getTemperature(x: number, z: number): number {
    const scale = this.temperatureNoiseScale;
    // 温度随纬度变化（z 坐标）
    const latitudinalVariation = 1 - Math.abs(z % 100) / 50;
    const noise = Math.sin(x * scale) * Math.cos(z * scale) * 0.3;
    return Math.max(0, Math.min(1, 0.7 + latitudinalVariation * 0.3 + noise));
  }

  /**
   * 根据坐标获取高度
   */
  public getHeight(x: number, z: number): number {
    const biome = this.getBiome(x, z);
    const scale1 = 0.02;
    const scale2 = 0.05;
    const scale3 = 0.01;

    const noise1 = Math.sin(x * scale1) * Math.cos(z * scale1);
    const noise2 = Math.sin(x * scale2) * Math.cos(z * scale2);
    const noise3 = Math.sin(x * scale3) * Math.cos(z * scale3);

    const variation = biome.heightVariation;
    const base = biome.baseHeight;

    return Math.floor(
      base +
      noise1 * variation * 0.5 +
      noise2 * variation * 0.3 +
      noise3 * variation * 0.2
    );
  }

  /**
   * 获取某位置的地表方块类型
   */
  public getTopBlock(x: number, z: number): BlockType {
    const biome = this.getBiome(x, z);
    const height = this.getHeight(x, z);

    // 如果在水面以下，可能使用不同的方块
    if (biome.hasWater && height < biome.waterLevel) {
      return BlockType.WATER;
    }

    return biome.topBlock;
  }

  /**
   * 获取所有生物群系类型
   */
  public getAllBiomeTypes(): BiomeType[] {
    return Array.from(this.biomes.keys());
  }

  /**
   * 获取生物群系配置
   */
  public getBiomeConfig(type: BiomeType): BiomeConfig | undefined {
    return this.biomes.get(type);
  }

  /**
   * 获取最近的生物群系过渡点
   */
  public getBiomeTransition(x: number, z: number, radius: number): BiomeTransition {
    let transitions: BiomeTransitionEdge[] = [];

    const steps = Math.ceil(radius / 5);
    for (let i = 1; i <= steps; i++) {
      const offset = i * 5;
      const neighbors = [
        { dx: offset, dz: 0 },
        { dx: -offset, dz: 0 },
        { dx: 0, dz: offset },
        { dx: 0, dz: -offset }
      ];

      for (const n of neighbors) {
        const currentBiome = this.getBiome(x, z);
        const neighborBiome = this.getBiome(x + n.dx, z + n.dz);

        if (currentBiome.type !== neighborBiome.type) {
          transitions.push({
            from: currentBiome.type,
            to: neighborBiome.type,
            distance: i * 5
          });
        }
      }
    }

    // 返回最近的过渡
    transitions.sort((a, b) => a.distance - b.distance);
    return {
      current: this.getBiome(x, z).type,
      edges: transitions.slice(0, 4)
    };
  }
}

/**
 * 生物群系过渡信息
 */
export interface BiomeTransition {
  current: BiomeType;
  edges: BiomeTransitionEdge[];
}

/**
 * 生物群系过渡边缘
 */
export interface BiomeTransitionEdge {
  from: BiomeType;
  to: BiomeType;
  distance: number;
}

/**
 * 生物群系混合器
 * 用于在生物群系边界创建平滑过渡
 */
export class BiomeBlender {
  private biomeManager: BiomeManager;
  private blendRadius: number = 8;

  constructor(biomeManager: BiomeManager) {
    this.biomeManager = biomeManager;
  }

  /**
   * 获取混合后的方块类型
   */
  public getBlendedBlock(x: number, y: number, z: number): BlockType {
    const biome = this.biomeManager.getBiome(x, z);
    const height = this.biomeManager.getHeight(x, z);

    // 如果在表面，检查是否是过渡区域
    if (Math.abs(y - height) < this.blendRadius) {
      const blendedBiome = this.getBlendedBiome(x, z);
      return this.getBlockForBiome(blendedBiome, y, height);
    }

    return this.getBlockForBiome(biome, y, height);
  }

  /**
   * 获取混合后的生物群系
   */
  private getBlendedBiome(x: number, z: number): BiomeConfig {
    const centerBiome = this.biomeManager.getBiome(x, z);
    const transitions = this.biomeManager.getBiomeTransition(x, z, this.blendRadius);

    // 计算加权平均
    let totalWeight = 1;
    let weightedBiome = { ...centerBiome };

    for (const edge of transitions.edges) {
      const neighborConfig = this.biomeManager.getBiomeConfig(edge.to);
      if (neighborConfig) {
        const weight = 1 - (edge.distance / this.blendRadius);
        totalWeight += weight;

        // 混合配置
        weightedBiome.baseHeight += (neighborConfig.baseHeight - centerBiome.baseHeight) * weight * 0.3;
        weightedBiome.treeDensity += (neighborConfig.treeDensity - centerBiome.treeDensity) * weight * 0.3;
      }
    }

    return weightedBiome;
  }

  /**
   * 根据生物群系和高度获取方块
   */
  private getBlockForBiome(biome: BiomeConfig, y: number, surfaceY: number): BlockType {
    const depth = surfaceY - y;

    if (y >= surfaceY) {
      // 水面以上
      if (biome.hasWater && y <= biome.waterLevel) {
        return BlockType.WATER;
      }
      return biome.topBlock;
    } else if (depth < 3) {
      // 表面下 3 格以内
      return biome.subsurfaceBlock;
    } else {
      // 更深的地方
      return biome.stoneBlock;
    }
  }

  /**
   * 设置混合半径
   */
  public setBlendRadius(radius: number): void {
    this.blendRadius = Math.max(1, Math.min(16, radius));
  }

  /**
   * 获取混合半径
   */
  public getBlendRadius(): number {
    return this.blendRadius;
  }
}
