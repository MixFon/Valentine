// Шаг 1 — выбор даты.

import { steps, dateOptions, customDateCopy } from '../content';
import { selectDate } from '../state';
import './kish.css';

export function render(container: HTMLElement): void {
  const section = document.createElement('section');
  section.className = 'kish';

  const step = document.createElement('p');
  step.className = 'kish__step';
  step.textContent = '1';
  section.append(step);

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
    button.addEventListener('click', () => selectDate(option.label));
    list.append(button);
  });

  list.append(renderCustomDate(dateOptions.length));

  section.append(list);
  container.append(section);
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

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'kish__custom-submit';
  submit.textContent = customDateCopy.submit;
  submit.disabled = true;

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
    selectDate(formatCustomDate(input.value));
  });

  form.append(label, input, submit);
  wrapper.append(trigger, form);
  return wrapper;
}

function formatCustomDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
}
