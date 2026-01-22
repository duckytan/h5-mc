export enum BlockType {
  AIR = 0,
  GRASS = 1,
  DIRT = 2,
  STONE = 3,
  WOOD = 4,
  LEAVES = 5,
  SAND = 6,
  WATER = 7
}

export interface VoxelData {
  type: BlockType;
  x: number;
  y: number;
  z: number;
}

export class VoxelWorld {
  private cellSize: number;
  private cellSliceSize: number;
  private cells: Map<string, Uint8Array>;

  constructor(cellSize: number = 32) {
    this.cellSize = cellSize;
    this.cellSliceSize = cellSize * cellSize;
    this.cells = new Map();
  }

  private getCellKey(x: number, y: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellY},${cellZ}`;
  }

  private getCellForVoxel(x: number, y: number, z: number): Uint8Array | null {
    const key = this.getCellKey(x, y, z);
    return this.cells.get(key) || null;
  }

  private computeVoxelOffset(x: number, y: number, z: number): number {
    const voxelX = ((x % this.cellSize) + this.cellSize) % this.cellSize;
    const voxelY = ((y % this.cellSize) + this.cellSize) % this.cellSize;
    const voxelZ = ((z % this.cellSize) + this.cellSize) % this.cellSize;
    return voxelY * this.cellSliceSize + voxelZ * this.cellSize + voxelX;
  }

  setVoxel(x: number, y: number, z: number, type: BlockType): void {
    let cell = this.getCellForVoxel(x, y, z);

    if (!cell) {
      if (type === BlockType.AIR) return; // Don't create cell for air

      const key = this.getCellKey(x, y, z);
      cell = new Uint8Array(this.cellSize * this.cellSize * this.cellSize);
      this.cells.set(key, cell);
    }

    const offset = this.computeVoxelOffset(x, y, z);
    cell[offset] = type;
  }

  getVoxel(x: number, y: number, z: number): BlockType {
    const cell = this.getCellForVoxel(x, y, z);

    if (!cell) {
      return BlockType.AIR;
    }

    const offset = this.computeVoxelOffset(x, y, z);
    return cell[offset] as BlockType;
  }

  removeVoxel(x: number, y: number, z: number): void {
    this.setVoxel(x, y, z, BlockType.AIR);
  }

  getAllVoxels(): VoxelData[] {
    const voxels: VoxelData[] = [];

    for (const [key, cell] of this.cells) {
      const [cellX, cellY, cellZ] = key.split(',').map(Number);
      const startX = cellX * this.cellSize;
      const startY = cellY * this.cellSize;
      const startZ = cellZ * this.cellSize;

      for (let y = 0; y < this.cellSize; y++) {
        for (let z = 0; z < this.cellSize; z++) {
          for (let x = 0; x < this.cellSize; x++) {
            const offset = y * this.cellSliceSize + z * this.cellSize + x;
            const type = cell[offset];

            if (type !== BlockType.AIR) {
              voxels.push({
                type,
                x: startX + x,
                y: startY + y,
                z: startZ + z
              });
            }
          }
        }
      }
    }

    return voxels;
  }

  clear(): void {
    this.cells.clear();
  }
}
