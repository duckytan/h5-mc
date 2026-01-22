import * as THREE from 'three';
import { VoxelWorld, BlockType } from '../core/VoxelWorld';
import { ChunkManager } from '../core/ChunkManager';

export interface RaycastResult {
  hit: boolean;
  position?: THREE.Vector3;
  normal?: THREE.Vector3;
  blockType?: BlockType;
}

export class BlockInteraction {
  private camera: THREE.Camera;
  private world: VoxelWorld;
  private chunkManager: ChunkManager;
  private raycaster: THREE.Raycaster;
  private reachDistance: number;

  constructor(camera: THREE.Camera, world: VoxelWorld, chunkManager: ChunkManager) {
    this.camera = camera;
    this.world = world;
    this.chunkManager = chunkManager;
    this.raycaster = new THREE.Raycaster();
    this.reachDistance = 8; // 最大交互距离
  }

  public raycast(): RaycastResult {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    this.raycaster.set(this.camera.position, direction);

    // 获取场景中所有可交互的对象
    const intersects = this.raycaster.intersectObjects(this.chunkManager.scene.children, true);

    if (intersects.length > 0 && intersects[0].distance < this.reachDistance) {
      const intersect = intersects[0];

      return {
        hit: true,
        position: intersect.point,
        normal: intersect.face?.normal,
        blockType: this.world.getVoxel(
          Math.floor(intersect.point.x),
          Math.floor(intersect.point.y),
          Math.floor(intersect.point.z)
        )
      };
    }

    return { hit: false };
  }

  public addBlock(blockType: BlockType = BlockType.GRASS): void {
    const result = this.raycast();

    if (result.hit && result.position && result.normal) {
      // 计算方块放置位置
      const x = Math.floor(result.position.x + result.normal!.x * 0.5);
      const y = Math.floor(result.position.y + result.normal!.y * 0.5);
      const z = Math.floor(result.position.z + result.normal!.z * 0.5);

      // 检查位置是否为空
      if (this.world.getVoxel(x, y, z) === BlockType.AIR) {
        this.world.setVoxel(x, y, z, blockType);

        // 更新区块
        const cellX = Math.floor(x / 32);
        const cellY = Math.floor(y / 32);
        const cellZ = Math.floor(z / 32);
        this.chunkManager.updateChunk(cellX, cellY, cellZ);
      }
    }
  }

  public removeBlock(): void {
    const result = this.raycast();

    if (result.hit && result.position) {
      const x = Math.floor(result.position.x);
      const y = Math.floor(result.position.y);
      const z = Math.floor(result.position.z);

      // 检查方块是否存在
      if (this.world.getVoxel(x, y, z) !== BlockType.AIR) {
        this.world.removeVoxel(x, y, z);

        // 更新区块
        const cellX = Math.floor(x / 32);
        const cellY = Math.floor(y / 32);
        const cellZ = Math.floor(z / 32);
        this.chunkManager.updateChunk(cellX, cellY, cellZ);
      }
    }
  }

  public setSelectedBlockType(blockType: BlockType): void {
    // 更新HUD显示
    const blockNameElement = document.getElementById('selected-block');
    if (blockNameElement) {
      const blockNames = ['空气', '草地方块', '泥土', '石头', '木头', '树叶', '沙子', '水'];
      blockNameElement.textContent = blockNames[blockType] || '未知方块';
    }
  }
}
