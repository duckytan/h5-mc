import { SceneManager } from './core/SceneManager';
import { PlayerController } from './gameplay/PlayerController';
import { BlockInteraction } from './gameplay/BlockInteraction';
import { TerrainGenerator } from './world/TerrainGenerator';
import { VoxelWorld, BlockType } from './core/VoxelWorld';
import { BlockRegistry } from './core/blocks/BlockRegistry';
import { ItemRegistry, ItemCategory } from './core/items/Item';
import { PlayerInventory } from './gameplay/Inventory';
import { InventoryUI } from './ui/InventoryUI';

/**
 * 游戏主类
 * 集成 PhysicsSystem、BlockRegistry、ItemSystem
 */
class Game {
  /** 场景管理器 */
  private sceneManager: SceneManager;
  /** 玩家控制器 */
  private player: PlayerController;
  /** 方块交互系统 */
  private blockInteraction: BlockInteraction;
  /** 地形生成器 */
  private terrainGenerator: TerrainGenerator;
  /** 玩家物品栏 */
  private playerInventory: PlayerInventory;
  /** 物品栏 UI */
  private inventoryUI: InventoryUI;
  /** Canvas 容器 */
  private canvasContainer: HTMLElement;
  /** HUD 元素 */
  private hud: HTMLElement;
  /** FPS 显示元素 */
  private fpsElement: HTMLElement;
  /** 坐标显示元素 */
  private coordsElement: HTMLElement;
  /** 选中的方块类型显示元素 */
  private selectedBlockElement: HTMLElement;
  /** 上一帧时间 */
  private lastFrameTime: number = 0;
  /** 帧计数 */
  private frameCount: number = 0;
  /** FPS 更新时间 */
  private fpsUpdateTime: number = 0;
  /** 游戏是否暂停 */
  private isPaused: boolean = false;
  /** 物品栏是否打开 */
  private isInventoryOpen: boolean = false;

  constructor() {
    // 获取 DOM 元素
    this.canvasContainer = document.getElementById('canvas-container') as HTMLElement;
    this.hud = document.getElementById('hud') as HTMLElement;
    this.fpsElement = document.getElementById('fps') as HTMLElement;
    this.coordsElement = document.getElementById('coords') as HTMLElement;
    this.selectedBlockElement = document.getElementById('selected-block') as HTMLElement;

    this.init();
  }

  /**
   * 初始化游戏
   */
  private async init(): Promise<void> {
    // 初始化场景
    this.sceneManager = new SceneManager(this.canvasContainer);

    // 初始化世界
    const world = this.sceneManager.getWorld();

    // 初始化玩家控制器（传入 world 用于碰撞检测）
    this.player = new PlayerController(
      this.sceneManager.camera,
      this.canvasContainer,
      world
    );

    // 初始化方块交互（传入 scene 用于射线检测）
    this.blockInteraction = new BlockInteraction(
      this.sceneManager.camera,
      world,
      this.sceneManager.getChunkManager(),
      this.sceneManager.scene
    );

    // 初始化物品栏
    this.playerInventory = new PlayerInventory();

    // 初始化物品栏 UI
    this.inventoryUI = new InventoryUI(this.playerInventory);

    // 初始化地形生成
    this.terrainGenerator = new TerrainGenerator(world);

    // 生成初始地形
    this.generateInitialWorld();

    // 绑定事件
    this.bindEvents();

    // 启动游戏循环
    this.gameLoop();
  }

  /**
   * 生成初始世界
   */
  private generateInitialWorld(): void {
    // 生成地形
    this.terrainGenerator.generateHillsTerrain(64);

    // 添加初始物品到物品栏（测试用）
    this.initializeInventory();

    // 生成一些树
    for (let i = 0; i < 15; i++) {
      const x = 10 + Math.random() * 40;
      const z = 10 + Math.random() * 40;
      const y = this.getGroundHeight(x, z);
      this.terrainGenerator.addTree(Math.floor(x), y, Math.floor(z));
    }

    // 生成初始区块
    this.generateChunksAround(0, 0, 0);
  }

