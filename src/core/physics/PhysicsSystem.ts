import * as THREE from 'three';
import { VoxelWorld, BlockType } from '../VoxelWorld';
import { BlockRegistry } from '../blocks/BlockRegistry';

/**
 * 碰撞检测结果
 */
export interface CollisionResult {
  /** 是否发生碰撞 */
  readonly hit: boolean;
  /** 碰撞法线（0, 1, -1 在各轴） */
  readonly normal: THREE.Vector3;
  /** 碰撞点 */
  readonly position: THREE.Vector3;
  /** 碰撞的方块类型 */
  readonly blockType: BlockType;
}

/**
 * 射线检测结果
 */
export interface RaycastResult {
  /** 是否命中 */
  readonly hit: boolean;
  /** 命中点 */
  readonly position: THREE.Vector3;
  /** 命中面法线 */
  readonly normal: THREE.Vector3;
  /** 命中的方块坐标 */
  readonly blockX: number;
  readonly blockY: number;
  readonly blockZ: number;
  /** 命中的方块类型 */
  readonly blockType: BlockType;
  /** 射线距离 */
  readonly distance: number;
}

/**
 * AABB（轴对齐包围盒）类
 */
export class AABB {
  /** 最小点 */
  public min: THREE.Vector3;
  /** 最大点 */
  public max: THREE.Vector3;

  /**
   * 创建 AABB
   */
  constructor(min: THREE.Vector3, max: THREE.Vector3) {
    this.min = min.clone();
    this.max = max.clone();
  }

  /**
   * 创建玩家大小的 AABB
   */
  public static createPlayer(position: THREE.Vector3, width: number = 0.6, height: number = 1.8): AABB {
    const halfWidth = width / 2;
    return new AABB(
      new THREE.Vector3(position.x - halfWidth, position.y, position.z - halfWidth),
      new THREE.Vector3(position.x + halfWidth, position.y + height, position.z + halfWidth)
    );
  }

  /**
   * 检查是否与另一个 AABB 相交
   */
  public intersects(other: AABB): boolean {
    return (
      this.min.x < other.max.x &&
      this.max.x > other.min.x &&
      this.min.y < other.max.y &&
      this.max.y > other.min.y &&
      this.min.z < other.max.z &&
      this.max.z > other.min.z
    );
  }

  /**
   * 检查点是否在 AABB 内部
   */
  public containsPoint(point: THREE.Vector3): boolean {
    return (
      point.x >= this.min.x &&
      point.x <= this.max.x &&
      point.y >= this.min.y &&
      point.y <= this.max.y &&
      point.z >= this.min.z &&
      point.z <= this.max.z
    );
  }

  /**
   * 获取 AABB 中心点
   */
  public getCenter(): THREE.Vector3 {
    return new THREE.Vector3(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2,
      (this.min.z + this.max.z) / 2
    );
  }

  /**
   * 获取 AABB 尺寸
   */
  public getSize(): THREE.Vector3 {
    return new THREE.Vector3(
      this.max.x - this.min.x,
      this.max.y - this.min.y,
      this.max.z - this.min.z
    );
  }

  /**
   * 扩展 AABB
   */
  public expand(amount: number): AABB {
    return new AABB(
      this.min.clone().subScalar(amount),
      this.max.clone().addScalar(amount)
    );
  }

  /**
   * 克隆 AABB
   */
  public clone(): AABB {
    return new AABB(this.min.clone(), this.max.clone());
  }

  /**
   * 更新 AABB 位置
   */
  public updatePosition(position: THREE.Vector3): void {
    const size = this.getSize();
    this.min.copy(position);
    this.max.copy(position).add(size);
  }

  /**
   * 水平移动（考虑碰撞）
   * @returns 碰撞信息（无碰撞时返回 null）
   */
  public horizontalMove(
    world: VoxelWorld,
    dx: number,
    dz: number
  ): CollisionResult | null {
    const newMin = this.min.clone();
    const newMax = this.max.clone();

    newMin.x += dx;
    newMax.x += dx;
    newMin.z += dz;
    newMax.z += dz;

    // 检查 X 轴碰撞
    if (dx !== 0) {
      const collision = this.checkCollision(world, new THREE.Vector3(dx, 0, 0), newMin, newMax);
      if (collision) return collision;
    }

    // 检查 Z 轴碰撞
    if (dz !== 0) {
      const collision = this.checkCollision(world, new THREE.Vector3(0, 0, dz), newMin, newMax);
      if (collision) return collision;
    }

    return null;
  }

  /**
   * 垂直移动（考虑碰撞）
   * @returns 碰撞信息（无碰撞时返回 null）
   */
  public verticalMove(
    world: VoxelWorld,
    dy: number
  ): CollisionResult | null {
    const newMin = this.min.clone();
    const newMax = this.max.clone();

    newMin.y += dy;
    newMax.y += dy;

    return this.checkCollision(world, new THREE.Vector3(0, dy, 0), newMin, newMax);
  }

