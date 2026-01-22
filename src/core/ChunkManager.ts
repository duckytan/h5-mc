import * as THREE from 'three';
import { VoxelWorld, BlockType } from './VoxelWorld';

export interface ChunkData {
  mesh: THREE.Mesh | null;
  geometry: THREE.BufferGeometry | null;
  cellX: number;
  cellY: number;
  cellZ: number;
}

export class ChunkManager {
  private world: VoxelWorld;
  private cellSize: number;
  private chunks: Map<string, ChunkData>;
  private material: THREE.MeshLambertMaterial;

  // 面定义 - 只渲染可见面
  private static readonly FACES = [
    { dir: [-1, 0, 0], corners: [[0,0,0], [0,1,0], [0,1,1], [0,0,1]] }, // 左
    { dir: [1, 0, 0], corners: [[1,0,0], [1,0,1], [1,1,1], [1,1,0]] },  // 右
    { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] }, // 下
    { dir: [0, 1, 0], corners: [[0,1,0], [0,1,1], [1,1,1], [1,1,0]] },  // 上
    { dir: [0, 0, -1], corners: [[0,0,0], [1,0,0], [1,1,0], [0,1,0]] }, // 前
    { dir: [0, 0, 1], corners: [[0,0,1], [0,1,1], [1,1,1], [1,0,1]] }  // 后
  ];

  constructor(world: VoxelWorld, cellSize: number = 32) {
    this.world = world;
    this.cellSize = cellSize;
    this.chunks = new Map();

    // 创建材质
    this.material = new THREE.MeshLambertMaterial({
      color: 0x888888,
      transparent: true
    });
  }

  private getChunkKey(cellX: number, cellY: number, cellZ: number): string {
    return `${cellX},${cellY},${cellZ}`;
  }

  generateChunk(cellX: number, cellY: number, cellZ: number): THREE.Mesh | null {
    const key = this.getChunkKey(cellX, cellY, cellZ);

    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const startX = cellX * this.cellSize;
    const startY = cellY * this.cellSize;
    const startZ = cellZ * this.cellSize;

    for (let y = 0; y < this.cellSize; y++) {
      for (let z = 0; z < this.cellSize; z++) {
        for (let x = 0; x < this.cellSize; x++) {
          const voxelX = startX + x;
          const voxelY = startY + y;
          const voxelZ = startZ + z;

          const voxelType = this.world.getVoxel(voxelX, voxelY, voxelZ);

          if (voxelType !== BlockType.AIR) {
            // 检查每个面是否需要渲染
            for (const face of ChunkManager.FACES) {
              const neighborX = voxelX + face.dir[0];
              const neighborY = voxelY + face.dir[1];
              const neighborZ = voxelZ + face.dir[2];

              const neighborType = this.world.getVoxel(neighborX, neighborY, neighborZ);

              if (neighborType === BlockType.AIR) {
                // 需要渲染这个面
                const vertexIndex = positions.length / 3;

                // 添加顶点位置
                for (const corner of face.corners) {
                  positions.push(
                    corner[0] + x,
                    corner[1] + y,
                    corner[2] + z
                  );
                  normals.push(face.dir[0], face.dir[1], face.dir[2]);
                }

                // 添加面索引（两个三角形）
                indices.push(
                  vertexIndex, vertexIndex + 1, vertexIndex + 2,
                  vertexIndex + 2, vertexIndex + 1, vertexIndex + 3
                );
              }
            }
          }
        }
      }
    }

    if (positions.length === 0) {
      return null; // 空区块
    }

    // 创建几何体
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    // 创建网格
    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.position.set(startX, startY, startZ);

    // 缓存区块
    this.chunks.set(key, {
      mesh,
      geometry,
      cellX,
      cellY,
      cellZ
    });

    return mesh;
  }

  getChunk(cellX: number, cellY: number, cellZ: number): ChunkData | undefined {
    const key = this.getChunkKey(cellX, cellY, cellZ);
    return this.chunks.get(key);
  }

  removeChunk(cellX: number, cellY: number, cellZ: number): void {
    const key = this.getChunkKey(cellX, cellY, cellZ);
    const chunk = this.chunks.get(key);

    if (chunk) {
      if (chunk.mesh) {
        chunk.mesh.geometry.dispose();
      }
      if (chunk.geometry) {
        chunk.geometry.dispose();
      }
      this.chunks.delete(key);
    }
  }

  updateChunk(cellX: number, cellY: number, cellZ: number): void {
    this.removeChunk(cellX, cellY, cellZ);
    this.generateChunk(cellX, cellY, cellZ);
  }

  dispose(): void {
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) {
        chunk.mesh.geometry.dispose();
      }
    }
    this.chunks.clear();
    this.material.dispose();
  }
}
