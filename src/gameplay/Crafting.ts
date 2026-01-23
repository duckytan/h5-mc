import { ItemRegistry, ItemStack } from '../core/items/Item';
import { Inventory, InventorySlot, InventoryEventType } from './Inventory';

/**
 * 合成配方类型
 */
export enum CraftingType {
  /** 工作台 3x3 合成 */
  WORKBENCH = 'workbench',
  /** 随身合成 2x2 */
  SHAPED = 'shaped',
  /** 无形状配方 */
  SHAPELESS = 'shapeless'
}

/**
 * 合成配方结果
 */
export interface CraftingResult {
  /** 输出物品 ID */
  resultId: string;
  /** 输出数量 */
  count: number;
}

/**
 * 合成配方模式行
 */
export type PatternRow = (string | null)[];

/**
 * 合成配方模式（3行）
 */
export type CraftingPattern = [PatternRow, PatternRow?, PatternRow?];

/**
 * 合成配方接口
 */
export interface CraftingRecipe {
  /** 配方唯一 ID */
  id: string;
  /** 配方类型 */
  type: CraftingType;
  /** 模式（用于有形状配方） */
  pattern?: CraftingPattern;
  /** 原料列表（用于无形状配方） */
  ingredients?: { itemId: string; count: number }[];
  /** 结果 */
  result: CraftingResult;
  /** 是否已启用 */
  enabled: boolean;
}

/**
 * 合成管理器
 * 处理工作台合成逻辑
 */
export class CraftingSystem {
  /** 合成槽位（3x3 = 9个） */
  private craftingSlots: (ItemStack | null)[] = [];
  /** 合成结果槽位 */
  private resultSlot: ItemStack | null = null;
  /** 结果槽位物品数量 */
  private resultCount: number = 0;
  /** 监听器 */
  private listeners: Set<(recipe: CraftingRecipe | null) => void> = new Set();

  constructor() {
    // 初始化9个合成槽位
    for (let i = 0; i < 9; i++) {
      this.craftingSlots[i] = null;
    }
  }

  /**
   * 设置合成槽位物品
   */
  public setSlot(index: number, item: ItemStack | null): boolean {
    if (index < 0 || index >= 9) return false;

    this.craftingSlots[index] = item;
    this.updateResult();
    return true;
  }

  /**
   * 获取合成槽位物品
   */
  public getSlot(index: number): ItemStack | null {
    if (index < 0 || index >= 9) return null;
    return this.craftingSlots[index];
  }

  /**
   * 获取所有合成槽位
   */
  public getAllSlots(): (ItemStack | null)[] {
    return [...this.craftingSlots];
  }

  /**
   * 获取合成结果
   */
  public getResult(): ItemStack | null {
    return this.resultSlot;
  }

  /**
   * 获取结果数量
   */
  public getResultCount(): number {
    return this.resultCount;
  }

  /**
   * 清空合成槽位
   */
  public clear(): void {
    for (let i = 0; i < 9; i++) {
      this.craftingSlots[i] = null;
    }
    this.resultSlot = null;
    this.resultCount = 0;
    this.notifyListeners();
  }

  /**
   * 尝试合成
   * @returns 是否成功
   */
  public craft(): boolean {
    if (!this.resultSlot || this.resultCount <= 0) return false;

    // 检查是否有足够的空间获取物品
    const item = this.resultSlot.copy();
    item.count = this.resultCount;

    // 消耗原料
    this.consumeIngredients();

    // 清空结果
    this.resultSlot = null;
    this.resultCount = 0;
    this.notifyListeners();

    return true;
  }

  /**
   * 消耗原料
   */
  private consumeIngredients(): void {
    // 找出使用的原料并减少数量
    for (let i = 0; i < 9; i++) {
      const slot = this.craftingSlots[i];
      if (slot) {
        slot.count--;
        if (slot.count <= 0) {
          this.craftingSlots[i] = null;
        }
      }
    }
  }

