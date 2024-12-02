import { Product, Category, Formula } from '../types';

export const sortByOrder = <T extends { order: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => a.order - b.order);
};

export const getNextOrder = <T extends { order: number }>(items: T[]): number => {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.order)) + 1;
};

export const reorderItems = <T extends { id: string; order: number }>(
  items: T[],
  sourceIndex: number,
  destinationIndex: number
): T[] => {
  const result = [...items];
  const [removed] = result.splice(sourceIndex, 1);
  result.splice(destinationIndex, 0, removed);
  
  return result.map((item, index) => ({
    ...item,
    order: index
  }));
};