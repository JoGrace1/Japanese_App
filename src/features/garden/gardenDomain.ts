import type { GardenPurchase, UserProgress } from '../../types';

export type GardenProductId =
  | 'restoration-kit'
  | 'kyoto-unlock'
  | 'lantern'
  | 'cherry-tree'
  | 'stone-path'
  | 'koi-pond';

export type GardenProductCategory = 'land' | 'decorations';

export interface GardenProduct {
  id: GardenProductId;
  name: string;
  description: string;
  emoji: string;
  price: number;
  category: GardenProductCategory;
}

export const GARDEN_PRODUCTS: GardenProduct[] = [
  {
    id: 'restoration-kit',
    name: 'Restoration Kit · Tokyo',
    description: 'Clear the weeds and repair one part of the garden.',
    emoji: '🧹',
    price: 20,
    category: 'land',
  },
  {
    id: 'kyoto-unlock',
    name: 'Garden 2 · Kyoto',
    description: 'Unlock the next village on your map.',
    emoji: '⛩️',
    price: 300,
    category: 'land',
  },
  {
    id: 'lantern',
    name: 'Stone Lantern',
    description: 'A warm light for the garden path.',
    emoji: '🏮',
    price: 60,
    category: 'decorations',
  },
  {
    id: 'cherry-tree',
    name: 'Cherry Tree',
    description: 'A little sakura canopy for the restored garden.',
    emoji: '🌸',
    price: 100,
    category: 'decorations',
  },
  {
    id: 'stone-path',
    name: 'Stone Path',
    description: 'Stepping stones through the garden.',
    emoji: '🪨',
    price: 40,
    category: 'decorations',
  },
  {
    id: 'koi-pond',
    name: 'Koi Pond',
    description: 'A clear pond with a pair of koi.',
    emoji: '🐟',
    price: 80,
    category: 'decorations',
  },
];

export const RESTORATION_STEP = 25;

export type GardenPurchaseStatus =
  | 'purchased'
  | 'insufficient-petals'
  | 'already-owned'
  | 'already-restored'
  | 'unknown-product';

export interface GardenPurchaseResult {
  progress: UserProgress;
  status: GardenPurchaseStatus;
}

export function getGardenProductStatus(
  progress: UserProgress,
  productId: string,
): GardenPurchaseStatus | 'available' {
  const product = GARDEN_PRODUCTS.find((candidate) => candidate.id === productId);
  if (!product) return 'unknown-product';
  if (product.id === 'restoration-kit' && (progress.restorationStatus ?? 0) >= 100) {
    return 'already-restored';
  }
  if (product.id === 'kyoto-unlock' && (progress.unlockedGardenLevels ?? []).includes('kyoto')) {
    return 'already-owned';
  }
  if (product.category === 'decorations' && progress.ownedDecorationIds.includes(product.id)) {
    return 'already-owned';
  }
  return progress.petalCount >= product.price ? 'available' : 'insufficient-petals';
}

export function purchaseGardenProduct(
  progress: UserProgress,
  productId: string,
  purchasedAt = new Date().toISOString(),
): GardenPurchaseResult {
  const status = getGardenProductStatus(progress, productId);
  if (status !== 'available') return { progress, status };

  const product = GARDEN_PRODUCTS.find((candidate) => candidate.id === productId);
  if (!product) return { progress, status: 'unknown-product' };

  const purchase: GardenPurchase = {
    decorationId: product.id,
    purchasedAt,
    price: product.price,
  };
  const nextProgress: UserProgress = {
    ...progress,
    petalCount: progress.petalCount - product.price,
    gardenPurchases: [...progress.gardenPurchases, purchase],
  };

  if (product.id === 'restoration-kit') {
    nextProgress.restorationStatus = Math.min(
      100,
      (progress.restorationStatus ?? 0) + RESTORATION_STEP,
    );
  } else if (product.id === 'kyoto-unlock') {
    nextProgress.unlockedGardenLevels = [...(progress.unlockedGardenLevels ?? ['aomori', 'tokyo']), 'kyoto'];
  } else {
    nextProgress.ownedDecorationIds = [...progress.ownedDecorationIds, product.id];
  }

  return { progress: nextProgress, status: 'purchased' };
}
