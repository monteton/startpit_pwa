// Страницы питания: общий рендер. Каждая HTML-страница задаёт PAGE = { type, ... } и подключает этот файл.
// Тексты лежат в самих страницах и перенесены из PDF без изменений.

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
};
const MEAL_EMOJI = { 'Завтрак': '🍳', 'Второй завтрак': '🍏', 'Перекус': '🍎', 'Перекус 1': '🍎', 'Перекус 2': '🥜', 'Обед': '🍲', 'Полдник': '🥗', 'Ужин': '🌙' };
const MEAL_BG = { 'Завтрак': '#fdf0dc', 'Обед': 'var(--violet-soft)', 'Ужин': 'var(--violet-soft)' };

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const app = document.getElementById('app');
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };

function topbar(title, back) {
  return `<header class="topbar">
    <a class="icon-btn" href="${back}" aria-label="Назад">${ICONS.back}</a>
    <h1>${title}</h1>
  </header>`;
}
// «Назад» с главной раздела: в каталог (если страница открыта отдельно — просто назад по истории)
const HOME_BACK = PAGE.back || 'menu.html';

function hero({ eyebrow, title, text, img, square, emoji }) {
  return `<div class="n-hero">
    <div class="t">
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h2>${title}</h2>
      <p>${esc(text)}</p>
    </div>
    ${img ? `<img class="cover${square ? ' square' : ''}" src="${img}" alt="">` : ''}
    ${emoji ? `<div class="big-emoji">${emoji}</div>` : ''}
  </div>`;
}
const stats = arr => `<div class="n-stats">${arr.map(([b, s]) => `<div class="n-stat"><b>${b}</b><span>${s}</span></div>`).join('')}</div>`;
const wideBtn = (href, ico, cls, title, sub) => `<a class="wide-btn" href="${href}">
  <div class="chip-ico ${cls}">${ico}</div><span>${title}${sub ? `<small>${sub}</small>` : ''}</span><div class="go">${ICONS.arrow}</div></a>`;
const pdfBtn = () => PAGE.pdf ? `<a class="btn btn-ghost" style="margin-top:16px" href="${PAGE.pdf}" download>${ICONS.down} Скачать PDF-версию</a>` : '';
const pager = (prev, next) => `<div class="pager">
  <a class="btn btn-ghost" href="${prev || '#'}" ${prev ? '' : 'aria-disabled="true"'}>← Назад</a>
  <a class="btn btn-ghost" href="${next || '#'}" ${next ? '' : 'aria-disabled="true"'}>Далее →</a></div>`;

// ---------- Карточка приёма пищи ----------
function ingList(lines) {
  return `<ul class="ing-list">${lines.map(l => /:\s*$/.test(l) ? `<li class="grp">${esc(l.replace(/:\s*$/, ''))}</li>` : `<li>${esc(l)}</li>`).join('')}</ul>`;
}
function prepHtml(paras) {
  return `<div class="prep">${paras.map(p => /^[А-ЯЁA-Z][^.!?]{1,40}:$/.test(p) ? `<p class="lbl">${esc(p.replace(/:$/, ''))}</p>` : `<p>${esc(p)}</p>`).join('')}</div>`;
}
function mealCard({ label, title, photo, rectPhoto, kcal, bju, body }) {
  const emoji = MEAL_EMOJI[label] || '🍽️';
  const icon = photo ? `<img src="${photo}" alt="" loading="lazy">` : emoji;
  if (!body) {
    return `<div class="meal simple"><div class="meal-head">
      <div class="meal-ico" style="background:${MEAL_BG[label] || 'var(--green-soft)'}">${icon}</div>
      <div class="t">${label ? `<small>${esc(label)}</small>` : ''}<b>${esc(title)}</b></div>
      ${kcal ? `<span class="kc">${kcal} ккал</span>` : ''}</div></div>`;
  }
  const macro = kcal ? `<div class="macro">
      <div class="m-k"><b>${kcal}</b><span>ккал</span></div>
      ${bju ? `<div class="m-p"><b>${bju[0]}</b><span>белки, г</span></div><div class="m-f"><b>${bju[1]}</b><span>жиры, г</span></div><div class="m-c"><b>${bju[2]}</b><span>углеводы, г</span></div>` : ''}
    </div>` : '';
  return `<div class="meal">
    <button class="meal-head" aria-expanded="false">
      <div class="meal-ico" style="background:${MEAL_BG[label] || 'var(--green-soft)'}">${icon}</div>
      <div class="t">${label ? `<small>${esc(label)}</small>` : ''}<b>${esc(title)}</b></div>
      ${kcal ? `<span class="kc">${kcal} ккал</span>` : ''}
      <div class="chev">${ICONS.arrow}</div>
    </button>
    <div class="meal-body">
      ${photo ? `<img class="dish-photo${rectPhoto ? ' rect' : ''}" src="${photo}" alt="${esc(title)}" loading="lazy">` : ''}
      ${macro}${body}
    </div>
  </div>`;
}

