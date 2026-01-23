import { ItemStack, ItemRegistry } from '../core/items/Item';

/**
 * 物品栏槽位接口
 */
export interface InventorySlot {
  /** 槽位索引 */
  readonly index: number;
  /** 物品堆叠（空时为 null） */
  item: ItemStack | null;
  /** 是否被锁定 */
  locked: boolean;
  /** 是否可选中 */
  selectable: boolean;
}

/**
 * 物品栏类型
 */
export enum InventoryType {
  /** 主物品栏（27格） */
  MAIN = 'main',
  /** 快捷栏（9格） */
  HOTBAR = 'hotbar',
  /** 合成输出栏 */
  CRAFTING_OUTPUT = 'crafting_output',
  /** 合成输入栏 */
  CRAFTING_INPUT = 'crafting_input'
}

/**
 * 物品栏事件类型
 */
export enum InventoryEventType {
  /** 物品添加 */
  ITEM_ADDED = 'item_added',
  /** 物品移除 */
  ITEM_REMOVED = 'item_removed',
  /** 物品移动 */
  ITEM_MOVED = 'item_moved',
  /** 物品交换 */
  ITEM_SWAPPED = 'item_swapped',
  /** 槽位变更 */
  SLOT_CHANGED = 'slot_changed',
  /** 选中槽位变更 */
  SELECTION_CHANGED = 'selection_changed'
}

/**
 * 物品栏事件数据
 */
export interface InventoryEventData {
  /** 事件类型 */
  type: InventoryEventType;
  /** 源槽位索引 */
  fromSlot?: number;
  /** 目标槽位索引 */
  toSlot?: number;
  /** 物品 */
  item?: ItemStack | null;
  /** 数量变化 */
  amount?: number;
}

/**
 * 物品栏事件监听器类型
 */
export type InventoryEventListener = (data: InventoryEventData) => void;

/**
 * 物品栏类
 * 管理一组物品槽位
 */
export class Inventory {
  /** 物品栏类型 */
  public readonly type: InventoryType;
  /** 槽位数量 */
  public readonly slotCount: number;
  /** 槽位列表 */
  protected slots: InventorySlot[];
  /** 选中的槽位索引 */
  protected selectedSlot: number;
  /** 事件监听器 */
  private listeners: Map<InventoryEventType, Set<InventoryEventListener>>;

  /**
   * 创建物品栏
   * @param type 物品栏类型
   * @param slotCount 槽位数量
   */
  constructor(type: InventoryType, slotCount: number) {
    this.type = type;
    this.slotCount = slotCount;
    this.slots = [];
    this.selectedSlot = -1;
    this.listeners = new Map();

    // 初始化槽位
    for (let i = 0; i < slotCount; i++) {
      this.slots.push({
        index: i,
        item: null,
        locked: false,
        selectable: true
      });
    }
  }

