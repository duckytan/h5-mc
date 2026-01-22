import * as THREE from 'three';

export class PlayerController {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private velocity: THREE.Vector3;
  private canJump: boolean;
  private moveSpeed: number;
  private jumpPower: number;
  private gravity: number;

  // 移动状态
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;

  // 鼠标控制
  private isPointerLocked: boolean = false;
  private euler: THREE.Euler;
  private PI_2: number = Math.PI / 2;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.velocity = new THREE.Vector3();
    this.canJump = false;
    this.moveSpeed = 0.1;
    this.jumpPower = 0.15;
    this.gravity = 0.002;

    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.initControls();
  }

  private initControls(): void {
    // 键盘事件
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // 鼠标点击锁定指针
    this.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.domElement.requestPointerLock();
      }
    });

    // 鼠标移动事件
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.onMouseMove(e);
      }
    });
  }

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
        if (this.canJump) {
          this.velocity.y = this.jumpPower;
          this.canJump = false;
        }
        break;
    }
  }

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

  private onMouseMove(event: MouseEvent): void {
    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * 0.002;
    this.euler.x -= movementY * 0.002;

    this.euler.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  public update(): void {
    // 应用重力
    this.velocity.y -= this.gravity;

    // 移动方向
    const direction = new THREE.Vector3();

    if (this.moveForward) direction.z -= 1;
    if (this.moveBackward) direction.z += 1;
    if (this.moveLeft) direction.x -= 1;
    if (this.moveRight) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
    }

    // 旋转方向以匹配相机
    direction.applyQuaternion(this.camera.quaternion);
    direction.y = 0; // 不在Y轴移动

    // 应用移动
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;

    // 更新相机位置
    this.camera.position.add(this.velocity);

    // 简单地面碰撞检测
    if (this.camera.position.y < 5) {
      this.velocity.y = 0;
      this.camera.position.y = 5;
      this.canJump = true;
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.camera.position;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }
}
