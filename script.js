// ===== 오디산업 홈페이지 스크립트 =====

// 시공 사례 데이터 - 여기에 항목을 추가하면 갤러리에 자동 반영됩니다.
//   cat: 'restore'(원상복구·철거) 또는 'interior'(인테리어)
//   before/after: 사진 경로,  caption: 사례 설명
const GALLERY_ITEMS = [
  { cat: 'restore',  before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 상가 원상복구' },
  { cat: 'restore',  before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 사무실 철거' },
  { cat: 'restore',  before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 건물 내부 철거' },
  { cat: 'restore',  before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 매장 원상복구' },
  { cat: 'interior', before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 카페 인테리어' },
  { cat: 'interior', before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 사무실 인테리어' },
  { cat: 'interior', before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 매장 인테리어' },
  { cat: 'interior', before: 'images/gallery/placeholder-before.svg', after: 'images/gallery/placeholder-after.svg', caption: '○○ 주택 인테리어' },
];

const galleryTrack = document.getElementById('galleryTrack');
if (galleryTrack) {
  galleryTrack.innerHTML = GALLERY_ITEMS.map((it) => `
    <figure class="ba-item" data-cat="${it.cat}">
      <div class="ba" style="--pos:50%">
        <img class="ba-img ba-after" src="${it.after}" alt="시공 후 - ${it.caption}" />
        <img class="ba-img ba-before" src="${it.before}" alt="시공 전 - ${it.caption}" />
        <span class="ba-tag ba-tag-before">BEFORE</span>
        <span class="ba-tag ba-tag-after">AFTER</span>
        <div class="ba-handle" aria-hidden="true"></div>
        <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="시공 전후 비교 슬라이더" />
      </div>
      <figcaption>${it.caption}</figcaption>
    </figure>`).join('');
}

// 모바일 메뉴 토글
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});

// 메뉴 항목 클릭 시 모바일 메뉴 닫기
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// 스크롤 등장 애니메이션 (같은 그룹은 순차 등장 - stagger)
const revealTargets = document.querySelectorAll(
  '.card, .feature, .steps li, .section-head, .contact-form, .contact-info'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

// 형제 요소끼리 지연시간을 줘서 하나씩 나타나게 함
document.querySelectorAll('.cards, .features, .steps').forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    child.style.transitionDelay = i * 0.09 + 's';
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealTargets.forEach((el) => observer.observe(el));

// 헤더: 스크롤하면 그림자 강조
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 히어로 통계 숫자 카운트업
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.hero-stats strong[data-count]').forEach((el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (reduceMotion) {
    el.textContent = target.toLocaleString('ko-KR') + suffix;
    return;
  }
  const finalText = target.toLocaleString('ko-KR') + suffix;
  el.textContent = '0' + suffix; // 시작 전 최종값 깜빡임 방지
  const duration = 1400;
  let startTime = null;
  const step = (now) => {
    if (startTime === null) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString('ko-KR') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  // 히어로 등장 애니메이션이 끝날 무렵부터 시작
  setTimeout(() => requestAnimationFrame(step), 650);
  // 안전장치: 어떤 환경에서도 최종 숫자로 반드시 마무리
  setTimeout(() => { el.textContent = finalText; }, 650 + duration + 300);
});

// 문의 폼 제출 (Formspree 연동 - 접수 시 이메일로 전달)
const FORMSPREE_ID = 'xqevwqza'; // formspree.io 폼 ID
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const submitBtn = form.querySelector('button[type="submit"]');

const showNote = (msg, type) => {
  formNote.textContent = msg;
  formNote.classList.toggle('is-error', type === 'error');
  formNote.classList.toggle('is-success', type !== 'error');
  formNote.hidden = false;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !phone) {
    showNote('이름과 연락처를 입력해 주세요.', 'error');
    return;
  }
  if (FORMSPREE_ID === 'REPLACE_ME') {
    showNote('폼 연동이 아직 설정되지 않았습니다. 전화로 문의해 주세요.', 'error');
    return;
  }

  const original = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '보내는 중...';

  try {
    const res = await fetch('https://formspree.io/f/' + FORMSPREE_ID, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    if (res.ok) {
      showNote('문의가 접수되었습니다. 빠르게 연락드리겠습니다.', 'success');
      form.reset();
      setTimeout(closeContactModal, 2200); // 접수 후 팝업 자동 닫기
    } else {
      showNote('전송에 실패했습니다. 잠시 후 다시 시도하시거나 전화로 문의해 주세요.', 'error');
    }
  } catch {
    showNote('네트워크 오류로 전송하지 못했습니다. 전화로 문의해 주세요.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = original;
  }
});

// ===== 문의 팝업(모달) =====
const contactModal = document.getElementById('contactModal');
let modalLastFocus = null;

function openContactModal(e) {
  if (e) e.preventDefault();
  modalLastFocus = document.activeElement;
  if (formNote) formNote.hidden = true; // 이전 안내 메시지 초기화
  contactModal.hidden = false;
  document.body.classList.add('modal-open');
  const firstField = contactModal.querySelector('input, select, textarea');
  if (firstField) setTimeout(() => firstField.focus(), 60);
}
function closeContactModal() {
  contactModal.hidden = true;
  document.body.classList.remove('modal-open');
  if (modalLastFocus && modalLastFocus.focus) modalLastFocus.focus();
}

// 열기: data-open-contact 요소 + 기존 #contact 링크 전부
document.querySelectorAll('[data-open-contact], a[href="#contact"]').forEach((el) => {
  el.addEventListener('click', openContactModal);
});
// 닫기: 닫기 버튼 / 배경 클릭
contactModal.querySelectorAll('[data-close-contact]').forEach((el) => {
  el.addEventListener('click', closeContactModal);
});
// ESC 로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !contactModal.hidden) closeContactModal();
});

// 좌상단 로고/OD INDUSTRY 클릭 시 맨 위로 스크롤
const brandLink = document.querySelector('.brand');
if (brandLink) {
  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    nav.classList.remove('open');
    navToggle.classList.remove('open');
  });
}

