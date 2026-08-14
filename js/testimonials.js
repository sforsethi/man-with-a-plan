const carousel = document.querySelector('[data-testimonials-carousel]');

if (carousel) {
  const track = carousel.querySelector('.testimonials-track');
  const slides = [...carousel.querySelectorAll('.testimonial-slide')];
  const previous = carousel.querySelector('[data-testimonial-prev]');
  const next = carousel.querySelector('[data-testimonial-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer;
  let touchStartX = 0;

  carousel.tabIndex = 0;

  function show(index, userInitiated = false) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', String(slideIndex !== current));
    });

    if (userInitiated) restart();
  }

  function advance(direction = 1, userInitiated = false) {
    show(current + direction, userInitiated);
  }

  function stop() {
    window.clearInterval(timer);
  }

  function start() {
    if (reduceMotion) return;
    stop();
    timer = window.setInterval(() => advance(), 7000);
  }

  function restart() {
    stop();
    start();
  }

  previous.addEventListener('click', () => advance(-1, true));
  next.addEventListener('click', () => advance(1, true));
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') advance(-1, true);
    if (event.key === 'ArrowRight') advance(1, true);
  });
  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) advance(distance > 0 ? -1 : 1, true);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  show(0);
  start();
}
