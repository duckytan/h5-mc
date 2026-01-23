import { WorldSaver, SaveSlotManager } from '../gameplay/WorldSaver';

/**
 * 保存/加载 UI 管理器
 */
export class SaveLoadUI {
  private worldSaver: WorldSaver;
  private container: HTMLElement;
  private isVisible: boolean = false;
  private saveList: HTMLElement;

  constructor(worldSaver: WorldSaver) {
    this.worldSaver = worldSaver;
    this.container = this.createContainer();
    this.saveList = this.createSaveList();

    this.setupContainer();
  }

  /**
   * 创建容器
   */
  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'save-load-ui';
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
      z-index: 300;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      min-width: 400px;
      max-width: 600px;
    `;
    return container;
  }

  /**
   * 创建保存列表
   */
  private createSaveList(): HTMLElement {
    const list = document.createElement('div');
    list.style.cssText = `
      width: 100%;
      max-height: 300px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      padding: 10px;
    `;
    return list;
  }

  /**
   * 设置容器内容
   */
  private setupContainer(): void {
    // 标题
    const title = document.createElement('h2');
    title.textContent = '保存/加载';
    title.style.cssText = `
      margin: 0;
      color: #ffffff;
      font-size: 20px;
    `;

    // 按钮行
    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = `
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    `;

    // 保存按钮
    const saveButton = this.createActionButton('保存游戏', '#5a8f5a', () => this.quickSave());
    buttonRow.appendChild(saveButton);

    // 加载按钮
    const loadButton = this.createActionButton('加载游戏', '#5a6f8f', () => this.quickLoad());
    buttonRow.appendChild(loadButton);

    // 导出按钮
    const exportButton = this.createActionButton('导出世界', '#8f7a5a', () => this.exportWorld());
    buttonRow.appendChild(exportButton);

    // 导入按钮
    const importButton = this.createActionButton('导入世界', '#7a5a8f', () => this.importWorld());
    buttonRow.appendChild(importButton);

    // 分隔线
    const divider = document.createElement('hr');
    divider.style.cssText = `
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    // 保存世界列表标题
    const listTitle = document.createElement('h3');
    listTitle.textContent = '保存的世界';
    listTitle.style.cssText = `
      margin: 0;
      color: #ffffff;
      font-size: 16px;
    `;

    // 刷新列表按钮
    const refreshButton = this.createActionButton('刷新列表', '#6a6a6a', () => this.refreshSaveList());
    buttonRow.appendChild(refreshButton);

    this.container.appendChild(title);
    this.container.appendChild(buttonRow);
    this.container.appendChild(divider);
    this.container.appendChild(listTitle);
    this.container.appendChild(this.saveList);
    this.container.appendChild(refreshButton);

    document.body.appendChild(this.container);

