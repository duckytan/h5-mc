import { CraftingSystem, CraftingRecipe } from '../gameplay/Crafting';
import { ItemStack, ItemRegistry } from '../core/items/Item';

/**
 * 合成 UI 类
 * 显示 3x3 合成网格和结果槽位
 */
export class CraftingUI {
  private craftingSystem: CraftingSystem;
  private container: HTMLElement;
  private craftingGrid: HTMLElement;
  private resultSlot: HTMLElement;
  private craftButton: HTMLButtonElement;
  private recipeInfo: HTMLElement;
  private isVisible: boolean = false;
  private slots: HTMLElement[] = [];

  constructor(craftingSystem: CraftingSystem) {
    this.craftingSystem = craftingSystem;
    this.container = this.createContainer();
    this.craftingGrid = this.createCraftingGrid();
    this.resultSlot = this.createResultSlot();
    this.craftButton = this.createCraftButton();
    this.recipeInfo = this.createRecipeInfo();

    this.setupContainer();
    this.bindEvents();

    // 监听合成结果变化
    this.craftingSystem.addListener((recipe) => {
      this.updateResultDisplay();
      this.updateRecipeInfo(recipe);
    });
  }

  /**
   * 创建容器
   */
  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'crafting-ui';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(30, 30, 30, 0.95);
      border: 3px solid #8b8b8b;
      border-radius: 8px;
      padding: 20px;
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      z-index: 200;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      min-width: 400px;
    `;
    return container;
  }

  /**
   * 创建合成网格
   */
  private createCraftingGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 60px);
      grid-template-rows: repeat(3, 60px);
      gap: 4px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    `;

    // 创建9个槽位
    for (let i = 0; i < 9; i++) {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: 60px;
        height: 60px;
        background-color: rgba(100, 100, 100, 0.6);
        border: 2px solid rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        cursor: pointer;
      `;
      slot.dataset.index = i.toString();

      // 槽位编号（调试用）
      const numberLabel = document.createElement('span');
      numberLabel.textContent = (i + 1).toString();
      numberLabel.style.cssText = `
        position: absolute;
        top: 2px;
        left: 4px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.5);
      `;
      slot.appendChild(numberLabel);

      grid.appendChild(slot);
      this.slots.push(slot);
    }

    return grid;
  }

  /**
   * 创建结果槽位
   */
  private createResultSlot(): HTMLElement {
    const slot = document.createElement('div');
    slot.style.cssText = `
      width: 80px;
      height: 80px;
      background-color: rgba(80, 80, 80, 0.6);
      border: 3px solid #c0c0c0;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: default;
    `;

    const arrow = document.createElement('div');
    arrow.innerHTML = '&#8594;';
    arrow.style.cssText = `
      position: absolute;
      left: -35px;
      font-size: 30px;
      color: #a0a0a0;
    `;
    slot.appendChild(arrow);

    return slot;
  }

  /**
   * 创建合成按钮
   */
  private createCraftButton(): HTMLButtonElement {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = '合成';
    button.style.cssText = `
      padding: 12px 40px;
      font-size: 16px;
      font-weight: bold;
      background: linear-gradient(to bottom, #5a8f5a, #3d6b3d);
      color: white;
      border: 2px solid #2d5a2d;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    `;

    button.onmouseenter = () => {
      button.style.background = 'linear-gradient(to bottom, #6ba86b, #4d7b4d)';
    };

    button.onmouseleave = () => {
      button.style.background = 'linear-gradient(to bottom, #5a8f5a, #3d6b3d)';
    };

    button.onclick = () => {
      this.craft();
    };

    return button;
  }

  /**
   * 创建配方信息显示
   */
  private createRecipeInfo(): HTMLElement {
    const info = document.createElement('div');
    info.style.cssText = `
      font-size: 12px;
      color: #a0a0a0;
      text-align: center;
      min-height: 20px;
    `;
    return info;
  }

