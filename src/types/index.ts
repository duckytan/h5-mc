/**
 * Minecraft H5 Web版 - 核心类型定义
 * 定义 Vector3、Chunk、Block 等核心类型
 */

// ============================================================================
// 坐标系统
// ============================================================================

/**
 * 方块坐标 - 整数坐标
 */
export interface BlockPos {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 创建方块坐标
 */
export function blockPos(x: number, y: number, z: number): BlockPos {
  return { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
}

/**
 * 比较两个方块坐标是否相等
 */
export function blockPosEquals(a: BlockPos, b: BlockPos): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/**
 * 区块坐标 - 基于 32x32x32 的区块系统
 */
export interface ChunkPos {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 创建区块坐标
 */
export function chunkPos(x: number, y: number, z: number): ChunkPos {
  return { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
}

/**
 * 世界坐标 - 浮点数坐标
 */
export interface WorldPos {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 创建世界坐标
 */
export function worldPos(x: number, y: number, z: number): WorldPos {
  return { x, y, z };
}

// ============================================================================
// 区块常量
// ============================================================================

/** 区块大小 */
export const CHUNK_SIZE = 32;

/** 区块体积 */
export const CHUNK_VOLUME = CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE;

/** 区块最大高度索引 */
export const CHUNK_MAX_HEIGHT = CHUNK_SIZE - 1;

// ============================================================================
// 坐标转换工具
// ============================================================================

/**
 * 世界坐标 → 方块坐标
 */
export function worldToBlock(x: number, y: number, z: number): BlockPos {
  return blockPos(Math.floor(x), Math.floor(y), Math.floor(z));
}

/**
 * 方块坐标 → 区块坐标
 */
export function blockToChunk(x: number, y: number, z: number): ChunkPos {
  return chunkPos(
    Math.floor(x / CHUNK_SIZE),
    Math.floor(y / CHUNK_SIZE),
    Math.floor(z / CHUNK_SIZE)
  );
}

/**
 * 世界坐标 → 区块坐标
 */
export function worldToChunk(x: number, y: number, z: number): ChunkPos {
  return blockToChunk(worldToBlock(x, y, z).x, worldToBlock(x, y, z).y, worldToBlock(x, y, z).z);
}

/**
 * 区块坐标 → 世界坐标（左上角）
 */
export function chunkToWorld(x: number, y: number, z: number): WorldPos {
  return worldPos(x * CHUNK_SIZE, y * CHUNK_SIZE, z * CHUNK_SIZE);
}

/**
 * 方块坐标 → 区块内局部坐标索引（0-31）
 */
export function blockToLocal(block: BlockPos): {
  x: number;
  y: number;
  z: number;
  index: number;
} {
  const x = ((block.x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const y = ((block.y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const z = ((block.z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const index = x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_SIZE;
  return { x, y, z, index };
}

/**
 * 区块内局部坐标 → 线性索引
 */
export function localToIndex(x: number, y: number, z: number): number {
  return x + y * CHUNK_SIZE + z * CHUNK_SIZE * CHUNK_SIZE;
}

/**
 * 线性索引 → 区块内局部坐标
 */
export function indexToLocal(index: number): { x: number; y: number; z: number } {
  const z = Math.floor(index / (CHUNK_SIZE * CHUNK_SIZE));
  const y = Math.floor((index % (CHUNK_SIZE * CHUNK_SIZE)) / CHUNK_SIZE);
  const x = index % CHUNK_SIZE;
  return { x, y, z };
}

// ============================================================================
// 方块类型
// ============================================================================

/**
 * 方块类型枚举
 */
export enum BlockType {
  Air = 0,
  Stone = 1,
  Dirt = 2,
  Grass = 3,
  Sand = 4,
  Water = 5,
  Wood = 6,
  Leaves = 7,
  Bedrock = 8,
  CoalOre = 9,
  IronOre = 10,
  Glass = 11,
  Wool = 12,
  Clay = 13,
  Gravel = 14,
  Planks = 15,
  Brick = 16,
  Cobblestone = 17,
  MossyCobblestone = 18,
  Obsidian = 19,
  DiamondOre = 20,
}

/**
 * 判断方块是否为空气
 */
export function isAirBlock(type: BlockType): boolean {
  return type === BlockType.Air;
}

/**
 * 判断方块是否透明
 */
export function isTransparentBlock(type: BlockType): boolean {
  return (
    type === BlockType.Air ||
    type === BlockType.Water ||
    type === BlockType.Glass ||
    type === BlockType.Leaves
  );
}

/**
 * 判断方块是否可穿过
 */
export function isPassableBlock(type: BlockType): boolean {
  return type === BlockType.Air || type === BlockType.Water || type === BlockType.Leaves;
}

// ============================================================================
// 方块数据
// ============================================================================

/**
 * 方块数据 - 存储方块类型和元数据
 * 使用 Uint8Array 存储以节省内存
 */
export type BlockData = Uint8Array;

/**
 * 创建空区块数据
 */
export function createEmptyBlockData(): BlockData {
  return new Uint8Array(CHUNK_VOLUME).fill(BlockType.Air);
}

/**
 * 获取方块类型
 */
export function getBlockType(data: BlockData, index: number): BlockType | undefined {
  return data[index];
}

/**
 * 设置方块类型
 */
export function setBlockType(data: BlockData, index: number, type: BlockType): void {
  data[index] = type;
}

// ============================================================================
// 区块相关
// ============================================================================

/**
 * 区块键 - 唯一标识一个区块
 */
export interface ChunkKey {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * 创建区块键
 */
export function chunkKey(x: number, y: number, z: number): ChunkKey {
  return { x, y, z };
}

/**
 * 区块键转字符串
 */
export function chunkKeyToString(key: ChunkKey): string {
  return `${key.x},${key.y},${key.z}`;
}

/**
 * 字符串转区块键
 */
export function stringToChunkKey(str: string): ChunkKey | null {
  const parts = str.split(',').map(Number);
  if (parts.length !== 3 || parts.some((n) => isNaN(n))) {
    return null;
  }
  const [x, y, z] = parts as [number, number, number];
  return { x, y, z };
}

/**
 * 比较两个区块键是否相等
 */
export function chunkKeyEquals(a: ChunkKey, b: ChunkKey): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

/**
 * 区块数据结构
 */
export interface Chunk {
  /** 区块键 */
  readonly key: ChunkKey;
  /** 方块数据 */
  readonly data: BlockData;
  /** 是否已修改 */
  modified: boolean;
  /** 是否已生成网格 */
  meshGenerated: boolean;
}

/**
 * 创建空区块
 */
export function createChunk(key: ChunkKey): Chunk {
  return {
    key,
    data: createEmptyBlockData(),
    modified: false,
    meshGenerated: false,
  };
}

// ============================================================================
// 材质类型
// ============================================================================

/**
 * 材质类型枚举
 */
export enum MaterialType {
  Stone = 'stone',
  Dirt = 'dirt',
  Grass = 'grass',
  Sand = 'sand',
  Water = 'water',
  Wood = 'wood',
  Leaves = 'leaves',
  Glass = 'glass',
  Wool = 'wool',
  Clay = 'clay',
  Gravel = 'gravel',
  Planks = 'planks',
  Brick = 'brick',
  Cobblestone = 'cobblestone',
  MossyCobblestone = 'mossy_cobblestone',
  Obsidian = 'obsidian',
  Bedrock = 'bedrock',
}

/**
 * 方块类型到材质类型的映射
 */
export function blockTypeToMaterial(blockType: BlockType): MaterialType | null {
  const map: Record<BlockType, MaterialType | null> = {
    [BlockType.Air]: null,
    [BlockType.Stone]: MaterialType.Stone,
    [BlockType.Dirt]: MaterialType.Dirt,
    [BlockType.Grass]: MaterialType.Grass,
    [BlockType.Sand]: MaterialType.Sand,
    [BlockType.Water]: MaterialType.Water,
    [BlockType.Wood]: MaterialType.Wood,
    [BlockType.Leaves]: MaterialType.Leaves,
    [BlockType.Bedrock]: MaterialType.Bedrock,
    [BlockType.CoalOre]: MaterialType.Stone,
    [BlockType.IronOre]: MaterialType.Stone,
    [BlockType.Glass]: MaterialType.Glass,
    [BlockType.Wool]: MaterialType.Wool,
    [BlockType.Clay]: MaterialType.Clay,
    [BlockType.Gravel]: MaterialType.Gravel,
    [BlockType.Planks]: MaterialType.Planks,
    [BlockType.Brick]: MaterialType.Brick,
    [BlockType.Cobblestone]: MaterialType.Cobblestone,
    [BlockType.MossyCobblestone]: MaterialType.MossyCobblestone,
    [BlockType.Obsidian]: MaterialType.Obsidian,
    [BlockType.DiamondOre]: MaterialType.Stone,
  };
  return map[blockType];
}

/**
 * 纹理图集坐标
 */
export interface TextureAtlasCoord {
  readonly u: number;
  readonly v: number;
}

/**
 * 材质纹理映射
 */
export interface MaterialTextures {
  /** 顶部纹理坐标 */
  top: TextureAtlasCoord;
  /** 底部纹理坐标 */
  bottom: TextureAtlasCoord;
  /** 前面纹理坐标 */
  front: TextureAtlasCoord;
  /** 后面纹理坐标 */
  back: TextureAtlasCoord;
  /** 左面纹理坐标 */
  left: TextureAtlasCoord;
  /** 右面纹理坐标 */
  right: TextureAtlasCoord;
}

// ============================================================================
// 方向枚举
// ============================================================================

/**
 * 方向枚举
 */
export enum Direction {
  Up = 0,
  Down = 1,
  North = 2,
  South = 3,
  West = 4,
  East = 5,
}

/**
 * 方向向量
 */
export const DIRECTION_VECTORS: Record<Direction, { x: number; y: number; z: number }> = {
  [Direction.Up]: { x: 0, y: 1, z: 0 },
  [Direction.Down]: { x: 0, y: -1, z: 0 },
  [Direction.North]: { x: 0, y: 0, z: -1 },
  [Direction.South]: { x: 0, y: 0, z: 1 },
  [Direction.West]: { x: -1, y: 0, z: 0 },
  [Direction.East]: { x: 1, y: 0, z: 0 },
};

/**
 * 获取相反方向
 */
export function getOppositeDirection(dir: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    [Direction.Up]: Direction.Down,
    [Direction.Down]: Direction.Up,
    [Direction.North]: Direction.South,
    [Direction.South]: Direction.North,
    [Direction.West]: Direction.East,
    [Direction.East]: Direction.West,
  };
  return opposites[dir];
}

// ============================================================================
// 生物群系类型
// ============================================================================

/**
 * 生物群系枚举
 */
export enum BiomeType {
  Plains = 'plains',
  Forest = 'forest',
  Desert = 'desert',
  SnowyTundra = 'snowy_tundra',
  Savanna = 'savanna',
  Swampland = 'swampland',
  Mountain = 'mountain',
  Ocean = 'ocean',
}

/**
 * 生物群系配置
 */
export interface BiomeConfig {
  /** 温度 (0-1) */
  temperature: number;
  /** 湿度 (0-1) */
  humidity: number;
  /** 地面方块类型 */
  groundBlock: BlockType;
  /** 地下方块类型 */
  subsoilBlock: BlockType;
  /** 树木生成概率 (0-1) */
  treeProbability: number;
}

/**
 * 生物群系配置映射
 */
export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  [BiomeType.Plains]: {
    temperature: 0.7,
    humidity: 0.5,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Dirt,
    treeProbability: 0.05,
  },
  [BiomeType.Forest]: {
    temperature: 0.6,
    humidity: 0.7,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Dirt,
    treeProbability: 0.2,
  },
  [BiomeType.Desert]: {
    temperature: 0.95,
    humidity: 0.1,
    groundBlock: BlockType.Sand,
    subsoilBlock: BlockType.Sand,
    treeProbability: 0,
  },
  [BiomeType.SnowyTundra]: {
    temperature: 0.1,
    humidity: 0.4,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Dirt,
    treeProbability: 0.01,
  },
  [BiomeType.Savanna]: {
    temperature: 0.85,
    humidity: 0.3,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Dirt,
    treeProbability: 0.02,
  },
  [BiomeType.Swampland]: {
    temperature: 0.5,
    humidity: 0.9,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Dirt,
    treeProbability: 0.1,
  },
  [BiomeType.Mountain]: {
    temperature: 0.4,
    humidity: 0.3,
    groundBlock: BlockType.Grass,
    subsoilBlock: BlockType.Stone,
    treeProbability: 0.02,
  },
  [BiomeType.Ocean]: {
    temperature: 0.5,
    humidity: 0.8,
    groundBlock: BlockType.Sand,
    subsoilBlock: BlockType.Sand,
    treeProbability: 0,
  },
};

// ============================================================================
// 世界边界
// ============================================================================

/**
 * 世界边界配置
 */
export interface WorldBounds {
  /** 最小 X 坐标 */
  minX: number;
  /** 最大 X 坐标 */
  maxX: number;
  /** 最小 Y 坐标 */
  minY: number;
  /** 最大 Y 坐标 */
  maxY: number;
  /** 最小 Z 坐标 */
  minZ: number;
  /** 最大 Z 坐标 */
  maxZ: number;
}

/**
 * 默认世界边界（无限世界返回 null）
 */
export const DEFAULT_WORLD_BOUNDS: WorldBounds = {
  minX: -Infinity,
  maxX: Infinity,
  minY: 0,
  maxY: 256,
  minZ: -Infinity,
  maxZ: Infinity,
};

/**
 * 检查坐标是否在世界边界内
 */
export function isInWorldBounds(
  x: number,
  y: number,
  z: number,
  bounds: WorldBounds = DEFAULT_WORLD_BOUNDS
): boolean {
  return (
    x >= bounds.minX &&
    x <= bounds.maxX &&
    y >= bounds.minY &&
    y <= bounds.maxY &&
    z >= bounds.minZ &&
    z <= bounds.maxZ
  );
}
