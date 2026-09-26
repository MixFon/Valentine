// Единая аудио-подсистема: один AudioContext на весь сайт, тумблер
// mute в sessionStorage, разблокировка звука по тапу — iOS
// Safari не даёт играть звук до жеста пользователя. Файлы — .m4a
// (AAC): Safari не декодирует Ogg/Vorbis, поэтому не .ogg.

import type { CatId } from './content';
import { audioCopy } from './content';
import './audio.css';

const SOURCES: Record<CatId, string> = {
  kish: new URL('../assets/audio/kish.m4a', import.meta.url).href,
  iriska: new URL('../assets/audio/iriska.m4a', import.meta.url).href,
  chips: new URL('../assets/audio/chips.m4a', import.meta.url).href,
};

const MUTE_KEY = 'valentine:muted';

const ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor" stroke="none" />
    <path class="mute-toggle__waves" d="M16 9a5 5 0 0 1 0 6" />
    <path class="mute-toggle__waves" d="M18.5 6.5a9 9 0 0 1 0 11" />
    <path class="mute-toggle__slash" d="M4 4l16 16" />
  </svg>
`;

let ctx: AudioContext | null = null;
const buffers = new Map<CatId, AudioBuffer>();

function isMuted(): boolean {
  return sessionStorage.getItem(MUTE_KEY) === '1';
}

function setMuted(muted: boolean): void {
  sessionStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}

// iOS Safari разрешает звук только по жесту, который засчитывается на
// отпускании пальца (touchend/click), а не на pointerdown. Кроме того,
// iOS сама приостанавливает контекст, когда вкладка уходит в фон или
// гаснет экран. Поэтому будим контекст на каждом касании, пока он не
// заработает, а не один раз.
function wake(): void {
  if (!ctx) {
    ctx = new AudioContext();
    void loadBuffers(ctx);
  }
  if (ctx.state !== 'running') {
    ctx.resume().catch(() => {
      // Жест не засчитался — попробуем на следующем касании.
    });
  }
}

let loading: Promise<void> | null = null;

function loadBuffers(context: AudioContext): Promise<void> {
  loading ??= Promise.all(
    (Object.keys(SOURCES) as CatId[]).map(async (cat) => {
      try {
        const response = await fetch(SOURCES[cat]);
        const data = await response.arrayBuffer();
        buffers.set(cat, await context.decodeAudioData(data));
      } catch {
        // Один кот остался без звука — не мешаем остальным.
      }
    }),
  ).then(() => undefined);
  return loading;
}

export function play(cat: CatId): void {
  if (isMuted()) return;

  // play() всегда вызывается из тапа — это законный момент разбудить
  // контекст, если iOS успела его приостановить.
  wake();

  const buffer = buffers.get(cat);
  if (!ctx || !buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

// Звук — часть задумки, поэтому просим Safari (iOS 17+) играть его и при
// включённом беззвучном режиме. Где API нет, ничего не меняется.
interface AudioSessionNavigator extends Navigator {
  audioSession?: { type: string };
}

export function initAudio(): void {
  const session = (navigator as AudioSessionNavigator).audioSession;
  if (session) session.type = 'playback';

  for (const type of ['touchend', 'click'] as const) {
    document.addEventListener(type, wake, { capture: true, passive: true });
  }

  mountMuteToggle();
}

function mountMuteToggle(): void {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mute-toggle';
  button.innerHTML = ICON;

  function refresh(): void {
    const muted = isMuted();
    button.setAttribute('aria-pressed', String(muted));
    button.setAttribute('aria-label', muted ? audioCopy.unmuteLabel : audioCopy.muteLabel);
  }

  button.addEventListener('click', () => {
    setMuted(!isMuted());
    refresh();
  });

  refresh();
  document.body.append(button);
}
