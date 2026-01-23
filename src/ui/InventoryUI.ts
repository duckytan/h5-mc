import { PlayerInventory, InventoryEventType } from '../gameplay/Inventory';
import { ItemStack } from '../core/items/Item';

/**
 * 物品栏 UI 元素接口
 */
export interface InventoryUIElement {
  container: HTMLElement;
  slots: HTMLElement[];
  hotbarSlots: HTMLElement[];
  selectedIndex: number;
}

/**
 * 物品栏 UI 类
 * 显示玩家物品栏（27格主物品栏 + 9格快捷栏）
 */
export class InventoryUI {
  /** 玩家物品栏实例 */
  private inventory: PlayerInventory;
  /** UI 元素 */
  private elements: InventoryUIElement;
  /** 是否可见 */
  private isVisible: boolean = false;

  /**
   * 创建物品栏 UI
   * @param inventory 玩家物品栏实例
   */
  constructor(inventory: PlayerInventory) {
    this.inventory = inventory;
    this.elements = this.createElements();
    this.bindEvents();
  }

  /**
   * 创建 UI 元素
   */
  private createElements(): InventoryUIElement {
    // 主容器
    const container = document.createElement('div');
    container.id = 'inventory-container';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.8);
      padding: 20px;
      border-radius: 8px;
      display: none;
      z-index: 1000;
      font-family: 'Microsoft YaHei', Arial, sans-serif;
    `;

    // 标题
    const title = document.createElement('div');
    title.textContent = '物品栏';
    title.style.cssText = `
      color: white;
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    `;
    container.appendChild(title);

    // 主物品栏容器
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(9, 50px);
      grid-template-rows: repeat(3, 50px);
      gap: 4px;
      margin-bottom: 20px;
    `;

    const mainSlots: HTMLElement[] = [];
    for (let i = 0; i < 27; i++) {
      const slot = this.createSlot(i);
      mainContainer.appendChild(slot);
      mainSlots.push(slot);
    }
    container.appendChild(mainContainer);

    // 分隔线
    const divider = document.createElement('hr');
    divider.style.cssText = `
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin: 10px 0;
    `;
    container.appendChild(divider);

    // 快捷栏容器
    const hotbarContainer = document.createElement('div');
    hotbarContainer.style.cssText = `
      display: grid;
      grid-template-columns: repeat(9, 50px);
      gap: 4px;
    `;

    const hotbarSlots: HTMLElement[] = [];
    for (let i = 0; i < 9; i++) {
      const slot = this.createSlot(i);
      hotbarContainer.appendChild(slot);
      hotbarSlots.push(slot);
    }
    container.appendChild(hotbarContainer);

    // 添加到文档
    document.body.appendChild(container);

    return {
      container,
      slots: mainSlots,
      hotbarSlots,
      selectedIndex: 0
    };
  }

  /**
   * 创建单个槽位元素
   */
  private createSlot(index: number): HTMLElement {
    const slot = document.createElement('div');
    slot.style.cssText = `
      width: 50px;
      height: 50px;
      background-color: rgba(100, 100, 100, 0.5);
      border: 2px solid rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
    `;

    // 槽位编号（调试用，可选显示）
    const numberLabel = document.createElement('span');
    numberLabel.textContent = (index + 1).toString();
    numberLabel.style.cssText = `
      position: absolute;
      top: 2px;
      left: 4px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
    `;
    slot.appendChild(numberLabel);

    return slot;
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 监听物品栏变化事件
    this.inventory.addListener(InventoryEventType.SELECTION_CHANGED, () => {
      this.updateSelection();
    });

    this.inventory.addListener(InventoryEventType.SLOT_CHANGED, () => {
      this.updateAllSlots();
    });
  }

  /**
   * 更新选中高亮
   */
  private updateSelection(): void {
    const selectedIndex = this.inventory.getSelectedSlotIndex();

    // 移除所有高亮
    for (const slot of this.elements.hotbarSlots) {
      slot.style.border = '2px solid rgba(0, 0, 0, 0.5)';
    }

    // 添加高亮到选中槽位
    if (selectedIndex >= 0 && selectedIndex < 9) {
      this.elements.hotbarSlots[selectedIndex].style.border = '2px solid white';
    }
  }

  /**
   * 更新所有槽位显示
   */
  private updateAllSlots(): void {
    // 更新快捷栏
    for (let i = 0; i < 9; i++) {
      this.updateSlotDisplay(this.elements.hotbarSlots[i], null);
    }

    // 更新主物品栏（需要访问内部状态，这里简化处理）
    // 实际应该通过事件系统同步
  }

  /**
   * 更新单个槽位显示
   */
  private updateSlotDisplay(slotElement: HTMLElement, item: ItemStack | null): void {
    // 清除现有内容（保留编号标签）
    const numberLabel = slotElement.querySelector('span');
    slotElement.innerHTML = '';
    if (numberLabel) {
      slotElement.appendChild(numberLabel);
    }

    if (item === null || item.isEmpty) {
      slotElement.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
      return;
    }

    // 显示物品颜色块
    const colorBlock = document.createElement('div');
    colorBlock.style.cssText = `
      width: 36px;
      height: 36px;
      background-color: #${item.item.color.toString(16).padStart(6, '0')};
      border: 1px solid rgba(0, 0, 0, 0.3);
    `;
    slotElement.appendChild(colorBlock);

    // 显示数量
    if (item.count > 1) {
      const countLabel = document.createElement('span');
      countLabel.textContent = item.count.toString();
      countLabel.style.cssText = `
        position: absolute;
        bottom: 2px;
        right: 4px;
        font-size: 12px;
        color: white;
        text-shadow: 1px 1px 1px black;
      `;
      slotElement.appendChild(countLabel);
    }

    slotElement.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
  }

  /**
   * 显示物品栏
   */
  public show(): void {
    this.isVisible = true;
    this.elements.container.style.display = 'block';
    this.updateAllSlots();
  }

  /**
   * 隐藏物品栏
   */
  public hide(): void {
    this.isVisible = false;
    this.elements.container.style.display = 'none';
  }

  /**
   * 切换显示状态
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 检查是否可见
   */
  public isOpen(): boolean {
    return this.isVisible;
  }

  /**
   * 销毁 UI
   */
  public dispose(): void {
    this.elements.container.remove();
  }

  /**
   * 获取容器元素（用于添加到特定的父容器）
   */
  public getContainer(): HTMLElement {
    return this.elements.container;
  }
}
