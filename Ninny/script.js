/* =========================================================
   Helpers
========================================================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const year = $('#year');
if (year) year.textContent = new Date().getFullYear();


/* =========================================================
   Light / dark theme
========================================================= */

const root = document.documentElement;
const themeToggle = $('#themeToggle');

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#13161a' : '#f0f6fa');
}

applyTheme(root.dataset.theme || 'light');

themeToggle?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch {}
});


/* =========================================================
   Skills modal
========================================================= */

const skills = {
  html: {
    icon: 'HTML', title: 'HTML & CSS', language: 'HTML + CSS',
    description: 'Semantic HTML, responsive layouts, and modern CSS styling.',
    code: `<section class="card">\n  <h2>Hello, world!</h2>\n  <p>A simple, accessible page.</p>\n</section>\n\n<style>\n  .card {\n    max-width: 32rem;\n    margin: auto;\n    padding: 2rem;\n    border-radius: 1rem;\n  }\n</style>`
  },
  javascript: {
    icon: 'JS', title: 'JavaScript', language: 'JAVASCRIPT',
    description: 'Interactive interfaces and the logic that makes them feel natural.',
    code: `const button = document.querySelector("button");\nconst message = document.querySelector("#message");\n\nbutton.addEventListener("click", () => {\n  message.textContent = "Thanks for clicking!";\n});`
  },
  responsive: {
    icon: 'UI', title: 'Responsive design', language: 'CSS',
    description: 'Layouts that adapt smoothly to phones, tablets, and larger screens.',
    code: `.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}\n\n@media (max-width: 700px) {\n  .grid {\n    grid-template-columns: 1fr;\n  }\n}`
  },
  git: {
    icon: 'GIT', title: 'Git & GitHub', language: 'TERMINAL',
    description: 'Version control helps track changes and share work with a team.',
    code: `$ git status\n$ git add .\n$ git commit -m "Build responsive page"\n$ git push origin main`
  },
  ui: {
    icon: 'UX', title: 'UI fundamentals', language: 'CSS',
    description: 'Typography, spacing, color, and accessibility help make interfaces easy to use.',
    code: `:root {\n  --text: #36383b;\n  --accent: #6488a4;\n  --space: 1rem;\n}\n\nbutton:focus-visible {\n  outline: 3px solid var(--accent);\n  outline-offset: 3px;\n}`
  },
  learning: {
    icon: '+', title: 'Always learning', language: 'JAVASCRIPT',
    description: 'I keep exploring new tools and improving through hands-on projects.',
    code: `const keepLearning = (today) => {\n  return {\n    curiosity: "always on",\n    practice: today,\n    nextStep: "build something"\n  };\n};`
  }
};

const modal = $('#skillModal');
const closeButton = $('#modalClose');
const codeEl = $('#codeContent');
const copyCodeButton = $('#copyCode');
let lastFocusedElement = null;
let currentCode = '';
let typeTimer = null;
let copyResetTimer = null;

// Writes the code out a few characters at a time, so opening a skill feels like typing.
function typeCode(text) {
  clearTimeout(typeTimer);
  codeEl.textContent = '';
  if (reduceMotion) {
    codeEl.textContent = text;
    return;
  }
  const chunk = Math.max(1, Math.ceil(text.length / 60));
  let i = 0;
  (function step() {
    i = Math.min(text.length, i + chunk);
    codeEl.textContent = text.slice(0, i);
    if (i < text.length) typeTimer = setTimeout(step, 16);
  })();
}

function openSkill(skillName) {
  const skill = skills[skillName];
  if (!skill || !modal) return;

  lastFocusedElement = document.activeElement;
  currentCode = skill.code;

  $('#modalIcon').textContent = skill.icon;
  $('#modalTitle').textContent = skill.title;
  $('#modalDescription').textContent = skill.description;
  $('#codeLanguage').textContent = skill.language;
  if (copyCodeButton) copyCodeButton.textContent = 'Copy';
  typeCode(skill.code);

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  closeButton?.focus();
}

function closeSkill() {
  if (!modal) return;
  clearTimeout(typeTimer);
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastFocusedElement?.focus({ preventScroll: true });
}

$$('.skill[data-skill]').forEach((card) => {
  card.addEventListener('click', () => openSkill(card.dataset.skill));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSkill(card.dataset.skill);
    }
  });
});

closeButton?.addEventListener('click', closeSkill);
$('#projectLink')?.addEventListener('click', closeSkill);

modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeSkill();
});

copyCodeButton?.addEventListener('click', async () => {
  const ok = await copyText(currentCode);
  copyCodeButton.textContent = ok ? 'Copied' : 'Copy failed';
  clearTimeout(copyResetTimer);
  copyResetTimer = setTimeout(() => { copyCodeButton.textContent = 'Copy'; }, 1600);
});