  /**
   * 检查与方块的碰撞
   */
  private checkCollision(
    world: VoxelWorld,
    velocity: THREE.Vector3,
    testMin: THREE.Vector3,
    testMax: THREE.Vector3
  ): CollisionResult | null {
    // 获取需要检查的方块范围
    const minX = Math.floor(testMin.x);
    const maxX = Math.floor(testMax.x);
    const minY = Math.floor(testMin.y);
    const maxY = Math.floor(testMax.y);
    const minZ = Math.floor(testMin.z);
    const maxZ = Math.floor(testMax.z);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const blockType = world.getVoxel(x, y, z);

          // 跳过空气和非固体方块
          if (blockType === BlockType.AIR) continue;
          if (!BlockRegistry.isSolid(blockType)) continue;

          // 创建方块的 AABB
          const blockAABB = new AABB(
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x + 1, y + 1, z + 1)
          );

          // 检查相交
          if (testMin.x < blockAABB.max.x &&
              testMax.x > blockAABB.min.x &&
              testMin.y < blockAABB.max.y &&
              testMax.y > blockAABB.min.y &&
              testMin.z < blockAABB.max.z &&
              testMax.z > blockAABB.min.z) {

            // 计算碰撞法线
            const normal = new THREE.Vector3(0, 0, 0);

            if (velocity.x > 0) {
              normal.set(-1, 0, 0);
            } else if (velocity.x < 0) {
              normal.set(1, 0, 0);
            } else if (velocity.y > 0) {
              normal.set(0, -1, 0);
            } else if (velocity.y < 0) {
              normal.set(0, 1, 0);
            } else if (velocity.z > 0) {
              normal.set(0, 0, -1);
            } else if (velocity.z < 0) {
              normal.set(0, 0, 1);
            }

            return {
              hit: true,
              normal,
              position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
              blockType
            };
          }
        }
      }
    }

    return null;
  }
}

/**
 * 物理系统类
 * 处理碰撞检测和物理模拟
 */
export class PhysicsSystem {
  /** 世界实例 */
  private world: VoxelWorld;
  /** 重力加速度 */
  private gravity: number;
  /** 玩家移动速度 */
  private moveSpeed: number;
  /** 玩家跳跃高度 */
  private jumpPower: number;
  /** 玩家宽度 */
  private playerWidth: number;
  /** 玩家高度 */
  private playerHeight: number;
  /** 是否站在地面上 */
  private onGround: boolean;
  /** 当前速度 */
  private velocity: THREE.Vector3;

  /**
   * 创建物理系统
   */
  constructor(world: VoxelWorld) {
    this.world = world;
    this.gravity = 0.015;
    this.moveSpeed = 0.1;
    this.jumpPower = 0.35;
    this.playerWidth = 0.6;
    this.playerHeight = 1.8;
    this.onGround = false;
    this.velocity = new THREE.Vector3();
  }

  /**
   * 更新物理状态
   * @param position 玩家当前位置
   * @param deltaTime 时间增量
   * @returns 更新后的位置和碰撞信息
   */
  public update(
    position: THREE.Vector3,
    deltaTime: number = 1
  ): { position: THREE.Vector3; onGround: boolean; collision: CollisionResult | null } {
    // 应用重力
    this.velocity.y -= this.gravity * deltaTime;

    // 应用水平速度
    this.velocity.x *= 0.9; // 摩擦力
    this.velocity.z *= 0.9;

    // 创建玩家的 AABB
    const aabb = AABB.createPlayer(position, this.playerWidth, this.playerHeight);

    // 垂直移动
    const verticalCollision = aabb.verticalMove(this.world, this.velocity.y * deltaTime);
    if (verticalCollision) {
      if (this.velocity.y < 0) {
        // 下落时碰到地面
        this.onGround = true;
      }
      this.velocity.y = 0;
    } else {
      position.y += this.velocity.y * deltaTime;
      this.onGround = false;
    }

    // 水平移动
    const horizontalCollision = aabb.horizontalMove(
      this.world,
      this.velocity.x * deltaTime,
      this.velocity.z * deltaTime
    );

    if (horizontalCollision) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    } else {
      position.x += this.velocity.x * deltaTime;
      position.z += this.velocity.z * deltaTime;
    }

    // 更新 AABB 位置
    aabb.updatePosition(position);

