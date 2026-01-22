import { BlockType } from '../../core/VoxelWorld';

/**
 * 物品类别枚举
 */
export enum ItemCategory {
  /** 方块类物品 */
  BLOCK = 'block',
  /** 工具类物品 */
  TOOL = 'tool',
  /** 武器类物品 */
  WEAPON = 'weapon',
  /** 消耗品类物品 */
  FOOD = 'food',
  /** 护甲类物品 */
  ARMOR = 'armor',
  /** 原材料类物品 */
  MATERIAL = 'material',
  /** 杂项物品 */
  MISC = 'misc'
}

/**
 * 工具类型枚举
 */
export enum ToolType {
  /** 镐 */
  PICKAXE = 'pickaxe',
  /** 斧 */
  AXE = 'axe',
  /** 锹 */
  SHOVEL = 'shovel',
  /** 剑 */
  SWORD = 'sword',
  /** 锄 */
  HOE = 'hoe'
}

/**
 * 护甲类型枚举
 */
export enum ArmorType {
  /** 头盔 */
  HELMET = 'helmet',
  /** 胸甲 */
  CHESTPLATE = 'chestplate',
  /** 护腿 */
  LEGGINGS = 'leggings',
  /** 靴子 */
  BOOTS = 'boots'
}

/**
 * 物品元数据接口
 */
export interface ItemData {
  /** 物品唯一ID（字符串格式，如 "minecraft:grass_block"） */
  readonly id: string;
  /** 物品名称（中文） */
  readonly name: string;
  /** 英文名称（用于材质映射） */
  readonly englishName: string;
  /** 最大堆叠数量 */
  readonly maxStack: number;
  /** 物品类别 */
  readonly category: ItemCategory;
  /** 材质颜色（用于显示） */
  readonly color: number;
  /** 描述文本 */
  readonly description?: string;
}

/**
 * 工具物品特有属性
 */
export interface ToolData extends ItemData {
  readonly category: ItemCategory.TOOL;
  readonly toolType: ToolType;
  readonly miningSpeed: number;
  readonly damage: number;
  readonly effectiveBlocks: BlockType[];
}

/**
 * 武器物品特有属性
 */
export interface WeaponData extends ItemData {
  readonly category: ItemCategory.WEAPON;
  readonly damage: number;
  readonly attackSpeed: number;
}

/**
 * 护甲物品特有属性
 */
export interface ArmorData extends ItemData {
  readonly category: ItemCategory.ARMOR;
  readonly armorType: ArmorType;
  readonly defense: number;
  readonly toughness: number;
}

/**
 * 方块物品特有属性
 */
export interface BlockItemData extends ItemData {
  readonly category: ItemCategory.BLOCK;
  readonly blockType: BlockType;
}

/**
 * 物品注册表
 */
export class ItemRegistry {
  /** 存储所有物品数据的映射 */
  private static readonly items = new Map<string, ItemData>();

  /**
   * 注册物品数据
   */
  public static register(item: ItemData): void {
    if (this.items.has(item.id)) {
      console.warn(`物品 ID ${item.id} 已存在，将被覆盖`);
    }
    this.items.set(item.id, item);
  }

  /**
   * 通过 ID 获取物品数据
   */
  public static getItemById(id: string): ItemData | undefined {
    return this.items.get(id);
  }

  /**
   * 获取所有物品数据
   */
  public static getAllItems(): ItemData[] {
    return Array.from(this.items.values());
  }