// ================= Меню по калориям (варианты дня) =================
function calorieRouter(h) {
  const D = PAGE.data, V = D.variants;
  let m;
  if (h === 'rules') return topbar('Как работать с рационом', '#/') + `
    <div class="card tips-card"><ol class="tip-list">${D.intro.map(p => `<li>${esc(p)}</li>`).join('')}</ol></div>
    <a class="btn btn-violet" href="#/v1">К вариантам рациона ${ICONS.arrow}</a>`;
  if ((m = h.match(/^v(\d+)$/)) && V[m[1] - 1]) {
    const i = m[1] - 1, v = V[i];
    const tabs = `<div class="tabs-scroll">${V.map((x, k) => `<a href="#/v${k + 1}" class="${k === i ? 'on' : ''}">Вариант ${x.n}</a>`).join('')}</div>`;
    const meals = v.meals.map(ml => {
      let body = '';
      if (ml.blocks.length) body = ml.blocks.map(([k, ls]) =>
        k === 'ing' ? `<p class="sec-title">Ингредиенты</p>${ingList(ls)}` :
        k === 'sub' ? `<p class="sub-title">${esc(ls[0])}</p>` :
        `<p class="sec-title">Приготовление</p>${prepHtml(ls)}`).join('');
      return mealCard({ label: ml.name, title: ml.title, photo: ml.photo, body });
    }).join('');
    return topbar(`Вариант ${v.n}`, '#/') + tabs + `<div class="meals">${meals}</div>` +
      pager(i > 0 ? `#/v${i}` : '', i < V.length - 1 ? `#/v${i + 2}` : '');
  }
  // главная
  const recipes = V.reduce((s, v) => s + v.meals.filter(x => x.blocks.length).length, 0);
  const cards = V.map((v, i) => {
    const ph = v.meals.filter(x => x.photo).slice(0, 3).map(x => `<img src="${x.photo}" alt="" loading="lazy">`).join('');
    return `<a class="list-card${i % 2 ? ' alt' : ''}" href="#/v${i + 1}">
      <div class="num-badge">${v.n}</div>
      <div class="list-text"><h3>Вариант ${v.n}</h3><p>${v.meals.map(x => esc(x.title)).join(' · ')}</p></div>
      <div class="thumbs">${ph}</div>
    </a>`;
  }).join('');
  return topbar(PAGE.title, HOME_BACK) + hero({ eyebrow: 'Пример рациона', title: PAGE.heroTitle, text: 'Варианты рациона на день — с рецептами', img: PAGE.cover }) +
    stats([[V.length, plural(V.length, 'вариант дня', 'варианта дня', 'вариантов дня')], [PAGE.kcal, 'ккал в день'], [recipes, plural(recipes, 'рецепт', 'рецепта', 'рецептов')]]) +
    wideBtn('#/rules', ICONS.info, 'ico-violet', 'Как работать с рационом', 'Продукты, время приёмов пищи, замены') +
    `<p class="section-title">Варианты рациона на день</p>${cards}${pdfBtn()}`;
}