  /**
   * 更新合成结果
   */
  private updateResult(): void {
    const recipe = this.findMatchingRecipe();

    if (recipe) {
      const resultItem = ItemRegistry.createItemStack(recipe.result.count > 1 ? `${recipe.result.resultId} x${recipe.result.count}` : recipe.result.resultId, recipe.result.count);
      if (resultItem) {
        this.resultSlot = resultItem;
        this.resultCount = recipe.result.count;
      } else {
        this.resultSlot = null;
        this.resultCount = 0;
      }
    } else {
      this.resultSlot = null;
      this.resultCount = 0;
    }

    this.notifyListeners();
  }

  /**
   * 查找匹配的配方
   */
  private findMatchingRecipe(): CraftingRecipe | null {
    for (const recipe of RecipeRegistry.getAllRecipes()) {
      if (!recipe.enabled) continue;

      if (this.matchRecipe(recipe)) {
        return recipe;
      }
    }
    return null;
  }

  /**
   * 匹配配方
   */
  private matchRecipe(recipe: CraftingRecipe): boolean {
    if (recipe.type === CraftingType.SHAPELESS) {
      return this.matchShapelessRecipe(recipe);
    } else {
      return this.matchShapedRecipe(recipe);
    }
  }

  /**
   * 匹配无形状配方
   */
  private matchShapelessRecipe(recipe: CraftingRecipe): boolean {
    if (!recipe.ingredients) return false;

    // 收集当前合成槽中的物品
    const currentItems: Map<string, number> = new Map();
    for (const slot of this.craftingSlots) {
      if (slot) {
        const key = slot.item.id;
        currentItems.set(key, (currentItems.get(key) || 0) + slot.count);
      }
    }

    // 检查是否包含所有原料
    for (const ingredient of recipe.ingredients) {
      const have = currentItems.get(ingredient.itemId) || 0;
      if (have < ingredient.count) {
        return false;
      }
    }

    return true;
  }

  /**
   * 匹配有形状配方
   */
  private matchShapedRecipe(recipe: CraftingRecipe): boolean {
    if (!recipe.pattern) return false;

    // 获取配方的实际尺寸
    const patternWidth = this.getPatternWidth(recipe.pattern);
    const patternHeight = this.getPatternHeight(recipe.pattern);

    // 检查当前合成槽是否匹配
    for (let py = 0; py < patternHeight; py++) {
      for (let px = 0; px < patternWidth; px++) {
        const patternItem = recipe.pattern[py]?.[px];
        const slotIndex = py * 3 + px;
        const slotItem = this.craftingSlots[slotIndex];

        if (patternItem === null) {
          if (slotItem !== null) return false;
        } else {
          if (!slotItem || slotItem.item.id !== patternItem) return false;
        }
      }
    }

    return true;
  }

  /**
   * 获取配方宽度
   */
  private getPatternWidth(pattern: CraftingPattern): number {
    let maxWidth = 0;
    for (const row of pattern) {
      if (row) {
        let width = row.length;
        // 移除末尾的 null
        while (width > 0 && row[width - 1] === null) width--;
        maxWidth = Math.max(maxWidth, width);
      }
    }
    return maxWidth;
  }

  /**
   * 获取配方高度
   */
  private getPatternHeight(pattern: CraftingPattern): number {
    let maxHeight = 0;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i]) {
        maxHeight = i + 1;
      }
    }
    return maxHeight;
  }

  /**
   * 监听结果变化
   */
  public addListener(listener: (recipe: CraftingRecipe | null) => void): void {
    this.listeners.add(listener);
  }

  /**
   * 移除监听器
   */
  public removeListener(listener: (recipe: CraftingRecipe | null) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * 通知监听器
   */
  private notifyListeners(): void {
    const recipe = this.findMatchingRecipe();
    for (const listener of this.listeners) {
      listener(recipe);
    }
  }

  /**
   * 序列化
   */
  public toJSON(): object {
    return {
      craftingSlots: this.craftingSlots.map(slot => slot ? slot.toJSON() : null),
      resultSlot: this.resultSlot ? this.resultSlot.toJSON() : null,
      resultCount: this.resultCount
    };
  }

  /**
   * 反序列化
   */
  public fromJSON(_json: unknown): void {
    this.clear();
    // 简化处理，实际需要从 JSON 恢复 ItemStack
  }
}