    return {
      position,
      onGround: this.onGround,
      collision: horizontalCollision ?? verticalCollision
    };
  }

  /**
   * 玩家跳跃
   * @param onGround 是否站在地面上
   * @returns 跳跃后的垂直速度
   */
  public jump(onGround: boolean): number {
    if (onGround) {
      this.velocity.y = this.jumpPower;
      return this.jumpPower;
    }
    return 0;
  }

  /**
   * 设置玩家速度
   */
  public setVelocity(x: number, y: number, z: number): void {
    this.velocity.set(x, y, z);
  }

  /**
   * 获取玩家速度
   */
  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * 射线检测
   */
  public raycast(
    from: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number = 8
  ): RaycastResult {
    const step = 0.1; // 步进大小
    const maxSteps = Math.ceil(maxDistance / step);

    let currentPos = from.clone();
    let lastSolidBlock: BlockType = BlockType.AIR;

    for (let i = 0; i < maxSteps; i++) {
      currentPos.add(direction.clone().multiplyScalar(step));

      const bx = Math.floor(currentPos.x);
      const by = Math.floor(currentPos.y);
      const bz = Math.floor(currentPos.z);

      const blockType = this.world.getVoxel(bx, by, bz);

      if (blockType !== BlockType.AIR && BlockRegistry.isSolid(blockType)) {
        // 命中实体方块
        return {
          hit: true,
          position: currentPos.clone(),
          normal: this.computeNormal(from, currentPos),
          blockX: bx,
          blockY: by,
          blockZ: bz,
          blockType,
          distance: from.distanceTo(currentPos)
        };
      }

      lastSolidBlock = blockType;
    }

    return {
      hit: false,
      position: currentPos.clone(),
      normal: new THREE.Vector3(),
      blockX: Math.floor(currentPos.x),
      blockY: Math.floor(currentPos.y),
      blockZ: Math.floor(currentPos.z),
      blockType: lastSolidBlock,
      distance: maxDistance
    };
  }

  /**
   * 计算射线命中的面法线
   */
  private computeNormal(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3 {
    const delta = to.clone().sub(from);
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);
    const absZ = Math.abs(delta.z);

    if (absX >= absY && absX >= absZ) {
      return new THREE.Vector3(delta.x > 0 ? -1 : 1, 0, 0);
    } else if (absY >= absX && absY >= absZ) {
      return new THREE.Vector3(0, delta.y > 0 ? -1 : 1, 0);
    } else {
      return new THREE.Vector3(0, 0, delta.z > 0 ? -1 : 1);
    }
  }

  /**
   * 获取地面高度
   * @param x X 坐标
   * @param z Z 坐标
   * @param startY 开始搜索的高度
   * @returns 地面高度（未找到返回 null）
   */
  public getGroundHeight(x: number, z: number, startY: number = 64): number | null {
    for (let y = startY; y >= 0; y--) {
      const blockType = this.world.getVoxel(x, y, z);
      if (blockType !== BlockType.AIR && BlockRegistry.isSolid(blockType)) {
        return y + 1;
      }
    }
    return null;
  }

  /**
   * 检查位置是否在空气中（可用于放置方块）
   */
  public isPositionEmpty(x: number, y: number, z: number): boolean {
    const blockType = this.world.getVoxel(x, y, z);
    return blockType === BlockType.AIR || !BlockRegistry.isSolid(blockType);
  }

  /**
   * 检查位置是否可以放置方块
   */
  public canPlaceBlock(x: number, y: number, z: number): boolean {
    if (y < 0) return false;
    return this.isPositionEmpty(x, y, z);
  }

  /**
   * 检查位置是否可以破坏方块
   */
  public canBreakBlock(x: number, y: number, z: number): boolean {
    if (y < 0) return false;
    const blockType = this.world.getVoxel(x, y, z);
    return blockType !== BlockType.AIR && BlockRegistry.isSolid(blockType);
  }

  /**
   * 检查玩家是否在液体中
   */
  public isInLiquid(position: THREE.Vector3): boolean {
    const blockType = this.world.getVoxel(
      Math.floor(position.x),
      Math.floor(position.y + 0.5),
      Math.floor(position.z)
    );
    return blockType === BlockType.WATER;
  }

  /**
   * 获取配置
   */
  public getConfig(): { gravity: number; moveSpeed: number; jumpPower: number; playerWidth: number; playerHeight: number } {
    return {
      gravity: this.gravity,
      moveSpeed: this.moveSpeed,
      jumpPower: this.jumpPower,
      playerWidth: this.playerWidth,
      playerHeight: this.playerHeight
    };
  }

  /**
   * 设置配置
   */
  public setConfig(config: Partial<{ gravity: number; moveSpeed: number; jumpPower: number; playerWidth: number; playerHeight: number }>): void {
    if (config.gravity !== undefined) this.gravity = config.gravity;
    if (config.moveSpeed !== undefined) this.moveSpeed = config.moveSpeed;
    if (config.jumpPower !== undefined) this.jumpPower = config.jumpPower;
    if (config.playerWidth !== undefined) this.playerWidth = config.playerWidth;
    if (config.playerHeight !== undefined) this.playerHeight = config.playerHeight;
  }
}