  /**
   * 设置容器内容
   */
  private setupContainer(): void {
    // 标题
    const title = document.createElement('h2');
    title.textContent = '合成';
    title.style.cssText = `
      margin: 0;
      color: #ffffff;
      font-size: 20px;
    `;

    // 顶部行：合成网格 -> 结果
    const topRow = document.createElement('div');
    topRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 30px;
    `;

    // 箭头
    const arrow = document.createElement('div');
    arrow.innerHTML = '&#8594;';
    arrow.style.cssText = `
      font-size: 40px;
      color: #a0a0a0;
    `;

    topRow.appendChild(this.craftingGrid);
    topRow.appendChild(arrow);
    topRow.appendChild(this.resultSlot);

    this.container.appendChild(title);
    this.container.appendChild(topRow);
    this.container.appendChild(this.craftButton);
    this.container.appendChild(this.recipeInfo);

    document.body.appendChild(this.container);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 槽位点击事件
    this.slots.forEach((slot, index) => {
      slot.addEventListener('click', () => {
        this.onSlotClick(index);
      });
    });
  }

  /**
   * 槽位点击
   */
  private onSlotClick(index: number): void {
    // 右键点击移除物品
    const currentItem = this.craftingSystem.getSlot(index);
    if (currentItem) {
      this.craftingSystem.setSlot(index, null);
      this.updateSlotDisplay(index);
    }
  }

  /**
   * 更新槽位显示
   */
  private updateSlotDisplay(index: number): void {
    const slot = this.slots[index];
    const item = this.craftingSystem.getSlot(index);

    // 移除旧的内容（保留编号）
    while (slot.childNodes.length > 1) {
      slot.removeChild(slot.lastChild!);
    }

    if (item) {
      const itemElement = this.createItemElement(item);
      slot.appendChild(itemElement);
    }
  }

  /**
   * 更新所有槽位显示
   */
  private updateAllSlotsDisplay(): void {
    for (let i = 0; i < 9; i++) {
      this.updateSlotDisplay(i);
    }
  }

  /**
   * 更新结果槽位显示
   */
  private updateResultDisplay(): void {
    // 清除旧内容
    while (this.resultSlot.childNodes.length > 1) {
      this.resultSlot.removeChild(this.resultSlot.lastChild!);
    }

    const result = this.craftingSystem.getResult();
    if (result) {
      const itemElement = this.createItemElement(result, true);
      this.resultSlot.appendChild(itemElement);
      this.craftButton.disabled = false;
      this.craftButton.style.opacity = '1';
    } else {
      this.craftButton.disabled = true;
      this.craftButton.style.opacity = '0.5';
    }
  }

  /**
   * 更新配方信息
   */
  private updateRecipeInfo(recipe: CraftingRecipe | null): void {
    if (recipe) {
      const resultItem = ItemRegistry.createItemStack(recipe.result.resultId, recipe.result.count);
      if (resultItem) {
        this.recipeInfo.textContent = `配方: ${resultItem.item.name} x${recipe.result.count}`;
      }
    } else {
      this.recipeInfo.textContent = '';
    }
  }

  /**
   * 创建物品元素
   */
  private createItemElement(item: ItemStack, showCount: boolean = true): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `
      width: 40px;
      height: 40px;
      background-color: #${item.item.color.toString(16).padStart(6, '0')};
      border: 1px solid rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    `;

    if (showCount && item.count > 1) {
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
      element.appendChild(countLabel);
    }

    return element;
  }

  /**
   * 执行合成
   */
  private craft(): void {
    if (this.craftingSystem.craft()) {
      // 播放合成音效（可选）
      this.updateAllSlotsDisplay();
      this.updateResultDisplay();
    }
  }

  /**
   * 显示
   */
  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'flex';
  }

  /**
   * 隐藏
   */
  public hide(): void {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  /**
   * 切换显示
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 是否显示
   */
  public isOpen(): boolean {
    return this.isVisible;
  }

  /**
   * 清空
   */
  public clear(): void {
    this.craftingSystem.clear();
    this.updateAllSlotsDisplay();
    this.updateResultDisplay();
  }

  /**
   * 设置合成槽位物品（从外部调用，用于从物品栏放入）
   */
  public setSlot(index: number, item: ItemStack | null): boolean {
    const result = this.craftingSystem.setSlot(index, item);
    if (result) {
      this.updateSlotDisplay(index);
    }
    return result;
  }

  /**
   * 获取合成系统
   */
  public getCraftingSystem(): CraftingSystem {
    return this.craftingSystem;
  }

  /**
   * 销毁
   */
  public dispose(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
