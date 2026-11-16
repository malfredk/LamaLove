import type { ImageMetadata } from "astro";
import champagne from "./assets/illustrations/champagne.png";
import dressAndTuxedo from "./assets/illustrations/dress-and-tuxedo.png";
import envelope from "./assets/illustrations/envelope.png";
import gift from "./assets/illustrations/gift.png";
import quill from "./assets/illustrations/quill.png";
import rockingHorse from "./assets/illustrations/rocking-horse.png";

// Hand-drawn sketches stored as black ink on transparent PNG.
// They are used as a CSS mask, so the page colour decides their colour.
export const illustrations = {
  "dress-and-tuxedo": dressAndTuxedo,
  gift,
  champagne,
  "rocking-horse": rockingHorse,
  quill,
  envelope,
} satisfies Record<string, ImageMetadata>;

export type IllustrationName = keyof typeof illustrations;
