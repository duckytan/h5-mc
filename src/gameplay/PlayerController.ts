import * as THREE from 'three';
import { VoxelWorld, BlockType } from '../core/VoxelWorld';
import { PhysicsSystem } from '../core/physics/PhysicsSystem';

/**
 * 玩家控制器
 * 集成 PhysicsSystem 进行碰撞检测
 */
export class PlayerController {
  /** 摄像机实例 */
  private camera: THREE.Camera;
  /** DOM 元素（用于指针锁定） */
  private domElement: HTMLElement;
  /** 物理系统 */
  private physicsSystem: PhysicsSystem;
  /** 速度向量 */
  private velocity: THREE.Vector3;
  /** 是否可以跳跃 */
  private canJump: boolean;
  /** 移动速度 */
  private moveSpeed: number;
  /** 跳跃力度 */
  private jumpPower: number;

  /** 移动状态 */
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;

  /** 指针锁定状态 */
  private pointerLocked: boolean = false;
  /** 欧拉角（用于视角控制） */
  private euler: THREE.Euler;
  /** 视角限制（PI/2 = 90度） */
  private readonly PI_2: number = Math.PI / 2;

  /**
   * 创建玩家控制器
   * @param camera 摄像机实例
   * @param domElement DOM 元素
   * @param world VoxelWorld 实例（用于碰撞检测）
   */
  constructor(camera: THREE.Camera, domElement: HTMLElement, world: VoxelWorld) {
    this.camera = camera;
    this.domElement = domElement;
    this.physicsSystem = new PhysicsSystem(world);

    // 初始化物理参数
    const config = this.physicsSystem.getConfig();
    this.moveSpeed = config.moveSpeed;
    this.jumpPower = config.jumpPower;

    this.velocity = new THREE.Vector3();
    this.canJump = false;

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.initControls();
  }

  /**
   * 初始化控制事件
   */
  private initControls(): void {
    // 键盘按下事件
    document.addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));

    // 键盘释放事件
    document.addEventListener('keyup', (event: KeyboardEvent) => this.onKeyUp(event));

    // 鼠标点击锁定指针
    this.domElement.addEventListener('click', () => {
      if (!this.pointerLocked) {
        this.domElement.requestPointerLock();
      }
    });

    // 指针锁定状态变化
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.domElement;
    });

    // 鼠标移动事件
    document.addEventListener('mousemove', (event: MouseEvent) => {
      if (this.pointerLocked) {
        this.onMouseMove(event);
      }
    });
  }

  /**
   * 处理键盘按下事件
   */
  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        // 空格键跳跃
        if (this.canJump) {
          const jumpVelocity = this.physicsSystem.jump(this.canJump);
          this.velocity.y = jumpVelocity;
          this.canJump = false;
        }
        break;
    }
  }

  /**
   * 处理键盘释放事件
   */
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  /**
   * 处理鼠标移动事件（视角控制）
   */
  private onMouseMove(event: MouseEvent): void {
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // 根据鼠标移动更新视角
    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;

    // 限制上下视角（不能看穿地面）
    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  /**
   * 更新玩家状态
   * 包含物理模拟和碰撞检测
   */
  public update(): void {
    // 计算移动方向
    const direction = new THREE.Vector3();

    if (this.moveForward) direction.z -= 1;
    if (this.moveBackward) direction.z += 1;
    if (this.moveLeft) direction.x -= 1;
    if (this.moveRight) direction.x += 1;

    // 归一化方向向量
    if (direction.length() > 0) {
      direction.normalize();
    }

    // 根据相机朝向调整移动方向（只保留水平方向）
    direction.applyQuaternion(this.camera.quaternion);
    direction.y = 0;

    // 设置水平速度
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;

    // 使用 PhysicsSystem 进行物理更新和碰撞检测
    const result = this.physicsSystem.update(
      this.camera.position.clone(),
      1.0
    );

    // 更新相机位置
    this.camera.position.copy(result.position);

    // 更新跳跃状态
    this.canJump = result.onGround;

    // 调试信息（可选）
    if (result.collision) {
      console.debug('碰撞方向:', result.collision.normal);
    }
  }

  /**
   * 获取玩家位置
   */
  public getPosition(): THREE.Vector3 {
    return this.camera.position;
  }

  /**
   * 设置玩家位置
   */
  public setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * 获取物理系统（用于外部访问）
   */
  public getPhysicsSystem(): PhysicsSystem {
    return this.physicsSystem;
  }

  /**
   * 检查是否在地面上
   */
  public isOnGround(): boolean {
    return this.canJump;
  }

  /**
   * 获取当前移动速度
   */
  public getMoveSpeed(): number {
    return this.moveSpeed;
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
    this.physicsSystem.setConfig({ moveSpeed: speed });
  }

  /**
   * 获取跳跃力度
   */
  public getJumpPower(): number {
    return this.jumpPower;
  }

  /**
   * 设置跳跃力度
   */
  public setJumpPower(power: number): void {
    this.jumpPower = power;
    this.physicsSystem.setConfig({ jumpPower: power });
  }

  /**
   * 检查指针是否锁定
   */
  public isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  /**
   * 射线检测（用于方块选择）
   */
  public raycast(maxDistance: number = 8): ReturnType<PhysicsSystem['raycast']> {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    return this.physicsSystem.raycast(
      this.camera.position.clone(),
      direction,
      maxDistance
    );
  }
}