  /**
   * 初始化物品栏（添加一些测试物品）
   */
  private initializeInventory(): void {
    // 添加草方块
    const grassItem = ItemRegistry.createItemStack('minecraft:grass_block', 64);
    if (grassItem) {
      this.playerInventory.addItem(grassItem);
    }

    // 添加泥土
    const dirtItem = ItemRegistry.createItemStack('minecraft:dirt', 32);
    if (dirtItem) {
      this.playerInventory.addItem(dirtItem);
    }

    // 添加石头
    const stoneItem = ItemRegistry.createItemStack('minecraft:stone', 32);
    if (stoneItem) {
      this.playerInventory.addItem(stoneItem);
    }

    // 添加木头
    const woodItem = ItemRegistry.createItemStack('minecraft:wood', 16);
    if (woodItem) {
      this.playerInventory.addItem(woodItem);
    }
  }

  /**
   * 获取地面高度
   */
  private getGroundHeight(x: number, z: number): number {
    const world = this.sceneManager.getWorld();

    // 使用 PhysicsSystem 获取地面高度
    const physics = this.player.getPhysicsSystem();
    const groundHeight = physics.getGroundHeight(Math.floor(x), Math.floor(z));

    if (groundHeight !== null) {
      return groundHeight;
    }

    // 备用：手动搜索
    for (let y = 64; y >= 0; y--) {
      const block = world.getVoxel(Math.floor(x), y, Math.floor(z));
      if (block !== BlockType.AIR) {
        return y + 1;
      }
    }
    return 10;
  }

  /**
   * 生成周围的区块
   */
  private generateChunksAround(cellX: number, cellY: number, cellZ: number): void {
    const chunkManager = this.sceneManager.getChunkManager();

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const chunk = chunkManager.generateChunk(
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

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 左键点击 - 破坏方块
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && document.pointerLockElement === this.canvasContainer) {
        // 破坏方块
        this.blockInteraction.removeBlock();
      }
    });

    // 右键点击 - 放置方块
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (document.pointerLockElement === this.canvasContainer) {
        // 放置方块
        this.blockInteraction.addBlock();
      }
    });

    // 数字键切换方块类型
    document.addEventListener('keydown', (e) => {
      // 快捷栏选择（1-9）
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        const slotIndex = parseInt(e.code.replace('Digit', '')) - 1;
        this.playerInventory.selectHotbarSlot(slotIndex);
        this.updateSelectedBlockDisplay();
        return;
      }

      // 物品栏开关
      if (e.code === 'KeyE') {
        this.toggleInventory();
        return;
      }

      // ESC 暂停游戏
      if (e.code === 'Escape') {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
          document.exitPointerLock();
        }
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'KeyS':
        case 'KeyA':
        case 'KeyD':
        case 'Space':
          // 这些由 PlayerController 处理
          break;
      }
    });

    // 滚轮切换快捷栏
    document.addEventListener('wheel', (e) => {
      if (document.pointerLockElement === this.canvasContainer) {
        const direction = e.deltaY > 0 ? 1 : -1;
        this.playerInventory.scrollHotbar(direction);
        this.updateSelectedBlockDisplay();
      }
    });

    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.sceneManager.handleResize();
    });
  }

  /**
   * 切换物品栏显示
   */
  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;

    if (this.isInventoryOpen) {
      // 打开物品栏，显示鼠标
      document.exitPointerLock();
      this.inventoryUI.show();
    } else {
      // 关闭物品栏，锁定指针
      this.inventoryUI.hide();
      this.canvasContainer.requestPointerLock();
    }
  }

  /**
   * 更新选中的方块显示
   */
  private updateSelectedBlockDisplay(): void {
    const selectedItem = this.playerInventory.getSelectedItem();
    if (selectedItem && this.selectedBlockElement) {
      this.selectedBlockElement.textContent = selectedItem.name;
    }
  }

  /**
   * 更新 HUD
   */
  private updateHUD(): void {
    const currentTime = performance.now();
    this.frameCount++;

    // 每秒更新一次 FPS
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

  /**
   * 游戏主循环
   */
  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());

    // 如果暂停，不更新
    if (this.isPaused) {
      return;
    }

    // 更新玩家
    this.player.update();

    // 更新场景
    this.sceneManager.update();

    // 渲染
    this.sceneManager.render();

    // 更新 HUD
    this.updateHUD();
  }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  // 隐藏加载提示，显示 HUD
  const loading = document.getElementById('loading');
  const hud = document.getElementById('hud');

  setTimeout(() => {
    if (loading) loading.style.display = 'none';
    if (hud) hud.style.display = 'block';
  }, 1000);
});
