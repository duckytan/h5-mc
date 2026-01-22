import * as THREE from 'three';
import { BlockType } from './VoxelWorld';

export class MaterialManager {
  private materials: Map<BlockType, THREE.MeshLambertMaterial>;
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.materials = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.initMaterials();
  }

  private initMaterials(): void {
    // 草地方块
    this.materials.set(BlockType.GRASS, new THREE.MeshLambertMaterial({
      color: 0x4a7c59
    }));

    // 泥土
    this.materials.set(BlockType.DIRT, new THREE.MeshLambertMaterial({
      color: 0x8b4513
    }));

    // 石头
    this.materials.set(BlockType.STONE, new THREE.MeshLambertMaterial({
      color: 0x808080
    }));

    // 木头
    this.materials.set(BlockType.WOOD, new THREE.MeshLambertMaterial({
      color: 0x9b7653
    }));

    // 树叶
    this.materials.set(BlockType.LEAVES, new THREE.MeshLambertMaterial({
      color: 0x228b22,
      transparent: true,
      opacity: 0.8
    }));

    // 沙子
    this.materials.set(BlockType.SAND, new THREE.MeshLambertMaterial({
      color: 0xf4a460
    }));

    // 水
    this.materials.set(BlockType.WATER, new THREE.MeshLambertMaterial({
      color: 0x4169e1,
      transparent: true,
      opacity: 0.7
    }));
  }

  public getMaterial(type: BlockType): THREE.MeshLambertMaterial {
    return this.materials.get(type) || this.materials.get(BlockType.STONE)!;
  }

  public async loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  public setTextureForBlock(type: BlockType, url: string): void {
    this.loadTexture(url).then(texture => {
      const material = this.getMaterial(type);
      material.map = texture;
      material.needsUpdate = true;
    }).catch(console.error);
  }

  public dispose(): void {
    for (const material of this.materials.values()) {
      material.dispose();
    }
    this.materials.clear();
  }
}
