(() => {
  const button = document.querySelector('#collab-motion');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const setPaused = (paused) => {
    document.body.classList.toggle('motion-paused', paused);
    button.setAttribute('aria-pressed', String(paused));
    button.innerHTML = paused ? 'Resume motion <span aria-hidden="true">▷</span>' : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
  };
  document.querySelectorAll('.collab-group').forEach((group) => {
    const copy = group.cloneNode(true);
    copy.classList.add('collab-copy');
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    group.parentElement.append(copy);
  });
  document.querySelectorAll('.collab-brand img').forEach((img) => {
    img.addEventListener('error', () => {
      const label = img.parentElement.querySelector('.brand-caption');
      label.className = 'collab-wordmark';
      img.remove();
    });
  });
  setPaused(motion.matches);
  document.body.classList.add('collab-ready');
  button.hidden = motion.matches;
  button.addEventListener('click', () => setPaused(!document.body.classList.contains('motion-paused')));
  motion.addEventListener('change', (event) => {
    setPaused(event.matches);
    button.hidden = event.matches;
  });
})();
