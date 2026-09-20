import './styles/tokens.css';
import './styles/base.css';
import type { CatId } from './content';
import { render as renderKish } from './steps/kish';
import { render as renderIriska } from './steps/iriska';
import { render as renderChips } from './steps/chips';

const STEPS: CatId[] = ['kish', 'iriska', 'chips'];
const STORAGE_KEY = 'valentine:step';

const renderers: Record<CatId, (container: HTMLElement) => void> = {
  kish: renderKish,
  iriska: renderIriska,
  chips: renderChips,
};

interface State {
  step: CatId;
}

const state: State = {
  step: readStoredStep() ?? 'kish',
};

function readStoredStep(): CatId | null {
  const value = sessionStorage.getItem(STORAGE_KEY);
  return (STEPS as string[]).includes(value ?? '') ? (value as CatId) : null;
}

export function goTo(step: CatId): void {
  state.step = step;
  sessionStorage.setItem(STORAGE_KEY, step);
  document.body.dataset.cat = step;

  const app = document.getElementById('app');
  if (!app) return;

  app.replaceChildren();
  renderers[step](app);
}

goTo(state.step);
