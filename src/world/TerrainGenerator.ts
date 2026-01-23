import { VoxelWorld, BlockType } from '../core/VoxelWorld';

export class TerrainGenerator {
  private world: VoxelWorld;

  constructor(world: VoxelWorld) {
    this.world = world;
  }

  public generateFlatTerrain(size: number = 64): void {
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // 地面高度（可以变化）
        const height = 10 + Math.sin(x * 0.1) * 2 + Math.cos(z * 0.1) * 2;

        for (let y = 0; y < height; y++) {
          let blockType: BlockType;

          if (y === height - 1) {
            blockType = BlockType.GRASS; // 表面
          } else if (y >= height - 3) {
            blockType = BlockType.DIRT; // 表土
          } else {
            blockType = BlockType.STONE; // 石头
          }

          this.world.setVoxel(x, y, z, blockType);
        }
      }
    }
  }

  public generateHillsTerrain(size: number = 128): void {
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // 使用简单的噪声算法生成地形
        const height = this.getHeight(x, z);

        for (let y = 0; y < height; y++) {
          let blockType: BlockType;

          if (y === height - 1) {
            blockType = BlockType.GRASS;
          } else if (y >= height - 4) {
            blockType = BlockType.DIRT;
          } else {
            blockType = BlockType.STONE;
          }

          this.world.setVoxel(x, y, z, blockType);
        }
      }
    }
  }

  private getHeight(x: number, z: number): number {
    // 简单的噪声函数
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

  public addTree(x: number, y: number, z: number): void {
    // 简单的树生成器
    const trunkHeight = 4;

    // 树干
    for (let i = 0; i < trunkHeight; i++) {
      this.world.setVoxel(x, y + i, z, BlockType.WOOD);
    }

    // 树叶
    const leavesY = y + trunkHeight;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy < 3; dy++) {
          if (Math.abs(dx) + Math.abs(dz) + dy < 4) {
            this.world.setVoxel(x + dx, leavesY + dy, z + dz, BlockType.LEAVES);
          }
        }
      }
    }
  }
}
