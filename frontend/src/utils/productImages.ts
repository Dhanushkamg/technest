import type { Product } from '../types';

const CATEGORY_IMAGES: Record<string, string[]> = {
  laptops: [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
  ],
  computers: [
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
  ],
  smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
  ],
  wearables: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586816879360-e018dfb70a4f?auto=format&fit=crop&w=800&q=80',
  ],
  monitors: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
  ],
  components: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
};

const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=800&q=80',
];

export function getProductImage(product: Partial<Product>): string {
  const id = product.id || 1;
  const categoryName = (product.categoryName || '').toLowerCase().trim();

  for (const [catKey, images] of Object.entries(CATEGORY_IMAGES)) {
    if (categoryName.includes(catKey)) {
      const index = (id - 1) % images.length;
      return images[index];
    }
  }

  // If product name gives a hint
  const name = (product.name || '').toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return CATEGORY_IMAGES.smartphones[id % CATEGORY_IMAGES.smartphones.length];
  if (name.includes('macbook') || name.includes('laptop')) return CATEGORY_IMAGES.laptops[id % CATEGORY_IMAGES.laptops.length];
  if (name.includes('headphone') || name.includes('earbud') || name.includes('audio')) return CATEGORY_IMAGES.audio[id % CATEGORY_IMAGES.audio.length];
  if (name.includes('watch')) return CATEGORY_IMAGES.wearables[id % CATEGORY_IMAGES.wearables.length];
  if (name.includes('monitor') || name.includes('screen') || name.includes('display')) return CATEGORY_IMAGES.monitors[id % CATEGORY_IMAGES.monitors.length];

  // Default fallback index based on ID
  return DEFAULT_FALLBACKS[(id - 1) % DEFAULT_FALLBACKS.length];
}
