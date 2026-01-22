import * as THREE from 'three';
import { VoxelWorld } from './VoxelWorld';
import { ChunkManager } from './ChunkManager';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private world: VoxelWorld;
  private chunkManager: ChunkManager;
  private clock: THREE.Clock;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.setupRenderer(container);
    this.setupCamera();
    this.setupLights();

    this.world = new VoxelWorld(32);
    this.chunkManager = new ChunkManager(this.world, 32);

    this.scene.add(this.chunkManager as any);
  }

  private setupRenderer(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x87CEEB); // 天空蓝

    container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private setupCamera(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 20, 0);
  }

  private setupLights(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 方向光（太阳）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public getWorld(): VoxelWorld {
    return this.world;
  }

  public getChunkManager(): ChunkManager {
    return this.chunkManager;
  }

  public update(): void {
    // 更新逻辑可以在这里添加
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.chunkManager.dispose();
    this.renderer.dispose();
  }
}