  /**
   * 通过名称查找物品
   */
  public static getItemByName(name: string): ItemData | undefined {
    for (const item of this.items.values()) {
      if (item.name === name || item.englishName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 获取指定类别的所有物品
   */
  public static getItemsByCategory(category: ItemCategory): ItemData[] {
    return Array.from(this.items.values()).filter(
      item => item.category === category
    );
  }

  /**
   * 获取所有方块物品
   */
  public static getBlockItems(): BlockItemData[] {
    return Array.from(this.items.values())
      .filter((item): item is BlockItemData => item.category === ItemCategory.BLOCK)
      .map(item => item as BlockItemData);
  }

  /**
   * 获取所有工具物品
   */
  public static getToolItems(): ToolData[] {
    return Array.from(this.items.values())
      .filter((item): item is ToolData => item.category === ItemCategory.TOOL)
      .map(item => item as ToolData);
  }

  /**
   * 通过物品 ID 创建物品实例
   */
  public static createItemStack(id: string, count: number = 1): ItemStack | null {
    const itemData = this.items.get(id);
    if (!itemData) {
      console.warn(`未找到物品: ${id}`);
      return null;
    }
    return new ItemStack(itemData, count);
  }

  /**
   * 验证注册表完整性
   */
  public static validate(): { valid: boolean; itemCount: number } {
    return {
      valid: this.items.size > 0,
      itemCount: this.items.size
    };
  }

  /**
   * 初始化所有基础物品
   */
  public static init(): void {
    // 方块物品
    this.register({
      id: 'minecraft:grass_block',
      name: '草方块',
      englishName: 'grass_block',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0x4a7c59,
      description: '覆盖着草皮的泥土方块'
    });

    this.register({
      id: 'minecraft:dirt',
      name: '泥土',
      englishName: 'dirt',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0x8b4513,
      description: '用于种植的基础方块'
    });

    this.register({
      id: 'minecraft:stone',
      name: '石头',
      englishName: 'stone',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0x808080,
      description: '基础建筑材料'
    });

    this.register({
      id: 'minecraft:wood',
      name: '木头',
      englishName: 'wood',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0x9b7653,
      description: '原木，可用于合成'
    });

    this.register({
      id: 'minecraft:leaves',
      name: '树叶',
      englishName: 'leaves',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0x228b22,
      description: '树木上的叶子'
    });

    this.register({
      id: 'minecraft:sand',
      name: '沙子',
      englishName: 'sand',
      maxStack: 64,
      category: ItemCategory.BLOCK,
      color: 0xf4a460,
      description: '沙漠和河岸的方块'
    });

    // 原材料物品
    this.register({
      id: 'minecraft:stick',
      name: '木棍',
      englishName: 'stick',
      maxStack: 64,
      category: ItemCategory.MATERIAL,
      color: 0x8B4513,
      description: '用于合成工具和武器'
    });

    this.register({
      id: 'minecraft:coal',
      name: '煤炭',
      englishName: 'coal',
      maxStack: 64,
      category: ItemCategory.MATERIAL,
      color: 0x1a1a1a,
      description: '用于燃料和冶炼'
    });

    // 工具物品（基础木镐）
    this.register({
      id: 'minecraft:wooden_pickaxe',
      name: '木镐',
      englishName: 'wooden_pickaxe',
      maxStack: 1,
      category: ItemCategory.TOOL,
      toolType: ToolType.PICKAXE,
      miningSpeed: 2,
      damage: 2,
      effectiveBlocks: [BlockType.STONE, BlockType.COAL_ORE, BlockType.IRON_ORE],
      color: 0x9b7653,
      description: '基础挖掘工具'
    });
  }
}

/**
 * 物品堆叠类
 * 表示一组相同的物品
 */
export class ItemStack {
  /** 物品数据 */
  private readonly _item: ItemData;
  /** 物品数量 */
  private _count: number;

  /**
   * 创建物品堆叠
   * @param item 物品数据
   * @param count 物品数量（默认1）
   */
  constructor(item: ItemData, count: number = 1) {
    this._item = item;
    this._count = Math.max(1, Math.min(count, item.maxStack));
  }

  /**
   * 获取物品数据（只读）
   */
  public get item(): ItemData {
    return this._item;
  }

  /**
   * 获取物品数量
   */
  public get count(): number {
    return this._count;
  }

  /**
   * 设置物品数量
   */
  public set count(value: number) {
    this._count = Math.max(0, Math.min(value, this._item.maxStack));
  }

  /**
   * 检查物品堆叠是否为空
   */
  public get isEmpty(): boolean {
    return this._count <= 0;
  }

  /**
   * 检查物品堆叠是否已满
   */
  public get isFull(): boolean {
    return this._count >= this._item.maxStack;
  }

  /**
   * 获取物品ID
   */
  public get id(): string {
    return this._item.id;
  }

  /**
   * 获取物品名称
   */
  public get name(): string {
    return this._item.name;
  }

  /**
   * 获取物品类别
   */
  public get category(): ItemCategory {
    return this._item.category;
  }

  /**
   * 获取最大堆叠数量
   */
  public get maxStack(): number {
    return this._item.maxStack;
  }

  /**
   * 添加物品
   * @param amount 添加数量
   * @returns 实际添加的数量
   */
  public add(amount: number): number {
    const space = this._item.maxStack - this._count;
    const toAdd = Math.min(space, amount);
    this._count += toAdd;
    return toAdd;
  }

  /**
   * 移除物品
   * @param amount 移除数量
   * @returns 实际移除的数量
   */
  public remove(amount: number): number {
    const toRemove = Math.min(amount, this._count);
    this._count -= toRemove;
    return toRemove;
  }

  /**
   * 减少一个物品（用于消耗）
   */
  public decrement(): boolean {
    if (this._count > 0) {
      this._count--;
      return true;
    }
    return false;
  }

  /**
   * 增加一个物品
   */
  public increment(): boolean {
    if (this._count < this._item.maxStack) {
      this._count++;
      return true;
    }
    return false;
  }

  /**
   * 复制物品堆叠
   */
  public copy(): ItemStack {
    return new ItemStack(this._item, this._count);
  }

  /**
   * 与另一个物品堆叠比较
   */
  public equals(other: ItemStack): boolean {
    return this._item.id === other._item.id;
  }

  /**
   * 获取显示名称（包含数量）
   */
  public getDisplayName(): string {
    if (this._count > 1) {
      return `${this._item.name} x${this._count}`;
    }
    return this._item.name;
  }

  /**
   * 获取物品描述
   */
  public getDescription(): string {
    return this._item.description ?? '';
  }

  /**
   * 创建空物品堆叠
   */
  public static empty(): ItemStack {
    return new ItemStack({
      id: 'minecraft:air',
      name: '空气',
      englishName: 'air',
      maxStack: 0,
      category: ItemCategory.MISC,
      color: 0x000000
    }, 0);
  }

  /**
   * 检查是否是同一种物品
   */
  public isSameItem(other: ItemStack): boolean {
    return this._item.id === other._item.id;
  }

  /**
   * 尝试与另一个物品堆叠合并
   * @returns 合并后的新堆叠（如果可合并）
   */
  public canMerge(other: ItemStack): boolean {
    if (!this.isSameItem(other)) {
      return false;
    }
    return !this.isFull;
  }

  /**
   * 合并两个物品堆叠
   * @param source 源堆叠
   * @returns 从 source 转移过来的数量
   */
  public mergeFrom(source: ItemStack): number {
    if (!this.isSameItem(source)) {
      return 0;
    }
    const space = this._item.maxStack - this._count;
    const toTransfer = Math.min(space, source.count);
    this._count += toTransfer;
    return toTransfer;
  }

  /**
   * 转换为 JSON 格式（用于保存）
   */
  public toJSON(): { id: string; count: number } {
    return {
      id: this._item.id,
      count: this._count
    };
  }

  /**
   * 从 JSON 创建物品堆叠
   */
  public static fromJSON(json: { id: string; count: number }): ItemStack | null {
    const itemData = ItemRegistry.getItemById(json.id);
    if (!itemData) {
      console.warn(`从 JSON 恢复物品失败: ${json.id}`);
      return ItemStack.empty();
    }
    return new ItemStack(itemData, json.count);
  }
}

// 初始化物品注册表
ItemRegistry.init();