// ================= Постное меню (недели → дни → блюда) =================
function postDays(week) {
  // День начинается с «Завтрака» — так блюда идут в PDF
  const days = [];
  week.items.forEach(it => { if (it.meal === 'Завтрак' || !days.length) days.push([]); days[days.length - 1].push(it); });
  return days;
}
function postRouter(h) {
  const W = PAGE.data;
  let m;
  if ((m = h.match(/^w(\d)\/d(\d+)$/)) && W[m[1] - 1]) {
    const wi = m[1] - 1, days = postDays(W[wi]), di = m[2] - 1, day = days[di];
    if (!day) return postRouter('');
    const tabs = `<div class="tabs-scroll">${days.map((_, k) => `<a href="#/w${wi + 1}/d${k + 1}" class="${k === di ? 'on' : ''}">День ${k + 1}</a>`).join('')}</div>`;
    const meals = day.map(it => mealCard({
      label: it.meal, title: it.title, photo: it.photo, rectPhoto: true, kcal: it.kcal, bju: it.bju,
      body: `<p class="sec-title">Ингредиенты</p>${ingList(it.ing)}` + (it.prep.length ? `<p class="sec-title">Способ приготовления</p>${prepHtml(it.prep)}` : ''),
    })).join('');
    const prev = di > 0 ? `#/w${wi + 1}/d${di}` : (wi > 0 ? `#/w${wi}/d${postDays(W[wi - 1]).length}` : '');
    const next = di < days.length - 1 ? `#/w${wi + 1}/d${di + 2}` : (wi < W.length - 1 ? `#/w${wi + 2}/d1` : '');
    return topbar(`Неделя ${W[wi].n} · День ${di + 1}`, `#/w${wi + 1}`) + tabs + `<div class="meals">${meals}</div>` + pager(prev, next);
  }
  if ((m = h.match(/^w(\d)$/)) && W[m[1] - 1]) {
    const wi = m[1] - 1, days = postDays(W[wi]);
    const cards = days.map((d, k) => `<a class="list-card${k % 2 ? ' alt' : ''}" href="#/w${wi + 1}/d${k + 1}">
      <div class="num-badge">${k + 1}</div>
      <div class="list-text"><h3>День ${k + 1}</h3><p>${d.map(x => esc(x.title)).join(' · ')}</p></div>
      <div class="thumbs">${d.filter(x => x.photo).slice(0, 3).map(x => `<img src="${x.photo}" alt="" loading="lazy">`).join('')}</div>
    </a>`).join('');
    return topbar(`Меню ${W[wi].n} недели`, '#/') + `<p class="section-title" style="margin-top:4px">Дни недели</p>${cards}`;
  }
  const dishes = W.reduce((s, w) => s + w.items.length, 0);
  const cards = W.map((w, i) => {
    const days = postDays(w);
    return `<a class="list-card${i % 2 ? ' alt' : ''}" href="#/w${i + 1}">
      <div class="num-badge">${w.n}</div>
      <div class="list-text"><h3>${w.n} неделя</h3><p>${days.length} ${plural(days.length, 'день', 'дня', 'дней')} · ${w.items.length} ${plural(w.items.length, 'блюдо', 'блюда', 'блюд')} с рецептами и КБЖУ</p></div>
      <div class="thumbs">${w.items.filter(x => x.photo).slice(0, 3).map(x => `<img src="${x.photo}" alt="" loading="lazy">`).join('')}</div>
    </a>`;
  }).join('');
  return topbar(PAGE.title, HOME_BACK) + hero({ eyebrow: 'В дни Великого поста', title: 'Постное<br>меню', text: 'Меню на 3 недели — рецепты с КБЖУ', img: PAGE.cover, square: true }) +
    stats([[W.length, plural(W.length, 'неделя', 'недели', 'недель')], [dishes, plural(dishes, 'блюдо', 'блюда', 'блюд')], ['КБЖУ', 'у каждого блюда']]) +
    `<p class="section-title">Меню по неделям</p>${cards}${pdfBtn()}`;
}

