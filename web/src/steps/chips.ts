// Шаг 3 — подтверждение.
//
// Билет с волнистым краем (рифленое ушко Чипса) показывает выбранные
// дату и формат. Кнопка отправляет POST /api/rsvp; после успеха —
// подтверждение, .ics, собранный на клиенте из dateISO, и кнопка титров.
// Факт отправки запоминается в state: вернувшись из титров, попадаешь
// сразу на итог, а не на повторную отправку.

import { steps, chipsCopy, backCopy } from '../content';
import { getState, goTo, markConfirmed, unconfirm } from '../state';
import { renderBackButton } from '../back';
import { play } from '../audio';
import { renderPixelCat } from '../pixelcats';
import './chips.css';

export function render(container: HTMLElement): void {
  const state = getState();
  const section = document.createElement('section');
  section.className = 'chips';

  container.append(section);
  if (state.confirmed) {
    renderConfirmed(section, state.dateISO, state.format);
  } else {
    renderPending(section, state.date, state.dateISO, state.format);
  }
}

function renderPending(
  section: HTMLElement,
  date: string | undefined,
  dateISO: string | undefined,
  format: string | undefined,
): void {
  section.replaceChildren();

  const heading = document.createElement('h1');
  heading.className = 'chips__heading';
  heading.textContent = steps.chips.heading;

  const body = document.createElement('p');
  body.className = 'chips__body';
  body.textContent = steps.chips.body;

  const ticket = buildTicket(date, format);

  const error = document.createElement('p');
  error.className = 'chips__error';
  error.textContent = chipsCopy.error;
  error.hidden = true;

  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.className = 'chips__confirm';
  confirm.textContent = chipsCopy.confirmButton;

  confirm.addEventListener('click', () => {
    confirm.disabled = true;
    confirm.textContent = chipsCopy.sending;
    error.hidden = true;

    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, format }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`unexpected status ${response.status}`);
        markConfirmed();
        play('chips');
        renderConfirmed(section, dateISO, format);
      })
      .catch(() => {
        confirm.disabled = false;
        confirm.textContent = chipsCopy.confirmButton;
        error.hidden = false;
      });
  });

  const cat = renderPixelCat('chipsHands');
  cat.el.classList.add('chips__cat');

  section.append(renderBackButton(backCopy.chips), heading, body, cat.el, ticket, error, confirm);
}

function renderConfirmed(
  section: HTMLElement,
  dateISO: string | undefined,
  format: string | undefined,
): void {
  section.replaceChildren();

  const heading = document.createElement('h1');
  heading.className = 'chips__heading';
  heading.textContent = chipsCopy.confirmedHeading;

  const body = document.createElement('p');
  body.className = 'chips__body';
  body.textContent = chipsCopy.confirmedBody;

  // Договорились — над Чипсом появляется сердечко.
  const cat = renderPixelCat('chipsHands', 'happy');
  cat.el.classList.add('chips__cat');

  section.append(heading, body, cat.el);

  if (dateISO) {
    const calendar = document.createElement('a');
    calendar.className = 'chips__calendar';
    calendar.textContent = chipsCopy.calendarButton;
    calendar.href = buildICSUrl(dateISO, format);
    calendar.download = 'valentine.ics';
    section.append(calendar);
  }

  const credits = document.createElement('button');
  credits.type = 'button';
  credits.className = 'chips__credits';
  credits.textContent = chipsCopy.creditsButton;
  credits.addEventListener('click', () => goTo('credits'));

  const change = document.createElement('button');
  change.type = 'button';
  change.className = 'chips__change';
  change.textContent = chipsCopy.changeAnswer;
  change.addEventListener('click', () => {
    unconfirm();
    const state = getState();
    renderPending(section, state.date, state.dateISO, state.format);
  });

  section.append(credits, change);
}

function buildTicket(date: string | undefined, format: string | undefined): HTMLElement {
  const ticket = document.createElement('div');
  ticket.className = 'chips__ticket';

  const top = document.createElement('div');
  top.className = 'chips__wave chips__wave--top';
  top.setAttribute('aria-hidden', 'true');

  const body = document.createElement('div');
  body.className = 'chips__ticket-body';

  const dateEl = document.createElement('p');
  dateEl.className = 'chips__ticket-date';
  dateEl.textContent = date ?? '';

  const divider = document.createElement('div');
  divider.className = 'chips__wave chips__wave--divider';
  divider.setAttribute('aria-hidden', 'true');

  const formatEl = document.createElement('p');
  formatEl.className = 'chips__ticket-format';
  formatEl.textContent = format ?? '';

  body.append(dateEl, divider, formatEl);
  ticket.append(top, body);
  return ticket;
}

function buildICSUrl(dateISO: string, format: string | undefined): string {
  const [year, month, day] = dateISO.split('-');
  const dtstamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const uid = `${crypto.randomUUID()}@valentine`;
  const summary = escapeICSText(format || 'Свидание');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//valentine//ru',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${year}${month}${day}`,
    `SUMMARY:${summary}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function escapeICSText(text: string): string {
  return text.replace(/([,;\\])/g, '\\$1');
}
