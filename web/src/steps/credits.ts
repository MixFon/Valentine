// Титры — после подтверждения, как после фильма. Каждый кот: настоящее
// фото, напротив — он же в пиксель-арте, под ними кличка и роль.
// Весь блок один раз проезжает снизу вверх и останавливается.

import { creditsCopy, type CatId } from '../content';
import { goTo } from '../state';
import { renderPhoto } from '../photos';
import { renderPixelCat, type SpriteId } from '../pixelcats';
import './credits.css';

const CAST: [CatId, SpriteId][] = [
  ['kish', 'kishBed'],
  ['iriska', 'iriskaSit'],
  ['chips', 'chipsSit'],
];

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'credits';

  const roll = document.createElement('div');
  roll.className = 'credits__roll';

  const heading = document.createElement('h1');
  heading.className = 'credits__heading';
  heading.textContent = creditsCopy.heading;
  roll.append(heading);

  CAST.forEach(([cat, sprite]) => roll.append(renderCastMember(cat, sprite)));

  const final = document.createElement('p');
  final.className = 'credits__final';
  final.textContent = creditsCopy.final;

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'credits__back';
  back.textContent = creditsCopy.back;
  back.addEventListener('click', () => goTo('chips'));

  roll.append(final, back);
  section.append(roll);
  container.append(section);
}

function renderCastMember(cat: CatId, sprite: SpriteId): HTMLElement {
  const figure = document.createElement('figure');
  figure.className = 'credits__cast';

  const pair = document.createElement('div');
  pair.className = 'credits__pair';
  pair.append(renderPhoto(cat, 'credits__photo'), renderPixelCat(sprite).el);

  const caption = document.createElement('figcaption');
  caption.className = 'credits__caption';

  const name = document.createElement('span');
  name.className = 'credits__name';
  name.textContent = creditsCopy.cast[cat].name;

  const role = document.createElement('span');
  role.className = 'credits__role';
  role.textContent = creditsCopy.cast[cat].role;

  caption.append(name, role);
  figure.append(pair, caption);
  return figure;
}
