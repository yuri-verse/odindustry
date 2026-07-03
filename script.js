// ===== 오디산업 홈페이지 스크립트 =====

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