    // 初始刷新列表
    this.refreshSaveList();
  }

  /**
   * 创建操作按钮
   */
  private createActionButton(
    text: string,
    color: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement('button') as HTMLButtonElement;
    button.textContent = text;
    button.style.cssText = `
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      background: ${color};
      color: white;
      border: 2px solid rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    `;

    button.onmouseenter = () => {
      button.style.filter = 'brightness(1.2)';
    };

    button.onmouseleave = () => {
      button.style.filter = 'brightness(1)';
    };

    button.onclick = onClick;

    return button;
  }

  /**
   * 创建保存槽项
   */
  private createSaveSlotItem(slotData: {
    name: string;
    createdAt: string;
    lastSavedAt: string;
    blockCount: number;
    size: number;
  }): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: rgba(100, 100, 100, 0.3);
      border-radius: 4px;
      margin-bottom: 8px;
    `;

    const info = document.createElement('div');
    const createdDate = new Date(slotData.createdAt).toLocaleString();
    info.innerHTML = `
      <div style="color: #ffffff; font-weight: bold;">${slotData.name}</div>
      <div style="color: #a0a0a0; font-size: 12px;">
        创建: ${createdDate}<br>
        方块: ${slotData.blockCount} | 大小: ${this.formatSize(slotData.size)}
      </div>
    `;

    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
      display: flex;
      gap: 5px;
    `;

    // 加载按钮
    const loadBtn = document.createElement('button') as HTMLButtonElement;
    loadBtn.textContent = '加载';
    loadBtn.style.cssText = `
      padding: 5px 10px;
      font-size: 12px;
      background: #5a6f8f;
      color: white;
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      cursor: pointer;
    `;
    loadBtn.onclick = () => this.loadSlot(slotData.name);

    // 删除按钮
    const deleteBtn = document.createElement('button') as HTMLButtonElement;
    deleteBtn.textContent = '删除';
    deleteBtn.style.cssText = `
      padding: 5px 10px;
      font-size: 12px;
      background: #8f5a5a;
      color: white;
      border: 1px solid rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      cursor: pointer;
    `;
    deleteBtn.onclick = () => this.deleteSlot(slotData.name);

    buttonGroup.appendChild(loadBtn);
    buttonGroup.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(buttonGroup);

    return item;
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * 刷新保存列表
   */
  private refreshSaveList(): void {
    const worlds = SaveSlotManager.listWorlds() as {
      name: string;
      createdAt: string;
      lastSavedAt: string;
      blockCount: number;
      size: number;
    }[];

    this.saveList.innerHTML = '';

    if (worlds.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.textContent = '没有保存的世界';
      emptyMsg.style.cssText = `
        color: #a0a0a0;
        text-align: center;
        padding: 20px;
      `;
      this.saveList.appendChild(emptyMsg);
      return;
    }

    for (const world of worlds) {
      const item = this.createSaveSlotItem(world);
      this.saveList.appendChild(item);
    }
  }

  /**
   * 快速保存
   */
  private quickSave(): void {
    if (this.worldSaver.saveToStorage('quick_save')) {
      this.showMessage('游戏已保存！', '#5a8f5a');
      this.refreshSaveList();
    } else {
      this.showMessage('保存失败！', '#8f5a5a');
    }
  }

  /**
   * 快速加载
   */
  private quickLoad(): void {
    if (this.worldSaver.loadFromStorage('quick_save')) {
      this.showMessage('游戏已加载！', '#5a6f8f');
      this.hide();
    } else {
      this.showMessage('加载失败！', '#8f5a5a');
    }
  }

  /**
   * 导出世界
   */
  private exportWorld(): void {
    this.worldSaver.exportToFile(`world_${Date.now()}.json`);
    this.showMessage('世界已导出！', '#8f7a5a');
  }

  /**
   * 导入世界
   */
  private importWorld(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const success = await this.worldSaver.importFromFile(file);
        if (success) {
          this.showMessage('世界已导入！', '#7a5a8f');
          this.hide();
        } else {
          this.showMessage('导入失败！', '#8f5a5a');
        }
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * 加载指定槽
   */
  private loadSlot(slotName: string): void {
    if (this.worldSaver.loadFromStorage(slotName)) {
      this.showMessage(`已加载: ${slotName}`, '#5a6f8f');
      this.hide();
    } else {
      this.showMessage('加载失败！', '#8f5a5a');
    }
  }

  /**
   * 删除指定槽
   */
  private deleteSlot(slotName: string): void {
    if (confirm(`确定要删除 "${slotName}" 吗？`)) {
      if (SaveSlotManager.deleteSlot(slotName)) {
        this.showMessage('已删除', '#8f5a5a');
        this.refreshSaveList();
      } else {
        this.showMessage('删除失败！', '#8f5a5a');
      }
    }
  }

  /**
   * 显示消息
   */
  private showMessage(text: string, color: string): void {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      z-index: 400;
      animation: fadeInOut 2s ease-in-out;
    `;

    // 添加动画样式
    if (!document.getElementById('save-load-animation')) {
      const style = document.createElement('style');
      style.id = 'save-load-animation';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  }

  /**
   * 显示
   */
  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'flex';
    this.refreshSaveList();
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
   * 销毁
   */
  public dispose(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
