import { VoxelWorld, BlockType } from '../core/VoxelWorld';
import { BiomeManager, BiomeBlender, BiomeType } from './Biome';

/**
 * 地形生成器
 * 使用生物群系系统生成多样化的地形
 */
export class TerrainGenerator {
  private world: VoxelWorld;
  private biomeManager: BiomeManager;
  private useBiomes: boolean = true;
  private treeCount: number = 0;
  private maxTrees: number = 200;

  constructor(world: VoxelWorld, useBiomes: boolean = true) {
    this.world = world;
    this.useBiomes = useBiomes;
    this.biomeManager = new BiomeManager();
  }

  /**
   * 生成平坦地形
   */
  public generateFlatTerrain(size: number = 64): void {
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const height = 10;

        for (let y = 0; y < height; y++) {
          let blockType: BlockType;

          if (y === height - 1) {
            blockType = BlockType.GRASS;
          } else if (y >= height - 3) {
            blockType = BlockType.DIRT;
          } else {
            blockType = BlockType.STONE;
          }

          this.world.setVoxel(x, y, z, blockType);
        }
      }
    }
  }

  /**
   * 生成丘陵地形（使用生物群系）
   */
  public generateHillsTerrain(size: number = 128): void {
    this.treeCount = 0;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        let height: number;
        let biome: { type: BiomeType; treeDensity: number };

        if (this.useBiomes) {
          height = this.biomeManager.getHeight(x, z);
          biome = {
            type: this.biomeManager.getBiome(x, z).type,
            treeDensity: this.biomeManager.getBiome(x, z).treeDensity
          };
        } else {
          height = this.getHeight(x, z);
          biome = { type: BiomeType.PLAINS, treeDensity: 0.05 };
        }

        // 获取生物群系配置
        const biomeConfig = this.biomeManager.getBiomeConfig(biome.type);
        const waterLevel = biomeConfig?.waterLevel ?? 4;

        // 生成方块
        for (let y = 0; y < height; y++) {
          let blockType: BlockType;

          if (this.useBiomes) {
            // 使用生物群系确定方块类型
            blockType = this.getBlockForBiome(biomeConfig!, y, height, waterLevel);
          } else {
            if (y === height - 1) {
              blockType = BlockType.GRASS;
            } else if (y >= height - 4) {
              blockType = BlockType.DIRT;
            } else {
              blockType = BlockType.STONE;
            }
          }

          this.world.setVoxel(x, y, z, blockType);
        }

        // 生成水
        if (biomeConfig?.hasWater) {
          for (let y = waterLevel; y < height && y < height; y++) {
            if (this.world.getVoxel(x, y, z) === BlockType.AIR) {
              this.world.setVoxel(x, y, z, BlockType.WATER);
            }
          }
        }

        // 尝试生成树
        if (this.useBiomes && Math.random() < biome.treeDensity && this.treeCount < this.maxTrees) {
          if (height > waterLevel + 1) {
            this.addTree(x, height, z);
            this.treeCount++;
          }
        }
      }
    }

    console.log(`生成了 ${this.treeCount} 棵树`);
  }

  /**
   * 根据生物群系获取方块类型
   */
  private getBlockForBiome(
    biome: { topBlock: BlockType; subsurfaceBlock: BlockType; stoneBlock: BlockType; hasWater: boolean; waterLevel: number },
    y: number,
    surfaceY: number,
    waterLevel: number
  ): BlockType {
    const depth = surfaceY - y;

    // 水面以下
    if (biome.hasWater && y <= waterLevel && y < surfaceY) {
      return BlockType.WATER;
    }

    // 水面以上
    if (y >= surfaceY) {
      return biome.topBlock;
    } else if (depth < 3) {
      // 表土层
      return biome.subsurfaceBlock;
    } else {
      // 岩石层
      return biome.stoneBlock;
    }
  }

  /**
   * 生成带有生物群系变化的地形
   */
  public generateBiomeTerrain(size: number = 128): void {
    this.treeCount = 0;

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // 获取生物群系
        const biome = this.biomeManager.getBiome(x, z);
        const height = this.biomeManager.getHeight(x, z);
        const config = this.biomeManager.getBiomeConfig(biome.type)!;

        // 生成方块
        for (let y = 0; y < height; y++) {
          const blockType = this.getBlockForBiome(config, y, height, config.waterLevel);
          this.world.setVoxel(x, y, z, blockType);
        }

        // 生成水
        if (config.hasWater) {
          for (let y = config.waterLevel; y < height && y < height; y++) {
            if (this.world.getVoxel(x, y, z) === BlockType.AIR) {
              this.world.setVoxel(x, y, z, BlockType.WATER);
            }
          }
        }

        // 生成树
        if (Math.random() < config.treeDensity && this.treeCount < this.maxTrees) {
          if (height > config.waterLevel + 1) {
            this.addTree(x, height, z);
            this.treeCount++;
          }
        }
      }
    }

    console.log(`生物群系地形生成了 ${this.treeCount} 棵树`);
  }

  /**
   * 获取高度（不使用生物群系时）
   */
  private getHeight(x: number, z: number): number {
    const scale1 = 0.05;
    const scale2 = 0.1;
    const scale3 = 0.02;

    const noise1 = Math.sin(x * scale1) * Math.cos(z * scale1);
    const noise2 = Math.sin(x * scale2) * Math.cos(z * scale2);
    const noise3 = Math.sin(x * scale3) * Math.cos(z * scale3);

    const baseHeight = 8;
    const amplitude = 6;

    return Math.floor(
      baseHeight +
      noise1 * amplitude * 0.5 +
      noise2 * amplitude * 0.3 +
      noise3 * amplitude * 0.2
    );
  }

  /**
   * 添加树
   */
  public addTree(x: number, y: number, z: number): void {
    const trunkHeight = 4 + Math.floor(Math.random() * 2);

    // 树干
    for (let i = 0; i < trunkHeight; i++) {
      this.world.setVoxel(x, y + i, z, BlockType.WOOD);
    }

    // 树叶
    const leavesY = y + trunkHeight;
    const leavesRadius = 2;

    for (let dx = -leavesRadius; dx <= leavesRadius; dx++) {
      for (let dz = -leavesRadius; dz <= leavesRadius; dz++) {
        for (let dy = 0; dy < 3; dy++) {
          const dist = Math.abs(dx) + Math.abs(dz) + dy;
          if (dist < 4 && !(dx === 0 && dz === 0 && dy === 0)) {
            this.world.setVoxel(x + dx, leavesY + dy, z + dz, BlockType.LEAVES);
          }
        }
      }
    }
  }

  /**
   * 添加大型树
   */
  public addBigTree(x: number, y: number, z: number): void {
    const trunkHeight = 6 + Math.floor(Math.random() * 4);

    // 树干
    for (let i = 0; i < trunkHeight; i++) {
      this.world.setVoxel(x, y + i, z, BlockType.WOOD);
      if (i > 2) {
        this.world.setVoxel(x + 1, y + i, z, BlockType.WOOD);
        this.world.setVoxel(x - 1, y + i, z, BlockType.WOOD);
        this.world.setVoxel(x, y + i, z + 1, BlockType.WOOD);
        this.world.setVoxel(x, y + i, z - 1, BlockType.WOOD);
      }
    }

    // 大型树冠
    const leavesY = y + trunkHeight;
    for (let layer = 0; layer < 4; layer++) {
      const radius = 3 - Math.floor(layer / 2);
      const layerY = leavesY + layer;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) + Math.abs(dz) <= radius + 1) {
            if (this.world.getVoxel(x + dx, layerY, z + dz) === BlockType.AIR) {
              this.world.setVoxel(x + dx, layerY, z + dz, BlockType.LEAVES);
            }
          }
        }
      }
    }
  }

  /**
   * 添加桦树
   */
  public addBirchTree(x: number, y: number, z: number): void {
    const trunkHeight = 5 + Math.floor(Math.random() * 3);

    // 白色树干
    for (let i = 0; i < trunkHeight; i++) {
      this.world.setVoxel(x, y + i, z, BlockType.WOOD);
    }

    // 树叶（更圆润）
    const leavesY = y + trunkHeight;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy < 3; dy++) {
          const dist = Math.sqrt(dx * dx + dz * dz) + dy;
          if (dist < 3.5) {
            this.world.setVoxel(x + dx, leavesY + dy, z + dz, BlockType.LEAVES);
          }
        }
      }
    }
  }

  /**
   * 获取生物群系管理器
   */
  public getBiomeManager(): BiomeManager {
    return this.biomeManager;
  }

  /**
   * 设置是否使用生物群系
   */
  public setUseBiomes(useBiomes: boolean): void {
    this.useBiomes = useBiomes;
  }

  /**
   * 获取当前生物群系
   */
  public getBiomeAt(x: number, z: number): BiomeType {
    return this.biomeManager.getBiome(x, z).type;
  }

  /**
   * 生成特定生物群系区域
   */
  public generateBiomeRegion(
    minX: number,
    maxX: number,
    minZ: number,
    maxZ: number,
    biomeType: BiomeType
  ): void {
    const config = this.biomeManager.getBiomeConfig(biomeType);
    if (!config) return;

    this.treeCount = 0;

    for (let x = minX; x < maxX; x++) {
      for (let z = minZ; z < maxZ; z++) {
        const height = this.biomeManager.getHeight(x, z);

        for (let y = 0; y < height; y++) {
          const blockType = this.getBlockForBiome(config, y, height, config.waterLevel);
          this.world.setVoxel(x, y, z, blockType);
        }

        // 生成水
        if (config.hasWater) {
          for (let y = config.waterLevel; y < height && y < height; y++) {
            if (this.world.getVoxel(x, y, z) === BlockType.AIR) {
              this.world.setVoxel(x, y, z, BlockType.WATER);
            }
          }
        }

        // 生成树
        if (Math.random() < config.treeDensity && this.treeCount < 50) {
          if (height > config.waterLevel + 1) {
            this.addTree(x, height, z);
            this.treeCount++;
          }
        }
      }
    }
  }
}
