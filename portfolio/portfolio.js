(() => {
  const destinations = window.MWAP_PORTFOLIO || [];
  const root = document.querySelector('#portfolio-app');
  if (!root) return;

  const page = document.body.dataset.page || 'portfolio';
  const destinationSlug = document.body.dataset.destination;
  const eventSlug = document.body.dataset.event;

  const header = `
    <header class="site-header">
      <a class="brand" href="/" aria-label="Man With A Plan home"><img src="/assets/mwp-recognition-logo.png?v=2" alt="Man With A Plan"></a>
      <a class="header-link" href="/portfolio/">All destinations</a>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <span>Man With A Plan</span>
      <span>Celebrations across the world</span>
    </footer>`;

  const card = (destination) => `
    <a class="destination-card reveal" href="/portfolio/${destination.slug}/">
      <div class="card-image"><img src="${destination.cover}" alt="Celebration in ${destination.name}" loading="lazy"></div>
      <div class="card-meta"><h2>${destination.name}</h2><span>${String(destination.events.length).padStart(2, '0')} ${destination.events.length === 1 ? 'story' : 'stories'}</span></div>
    </a>`;

  const renderPortfolio = () => {
    document.title = 'Our Work — Man With A Plan';
    root.innerHTML = `${header}
      <main>
        <section class="portfolio-hero">
          <div class="hero-copy">
            <p class="eyebrow">Man With A Plan presents</p>
            <h1>Our Work</h1>
            <p class="hero-intro">Stories of celebration, shaped by place and remembered through feeling.</p>
          </div>
          <span class="scroll-cue">Explore destinations</span>
        </section>
        <section class="portfolio-section">
          <div class="section-heading reveal"><p class="eyebrow">The journey so far</p><h2>Destinations</h2></div>
          <div class="destination-grid">${destinations.map(card).join('')}</div>
        </section>
      </main>${footer}`;
  };

  const renderDestination = () => {
    const destination = destinations.find(item => item.slug === destinationSlug);
    if (!destination) return renderNotFound();
    document.title = `${destination.name} — Man With A Plan`;
    const events = destination.events.map(event => `
      <a class="event-card reveal" href="/portfolio/${destination.slug}/${event.slug}/">
        <div class="card-image"><img src="${event.cover}" alt="${event.title}" loading="lazy"></div>
        <div class="card-meta"><h3>${event.title}</h3><span>View story</span></div>
      </a>`).join('');
    root.innerHTML = `${header}
      <main>
        <section class="detail-hero">
          <div class="detail-hero-media"><img src="${destination.cover}" alt=""></div>
          <div class="hero-copy"><p class="eyebrow">Destination</p><h1>${destination.name}</h1><p class="hero-intro">${destination.intro}</p></div>
        </section>
        <section class="portfolio-section">
          <div class="section-heading reveal"><p class="eyebrow">Selected work</p><h2>Stories from ${destination.name}</h2><p>Step inside the celebrations we have created in this destination.</p></div>
          <div class="event-grid">${events}</div>
          <a class="back-link" href="/portfolio/">← All destinations</a>
        </section>
      </main>${footer}`;
  };

  const renderEvent = () => {
    const destination = destinations.find(item => item.slug === destinationSlug);
    const event = destination?.events.find(item => item.slug === eventSlug);
    if (!destination || !event) return renderNotFound();
    document.title = `${event.title} — Man With A Plan`;
    const images = event.images.map((src, index) => `
      <button class="gallery-button reveal" type="button" data-image="${src}" aria-label="Open image ${index + 1} of ${event.images.length}">
        <img src="${src}" alt="${event.title}, photograph ${index + 1}" loading="${index < 2 ? 'eager' : 'lazy'}">
      </button>`).join('');
    root.innerHTML = `${header}
      <main>
        <section class="detail-hero">
          <div class="detail-hero-media"><img src="${event.cover}" alt=""></div>
          <div class="hero-copy"><p class="eyebrow">${event.label}</p><h1>${event.title}</h1></div>
        </section>
        <section class="story-intro reveal">
          <div><p class="eyebrow">The story</p><h2>A moment,<br>made lasting.</h2></div>
          <div class="story-intro-copy"><p>${event.writeup}</p><a class="back-link" href="/portfolio/${destination.slug}/">← More from ${destination.name}</a></div>
        </section>
        <section class="gallery" aria-label="Event gallery">${images}</section>
      </main>${footer}
      <div class="lightbox" hidden role="dialog" aria-modal="true" aria-label="Image viewer"><button class="lightbox-close" type="button" aria-label="Close">×</button><img src="" alt=""></div>`;
    setupLightbox();
  };

  const renderNotFound = () => {
    document.title = 'Not found — Man With A Plan';
    root.innerHTML = `${header}<main><section class="portfolio-hero"><div class="hero-copy"><p class="eyebrow">Not found</p><h1>Lost trail</h1><p class="hero-intro">This story is not available yet.</p><a class="back-link" href="/portfolio/">← Return to the portfolio</a></div></section></main>${footer}`;
  };

  const setupLightbox = () => {
    const lightbox = document.querySelector('.lightbox');
    const image = lightbox?.querySelector('img');
    if (!lightbox || !image) return;
    const close = () => { lightbox.hidden = true; image.src = ''; document.body.style.overflow = ''; };
    document.querySelectorAll('.gallery-button').forEach(button => button.addEventListener('click', () => {
      image.src = button.dataset.image;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox-close').focus();
    }));
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  };

  if (page === 'destination') renderDestination();
  else if (page === 'event') renderEvent();
  else renderPortfolio();

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
})();
