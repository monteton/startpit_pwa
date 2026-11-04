// Общий видеоплеер.
// Окно всегда по размеру самого видео; управление: перемотка (ползунок и ±10 с), пауза, крестик.
// Кнопок «скачать», «на весь экран», «картинка в картинке» нет.
//
// Использование:
//   openPlayer(src)                                  — открыть видео поверх страницы
//   openPlayer(src, { closeHref: 'main.html' })      — крестик уводит на страницу
//   Все <video> на странице автоматически становятся превью с кнопкой play,
//   по нажатию открывается плеер. Пропустить видео: <video data-no-player>.
(function () {
  const CSS = `
.vp-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;
  padding:calc(16px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));
  background:radial-gradient(80% 50% at 50% 0%,rgba(42,52,32,.95) 0%,rgba(20,26,15,.96) 70%);
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f3f1e4;
  -webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;animation:vp-fade .2s ease}
@keyframes vp-fade{from{opacity:0}to{opacity:1}}
.vp-player{position:relative;display:inline-block;line-height:0;border-radius:20px;overflow:hidden;background:#000;
  box-shadow:0 0 0 1px rgba(255,255,255,.08),0 20px 50px -12px rgba(0,0,0,.7);transition:opacity .3s}
.vp-player.vp-loading{opacity:0;pointer-events:none}
.vp-player video{display:block;width:auto;height:auto;max-width:min(calc(100vw - 32px),900px);
  max-height:calc(100vh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  max-height:calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom))}
.vp-spinner{position:fixed;top:50%;left:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
  border:3px solid rgba(169,179,138,.25);border-top-color:#a9b38a;animation:vp-spin .9s linear infinite}
.vp-overlay.vp-ready .vp-spinner,.vp-overlay.vp-ready>.vp-close{display:none}
@keyframes vp-spin{to{transform:rotate(360deg)}}
.vp-close{position:absolute;top:12px;right:12px;z-index:3;width:40px;height:40px;border:0;padding:0;border-radius:50%;
  display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.45);cursor:pointer;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 0 0 1px rgba(255,255,255,.15) inset;
  transition:opacity .25s;text-decoration:none}
.vp-overlay>.vp-close{position:fixed;top:calc(16px + env(safe-area-inset-top));right:16px}
.vp-close svg{width:20px;height:20px}
.vp-big{position:absolute;inset:0;margin:auto;z-index:2;width:76px;height:76px;border:0;padding:0;border-radius:50%;
  display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(110,125,74,.85);cursor:pointer;
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  box-shadow:0 1px 0 rgba(255,255,255,.3) inset,0 12px 28px -8px rgba(0,0,0,.6);transition:opacity .2s,transform .2s}
.vp-big svg{width:32px;height:32px;margin-left:4px}
.vp-player.vp-playing .vp-big{opacity:0;transform:scale(.85);pointer-events:none}
.vp-controls{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:36px 12px 12px;line-height:normal;
  background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.7) 100%);transition:opacity .25s}
.vp-player.vp-playing.vp-idle .vp-controls,.vp-player.vp-playing.vp-idle .vp-close{opacity:0;pointer-events:none}
.vp-seek{-webkit-appearance:none;appearance:none;display:block;width:100%;height:22px;margin:0 0 6px;padding:0;
  background:transparent;cursor:pointer;--p:0%}
.vp-seek::-webkit-slider-runnable-track{height:4px;border-radius:4px;
  background:linear-gradient(90deg,#a9b38a var(--p),rgba(255,255,255,.28) var(--p))}
.vp-seek::-moz-range-track{height:4px;border-radius:4px;
  background:linear-gradient(90deg,#a9b38a var(--p),rgba(255,255,255,.28) var(--p))}
.vp-seek::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;margin-top:-6px;border-radius:50%;
  background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.vp-seek::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.vp-row{display:flex;align-items:center;gap:4px}
.vp-btn{width:40px;height:40px;border:0;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
  color:#fff;background:transparent;cursor:pointer}
.vp-btn:active{background:rgba(255,255,255,.15)}
.vp-btn svg{width:24px;height:24px}
.vp-btn.vp-play svg{width:26px;height:26px}
.vp-time{margin-left:auto;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.9)}
html.vp-lock,html.vp-lock body{overflow:hidden}

/* Превью вместо встроенного плеера */
.vp-thumb{position:relative;display:block;line-height:0;cursor:pointer;background:#000}
.vp-thumb video{pointer-events:none;width:100%;display:block}
.vp-thumb .vp-big{width:64px;height:64px}
.vp-thumb .vp-big svg{width:28px;height:28px}
.vp-thumb:active .vp-big{transform:scale(.94)}
`;

  const ICON = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 3v4.5h4.5"/><text x="12" y="15.6" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none" font-family="Manrope, sans-serif">10</text></svg>',
    fwd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M21 3v4.5h-4.5"/><text x="12" y="15.6" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none" font-family="Manrope, sans-serif">10</text></svg>',
  };

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const fmt = s => {
    if (!isFinite(s)) s = 0;
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  };

  // Кнопка закрытия: ссылка (если закрытие уводит на страницу) или кнопка
  const closeEl = closeHref => closeHref
    ? `<a class="vp-close" href="${closeHref}" aria-label="Закрыть">${ICON.close}</a>`
    : `<button class="vp-close" type="button" aria-label="Закрыть">${ICON.close}</button>`;

  let current = null;

  function openPlayer(src, opts) {
    opts = opts || {};
    if (current) current.close();

    const overlay = document.createElement('div');
    overlay.className = 'vp-overlay';
    overlay.innerHTML = `
      <div class="vp-spinner" aria-hidden="true"></div>
      ${closeEl(opts.closeHref)}
      <div class="vp-player vp-idle vp-loading">
        <video playsinline preload="metadata" disablepictureinpicture disableremoteplayback
          controlslist="nodownload nofullscreen noremoteplayback noplaybackrate"></video>
        ${closeEl(opts.closeHref)}
        <button class="vp-big" type="button" aria-label="Смотреть">${ICON.play}</button>
        <div class="vp-controls">
          <input class="vp-seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Перемотка">
          <div class="vp-row">
            <button class="vp-btn vp-back" type="button" aria-label="Назад на 10 секунд">${ICON.back}</button>
            <button class="vp-btn vp-play" type="button" aria-label="Пауза">${ICON.pause}</button>
            <button class="vp-btn vp-fwd" type="button" aria-label="Вперёд на 10 секунд">${ICON.fwd}</button>
            <span class="vp-time">0:00 / 0:00</span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.documentElement.classList.add('vp-lock');

    const player = overlay.querySelector('.vp-player');
    const video = overlay.querySelector('video');
    const seek = overlay.querySelector('.vp-seek');
    const time = overlay.querySelector('.vp-time');
    const playBtn = overlay.querySelector('.vp-play');

    const toggle = () => video.paused ? video.play().catch(() => {}) : video.pause();

    let idleTimer;
    function wake() {
      player.classList.remove('vp-idle');
      clearTimeout(idleTimer);
      if (!video.paused) idleTimer = setTimeout(() => player.classList.add('vp-idle'), 2500);
    }

    function updateState() {
      const playing = !video.paused && !video.ended;
      player.classList.toggle('vp-playing', playing);
      playBtn.innerHTML = playing ? ICON.pause : ICON.play;
      playBtn.setAttribute('aria-label', playing ? 'Пауза' : 'Смотреть');
      wake();
    }

    let seeking = false;
    function updateTime() {
      const d = video.duration || 0;
      if (!seeking) {
        const p = d ? video.currentTime / d : 0;
        seek.value = Math.round(p * 1000);
        seek.style.setProperty('--p', (p * 100) + '%');
      }
      time.textContent = fmt(video.currentTime) + ' / ' + fmt(d);
    }

    function ready() {
      player.classList.remove('vp-loading');
      overlay.classList.add('vp-ready');
      updateTime();
    }

    function close() {
      clearTimeout(idleTimer);
      video.pause();
      video.removeAttribute('src');
      video.load();
      overlay.remove();
      document.documentElement.classList.remove('vp-lock');
      document.removeEventListener('keydown', onKey);
      if (current === api) current = null;
    }

    function onKey(e) {
      if (e.key === 'Escape' && !opts.closeHref) close();
      else if (e.key === ' ') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 10);
      else if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
    }

    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', ready);
    video.addEventListener('contextmenu', e => e.preventDefault());
    video.addEventListener('click', () => {
      if (player.classList.contains('vp-idle') && !video.paused) wake();
      else toggle();
    });
    player.addEventListener('pointermove', wake);

    overlay.querySelector('.vp-big').onclick = toggle;
    playBtn.onclick = toggle;
    overlay.querySelector('.vp-back').onclick = () => { video.currentTime = Math.max(0, video.currentTime - 10); wake(); };
    overlay.querySelector('.vp-fwd').onclick = () => { video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); wake(); };
    if (!opts.closeHref) overlay.querySelectorAll('.vp-close').forEach(b => b.onclick = close);

    seek.addEventListener('input', () => {
      seeking = true;
      const p = seek.value / 1000;
      seek.style.setProperty('--p', (p * 100) + '%');
      if (video.duration) video.currentTime = p * video.duration;
      wake();
    });
    seek.addEventListener('change', () => { seeking = false; });

    document.addEventListener('keydown', onKey);

    video.src = src;
    video.play().catch(() => {});
    updateState();

    const api = { close, video };
    current = api;
    return api;
  }

  // Встроенные <video> → превью с кнопкой play, по нажатию открывается плеер
  function enhance(root) {
    (root || document).querySelectorAll('video:not([data-no-player])').forEach(v => {
      if (v.closest('.vp-thumb, .vp-overlay')) return;
      const source = v.querySelector('source');
      const src = (source && source.getAttribute('src')) || v.getAttribute('src');
      if (!src) return;
      v.removeAttribute('controls');
      v.removeAttribute('autoplay');
      v.setAttribute('playsinline', '');
      v.setAttribute('preload', 'metadata');
      v.muted = true;
      v.addEventListener('contextmenu', e => e.preventDefault());

      const wrap = document.createElement('div');
      wrap.className = 'vp-thumb';
      wrap.setAttribute('role', 'button');
      wrap.setAttribute('tabindex', '0');
      wrap.setAttribute('aria-label', 'Смотреть видео');
      v.parentNode.insertBefore(wrap, v);
      wrap.appendChild(v);
      wrap.insertAdjacentHTML('beforeend', `<span class="vp-big" aria-hidden="true">${ICON.play}</span>`);

      const open = () => openPlayer(src.replace(/#t=[\d.]+$/, ''));
      wrap.addEventListener('click', open);
      wrap.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  window.openPlayer = openPlayer;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => enhance());
  else enhance();
})();
