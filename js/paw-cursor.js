(() => {
  const finePointer = window.matchMedia('(pointer: fine)');
  if (!finePointer.matches || document.documentElement.dataset.pawCursorReady) return;

  document.documentElement.dataset.pawCursorReady = 'true';

  const style = document.createElement('style');
  style.textContent = `
    html.paw-cursor-active,
    html.paw-cursor-active *,
    html.paw-cursor-active *::before,
    html.paw-cursor-active *::after {
      cursor: none !important;
    }

    .paw-cursor-visual {
      position: fixed;
      z-index: 2147483647;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      image-rendering: auto;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);

  const paw = new Image();
  paw.className = 'paw-cursor-visual';
  paw.alt = '';
  paw.setAttribute('aria-hidden', 'true');
  paw.decoding = 'async';
  paw.draggable = false;

  let x = -100;
  let y = -100;
  let visible = false;
  let mounted = false;
  let frame = 0;

  const render = () => {
    frame = 0;
    if (!mounted) return;
    paw.style.transform = `translate3d(${Math.round(x - 15)}px, ${Math.round(y - 14)}px, 0)`;
    paw.style.opacity = visible ? '1' : '0';
  };

  const scheduleRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const updatePosition = (event) => {
    if (event.pointerType === 'touch') return;
    x = event.clientX;
    y = event.clientY;
    visible = true;
    scheduleRender();
  };

  const hide = () => {
    visible = false;
    scheduleRender();
  };

  const mount = () => {
    if (mounted) return;
    document.documentElement.appendChild(paw);
    document.documentElement.classList.add('paw-cursor-active');
    mounted = true;
    scheduleRender();
  };

  window.addEventListener('pointermove', updatePosition, { capture: true, passive: true });
  window.addEventListener('pointerdown', updatePosition, { capture: true, passive: true });
  window.addEventListener('pointerup', updatePosition, { capture: true, passive: true });
  window.addEventListener('blur', hide);
  document.addEventListener('pointerleave', hide);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
  });

  paw.addEventListener('load', mount, { once: true });
  paw.src = '/assets/cheetah-paw-cursor-hires.png?v=1';
  if (paw.complete && paw.naturalWidth) mount();
})();
