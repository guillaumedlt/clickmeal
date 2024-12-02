export const categoryEmojis: { [key: string]: string } = {
  'entrees': '🥗',
  'plats': '🍽️',
  'desserts': '🍰',
  'boissons': '🥤',
  'vegetarien': '🥬',
  'viandes': '🥩',
  'poissons': '🐟',
  'pates': '🍝',
  'pizzas': '🍕',
  'salades': '🥗',
  'sandwiches': '🥪',
  'asiatique': '🍜',
  'italien': '🇮🇹',
  'healthy': '🥑',
  'default': '🍴'
};

export const getEmoji = (categoryId: string): string => {
  return categoryEmojis[categoryId.toLowerCase()] || categoryEmojis.default;
};