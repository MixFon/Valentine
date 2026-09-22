// Шаг 2 — выбор формата.
//
// Механика: первое наведение (hover-устройства) или тап (touch)
// уводит карточку в сторону — "шарахается". Повторный тап по уже
// увёдшей карточке — выбор, отдаётся в руки. При prefers-reduced-motion
// фаза "шарахания" пропускается: первый тап сразу выбирает.

import { steps, formatOptions, type FormatOption } from '../content';
import { selectFormat } from '../state';
import { play } from '../audio';
import './iriska.css';

const ACCENT_VARS = ['--accent', '--accent-2', '--accent-3'];

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'iriska';

  const step = document.createElement('p');
  step.className = 'iriska__step';
  step.textContent = '2';
  section.append(step);

  const heading = document.createElement('h1');
  heading.className = 'iriska__heading';
  heading.textContent = steps.iriska.heading;
  section.append(heading);

  const body = document.createElement('p');
  body.className = 'iriska__body';
  body.textContent = steps.iriska.body;
  section.append(body);

  const list = document.createElement('div');
  list.className = 'iriska__cards';

  formatOptions.forEach((option, index) => {
    list.append(createCard(option, index));
  });

  section.append(list);
  container.append(section);
}

function createCard(option: FormatOption, index: number): HTMLButtonElement {
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

  let dodged = prefersReducedMotion;

  function dodge(): void {
    if (dodged) return;
    dodged = true;

    const dx = Math.round(Math.random() * 120 - 60);
    const dy = Math.round(Math.random() * 40 - 20);
    const rot = (Math.random() * 20 - 10).toFixed(1);

    button.style.setProperty('--dodge-x', `${dx}px`);
    button.style.setProperty('--dodge-y', `${dy}px`);
    button.style.setProperty('--dodge-rot', `${rot}deg`);
    button.classList.add('iriska__card--dodged');
  }

  if (supportsHover && !prefersReducedMotion) {
    button.addEventListener('mouseenter', dodge);
  }

  button.addEventListener('click', () => {
    if (dodged) {
      play('iriska');
      selectFormat(option.label);
    } else {
      dodge();
    }
  });

  return button;
}