// ===== 인라인 달력 (여러 날짜 선택 / 드래그로 여러 날 선택·해제) =====
function initCalendar(rootId, inputId) {
  const root = document.getElementById(rootId);
  if (!root) return;
  const daysEl = root.querySelector('.cal-days');
  const titleEl = root.querySelector('.cal-title');
  const selEl = root.querySelector('.cal-selected strong');
  const input = document.getElementById(inputId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const selected = new Set(); // 'YYYY-MM-DD'
  let dragging = false;
  let mode = 'add'; // 'add' | 'remove'

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const nextDay = (s) => {
    const p = s.split('-').map(Number);
    return fmt(new Date(p[0], p[1] - 1, p[2] + 1));
  };

  // 선택된 날짜를 연속 구간으로 묶어 표시 (예: 7-10 ~ 7-12, 7-15)
  function buildText() {
    const arr = [...selected].sort();
    if (!arr.length) return '';
    const groups = [];
    let s = arr[0];
    let prev = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (nextDay(prev) === arr[i]) { prev = arr[i]; }
      else { groups.push([s, prev]); s = arr[i]; prev = arr[i]; }
    }
    groups.push([s, prev]);
    return groups.map((g) => (g[0] === g[1] ? g[0] : g[0] + ' ~ ' + g[1])).join(', ');
  }

  function refresh() {
    daysEl.querySelectorAll('.cal-day').forEach((c) => {
      if (!c.dataset.date) return;
      c.classList.toggle('is-sel', selected.has(c.dataset.date));
    });
    const text = buildText();
    input.value = text;
    selEl.textContent = text || '없음';
  }

  function apply(dateStr) {
    if (mode === 'add') selected.add(dateStr);
    else selected.delete(dateStr);
    refresh();
  }

  function render() {
    titleEl.textContent = view.getFullYear() + '년 ' + (view.getMonth() + 1) + '월';
    daysEl.innerHTML = '';
    const firstDow = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) {
      const b = document.createElement('span');
      b.className = 'cal-day cal-empty';
      daysEl.appendChild(b);
    }
    for (let d = 1; d <= total; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      cell.textContent = d;
      if (date < today) { cell.classList.add('cal-past'); cell.disabled = true; }
      else cell.dataset.date = fmt(date);
      daysEl.appendChild(cell);
    }
    refresh();
  }

  const dayFromPoint = (x, y) => {
    const el = document.elementFromPoint(x, y);
    const c = el && el.closest ? el.closest('.cal-day') : null;
    return c && c.dataset && c.dataset.date && !c.disabled ? c : null;
  };

  daysEl.addEventListener('pointerdown', (e) => {
    const c = e.target.closest ? e.target.closest('.cal-day') : null;
    if (!c || !c.dataset.date || c.disabled) return;
    e.preventDefault();
    dragging = true;
    mode = selected.has(c.dataset.date) ? 'remove' : 'add'; // 시작 칸 기준으로 추가/해제
    apply(c.dataset.date);
  });
  document.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const c = dayFromPoint(e.clientX, e.clientY);
    if (c) apply(c.dataset.date);
  });
  document.addEventListener('pointerup', () => { dragging = false; });

  root.querySelector('[data-cal-prev]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    render();
  });
  root.querySelector('[data-cal-next]').addEventListener('click', () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    render();
  });

  render();
}
initCalendar('visitCal', 'visitValue');
initCalendar('demoCal', 'demoValue');

