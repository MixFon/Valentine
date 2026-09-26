// Шаг 0 — стартовый экран: что это за сайт и что впереди три вопроса.
// Кнопка ведёт к Кишу. Этот же тап разблокирует звук на iOS
// (см. audio.ts) — до него звук не играет.

import { introCopy } from '../content';
import { goTo } from '../state';
import { renderPixelCat } from '../pixelcats';
import './intro.css';

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'intro';

  const cats = document.createElement('div');
  cats.className = 'intro__cats';
  cats.setAttribute('role', 'img');
  cats.setAttribute('aria-label', introCopy.catsLabel);
  cats.append(
    renderPixelCat('kishBed').el,
    renderPixelCat('iriskaSit').el,
    renderPixelCat('chipsSit').el,
  );

  const heading = document.createElement('h1');
  heading.className = 'intro__heading';
  heading.textContent = introCopy.heading;

  const body = document.createElement('p');
  body.className = 'intro__body';
  body.textContent = introCopy.body;

  const start = document.createElement('button');
  start.type = 'button';
  start.className = 'intro__start';
  start.textContent = introCopy.start;
  start.addEventListener('click', () => goTo('kish'));

  section.append(cats, heading, body, start);
  container.append(section);
}
