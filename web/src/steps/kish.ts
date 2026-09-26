// Шаг 1 — выбор даты.

import { steps, dateOptions, customDateCopy, kishCopy, backCopy } from '../content';
import { getState, selectDate } from '../state';
import { renderBackButton } from '../back';
import { renderPixelCat } from '../pixelcats';
import { play } from '../audio';
import './kish.css';

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'kish';

  section.append(renderBackButton(backCopy.kish), renderSleepingKish());

  const heading = document.createElement('h1');
  heading.className = 'kish__heading';
  heading.textContent = steps.kish.heading;
  section.append(heading);

  const body = document.createElement('p');
  body.className = 'kish__body';
  body.textContent = steps.kish.body;
  section.append(body);

  const list = document.createElement('div');
  list.className = 'kish__dates';

  dateOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kish__date';
    button.textContent = option.label;
    button.style.setProperty('--breathe-delay', `${index * 0.6}s`);
    // Дата, выбранная раньше, — если вернулись с экрана Ириски.
    if (option.label === getState().date) {
      button.classList.add('kish__date--current');
      button.setAttribute('aria-current', 'true');
    }
    button.addEventListener('click', () =>
      selectDate(option.label, resolveNextOccurrence(option.day, option.month)),
    );
    list.append(button);
  });

  list.append(renderCustomDate(dateOptions.length));

  section.append(list);
  container.append(section);
}

// Пасхалка: Киш спит клубком, тап будит его — поднимает голову,
// кряхтит и засыпает обратно. Это кнопка, чтобы разбудить можно было
// и с клавиатуры.
function renderSleepingKish(): HTMLButtonElement {
  const cat = renderPixelCat('kishSleep');

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kish__cat';
  button.setAttribute('aria-label', kishCopy.wakeLabel);
  button.append(cat.el);
  button.addEventListener('click', () => {
    cat.react('wake');
    play('kish');
  });

  return button;
}

function renderCustomDate(delayIndex: number): HTMLElement {
  const wrapper = document.createElement('div');

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'kish__date kish__date--custom';
  trigger.textContent = customDateCopy.cardLabel;
  trigger.style.setProperty('--breathe-delay', `${delayIndex * 0.6}s`);

  const form = document.createElement('form');
  form.className = 'kish__custom-form';
  form.hidden = true;

  const label = document.createElement('label');
  label.className = 'sr-only';
  label.htmlFor = 'kish-custom-input';
  label.textContent = customDateCopy.inputLabel;

  const input = document.createElement('input');
  input.type = 'date';
  input.id = 'kish-custom-input';
  input.className = 'kish__custom-input';
  input.required = true;

  // Раньше выбрали свою дату — она уже стоит в поле.
  const { date, dateISO } = getState();
  const isCustom = date !== undefined && !dateOptions.some((o) => o.label === date);
  if (isCustom && dateISO) {
    input.value = dateISO;
    trigger.classList.add('kish__date--current');
  }

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'kish__custom-submit';
  submit.textContent = customDateCopy.submit;
  submit.disabled = input.value === '';

  input.addEventListener('input', () => {
    submit.disabled = input.value === '';
  });

  trigger.addEventListener('click', () => {
    trigger.hidden = true;
    form.hidden = false;
    input.focus();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input.value) return;
    selectDate(formatCustomDate(input.value), input.value);
  });

  form.append(label, input, submit);
  wrapper.append(trigger, form);
  return wrapper;
}

function formatCustomDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
}

// Готовые карточки не показывают год, но для .ics он нужен: берём
// ближайшее будущее наступление этого дня и месяца (сегодня считается
// подходящим днём).
function resolveNextOccurrence(day: number, month: number): string {
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  let year = today.getFullYear();
  let candidateUTC = Date.UTC(year, month - 1, day);
  if (candidateUTC < todayUTC) {
    year += 1;
    candidateUTC = Date.UTC(year, month - 1, day);
  }

  return new Date(candidateUTC).toISOString().slice(0, 10);
}
