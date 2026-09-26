// Фото котов: <picture> с webp и jpg-fallback, два размера на кадр.
// Кадры нарезаны заранее из оригиналов в assets/img/ (см. DECISIONS.md),
// оригиналы в бандл не попадают.
//
// preload() строит тот же <picture>, но не вставляет его в документ:
// браузер выбирает из srcset ровно тот файл, который потом понадобится
// на экране, и кладёт его в кеш.

import type { CatId } from './content';
import { photoAlt } from './content';

interface Photo {
  webp: string;
  jpg: string;
  fallback: string;
  width: number;
  height: number;
  // Должен совпадать с шириной, которую фото занимает в вёрстке шага.
  sizes: string;
}

const PHOTOS: Record<CatId, Photo> = {
  kish: {
    webp: srcset(
      new URL('../assets/img/kish-800.webp', import.meta.url).href, 800,
      new URL('../assets/img/kish-1200.webp', import.meta.url).href, 1200,
    ),
    jpg: srcset(
      new URL('../assets/img/kish-800.jpg', import.meta.url).href, 800,
      new URL('../assets/img/kish-1200.jpg', import.meta.url).href, 1200,
    ),
    fallback: new URL('../assets/img/kish-800.jpg', import.meta.url).href,
    width: 1200,
    height: 600,
    sizes: 'min(100vw - 2.5rem, 70ch)',
  },
  iriska: {
    webp: srcset(
      new URL('../assets/img/iriska-240.webp', import.meta.url).href, 240,
      new URL('../assets/img/iriska-480.webp', import.meta.url).href, 480,
    ),
    jpg: srcset(
      new URL('../assets/img/iriska-240.jpg', import.meta.url).href, 240,
      new URL('../assets/img/iriska-480.jpg', import.meta.url).href, 480,
    ),
    fallback: new URL('../assets/img/iriska-240.jpg', import.meta.url).href,
    width: 480,
    height: 480,
    sizes: '6rem',
  },
  chips: {
    webp: srcset(
      new URL('../assets/img/chips-400.webp', import.meta.url).href, 400,
      new URL('../assets/img/chips-800.webp', import.meta.url).href, 800,
    ),
    jpg: srcset(
      new URL('../assets/img/chips-400.jpg', import.meta.url).href, 400,
      new URL('../assets/img/chips-800.jpg', import.meta.url).href, 800,
    ),
    fallback: new URL('../assets/img/chips-400.jpg', import.meta.url).href,
    width: 800,
    height: 1000,
    sizes: '9rem',
  },
};

function srcset(small: string, smallW: number, large: string, largeW: number): string {
  return `${small} ${smallW}w, ${large} ${largeW}w`;
}

export function renderPhoto(cat: CatId, className: string): HTMLPictureElement {
  const photo = PHOTOS[cat];

  const picture = document.createElement('picture');
  picture.className = className;

  const source = document.createElement('source');
  source.type = 'image/webp';
  source.srcset = photo.webp;
  source.sizes = photo.sizes;

  // <img> сначала кладём в <picture> и только потом даём ему src:
  // иначе браузер успеет начать качать jpg до того, как увидит webp.
  const img = document.createElement('img');
  picture.append(source, img);

  img.srcset = photo.jpg;
  img.sizes = photo.sizes;
  img.src = photo.fallback;
  img.width = photo.width;
  img.height = photo.height;
  img.alt = photoAlt[cat];
  img.decoding = 'async';
  // Первый экран — Киш, его фото нужно как можно раньше.
  if (cat === 'kish') img.fetchPriority = 'high';

  return picture;
}

const preloaded = new Set<CatId>();

export function preload(cat: CatId): void {
  if (preloaded.has(cat)) return;
  preloaded.add(cat);
  renderPhoto(cat, '');
}
