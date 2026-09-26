// Шаг 2 — выбор формата.
//
// Механика: первое наведение (hover-устройства) или тап (touch)
// уводит карточку в сторону — "шарахается". Повторный тап по уже
// увёдшей карточке — выбор, отдаётся в руки. Отскочившей может быть
// только одна: шарахнулась другая — прежняя возвращается на место.
// При prefers-reduced-motion фаза "шарахания" пропускается: первый тап
// сразу выбирает.

import { steps, formatOptions, backCopy, type FormatOption } from '../content';
import { getState, selectFormat } from '../state';
import { renderBackButton } from '../back';
import { play } from '../audio';
import { renderPixelCat, type PixelCat } from '../pixelcats';
import './iriska.css';

const ACCENT_VARS = ['--accent', '--accent-2', '--accent-3'];

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'iriska';

  const heading = document.createElement('h1');
  heading.className = 'iriska__heading';
  heading.textContent = steps.iriska.heading;

  // Подзаголовок слева, Ириска справа: рядом с заголовком длинные слова
  // не помещаются, а сверху справа живёт тумблер звука. Так кошка почти
  // не добавляет высоты экрану, где и без неё шесть карточек.
  const intro = document.createElement('div');
  intro.className = 'iriska__intro';

  const body = document.createElement('p');
  body.className = 'iriska__body';
  body.textContent = steps.iriska.body;

  const cat = renderPixelCat('iriskaCrouch');
  cat.el.classList.add('iriska__cat');

  intro.append(body, cat.el);
  section.append(renderBackButton(backCopy.iriska), heading, intro);

  const list = document.createElement('div');
  list.className = 'iriska__cards';

  // В каждый момент отскочившей может быть только одна карточка:
  // шарахнулась другая — предыдущая возвращается на место.
  const deck: Deck = { dodged: null, cat, current: getState().format };

  formatOptions.forEach((option, index) => {
    list.append(createCard(option, index, deck));
  });

  section.append(list);
  container.append(section);
}

interface Card {
  settle(): void;
}

interface Deck {
  dodged: Card | null;
  cat: PixelCat;
  // Формат, выбранный раньше, — если вернулись с экрана Чипса.
  current: string | undefined;
}

function createCard(option: FormatOption, index: number, deck: Deck): HTMLButtonElement {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'iriska__card';
  button.textContent = option.label;
  button.style.setProperty(
    '--card-accent',
    `var(${ACCENT_VARS[index % ACCENT_VARS.length]})`,
  );
  button.style.setProperty('--tilt', `${(Math.random() * 3 - 1.5).toFixed(2)}deg`);
  if (option.label === deck.current) {
    button.classList.add('iriska__card--current');
    button.setAttribute('aria-current', 'true');
  }

  let dodged = false;

  const card: Card = {
    settle() {
      dodged = false;
      button.classList.remove('iriska__card--dodged');
    },
  };

  function dodge(): void {
    if (dodged) return;
    if (deck.dodged && deck.dodged !== card) deck.dodged.settle();
    dodged = true;
    deck.dodged = card;

    const dx = Math.round(Math.random() * 120 - 60);
    const dy = Math.round(Math.random() * 40 - 20);
    const rot = (Math.random() * 20 - 10).toFixed(1);

    button.style.setProperty('--dodge-x', `${dx}px`);
    button.style.setProperty('--dodge-y', `${dy}px`);
    button.style.setProperty('--dodge-rot', `${rot}deg`);
    button.classList.add('iriska__card--dodged');
    // Карточка шарахнулась — кошка-тревожа вздрагивает вместе с ней.
    deck.cat.react('startle');
  }

  if (supportsHover && !prefersReducedMotion) {
    button.addEventListener('mouseenter', dodge);
  }

  button.addEventListener('click', () => {
    if (dodged || prefersReducedMotion) {
      play('iriska');
      selectFormat(option.label);
    } else {
      dodge();
    }
  });

  return button;
}