  /**
   * 获取槽位
   */
  public getSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.slotCount) {
      return null;
    }
    return this.slots[index];
  }

  /**
   * 获取所有非空槽位
   */
  public getNonEmptySlots(): InventorySlot[] {
    return this.slots.filter(slot => slot.item !== null);
  }

  /**
   * 获取所有物品
   */
  public getAllItems(): ItemStack[] {
    return this.slots
      .filter(slot => slot.item !== null)
      .map(slot => slot.item as ItemStack);
  }

  /**
   * 获取物品数量
   */
  public getItemCount(itemId: string): number {
    let count = 0;
    for (const slot of this.slots) {
      if (slot.item !== null && slot.item.id === itemId) {
        count += slot.item.count;
      }
    }
    return count;
  }

  /**
   * 检查是否包含指定物品
   */
  public hasItem(itemId: string): boolean {
    return this.getItemCount(itemId) > 0;
  }

  /**
   * 添加物品
   * @param itemStack 物品堆叠
   * @param slotIndex 指定槽位（可选）
   * @returns 实际添加的数量
   */
  public addItem(itemStack: ItemStack, slotIndex?: number): number {
    const remaining = itemStack.count;
    let added = 0;

    // 如果指定了槽位，优先尝试该槽位
    const slotIndices = slotIndex !== undefined
      ? [slotIndex, ...this.getAvailableSlots()]
      : this.getAvailableSlots();

    for (const index of slotIndices) {
      if (remaining <= 0) break;

      const slot = this.slots[index];
      if (slot.locked || !slot.selectable) continue;

      if (slot.item === null) {
        // 空槽位，直接放置
        const toAdd = Math.min(remaining, itemStack.maxStack);
        slot.item = new ItemStack(itemStack.item, toAdd);
        added += toAdd;
      } else if (slot.item.isSameItem(itemStack)) {
        // 同种物品，尝试堆叠
        const space = slot.item.maxStack - slot.item.count;
        if (space > 0) {
          const toAdd = Math.min(space, remaining);
          slot.item.count += toAdd;
          added += toAdd;
        }
      }

      // 触发事件
      this.emit({
        type: InventoryEventType.ITEM_ADDED,
        toSlot: index,
        item: slot.item,
        amount: added
      });
    }

    return added;
  }

  /**
   * 移除物品
   * @param itemId 物品ID
   * @param amount 数量
   * @returns 实际移除的数量
   */
  public removeItem(itemId: string, amount: number): number {
    let remaining = amount;
    let removed = 0;

    for (const slot of this.slots) {
      if (remaining <= 0) break;
      if (slot.item === null || slot.item.id !== itemId) continue;
      if (slot.locked) continue;

      const toRemove = Math.min(remaining, slot.item.count);
      removed += toRemove;
      remaining -= toRemove;

      if (toRemove >= slot.item.count) {
        slot.item = null;
      } else {
        slot.item.count -= toRemove;
      }

      this.emit({
        type: InventoryEventType.ITEM_REMOVED,
        fromSlot: slot.index,
        amount: toRemove
      });
    }

    return removed;
  }

  /**
   * 获取物品（不移除）
   */
  public getItem(itemId: string): ItemStack | null {
    for (const slot of this.slots) {
      if (slot.item !== null && slot.item.id === itemId) {
        return slot.item;
      }
    }
    return null;
  }

  /**
   * 设置槽位物品
   */
  public setItem(index: number, item: ItemStack | null): boolean {
    if (index < 0 || index >= this.slotCount) {
      return false;
    }

    const slot = this.slots[index];
    if (slot.locked) {
      return false;
    }

    slot.item = item;

    this.emit({
      type: InventoryEventType.SLOT_CHANGED,
      fromSlot: index,
      item: item
    });

    return true;
  }

  /**
   * 交换两个槽位的物品
   */
  public swapSlots(index1: number, index2: number): boolean {
    const slot1 = this.getSlot(index1);
    const slot2 = this.getSlot(index2);

    if (!slot1 || !slot2) return false;
    if (!slot1.selectable || !slot2.selectable) return false;

    // 交换物品
    const temp = slot1.item;
    slot1.item = slot2.item;
    slot2.item = temp;

    this.emit({
      type: InventoryEventType.ITEM_SWAPPED,
      fromSlot: index1,
      toSlot: index2
    });

    return true;
  }

  /**
   * 将物品从一个槽位移动到另一个槽位
   */
  public moveItem(fromIndex: number, toIndex: number): boolean {
    const fromSlot = this.getSlot(fromIndex);
    const toSlot = this.getSlot(toIndex);

    if (!fromSlot || !toSlot) return false;
    if (!fromSlot.item) return false;
    if (toSlot.locked || !toSlot.selectable) return false;

    // 如果目标槽位为空，直接移动
    if (toSlot.item === null) {
      toSlot.item = fromSlot.item;
      fromSlot.item = null;
    } else if (toSlot.item.isSameItem(fromSlot.item) && !toSlot.item.isFull) {
      // 如果是同种物品且目标未满，合并
      const available = toSlot.item.add(fromSlot.item.count);
      if (available > 0) {
        fromSlot.item.count = available;
      } else {
        fromSlot.item = null;
      }
    } else {
      // 交换物品
      const temp = toSlot.item;
      toSlot.item = fromSlot.item;
      fromSlot.item = temp;
    }

    this.emit({
      type: InventoryEventType.ITEM_MOVED,
      fromSlot: fromSlot.index,
      toSlot: toSlot.index
    });

    return true;
  }

  /**
   * 选中槽位
   */
  public selectSlot(index: number): boolean {
    if (index < 0 || index >= this.slotCount) {
      return false;
    }

    const slot = this.slots[index];
    if (!slot.selectable) {
      return false;
    }

    const oldSelected = this.selectedSlot;
    this.selectedSlot = index;

    if (oldSelected !== index) {
      this.emit({
        type: InventoryEventType.SELECTION_CHANGED,
        fromSlot: oldSelected,
        toSlot: index
      });
    }

    return true;
  }

  /**
   * 获取当前选中的槽位
   */
  public getSelectedSlot(): number {
    return this.selectedSlot;
  }

  /**
   * 获取当前选中的物品
   */
  public getSelectedItem(): ItemStack | null {
    if (this.selectedSlot >= 0 && this.selectedSlot < this.slotCount) {
      return this.slots[this.selectedSlot].item;
    }
    return null;
  }

  /**
   * 清空物品栏
   */
  public clear(): void {
    for (const slot of this.slots) {
      if (!slot.locked) {
        slot.item = null;
      }
    }

    this.selectedSlot = -1;
  }

  /**
   * 获取可用槽位列表（按优先级）
   */
  protected getAvailableSlots(): number[] {
    const available: number[] = [];

    // 1. 已有的同种物品槽位（可堆叠）
    for (let i = 0; i < this.slotCount; i++) {
      const slot = this.slots[i];
      if (slot.item !== null && !slot.item.isFull && slot.selectable) {
        available.push(i);
      }
    }

    // 2. 空槽位
    for (let i = 0; i < this.slotCount; i++) {
      const slot = this.slots[i];
      if (slot.item === null && slot.selectable) {
        available.push(i);
      }
    }

    return available;
  }

  /**
   * 添加事件监听器
   */
  public addListener(type: InventoryEventType, listener: InventoryEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  public removeListener(type: InventoryEventType, listener: InventoryEventListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  protected emit(data: InventoryEventData): void {
    const listeners = this.listeners.get(data.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  /**
   * 转换为 JSON（用于保存）
   */
  public toJSON(): { slots: { id: string | null; count: number }[]; selectedSlot: number } {
    return {
      slots: this.slots.map(slot => ({
        id: slot.item?.id ?? null,
        count: slot.item?.count ?? 0
      })),
      selectedSlot: this.selectedSlot
    };
  }

  /**
   * 从 JSON 恢复（用于加载）
   */
  public fromJSON(json: { slots: { id: string | null; count: number }[]; selectedSlot: number }): void {
    this.clear();

    for (let i = 0; i < Math.min(json.slots.length, this.slotCount); i++) {
      const slotData = json.slots[i];
      if (slotData.id !== null && slotData.count > 0) {
        const itemStack = ItemRegistry.createItemStack(slotData.id, slotData.count);
        if (itemStack) {
          this.slots[i].item = itemStack;
        }
      }
    }

    if (json.selectedSlot >= 0 && json.selectedSlot < this.slotCount) {
      this.selectedSlot = json.selectedSlot;
    }
  }

  /**
   * 检查物品栏是否为空
   */
  public isEmpty(): boolean {
    return this.slots.every(slot => slot.item === null);
  }

  /**
   * 获取物品栏容量使用百分比
   */
  public getUsagePercentage(): number {
    const totalSlots = this.slotCount;
    const usedSlots = this.slots.filter(slot => slot.item !== null).length;
    return usedSlots / totalSlots;
  }
}

/**
 * 玩家物品栏
 * 包含主物品栏（27格）和快捷栏（9格）
 */
export class PlayerInventory {
  /** 主物品栏（27格） */
  public readonly mainInventory: Inventory;
  /** 快捷栏（9格） */
  public readonly hotbar: Inventory;
  /** 物品栏槽位总数 */
  public static readonly TOTAL_SLOTS = 36;

  /** 事件监听器 */
  private listeners: Map<InventoryEventType, Set<InventoryEventListener>>;

  /**
   * 创建玩家物品栏
   */
  constructor() {
    this.mainInventory = new Inventory(InventoryType.MAIN, 27);
    this.hotbar = new Inventory(InventoryType.HOTBAR, 9);
    this.listeners = new Map();

    // 同步事件
    this.setupEventSync();
  }

  /**
   * 设置事件同步
   */
  private setupEventSync(): void {
    const syncEvent = (data: InventoryEventData) => {
      this.emit(data);
    };

    this.mainInventory.addListener(InventoryEventType.SLOT_CHANGED, syncEvent);
    this.hotbar.addListener(InventoryEventType.SLOT_CHANGED, syncEvent);
  }

  /**
   * 获取所有物品
   */
  public getAllItems(): ItemStack[] {
    return [
      ...this.mainInventory.getAllItems(),
      ...this.hotbar.getAllItems()
    ];
  }

  /**
   * 添加物品到物品栏
   * 优先添加到主物品栏
   */
  public addItem(itemStack: ItemStack): number {
    // 先尝试添加到主物品栏
    let added = this.mainInventory.addItem(itemStack);

    // 如果主物品栏已满，尝试添加到快捷栏
    if (added < itemStack.count) {
      const remaining = new ItemStack(itemStack.item, itemStack.count - added);
      added += this.hotbar.addItem(remaining);
    }

    return added;
  }

  /**
   * 从物品栏移除物品
   */
  public removeItem(itemId: string, amount: number): number {
    let removed = this.mainInventory.removeItem(itemId, amount);

    if (removed < amount) {
      removed += this.hotbar.removeItem(itemId, amount - removed);
    }

    return removed;
  }

  /**
   * 获取物品数量
   */
  public getItemCount(itemId: string): number {
    return this.mainInventory.getItemCount(itemId) + this.hotbar.getItemCount(itemId);
  }

  /**
   * 检查是否包含物品
   */
  public hasItem(itemId: string): boolean {
    return this.mainInventory.hasItem(itemId) || this.hotbar.hasItem(itemId);
  }

  /**
   * 获取选中的物品
   */
  public getSelectedItem(): ItemStack | null {
    return this.hotbar.getSelectedItem();
  }

  /**
   * 设置快捷栏选中的槽位
   */
  public selectHotbarSlot(index: number): boolean {
    return this.hotbar.selectSlot(index);
  }

  /**
   * 快捷栏滚动选择
   */
  public scrollHotbar(direction: number): void {
    const current = this.hotbar.getSelectedSlot();
    let next = current + direction;

    // 循环选择
    if (next >= 9) next = 0;
    if (next < 0) next = 8;

    this.hotbar.selectSlot(next);
  }

  /**
   * 获取快捷栏选中索引
   */
  public getSelectedSlotIndex(): number {
    return this.hotbar.getSelectedSlot();
  }

  /**
   * 将物品从主物品栏移动到快捷栏
   */
  public moveToHotbar(mainIndex: number, hotbarIndex: number): boolean {
    if (mainIndex < 0 || mainIndex >= 27) return false;
    if (hotbarIndex < 0 || hotbarIndex >= 9) return false;

    return this.mainInventory.moveItem(mainIndex, hotbarIndex + 27);
  }

  /**
   * 将物品从快捷栏移动到主物品栏
   */
  public moveToMain(hotbarIndex: number, mainIndex: number): boolean {
    if (hotbarIndex < 0 || hotbarIndex >= 9) return false;
    if (mainIndex < 0 || mainIndex >= 27) return false;

    return this.hotbar.moveItem(hotbarIndex, mainIndex);
  }

  /**
   * 丢弃选中的物品
   */
  public dropSelectedItem(): void {
    const selectedItem = this.hotbar.getSelectedItem();
    if (selectedItem) {
      selectedItem.decrement();
      if (selectedItem.isEmpty) {
        this.hotbar.setItem(this.hotbar.getSelectedSlot(), null);
      }
    }
  }

  /**
   * 添加事件监听器
   */
  public addListener(type: InventoryEventType, listener: InventoryEventListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    // 同时添加到子物品栏
    this.mainInventory.addListener(type, listener);
    this.hotbar.addListener(type, listener);
  }

  /**
   * 移除事件监听器
   */
  public removeListener(type: InventoryEventType, listener: InventoryEventListener): void {
    this.mainInventory.removeListener(type, listener);
    this.hotbar.removeListener(type, listener);

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(data: InventoryEventData): void {
    const listeners = this.listeners.get(data.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(data);
      }
    }
  }

  /**
   * 清空物品栏
   */
  public clear(): void {
    this.mainInventory.clear();
    this.hotbar.clear();
  }

  /**
   * 序列化物品栏为 JSON
   */
  public toJSON(): { mainInventory: object; hotbar: object } {
    return {
      mainInventory: this.mainInventory.toJSON(),
      hotbar: this.hotbar.toJSON()
    };
  }

  /**
   * 从 JSON 恢复
   */
  public fromJSON(json: unknown): void {
    const data = json as { mainInventory: { slots: { id: string | null; count: number }[]; selectedSlot: number }; hotbar: { slots: { id: string | null; count: number }[]; selectedSlot: number } };
    this.mainInventory.fromJSON(data.mainInventory);
    this.hotbar.fromJSON(data.hotbar);
  }
}
