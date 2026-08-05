const overlay = document.getElementById('work-gallery');
const trigger = document.getElementById('open-work-gallery');

if (overlay && trigger) {
  const closeBtn = document.getElementById('work-gallery-close');
  const stage = document.getElementById('work-gallery-stage');
  const ring = document.getElementById('work-gallery-ring');
  const items = Array.from(ring.querySelectorAll('.work-gallery-item'));
  const prevBtn = document.getElementById('work-gallery-prev');
  const nextBtn = document.getElementById('work-gallery-next');
  const badgeEl = document.getElementById('work-gallery-badge');
  const titleEl = document.getElementById('work-gallery-title');
  const descEl = document.getElementById('work-gallery-desc');

  const angleStep = 360 / items.length;
  let radius = 420;
  let currentRotation = 0;
  let targetRotation = 0;
  let lastActiveIndex = -1;
  let rafId = null;
  let isOpen = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartRotation = 0;

  function getRadius() {
    const base = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(240, Math.min(base * 0.42, 520));
  }

  function updateRadius() {
    radius = getRadius();
  }

  function normalizeAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }

  function updateCaption(index) {
    const item = items[index];
    if (!item) return;
    badgeEl.textContent = item.dataset.badge || '';
    titleEl.textContent = item.dataset.title || '';
    descEl.textContent = item.dataset.desc || '';
  }

  function render() {
    currentRotation += (targetRotation - currentRotation) * 0.12;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    items.forEach((item, index) => {
      const itemAngle = index * angleStep;
      const effective = normalizeAngle(itemAngle + currentRotation);
      const distance = Math.abs(effective) / 180;

      // Position the card on the circle at `effective`, then cancel that
      // same rotation so the card keeps facing the camera (billboarded)
      // instead of spinning edge-on as the ring rotates.
      item.style.transform =
        `translate(-50%, -50%) rotateY(${effective}deg) translateZ(${radius}px) rotateY(${-effective}deg)`;
      item.style.filter = `blur(${distance * 9}px) grayscale(${distance * 100}%)`;
      item.style.opacity = String(1 - distance * 0.6);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== lastActiveIndex) {
      lastActiveIndex = nearestIndex;
      updateCaption(nearestIndex);
    }

    if (isOpen) {
      rafId = requestAnimationFrame(render);
    }
  }

  function step(direction) {
    targetRotation += direction * angleStep;
  }

  function onWheel(event) {
    if (!isOpen) return;
    event.preventDefault();
    const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    targetRotation += delta * 0.25;
  }

  function onPointerDown(event) {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartRotation = targetRotation;
    stage.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!isDragging) return;
    const deltaX = event.clientX - dragStartX;
    targetRotation = dragStartRotation - deltaX * 0.4;
  }

  function onPointerUp(event) {
    isDragging = false;
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  }

  function onKeydown(event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      closeGallery();
    } else if (event.key === 'ArrowLeft') {
      step(1);
    } else if (event.key === 'ArrowRight') {
      step(-1);
    }
  }

  function openGallery() {
    isOpen = true;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    currentRotation = 0;
    targetRotation = 0;
    lastActiveIndex = -1;
    updateRadius();
    updateCaption(0);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(render);
    closeBtn.focus();
  }

  function closeGallery() {
    isOpen = false;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (rafId) cancelAnimationFrame(rafId);
    trigger.focus();
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openGallery();
  });

  closeBtn.addEventListener('click', closeGallery);
  prevBtn.addEventListener('click', () => step(1));
  nextBtn.addEventListener('click', () => step(-1));

  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerUp);

  window.addEventListener('resize', () => {
    if (isOpen) updateRadius();
  });
  window.addEventListener('keydown', onKeydown);
}
