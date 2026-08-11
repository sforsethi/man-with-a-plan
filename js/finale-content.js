const counters = Array.from(document.querySelectorAll('.count-up[data-count]'));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderCount(counter, value) {
  counter.textContent = Math.round(value).toLocaleString('en-IN');
}

function animateCount(counter) {
  const target = Number(counter.dataset.count);
  if (!Number.isFinite(target)) return;

  const duration = 3000;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    renderCount(counter, target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

let countersStarted = false;

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach(animateCount);
}

if (reduceMotion) {
  counters.forEach((counter) => renderCount(counter, Number(counter.dataset.count)));
} else {
  counters.forEach((counter) => renderCount(counter, 0));
  window.addEventListener('mwp:finale-visible', startCounters, { once: true });
  if (document.getElementById('final-metrics')?.classList.contains('is-visible')) startCounters();
}

document.querySelectorAll('[data-current-year]').forEach((year) => {
  year.textContent = String(new Date().getFullYear());
});
