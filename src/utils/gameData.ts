import { GameDifficulty } from '../store/gameStore';

export type TrashCategory = 'organik' | 'anorganik' | 'kertas' | 'b3';

export interface TrashItemData {
  id: string;
  name: string;
  category: TrashCategory;
  emoji: string;
  imageUrl?: string;
  isGolden?: boolean;
  clicksNeeded?: number;
}

export const TRASH_BINS = [
  { id: 'organik', label: 'Organik', color: 'bg-green-500', emoji: '🍎' },
  { id: 'anorganik', label: 'Anorganik', color: 'bg-yellow-400', emoji: '🥤' },
  { id: 'kertas', label: 'Kertas', color: 'bg-blue-400', emoji: '📦' },
  { id: 'b3', label: 'B3', color: 'bg-red-500', emoji: '🔋' },
];

export const TRASH_ITEMS: Omit<TrashItemData, 'id'>[] = [
  { name: 'Sisa Apel', category: 'organik', emoji: '🍎' },
  { name: 'Kulit Pisang', category: 'organik', emoji: '🍌' },
  { name: 'Daun Kering', category: 'organik', emoji: '🍂' },
  { name: 'Botol Plastik', category: 'anorganik', emoji: '🍾' },
  { name: 'Kantong Plastik', category: 'anorganik', emoji: '🛍️' },
  { name: 'Kaleng Minuman', category: 'anorganik', emoji: '🥫' },
  { name: 'Kardus Bekas', category: 'kertas', emoji: '📦' },
  { name: 'Koran Lama', category: 'kertas', emoji: '📰' },
  { name: 'Buku Bekas', category: 'kertas', emoji: '📚' },
  { name: 'Baterai Bekas', category: 'b3', emoji: '🔋' },
  { name: 'Lampu Bohlam', category: 'b3', emoji: '💡' },
  { name: 'Obat Kadaluarsa', category: 'b3', emoji: '💊' },
];

export const getRandomTrash = (difficulty: GameDifficulty = 'normal'): TrashItemData => {
  let allowedCategories: TrashCategory[] = ['organik', 'anorganik'];
  if (difficulty === 'normal' || difficulty === 'sulit') {
    allowedCategories.push('kertas');
  }
  if (difficulty === 'sulit') {
    allowedCategories.push('b3');
  }

  const filteredItems = TRASH_ITEMS.filter(item => allowedCategories.includes(item.category));
  const template = filteredItems[Math.floor(Math.random() * filteredItems.length)];
  const isGolden = Math.random() < 0.15; // 15% chance to be golden
  return { 
    ...template, 
    id: Math.random().toString(36).substring(7),
    isGolden,
    clicksNeeded: isGolden ? 3 : 0
  };
};
