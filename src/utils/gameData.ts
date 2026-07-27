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

const baseImg = '/@fs/C:/Users/ASUS/.gemini/antigravity-ide/brain/ca322788-d1f1-4054-a5c3-3a4a8cddcbf3';

export const TRASH_ITEMS: Omit<TrashItemData, 'id'>[] = [
  { name: 'Sisa Apel', category: 'organik', emoji: '🍎', imageUrl: `${baseImg}/trash_organik_1785090099289.png` },
  { name: 'Kulit Pisang', category: 'organik', emoji: '🍌', imageUrl: `${baseImg}/trash_organik_1785090099289.png` },
  { name: 'Daun Kering', category: 'organik', emoji: '🍂', imageUrl: `${baseImg}/trash_organik_1785090099289.png` },
  { name: 'Botol Plastik', category: 'anorganik', emoji: '🍾', imageUrl: `${baseImg}/trash_anorganik_1785090109033.png` },
  { name: 'Kantong Plastik', category: 'anorganik', emoji: '🛍️', imageUrl: `${baseImg}/trash_anorganik_1785090109033.png` },
  { name: 'Kaleng Minuman', category: 'anorganik', emoji: '🥫', imageUrl: `${baseImg}/trash_anorganik_1785090109033.png` },
  { name: 'Kardus Bekas', category: 'kertas', emoji: '📦', imageUrl: `${baseImg}/trash_kertas_1785090119871.png` },
  { name: 'Koran Lama', category: 'kertas', emoji: '📰', imageUrl: `${baseImg}/trash_kertas_1785090119871.png` },
  { name: 'Buku Bekas', category: 'kertas', emoji: '📚', imageUrl: `${baseImg}/trash_kertas_1785090119871.png` },
  { name: 'Baterai Bekas', category: 'b3', emoji: '🔋', imageUrl: `${baseImg}/trash_b3_1785090129654.png` },
  { name: 'Lampu Bohlam', category: 'b3', emoji: '💡', imageUrl: `${baseImg}/trash_b3_1785090129654.png` },
  { name: 'Obat Kadaluarsa', category: 'b3', emoji: '💊', imageUrl: `${baseImg}/trash_b3_1785090129654.png` },
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
