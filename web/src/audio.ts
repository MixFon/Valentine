// Единая аудио-подсистема: один AudioContext на весь сайт, тумблер
// mute в sessionStorage, разблокировка звука по первому тапу — iOS
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
let unlocking: Promise<void> | null = null;
const buffers = new Map<CatId, AudioBuffer>();

function isMuted(): boolean {
  return sessionStorage.getItem(MUTE_KEY) === '1';
}

function setMuted(muted: boolean): void {
  sessionStorage.setItem(MUTE_KEY, muted ? '1' : '0');
}

async function unlock(): Promise<void> {
  if (unlocking) return unlocking;

  unlocking = (async () => {
    ctx = new AudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    await Promise.all(
      (Object.keys(SOURCES) as CatId[]).map(async (cat) => {
        try {
          const response = await fetch(SOURCES[cat]);
          const data = await response.arrayBuffer();
          buffers.set(cat, await ctx!.decodeAudioData(data));
        } catch {
          // Один кот остался без звука — не мешаем остальным.
        }
      }),
    );
  })();

  return unlocking;
}

export function play(cat: CatId): void {
  if (isMuted() || !ctx) return;

  const buffer = buffers.get(cat);
  if (!buffer) return;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}

export function initAudio(): void {
  document.addEventListener('pointerdown', () => void unlock(), {
    once: true,
    passive: true,
  });

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
