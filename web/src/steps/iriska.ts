// Шаг 2 — выбор формата.
//
// Механика: первое наведение (hover-устройства) или тап (touch)
// уводит карточку в сторону — "шарахается". Повторный тап по уже
// увёдшей карточке — выбор, отдаётся в руки. Отскочившей может быть
// только одна: шарахнулась другая — прежняя возвращается на место.
// При prefers-reduced-motion фаза "шарахания" пропускается: первый тап
// сразу выбирает.

import {
  steps,
  formatOptions,
  customFormatCopy,
  backCopy,
  type FormatIcon,
} from '../content';
import { getState, selectFormat } from '../state';
import { renderBackButton } from '../back';
import { renderPixelCat, type PixelCat } from '../pixelcats';
import { renderFormatIcon } from '../formaticons';
import './iriska.css';

const ACCENT_VARS = ['--accent', '--accent-2', '--accent-3'];
// Заливка значка по тому же пятну окраса. Третье пятно почти чёрное —
// на нём значок сливается с контуром, поэтому ему кремовая заливка.
const ICON_FILL_VARS = ['--accent', '--accent-2', '--tortie-cream'];

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'iriska';

  const heading = document.createElement('h1');
  heading.className = 'iriska__heading';
  heading.textContent = steps.iriska.heading;

  // Подзаголовок слева, Ириска справа: рядом с заголовком длинные слова
  // не помещаются, а сверху справа живёт тумблер звука. Так кошка почти
  // не добавляет высоты экрану, где и без неё семь карточек.
  const intro = document.createElement('div');
  intro.className = 'iriska__intro';

  const body = document.createElement('p');
  body.className = 'iriska__body';
  body.textContent = steps.iriska.body;

  const cat = renderPixelCat('iriskaCrouch');
  cat.el.classList.add('iriska__cat');

  // Облачко: реплика Ириски про карточку, которую только что тронули.
  // Заменяет подзаголовок с первого тапа. aria-live — чтобы экранный
  // диктор тоже зачитал, что она «сказала».
  const bubble = document.createElement('p');
  bubble.className = 'iriska__bubble';
  bubble.hidden = true;
  bubble.setAttribute('aria-live', 'polite');

  const say = (text: string): void => {
    body.hidden = true;
    bubble.hidden = false;
    bubble.textContent = text;
    // Каждый раз новое облачко: перезапускаем всплытие.
    bubble.classList.remove('iriska__bubble--pop');
    void bubble.offsetWidth;
    bubble.classList.add('iriska__bubble--pop');
  };

  intro.append(body, bubble, cat.el);
  section.append(renderBackButton(backCopy.iriska), heading, intro);

  const list = document.createElement('div');
  list.className = 'iriska__cards';

  // В каждый момент отскочившей может быть только одна карточка:
  // шарахнулась другая — предыдущая возвращается на место.
  const deck: Deck = { dodged: null, cat, say, current: getState().format };

  formatOptions.forEach((option, index) => {
    const card = createCard(option, index, deck, () => selectFormat(option.label));
    if (option.label === deck.current) markCurrent(card);
    list.append(card);
  });

  list.append(renderCustomFormat(formatOptions.length, deck));

  section.append(list);
  container.append(section);
}

interface Card {
  settle(): void;
}

interface Deck {
  dodged: Card | null;
  cat: PixelCat;
  say(text: string): void;
  // Формат, выбранный раньше, — если вернулись с экрана Чипса.
  current: string | undefined;
}

interface CardContent {
  label: string;
  worry: string;
  icon: FormatIcon;
}

function markCurrent(button: HTMLButtonElement): void {
  button.classList.add('iriska__card--current');
  button.setAttribute('aria-current', 'true');
}

// Свой вариант — как «Указать самой» у Киша: карточка сначала тоже
// шарахается, а поймав её, открываешь поле. Выбор — по кнопке.
function renderCustomFormat(index: number, deck: Deck): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'iriska__custom';

  const form = document.createElement('form');
  form.className = 'iriska__custom-form';
  form.hidden = true;

  const label = document.createElement('label');
  label.className = 'sr-only';
  label.htmlFor = 'iriska-custom-input';
  label.textContent = customFormatCopy.inputLabel;

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'iriska-custom-input';
  input.className = 'iriska__custom-input';
  input.placeholder = customFormatCopy.placeholder;
  input.maxLength = 60;
  input.required = true;

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'iriska__custom-submit';
  submit.textContent = customFormatCopy.submit;

  const card = createCard(
    {
      label: customFormatCopy.cardLabel,
      worry: customFormatCopy.worry,
      icon: 'custom',
    },
    index,
    deck,
    () => {
      card.hidden = true;
      form.hidden = false;
      input.focus();
    },
  );

  // Раньше выбрали свой вариант — он уже стоит в поле.
  const isCustom =
    deck.current !== undefined && !formatOptions.some((o) => o.label === deck.current);
  if (isCustom) {
    input.value = deck.current ?? '';
    markCurrent(card);
  }

  const sync = (): void => {
    submit.disabled = input.value.trim() === '';
  };
  sync();
  input.addEventListener('input', sync);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (value) selectFormat(value);
  });

  form.append(label, input, submit);
  wrapper.append(card, form);
  return wrapper;
}

function createCard(
  content: CardContent,
  index: number,
  deck: Deck,
  choose: () => void,
): HTMLButtonElement {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const supportsHover = window.matchMedia('(hover: hover)').matches;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'iriska__card';
  button.append(renderFormatIcon(content.icon));

  const text = document.createElement('span');
  text.className = 'iriska__card-text';

  const label = document.createElement('span');
  label.className = 'iriska__card-label';
  label.textContent = content.label;

  text.append(label);
  button.append(text);
  button.style.setProperty(
    '--card-accent',
    `var(${ACCENT_VARS[index % ACCENT_VARS.length]})`,
  );
  button.style.setProperty('--tilt', `${(Math.random() * 3 - 1.5).toFixed(2)}deg`);
  button.style.setProperty(
    '--icon-fill',
    `var(${ICON_FILL_VARS[index % ICON_FILL_VARS.length]})`,
  );
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
    deck.say(content.worry);
  }

  if (supportsHover && !prefersReducedMotion) {
    button.addEventListener('mouseenter', dodge);
  }

  button.addEventListener('click', () => {
    if (dodged || prefersReducedMotion) {
      choose();
    } else {
      dodge();
    }
  });

  return button;
}
