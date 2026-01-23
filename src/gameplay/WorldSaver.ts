import { VoxelWorld, BlockType } from '../core/VoxelWorld';
import { PlayerInventory } from './Inventory';

/**
 * 保存数据版本
 */
const SAVE_VERSION = '1.0.0';

/**
 * 世界保存数据接口
 */
export interface WorldSaveData {
  /** 保存版本 */
  version: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后保存时间 */
  lastSavedAt: string;
  /** 玩家位置 */
  playerPosition: { x: number; y: number; z: number };
  /** 世界边界 */
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  /** 方块数据 */
  blocks: VoxelSaveData[];
  /** 物品栏数据 */
  inventory: InventorySaveData;
}

/**
 * 单个方块保存数据
 */
export interface VoxelSaveData {
  x: number;
  y: number;
  z: number;
  type: number;
}

/**
 * 物品栏保存数据
 */
export interface InventorySaveData {
  mainInventory: object;
  hotbar: object;
}

/**
 * 世界保存器
 * 处理世界的序列化和反序列化
 */
export class WorldSaver {
  private world: VoxelWorld;
  private playerInventory: PlayerInventory;

  constructor(world: VoxelWorld, playerInventory: PlayerInventory) {
    this.world = world;
    this.playerInventory = playerInventory;
  }

  /**
   * 保存世界数据
   */
  public save(playerPosition: { x: number; y: number; z: number }): WorldSaveData {
    const voxels = this.world.getAllVoxels();
    const bounds = this.calculateBounds(voxels);

    return {
      version: SAVE_VERSION,
      createdAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
      playerPosition,
      bounds,
      blocks: voxels.map(v => ({
        x: v.x,
        y: v.y,
        z: v.z,
        type: v.type
      })),
      inventory: this.playerInventory.toJSON() as InventorySaveData
    };
  }

  /**
   * 保存到 LocalStorage
   */
  public saveToStorage(slotName: string = 'world_save'): boolean {
    try {
      const playerPos = { x: 0, y: 20, z: 0 }; // 默认位置
      const data = this.save(playerPos);
      const json = JSON.stringify(data);
      localStorage.setItem(slotName, json);
      console.log(`世界已保存到 ${slotName}`);
      return true;
    } catch (error) {
      console.error('保存世界失败:', error);
      return false;
    }
  }

  /**
   * 从 LocalStorage 加载
   */
  public loadFromStorage(slotName: string = 'world_save'): boolean {
    try {
      const json = localStorage.getItem(slotName);
      if (!json) {
        console.log('未找到保存的世界');
        return false;
      }

      const data = JSON.parse(json) as WorldSaveData;
      return this.load(data);
    } catch (error) {
      console.error('加载世界失败:', error);
      return false;
    }
  }

  /**
   * 加载世界数据
   */
  public load(data: WorldSaveData): boolean {
    try {
      // 验证版本
      if (!this.validateVersion(data.version)) {
        console.warn(`保存版本 ${data.version} 与当前版本 ${SAVE_VERSION} 不兼容`);
      }

      // 清空当前世界
      this.world.clear();

      // 恢复方块
      for (const block of data.blocks) {
        this.world.setVoxel(block.x, block.y, block.z, block.type as BlockType);
      }

      // 恢复物品栏
      if (data.inventory) {
        this.playerInventory.fromJSON(data.inventory);
      }

      console.log(`世界已加载，包含 ${data.blocks.length} 个方块`);
      return true;
    } catch (error) {
      console.error('加载世界数据失败:', error);
      return false;
    }
  }

  /**
   * 导出保存数据到文件
   */
  public exportToFile(filename: string = 'world.json'): void {
    const playerPos = { x: 0, y: 20, z: 0 };
    const data = this.save(playerPos);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    console.log(`世界已导出到 ${filename}`);
  }

  /**
   * 从文件导入保存数据
   */
  public async importFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as WorldSaveData;
      return this.load(data);
    } catch (error) {
      console.error('导入世界失败:', error);
      return false;
    }
  }

  /**
   * 计算世界边界
   */
  private calculateBounds(voxels: { x: number; y: number; z: number }[]): WorldSaveData['bounds'] {
    if (voxels.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const v of voxels) {
      minX = Math.min(minX, v.x);
      maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
      minZ = Math.min(minZ, v.z);
      maxZ = Math.max(maxZ, v.z);
    }

    return { minX, maxX, minY, maxY, minZ, maxZ };
  }

  /**
   * 验证保存版本
   */
  private validateVersion(version: string): boolean {
    // 简单的版本检查，实际使用时可能需要更复杂的迁移逻辑
    return version.startsWith('1.');
  }

  /**
   * 获取保存统计信息
   */
  public getStats(playerPosition: { x: number; y: number; z: number }): object {
    const voxels = this.world.getAllVoxels();
    const bounds = this.calculateBounds(voxels);
    const blockCounts = this.countBlockTypes(voxels);

    return {
      totalBlocks: voxels.length,
      bounds,
      blockCounts,
      playerPosition,
      saveVersion: SAVE_VERSION,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 统计方块类型数量
   */
  private countBlockTypes(voxels: { type: BlockType }[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const v of voxels) {
      const key = BlockType[v.type];
      counts[key] = (counts[key] || 0) + 1;
    }

    return counts;
  }
}

/**
 * 保存槽管理器
 */
export class SaveSlotManager {
  private static readonly STORAGE_KEY = 'mc_h5_save_slots';

  /**
   * 获取所有保存槽
   */
  public static getSaveSlots(): string[] {
    try {
      const slots = localStorage.getItem(this.STORAGE_KEY);
      return slots ? JSON.parse(slots) : [];
    } catch {
      return [];
    }
  }

  /**
   * 检查保存槽是否存在
   */
  public static slotExists(slotName: string): boolean {
    return localStorage.getItem(slotName) !== null;
  }

  /**
   * 获取保存槽信息
   */
  public static getSlotInfo(slotName: string): { exists: boolean; data?: WorldSaveData; size?: number } {
    try {
      const json = localStorage.getItem(slotName);
      if (!json) {
        return { exists: false };
      }

      const data = JSON.parse(json) as WorldSaveData;
      const size = new Blob([json]).size;

      return {
        exists: true,
        data,
        size
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * 删除保存槽
   */
  public static deleteSlot(slotName: string): boolean {
    try {
      localStorage.removeItem(slotName);
      
      // 更新槽列表
      const slots = this.getSaveSlots();
      const index = slots.indexOf(slotName);
      if (index > -1) {
        slots.splice(index, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(slots));
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 列出所有保存的世界
   */
  public static listWorlds(): object[] {
    const slots = this.getSaveSlots();
    const worlds: object[] = [];

    for (const slot of slots) {
      const info = this.getSlotInfo(slot);
      if (info.exists && info.data) {
        worlds.push({
          name: slot,
          createdAt: info.data.createdAt,
          lastSavedAt: info.data.lastSavedAt,
          blockCount: info.data.blocks.length,
          size: info.size
        });
      }
    }

    return worlds;
  }
}
