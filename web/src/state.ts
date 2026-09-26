// Единственное место, где живёт состояние приглашения и переходы
// между стартовым экраном и тремя шагами. Экраны не переключают себя
// сами — они сообщают сюда, что выбрано, а дальше уже решает эта
// машина состояний.

import type { CatId } from './content';
import { render as renderIntro } from './steps/intro';
import { render as renderKish } from './steps/kish';
import { render as renderIriska } from './steps/iriska';
import { render as renderChips } from './steps/chips';
import { render as renderCredits } from './steps/credits';
import { preload } from './photos';

// Старт и титры — не коты: у них нет своего звука и своей палитры кота.
type Step = 'intro' | CatId | 'credits';

const STEPS: Step[] = ['intro', 'kish', 'iriska', 'chips', 'credits'];
const CATS: CatId[] = ['kish', 'iriska', 'chips'];
const STORAGE_KEY = 'valentine:state';

interface AppState {
  step: Step;
  date?: string;
  // ISO-дата (YYYY-MM-DD), которую понимает <input type="date">.
  // Нужна только для .ics на шаге Чипса — на карточках дат года нет.
  dateISO?: string;
  format?: string;
  // Ответ уже ушёл на сервер — экран Чипса сразу показывает итог,
  // а не кнопку отправки: иначе после титров ответ можно отправить дважды.
  confirmed?: boolean;
}

const renderers: Record<Step, (container: HTMLElement) => void> = {
  intro: renderIntro,
  kish: renderKish,
  iriska: renderIriska,
  chips: renderChips,
  credits: renderCredits,
};

let state: AppState = readStored() ?? { step: 'intro' };

function readStored(): AppState | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AppState;
    return STEPS.includes(parsed.step) ? parsed : null;
  } catch {
    return null;
  }
}

function persist(): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderCurrentStep(): void {
  document.body.dataset.cat = state.step;

  const app = document.getElementById('app');
  if (!app) return;

  app.replaceChildren();
  renderers[state.step](app);
  // Новый экран всегда с начала: титрам важно проехать с самого верха.
  window.scrollTo(0, 0);

  // Фото котов живут только в титрах — грузим их, пока открыт Чипс.
  if (STEPS[STEPS.indexOf(state.step) + 1] === 'credits') CATS.forEach(preload);
}

export function goTo(step: Step): void {
  state = { ...state, step };
  persist();
  renderCurrentStep();
}

export function selectDate(date: string, dateISO?: string): void {
  state = { ...state, date, dateISO };
  persist();
  goTo('iriska');
}

export function selectFormat(format: string): void {
  state = { ...state, format };
  persist();
  goTo('chips');
}

export function markConfirmed(): void {
  state = { ...state, confirmed: true };
  persist();
}

export function getState(): Readonly<AppState> {
  return state;
}

export function init(): void {
  renderCurrentStep();
}
