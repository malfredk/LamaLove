import type { ImageMetadata } from 'astro';
import coupleUmbrella from './assets/couple-umbrella.png';
import coupleSun from './assets/couple-sun.png';
import coupleClouds from './assets/couple-clouds.png';
import coupleUncertain from './assets/couple-uncertain.png';

export const illustrations = {
  'couple-umbrella': coupleUmbrella,
  'couple-sun': coupleSun,
  'couple-clouds': coupleClouds,
  'couple-uncertain': coupleUncertain,
} satisfies Record<string, ImageMetadata>;