// 문의 유형 / 현장에서 '기타' 선택 시 입력칸 표시
document.querySelectorAll('.check-chips input[value="기타"]').forEach((cb) => {
  const field = cb.closest('.type-field');
  const etc = field ? field.querySelector('.etc-input') : null;
  if (!etc) return;
  const sync = (focus) => {
    etc.style.display = cb.checked ? 'block' : 'none';
    if (cb.checked && focus) etc.focus();
  };
  cb.addEventListener('change', () => sync(true));
  sync(false); // 초기 상태 반영
});

// ===== 시공 사례 갤러리 =====
const galleryTabs = document.querySelectorAll('.gtab');
const galleryItems = document.querySelectorAll('.ba-item');

// before/after 비교 슬라이더 (마우스/터치 드래그)
document.querySelectorAll('.ba').forEach((ba) => {
  const range = ba.querySelector('.ba-range');
  const setPos = (pct) => {
    const clamped = Math.max(0, Math.min(100, pct));
    ba.style.setProperty('--pos', clamped + '%');
    if (range) range.value = clamped;
  };
  let dragging = false;
  const posFromEvent = (e) => {
    const rect = ba.getBoundingClientRect();
    setPos(((e.clientX - rect.left) / rect.width) * 100);
  };
  ba.addEventListener('pointerdown', (e) => {
    dragging = true;
    ba.setPointerCapture(e.pointerId);
    posFromEvent(e);
  });
  ba.addEventListener('pointermove', (e) => { if (dragging) posFromEvent(e); });
  const endDrag = () => { dragging = false; };
  ba.addEventListener('pointerup', endDrag);
  ba.addEventListener('pointercancel', endDrag);
  if (range) range.addEventListener('input', () => setPos(Number(range.value)));
});