/**
 * 合成配方注册表
 */
export class RecipeRegistry {
  private static recipes: Map<string, CraftingRecipe> = new Map();

  /**
   * 注册配方
   */
  public static register(recipe: CraftingRecipe): void {
    if (this.recipes.has(recipe.id)) {
      console.warn(`配方 ${recipe.id} 已存在，将被覆盖`);
    }
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * 获取配方
   */
  public static get(id: string): CraftingRecipe | undefined {
    return this.recipes.get(id);
  }

  /**
   * 获取所有配方
   */
  public static getAllRecipes(): CraftingRecipe[] {
    return Array.from(this.recipes.values());
  }

  /**
   * 获取所有启用的配方
   */
  public static getEnabledRecipes(): CraftingRecipe[] {
    return this.getAllRecipes().filter(r => r.enabled);
  }

  /**
   * 按结果物品查找配方
   */
  public static findByResult(resultId: string): CraftingRecipe[] {
    return this.getAllRecipes().filter(r => r.result.resultId === resultId);
  }

  /**
   * 移除配方
   */
  public static remove(id: string): boolean {
    return this.recipes.delete(id);
  }

  /**
   * 初始化默认配方
   */
  public static initDefaultRecipes(): void {
    // 木棍 (2个木板垂直)
    this.register({
      id: 'stick',
      type: CraftingType.SHAPED,
      pattern: [
        [null, null, null],
        [null, 'minecraft:wood', null],
        [null, 'minecraft:wood', null]
      ],
      result: { resultId: 'minecraft:stick', count: 4 },
      enabled: true
    });

    // 木镐
    this.register({
      id: 'wooden_pickaxe',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        [null, 'minecraft:stick', null],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:wooden_pickaxe', count: 1 },
      enabled: true
    });

    // 木斧
    this.register({
      id: 'wooden_axe',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', null],
        ['minecraft:wood', 'minecraft:stick', null],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:wooden_axe', count: 1 },
      enabled: true
    });

    // 木剑
    this.register({
      id: 'wooden_sword',
      type: CraftingType.SHAPED,
      pattern: [
        [null, 'minecraft:wood', null],
        [null, 'minecraft:wood', null],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:wooden_sword', count: 1 },
      enabled: true
    });

    // 木锹
    this.register({
      id: 'wooden_shovel',
      type: CraftingType.SHAPED,
      pattern: [
        [null, 'minecraft:wood', null],
        [null, 'minecraft:stick', null],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:wooden_shovel', count: 1 },
      enabled: true
    });

    // 石头镐
    this.register({
      id: 'stone_pickaxe',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:stone', 'minecraft:stone', 'minecraft:stone'],
        [null, 'minecraft:stick', null],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:stone_pickaxe', count: 1 },
      enabled: true
    });

    // 营火
    this.register({
      id: 'campfire',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        ['minecraft:wood', 'minecraft:coal', 'minecraft:wood'],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:campfire', count: 1 },
      enabled: true
    });

    // 箱子
    this.register({
      id: 'chest',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        ['minecraft:wood', null, 'minecraft:wood'],
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood']
      ],
      result: { resultId: 'minecraft:chest', count: 1 },
      enabled: true
    });

    // 牌子
    this.register({
      id: 'sign',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        [null, 'minecraft:stick', null]
      ],
      result: { resultId: 'minecraft:sign', count: 3 },
      enabled: true
    });

    // 书架
    this.register({
      id: 'bookshelf',
      type: CraftingType.SHAPED,
      pattern: [
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood'],
        ['minecraft:book', 'minecraft:book', 'minecraft:book'],
        ['minecraft:wood', 'minecraft:wood', 'minecraft:wood']
      ],
      result: { resultId: 'minecraft:bookshelf', count: 1 },
      enabled: true
    });
  }
}

// 初始化默认配方
RecipeRegistry.initDefaultRecipes();
