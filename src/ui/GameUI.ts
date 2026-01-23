export interface GameUI {
  showCrosshair(): void;
  hideCrosshair(): void;
  updateFPS(fps: number): void;
  updatePosition(x: number, y: number, z: number): void;
  updateSelectedBlock(blockName: string): void;
  showMessage(message: string, duration: number): void;
}

export class GameUIImpl implements GameUI {
  private crosshairElement: HTMLElement;
  private fpsElement: HTMLElement;
  private coordsElement: HTMLElement;
  private blockElement: HTMLElement;

  constructor() {
    this.crosshairElement = document.getElementById('crosshair') as HTMLElement;
    this.fpsElement = document.getElementById('fps') as HTMLElement;
    this.coordsElement = document.getElementById('coords') as HTMLElement;
    this.blockElement = document.getElementById('selected-block') as HTMLElement;
  }

  public showCrosshair(): void {
    this.crosshairElement.style.display = 'block';
  }

  public hideCrosshair(): void {
    this.crosshairElement.style.display = 'none';
  }

  public updateFPS(fps: number): void {
    this.fpsElement.textContent = fps.toString();
  }

  public updatePosition(x: number, y: number, z: number): void {
    this.coordsElement.textContent = `${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`;
  }

  public updateSelectedBlock(blockName: string): void {
    this.blockElement.textContent = blockName;
  }

  public showMessage(message: string, duration: number = 3000): void {
    // 创建消息元素
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      z-index: 10000;
      pointer-events: none;
    `;

    document.body.appendChild(messageDiv);

    // 自动移除
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, duration);
  }
}

export class BlockSelectorUI {
  private container!: HTMLElement;
  private selectedIndex: number = 0;
  private blockTypes: Array<{ type: number; name: string }> = [
    { type: 1, name: '草地方块' },
    { type: 2, name: '泥土' },
    { type: 3, name: '石头' },
    { type: 4, name: '木头' }
  ];

  constructor() {
    this.createUI();
  }

  private createUI(): void {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 1000;
    `;

    this.blockTypes.forEach((block, index) => {
      const slot = document.createElement('div');
      slot.style.cssText = `
        width: 60px;
        height: 60px;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid ${index === this.selectedIndex ? '#fff' : 'transparent'};
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      slot.textContent = block.name;
      slot.addEventListener('click', () => this.selectBlock(index));

      this.container.appendChild(slot);
    });

    document.body.appendChild(this.container);
  }

  public selectBlock(index: number): void {
    if (index >= 0 && index < this.blockTypes.length) {
      this.selectedIndex = index;
      this.updateUI();
    }
  }

  private updateUI(): void {
    const slots = this.container.children;
    for (let i = 0; i < slots.length; i++) {
      (slots[i] as HTMLElement).style.border = `2px solid ${i === this.selectedIndex ? '#fff' : 'transparent'}`;
    }
  }

  public getSelectedBlockType(): number {
    return this.blockTypes[this.selectedIndex].type;
  }

  public dispose(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
