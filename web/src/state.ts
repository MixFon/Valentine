// Единственное место, где живёт состояние приглашения и переходы
// между тремя шагами. Экраны не переключают себя сами — они сообщают
// сюда, что выбрано, а дальше уже решает эта машина состояний.

import type { CatId } from './content';
import { render as renderKish } from './steps/kish';
import { render as renderIriska } from './steps/iriska';
import { render as renderChips } from './steps/chips';
import { preload } from './photos';

const STEPS: CatId[] = ['kish', 'iriska', 'chips'];
const STORAGE_KEY = 'valentine:state';

interface AppState {
  step: CatId;
  date?: string;
  // ISO-дата (YYYY-MM-DD), которую понимает <input type="date">.
  // Нужна только для .ics на шаге Чипса — на карточках дат года нет.
  dateISO?: string;
  format?: string;
}

const renderers: Record<CatId, (container: HTMLElement) => void> = {
  kish: renderKish,
  iriska: renderIriska,
  chips: renderChips,
};

let state: AppState = readStored() ?? { step: 'kish' };

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

  const next = STEPS[STEPS.indexOf(state.step) + 1];
  if (next) preload(next);
}

export function goTo(step: CatId): void {
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

export function getState(): Readonly<AppState> {
  return state;
}

export function init(): void {
  renderCurrentStep();
}