// 캐러셀: 자동 슬라이드 + 좌우 화살표 + 점 + 카테고리 탭
if (galleryTrack) {
  const prevBtn = document.querySelector('.gcar-prev');
  const nextBtn = document.querySelector('.gcar-next');
  const dotsBox = document.getElementById('galleryDots');
  const carousel = document.querySelector('.gallery-carousel');
  let curCat = 'restore';
  let idx = 0;
  let timer = null;

  const visible = () => Array.from(galleryItems).filter((it) => it.dataset.cat === curCat);
  const perView = () => (window.innerWidth <= 720 ? 1 : 2);
  const maxIdx = () => Math.max(0, visible().length - perView());

  const goTo = (i, smooth = true) => {
    const items = visible();
    if (!items.length) return;
    const last = maxIdx();
    idx = i < 0 ? last : i > last ? 0 : i; // 끝에서 순환
    galleryTrack.scrollTo({ left: items[idx].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    syncDots();
  };

  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
  const startAuto = () => {
    stopAuto();
    if (maxIdx() > 0 && !reduceMotion) timer = window.setInterval(() => goTo(idx + 1), 4000);
  };

  const buildDots = () => {
    const pages = maxIdx() + 1;
    dotsBox.innerHTML = '';
    dotsBox.style.display = pages > 1 ? 'flex' : 'none';
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gdot' + (i === idx ? ' is-active' : '');
      b.setAttribute('aria-label', i + 1 + '번째 사례로 이동');
      b.addEventListener('click', () => { goTo(i); startAuto(); });
      dotsBox.appendChild(b);
    }
  };
  function syncDots() {
    Array.from(dotsBox.children).forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }
  const updateControls = () => {
    const many = maxIdx() > 0;
    [prevBtn, nextBtn].forEach((b) => { if (b) b.style.display = many ? 'grid' : 'none'; });
  };

  const setCat = (cat) => {
    curCat = cat;
    galleryTabs.forEach((t) => {
      const active = t.dataset.cat === cat;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    galleryItems.forEach((it) => { it.hidden = it.dataset.cat !== cat; });
    idx = 0;
    buildDots();
    updateControls();
    goTo(0, false);
    startAuto();
  };

  galleryTabs.forEach((t) => t.addEventListener('click', () => setCat(t.dataset.cat)));
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(idx - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(idx + 1); startAuto(); });

  // 마우스 올리거나 드래그 중이면 자동 슬라이드 정지, 벗어나면 재개
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('pointerdown', stopAuto);
  window.addEventListener('pointerup', startAuto);

  // 손으로 스와이프했을 때 현재 위치·점 동기화
  let scrollDebounce = null;
  galleryTrack.addEventListener('scroll', () => {
    clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(() => {
      const items = visible();
      let nearest = 0;
      let min = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft - galleryTrack.scrollLeft);
        if (d < min) { min = d; nearest = i; }
      });
      idx = Math.min(nearest, maxIdx());
      syncDots();
    }, 120);
  });

  // 창 크기 변경 시 재계산 (2개↔1개 뷰 전환)
  let resizeDebounce = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(() => {
      buildDots();
      updateControls();
      goTo(Math.min(idx, maxIdx()), false);
    }, 150);
  });

  setCat('restore');
}

// 히어로 제목 타이핑 효과
(function typeHeroTitle() {
  const titleEl = document.getElementById('heroTitle');
  if (!titleEl) return;
  if (reduceMotion) return; // 모션 최소화 설정 시 정적 텍스트 유지

  const parts = [
    { t: '공간의 가치를' },
    { t: '\n' },
    { t: '다시 세우는', cls: 'accent' },
    { t: ' 오디산업' },
  ];
  const chars = [];
  parts.forEach((p) => {
    for (const ch of p.t) chars.push({ ch, cls: p.cls });
  });

  const caret = ''; // 커서 표시 없음
  const render = (count) => {
    let html = '';
    let curCls = null;
    let buf = '';
    const flush = () => {
      if (!buf) return;
      html += curCls ? '<span class="' + curCls + '">' + buf + '</span>' : buf;
      buf = '';
    };
    for (let k = 0; k < count; k++) {
      const c = chars[k];
      if (c.ch === '\n') { flush(); html += '<br>'; curCls = null; continue; }
      if (c.cls !== curCls) { flush(); curCls = c.cls; }
      buf += c.ch;
    }
    flush();
    titleEl.innerHTML = html + caret;
  };

  titleEl.innerHTML = caret; // 커서만 두고 시작
  let i = 0;
  const tick = () => {
    i++;
    render(i);
    if (i < chars.length) {
      const justTyped = chars[i - 1].ch;
      setTimeout(tick, justTyped === '\n' ? 10 : 85); // 글자당 약 85ms
    }
    // 완료 후에도 커서는 계속 깜빡이도록 유지
  };
  setTimeout(tick, 350); // 히어로가 나타난 직후 시작

  titleEl.classList.add('typing'); // 스타일 훅(필요 시)
})();

// 푸터 연도 자동 표시
document.getElementById('year').textContent = new Date().getFullYear();
