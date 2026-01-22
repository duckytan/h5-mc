import { SceneManager } from './core/SceneManager';
import { PlayerController } from './gameplay/PlayerController';
import { BlockInteraction } from './gameplay/BlockInteraction';
import { TerrainGenerator } from './world/TerrainGenerator';
import { VoxelWorld, BlockType } from './core/VoxelWorld';

class Game {
  private sceneManager: SceneManager;
  private player: PlayerController;
  private blockInteraction: BlockInteraction;
  private terrainGenerator: TerrainGenerator;
  private canvasContainer: HTMLElement;
  private hud: HTMLElement;
  private fpsElement: HTMLElement;
  private coordsElement: HTMLElement;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  constructor() {
    this.canvasContainer = document.getElementById('canvas-container') as HTMLElement;
    this.hud = document.getElementById('hud') as HTMLElement;
    this.fpsElement = document.getElementById('fps') as HTMLElement;
    this.coordsElement = document.getElementById('coords') as HTMLElement;

    this.init();
  }

  private async init(): Promise<void> {
    // 初始化场景
    this.sceneManager = new SceneManager(this.canvasContainer);

    // 初始化玩家
    this.player = new PlayerController(
      this.sceneManager.camera,
      this.canvasContainer
    );

    // 初始化方块交互
    this.blockInteraction = new BlockInteraction(
      this.sceneManager.camera,
      this.sceneManager.getWorld(),
      this.sceneManager.getChunkManager()
    );

    // 初始化地形生成
    this.terrainGenerator = new TerrainGenerator(this.sceneManager.getWorld());

    // 生成初始地形
    this.generateInitialWorld();

    // 绑定事件
    this.bindEvents();

    // 开始游戏循环
    this.gameLoop();
  }

  private generateInitialWorld(): void {
    // 生成地形
    this.terrainGenerator.generateHillsTerrain(64);

    // 生成一些树
    for (let i = 0; i < 10; i++) {
      const x = 10 + Math.random() * 40;
      const z = 10 + Math.random() * 40;
      const y = this.getGroundHeight(x, z);
      this.terrainGenerator.addTree(Math.floor(x), y, Math.floor(z));
    }

    // 生成初始区块
    this.generateChunksAround(0, 0, 0);
  }

  private getGroundHeight(x: number, z: number): number {
    // 找到地面高度
    for (let y = 50; y >= 0; y--) {
      const block = this.sceneManager.getWorld().getVoxel(Math.floor(x), y, Math.floor(z));
      if (block !== BlockType.AIR) {
        return y + 1;
      }
    }
    return 10;
  }

  private generateChunksAround(cellX: number, cellY: number, cellZ: number): void {
    // 生成周围区块
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = this.sceneManager.getChunkManager().generateChunk(
          cellX + dx,
          cellY,
          cellZ + dz
        );

        if (chunk) {
          this.sceneManager.scene.add(chunk);
        }
      }
    }
  }

  private bindEvents(): void {
    // 左键点击 - 破坏方块
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement === this.canvasContainer) {
        this.blockInteraction.removeBlock();
      }
    });

    // 右键点击 - 放置方块
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (document.pointerLockElement === this.canvasContainer) {
        this.blockInteraction.addBlock();
      }
    });

    // 数字键切换方块类型
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'Digit1':
          this.blockInteraction.setSelectedBlockType(BlockType.GRASS);
          break;
        case 'Digit2':
          this.blockInteraction.setSelectedBlockType(BlockType.DIRT);
          break;
        case 'Digit3':
          this.blockInteraction.setSelectedBlockType(BlockType.STONE);
          break;
        case 'Digit4':
          this.blockInteraction.setSelectedBlockType(BlockType.WOOD);
          break;
      }
    });
  }

  private updateHUD(): void {
    const currentTime = performance.now();
    this.frameCount++;

    // 每秒更新一次FPS
    if (currentTime - this.fpsUpdateTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
      this.fpsElement.textContent = fps.toString();
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }

    // 更新坐标显示
    const pos = this.player.getPosition();
    this.coordsElement.textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
  }

  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());

    // 更新玩家
    this.player.update();

    // 更新场景
    this.sceneManager.update();

    // 渲染
    this.sceneManager.render();

    // 更新HUD
    this.updateHUD();
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  // 隐藏加载提示，显示HUD
  const loading = document.getElementById('loading');
  const hud = document.getElementById('hud');

  setTimeout(() => {
    if (loading) loading.style.display = 'none';
    if (hud) hud.style.display = 'block';
  }, 1000);
});
