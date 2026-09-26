// Кнопка «на шаг назад» в левом верхнем углу экрана. Выбор при этом
// не сбрасывается: экран, куда вернулись, подсвечивает прежний.

import { goBack } from './state';
import './back.css';

export function renderBackButton(label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back';
  button.textContent = label;
  button.addEventListener('click', goBack);
  return button;
}