// Escape closes the modal, and Tab stays inside it while it is open.
document.addEventListener('keydown', (event) => {
  if (!modal?.classList.contains('active')) return;

  if (event.key === 'Escape') {
    closeSkill();
    return;
  }

  if (event.key === 'Tab') {
    const focusable = $$('button, a[href]', modal).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});


/* =========================================================
   Navigation: dropdowns + mobile menu
========================================================= */

const nav = $('.nav');
const menuToggle = $('#menuToggle');
const dropdowns = $$('.nav-dropdown');

function closeDropdowns(except = null) {
  dropdowns.forEach((dropdown) => {
    if (dropdown === except) return;
    dropdown.classList.remove('open');
    $('.dropdown-toggle', dropdown)?.setAttribute('aria-expanded', 'false');
  });
}

function closeMenu() {
  nav?.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}

dropdowns.forEach((dropdown) => {
  const toggle = $('.dropdown-toggle', dropdown);
  toggle?.addEventListener('click', () => {
    const willOpen = !dropdown.classList.contains('open');
    closeDropdowns(dropdown);
    dropdown.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });

  $$('.dropdown-menu a', dropdown).forEach((link) => {
    link.addEventListener('click', () => {
      closeDropdowns();
      closeMenu();
    });
  });
});

menuToggle?.addEventListener('click', () => {
  const willOpen = !nav.classList.contains('menu-open');
  nav.classList.toggle('menu-open', willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
});

$$('.links > a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-dropdown')) closeDropdowns();
  if (!event.target.closest('.nav')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || modal?.classList.contains('active')) return;
  const openToggle = $('.nav-dropdown.open .dropdown-toggle');
  closeDropdowns();
  closeMenu();
  (openToggle || (nav?.classList.contains('menu-open') ? menuToggle : null))?.focus();
});

window.matchMedia('(min-width: 761px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});


/* =========================================================
   Scroll: progress bar, header border, active link
========================================================= */

const topbar = $('#topbar');
const progress = $('#progress');
let scrollTicking = false;

function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  topbar?.classList.toggle('scrolled', window.scrollY > 8);
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
updateScroll();

const navAnchors = $$('.links > a[href^="#"]');
const anchorsBySection = new Map();
navAnchors.forEach((anchor) => {
  const id = anchor.getAttribute('href').slice(1);
  if (!anchorsBySection.has(id)) anchorsBySection.set(id, []);
  anchorsBySection.get(id).push(anchor);
});

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((anchor) => {
      anchor.classList.remove('active');
      anchor.removeAttribute('aria-current');
    });
    (anchorsBySection.get(entry.target.id) || []).forEach((anchor) => {
      anchor.classList.add('active');
      anchor.setAttribute('aria-current', 'true');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

$$('main > section[id]').forEach((section) => spy.observe(section));


/* =========================================================
   Skill bars fill in when they scroll into view
========================================================= */

const skillGrid = $('.skill-grid');
if (skillGrid) {
  if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        skillGrid.classList.add('in-view');
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    barObserver.observe(skillGrid);
  } else {
    skillGrid.classList.add('in-view');
  }
}


/* =========================================================
   Hero: rotating role + pointer parallax
========================================================= */

const roles = ['Front-end Web Developer', 'Detail-minded builder', 'Curious learner'];
const roleWord = $('#roleWord');

if (roleWord && !reduceMotion) {
  let roleIndex = 0;
  let length = roles[0].length;
  let deleting = true;

  const step = () => {
    if (deleting) {
      length -= 1;
      roleWord.textContent = roles[roleIndex].slice(0, length);
      if (length === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(step, 350);
        return;
      }
      setTimeout(step, 28);
      return;
    }
    length += 1;
    roleWord.textContent = roles[roleIndex].slice(0, length);
    if (length === roles[roleIndex].length) {
      deleting = true;
      setTimeout(step, 2400);
      return;
    }
    setTimeout(step, 55);
  };

  setTimeout(step, 2800);
}

const hero = $('.hero');
const depthLayers = $$('[data-depth]');

if (hero && depthLayers.length && canHover && !reduceMotion) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = null;

  const loop = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    depthLayers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      layer.style.transform = `translate3d(${currentX * depth * 14}px, ${currentY * depth * 10}px, 0)`;
    });

    const settled = Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
    frame = settled ? null : requestAnimationFrame(loop);
  };

  const kick = () => { if (!frame) frame = requestAnimationFrame(loop); };

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    kick();
  });

  hero.addEventListener('pointerleave', () => {
    targetX = 0;
    targetY = 0;
    kick();
  });
}

// If the portrait file is missing, hide the broken image icon and keep the glow.
const portraitImg = $('.portrait img');
if (portraitImg) {
  const hideImg = () => { portraitImg.style.display = 'none'; };
  portraitImg.addEventListener('error', hideImg);
  if (portraitImg.complete && portraitImg.naturalWidth === 0) hideImg();
}


/* =========================================================
   Project cards: gentle tilt toward the pointer
========================================================= */

if (canHover && !reduceMotion) {
  $$('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', `${(px * 6).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  });
}


/* =========================================================
   Contact: copy email
========================================================= */

const copyEmail = $('#copyEmail');
const copyNote = $('#copyNote');
let noteTimer = null;

copyEmail?.addEventListener('click', async () => {
  const email = copyEmail.dataset.email;
  const ok = await copyText(email);
  if (copyNote) copyNote.textContent = ok ? `Copied ${email}` : `Couldn’t copy. My email is ${email}`;
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => { if (copyNote) copyNote.textContent = ''; }, 3000);
});