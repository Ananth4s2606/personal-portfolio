const menu = document.querySelector('.menu');
const nav = document.querySelector('#primary-navigation');
const navLinks = nav ? nav.querySelectorAll('a') : [];

function setMenuOpen(open) {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
}

menu?.addEventListener('click', () => {
  const isOpen = menu.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menu.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 850) setMenuOpen(false);
});