// ================= Гайд (главы из блоков) =================
function block(b) {
  switch (b.t) {
    case 'h': return `<h3>${esc(b.v)}</h3>`;
    case 'p': return `<p>${esc(b.v)}</p>`;
    case 'lead': return `<p class="g-lead">${esc(b.v)}</p>`;
    case 'big': return `<div class="g-big">${esc(b.v)}</div>`;
    case 'note': return `<p class="g-note">${esc(b.v)}</p>`;
    case 'accent': return `<p class="g-accent">${esc(b.v)}</p>`;
    case 'warn': return `<p class="g-warn">${esc(b.v)}</p>`;
    case 'list': return `<ul>${b.v.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    case 'dots': return `<ul class="dots">${b.v.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    case 'steps': return `<ol class="steps">${b.v.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    case 'stats': return `<div class="g-stats">${b.v.map(([x, y]) => `<div><b>${esc(x)}</b><span>${esc(y)}</span></div>`).join('')}</div>`;
    case 'img': return `<img class="g-img" src="${b.src}" alt="${esc(b.alt || '')}" loading="lazy">`;
    case 'link': return `<a class="g-link" href="${b.href}" target="_blank" rel="noopener">${ICONS.play} ${esc(b.v)}</a>`;
  }
  return '';
}
function guideRouter(h) {
  const C = PAGE.data;
  let m;
  if ((m = h.match(/^c(\d+)$/)) && C[m[1] - 1]) {
    const i = m[1] - 1, ch = C[i];
    const cards = ch.cards.map(card => `<div class="g-card">${card.title ? `<h2>${esc(card.title)}</h2>` : ''}${card.blocks.map(block).join('')}</div>`).join('');
    return topbar(`${ch.emoji} ${esc(ch.title)}`, '#/') + cards + pager(i > 0 ? `#/c${i}` : '', i < C.length - 1 ? `#/c${i + 2}` : '');
  }
  const cards = C.map((ch, i) => `<a class="list-card" href="#/c${i + 1}">
    <div class="num-badge emoji">${ch.emoji}</div>
    <div class="list-text"><h3>${esc(ch.title)}</h3>${ch.sub ? `<p>${esc(ch.sub)}</p>` : ''}</div>
    <div class="arrow ${i % 2 ? 'arrow-green' : 'arrow-violet'}">${ICONS.arrow}</div>
  </a>`).join('');
  return topbar(PAGE.title, HOME_BACK) + hero(PAGE.hero) + `<p class="section-title">Разделы</p>${cards}${pdfBtn()}`;
}

// ================= FAQ =================
function faqRouter() {
  const items = PAGE.data.map((x, i) => `<div class="qa" data-text="${esc((x.q + ' ' + x.a.join(' ')).toLowerCase())}">
    <button class="qa-q" aria-expanded="false"><span class="n">${i + 1}</span><span class="q">${esc(x.q)}</span><span class="chev">${ICONS.arrow}</span></button>
    <div class="qa-a">${x.a.map(p => `<p>${esc(p)}</p>`).join('')}</div>
  </div>`).join('');
  return topbar(PAGE.title, HOME_BACK) + hero(PAGE.hero) + `
    <label class="search">${ICONS.search}<input type="search" id="faq-search" placeholder="Поиск по вопросам" autocomplete="off"></label>
    <div id="faq-list">${items}</div><p class="empty" id="faq-empty" hidden>Ничего не найдено</p>${pdfBtn()}`;
}

// ================= Быстрый старт: тренировки на 30 дней (данные в assets/bystry-data.js) =================
// 1–14 день — новые тренировки (одно видео на тренировку), 15–30 день — старые (видео на каждое упражнение).
// В каждом блоке 2 недели по 3 тренировки: понедельник, среда, пятница.
const TR_DAYS = ['Понедельник', 'Среда', 'Пятница'];
const TR_PARTS = [
  { id: 'p1', title: 'Тренировки 1–14 день', weeks: [1, 2], list: () => NEW_WORKOUTS, kind: 'full' },
  { id: 'p2', title: 'Тренировки 15–30 день', weeks: [3, 4], list: () => WORKOUTS, kind: 'split' },
];
const trDay = i => TR_DAYS[i % 3];
const trWeek = (part, i) => part.weeks[Math.floor(i / 3)];

function trainingRouter(h) {
  let m;
  const part = TR_PARTS.find(p => h === p.id || h.startsWith(p.id + '/'));

  // ----- Тренировка -----
  if (part && (m = h.match(/\/w(\d+)$/)) && part.list()[m[1] - 1]) {
    const W = part.list(), i = m[1] - 1, w = W[i];
    const tabs = `<div class="tabs-scroll">${W.map((x, k) => `<a href="#/${part.id}/w${k + 1}" class="${k === i ? 'on' : ''}">Нед. ${trWeek(part, k)} · ${['Пн', 'Ср', 'Пт'][k % 3]}</a>`).join('')}</div>`;
    const head = `Неделя ${trWeek(part, i)} · ${trDay(i)}`;
    let body;
    if (part.kind === 'full') {
      const list = w.ex.map((name, k) => `<li><span class="ex-n">${k + 1}</span><span class="ex-t"><b>${esc(name)}</b></span></li>`).join('');
      body = `<div class="full-video"><video data-no-player controls playsinline preload="metadata" poster="${w.cover}" src="${w.video}"></video></div>` +
        `<div class="g-card"><h2>${head} · ~${w.min} мин</h2><ol class="ex-list">${list}</ol></div>`;
    } else {
      const list = w.ex.map(([name, reps], k) => `<li><span class="ex-n">${k + 1}</span><span class="ex-t"><b>${esc(name)}</b><small>${esc(reps)}</small></span></li>`).join('');
      const videos = w.ex.map(([name, , src], k) => `<div class="ex-video"><p>${k + 1}. ${esc(name)}</p>
        <video data-no-player controls playsinline preload="metadata" src="${src}#t=0.1"></video></div>`).join('');
      body = `<img class="w-cover" src="${w.cover}" alt="">` +
        `<div class="g-card"><h2>${head}</h2>${w.warmup ? `<p class="g-note">${esc(w.warmup)}</p>` : ''}
          <ol class="ex-list">${list}</ol>${w.rest ? `<p class="g-warn" style="margin-top:12px">⏱ ${esc(w.rest)}</p>` : ''}</div>` +
        `<p class="section-title">Видео упражнений</p>${videos}`;
    }
    return topbar(`Тренировка ${w.n}`, `#/${part.id}`) + tabs + body +
      pager(i > 0 ? `#/${part.id}/w${i}` : '', i < W.length - 1 ? `#/${part.id}/w${i + 2}` : '');
  }

  // ----- Блок из двух недель -----
  if (part) {
    const W = part.list();
    const card = (w, i) => {
      const names = part.kind === 'full' ? w.ex : w.ex.map(x => x[0]);
      return `<a class="list-card${i % 2 ? ' alt' : ''}" href="#/${part.id}/w${i + 1}">
        <div class="num-badge">${w.n}</div>
        <div class="list-text"><h3>${trDay(i)}</h3><p>Тренировка ${w.n} · ${names.map(esc).join(' · ')}</p></div>
        <img class="w-thumb${part.kind === 'full' ? ' tall' : ''}" src="${w.cover}" alt="" loading="lazy">
      </a>`;
    };
    const weeks = part.weeks.map((wk, j) => `<p class="section-title">Неделя ${wk}</p>` +
      W.slice(j * 3, j * 3 + 3).map((w, k) => card(w, j * 3 + k)).join('')).join('');
    const note = part.kind === 'split'
      ? `<p class="g-note" style="margin:0 0 4px">Рекомендуется выполнять 3 (максимум 4) тренировки в неделю, чтобы мышцы успевали восстанавливаться.</p>` : '';
    return topbar(part.title, '#/') + note + weeks +
      (part.id === 'p1' ? `<a class="btn btn-violet" style="margin-top:14px" href="#/p2">Дальше: 15–30 день ${ICONS.arrow}</a>` : '');
  }

  // ----- Главная раздела -----
  const big = (p, img, sub, alt) => `<a class="list-card big-card${alt ? ' alt' : ''}" href="#/${p.id}">
      <img class="big-cover" src="${img}" alt="" loading="lazy">
      <div class="list-text"><h3>${p.title}</h3><p>${sub}</p></div>
      <div class="go">${ICONS.arrow}</div>
    </a>`;
  return topbar(PAGE.title, HOME_BACK) +
    `<button class="n-hero hello" type="button" onclick="openPlayer('${PAGE.hello}')">
      <div class="t"><h2>Тренировки<br>на 30 дней</h2><p>Смотреть приветствие</p></div>
      <div class="hello-play">${ICONS.play}</div>
    </button>` +
    stats([['30', 'дней'], ['12', 'тренировок'], ['Пн · Ср · Пт', 'дни занятий']]) +
    big(TR_PARTS[0], NEW_WORKOUTS[0].cover, 'Неделя 1–2 · 6 тренировок · тренируйтесь вместе с видео') +
    big(TR_PARTS[1], WORKOUTS[0].cover, 'Неделя 3–4 · 6 тренировок · видео к каждому упражнению', true);
}

// ================= Быстрый старт: рецепты =================
function recipeBody(r, per100) {
  return (r.sub ? `<p class="sub-title" style="margin-top:0">${esc(r.sub)}</p>` : '') +
    (per100 ? `<p class="per100">На 100 г: ${per100[0]} ккал · Б ${per100[1]} · Ж ${per100[2]} · У ${per100[3]}</p>` : '') +
    `<p class="sec-title">Ингредиенты</p>${ingList(r.ing)}` +
    `<p class="sec-title">Приготовление</p>${prepHtml(r.steps)}`;
}
function recipesRouter(h) {
  const fmt = v => String(v).replace('.', ',');
  if (h === 'fav') {
    const meals = FAV_RECIPES.map(r => mealCard({ title: r.title, photo: r.photo, body: recipeBody(r) })).join('');
    return topbar('Любимые рецепты', '#/') + `<div class="meals">${meals}</div>` + pager('#/', '#/book');
  }
  if (h === 'book') {
    const meals = BOOK_RECIPES.map(r => mealCard({
      title: r.title, photo: r.photo, kcal: r.total[0], bju: r.total.slice(1).map(fmt),
      body: recipeBody(r, r.per100.map(fmt)),
    })).join('');
    return topbar('Сборник рецептов', '#/') +
      `<p class="src-note" style="margin:0 4px 12px">КБЖУ на всё блюдо, значения примерные</p>` +
      `<div class="meals">${meals}</div>` +
      `<div class="pager"><a class="btn btn-ghost" href="${PAGE.pdf}" download="Сборник рецептов.pdf">${ICONS.down} Скачать PDF</a>
        <a class="btn btn-ghost" href="${PAGE.pdf}" target="_blank" rel="noopener">Открыть PDF</a></div>`;
  }
  const total = FAV_RECIPES.length + BOOK_RECIPES.length;
  const thumbs = list => list.slice(0, 3).map(x => `<img src="${x.photo}" alt="" loading="lazy">`).join('');
  return topbar(PAGE.title, HOME_BACK) +
    hero({ eyebrow: 'Питание + тренировки', title: 'Бонусные<br>рецепты', text: 'Полезные блюда на каждый день', img: BOOK_RECIPES[0].photo }) +
    stats([[total, plural(total, 'рецепт', 'рецепта', 'рецептов')], [FAV_RECIPES.length, 'любимых'], [BOOK_RECIPES.length, 'с КБЖУ']]) +
    `<p class="section-title">Подборки</p>
    <a class="list-card" href="#/fav">
      <div class="num-badge emoji">❤️</div>
      <div class="list-text"><h3>Любимые рецепты</h3><p>${FAV_RECIPES.length} ${plural(FAV_RECIPES.length, 'рецепт', 'рецепта', 'рецептов')} · ${FAV_RECIPES.slice(0, 4).map(x => esc(x.title)).join(' · ')}</p></div>
      <div class="thumbs">${thumbs(FAV_RECIPES)}</div>
    </a>
    <a class="list-card alt" href="#/book">
      <div class="num-badge emoji">📖</div>
      <div class="list-text"><h3>Сборник рецептов</h3><p>${BOOK_RECIPES.length} ${plural(BOOK_RECIPES.length, 'рецепт', 'рецепта', 'рецептов')} с КБЖУ · ${BOOK_RECIPES.slice(0, 4).map(x => esc(x.title)).join(' · ')}</p></div>
      <div class="thumbs">${thumbs(BOOK_RECIPES)}</div>
    </a>`;
}

// ---------- Роутер ----------
const ROUTERS = { calorie: calorieRouter, post: postRouter, guide: guideRouter, faq: faqRouter, training: trainingRouter, recipes: recipesRouter };
function render() {
  const h = location.hash.replace(/^#\/?/, '');
  app.innerHTML = `<div class="view">${ROUTERS[PAGE.type](h)}</div>`;
  window.scrollTo(0, 0);
  bind();
}
function bind() {
  app.querySelectorAll('.meal-head, .qa-q').forEach(b => {
    if (b.parentElement.classList.contains('simple')) return;
    b.onclick = () => b.setAttribute('aria-expanded', b.parentElement.classList.toggle('open'));
  });
  // Первое блюдо с рецептом раскрыто сразу — чтобы было видно, что внутри
  const first = app.querySelector('.meal:not(.simple)');
  if (first) { first.classList.add('open'); first.querySelector('.meal-head').setAttribute('aria-expanded', 'true'); }

  const tab = app.querySelector('.tabs-scroll a.on');
  if (tab) tab.parentElement.scrollLeft = tab.offsetLeft - 16;

  const input = document.getElementById('faq-search');
  if (input) input.oninput = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    app.querySelectorAll('.qa').forEach(el => {
      const ok = !q || el.dataset.text.includes(q);
      el.hidden = !ok; if (ok) shown++;
      if (q && ok) el.classList.add('open'); else if (!q) el.classList.remove('open');
    });
    document.getElementById('faq-empty').hidden = shown > 0;
  };
}
window.addEventListener('hashchange', render);
render();

// ---------- Нижнее меню (как на главной, стили в assets/nav.css) ----------
(function renderNav() {
  if (!document.querySelector('link[href$="assets/nav.css"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = 'assets/nav.css';
    document.head.appendChild(l);
  }
  const HOUSE = '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"/></svg>';
  const PLANE = '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M229.6,27.4a10,10,0,0,0-10.4-1.6L30.4,101.3a10,10,0,0,0,.9,18.8l57.4,18.4,22.7,70.1a10,10,0,0,0,16.6,3.9l31.6-30.9,51.8,38a10,10,0,0,0,15.7-5.8l36-174.5A10,10,0,0,0,229.6,27.4Z"/></svg>';
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav app-nav is-fixed';
  nav.setAttribute('aria-label', 'Основное меню');
  nav.innerHTML = `
    <a href="main.html" class="nav-item"><span class="nav-ic">${HOUSE}</span><span>Главная</span></a>
    <a href="https://t.me/MyuppyTeam" class="nav-item" target="_blank" rel="noopener"><span class="nav-ic">${PLANE}</span><span>Поддержка</span></a>`;
  document.body.appendChild(nav);
  document.body.classList.add('has-app-nav');
})();
