(() => {
  const destinations = window.MWAP_PORTFOLIO || [];
  const destinationSequence = [
    'delhi',
    'jaipur',
    'udaipur',
    'goa',
    'mumbai',
    'bangalore',
    'indore',
    'kolkata',
    'kochi',
    'thailand',
    'istanbul',
    'venice',
  ];
  const hiddenDestinationSlugs = new Set(['kolkata', 'kochi']);
  const sequencePosition = new Map(destinationSequence.map((slug, index) => [slug, index]));
  const orderedDestinations = destinations
    .filter(destination => !hiddenDestinationSlugs.has(destination.slug))
    .map((destination, originalIndex) => ({ destination, originalIndex }))
    .sort((a, b) => {
      const aPosition = sequencePosition.get(a.destination.slug) ?? destinationSequence.length + a.originalIndex;
      const bPosition = sequencePosition.get(b.destination.slug) ?? destinationSequence.length + b.originalIndex;
      return aPosition - bPosition;
    })
    .map(({ destination }) => destination);
const IMAGE_RATIOS = {
  "/assets/destinations/Indore.jpg": 1.5,
  "/assets/destinations/Istanbul/1.jpg": 1.0,
  "/assets/destinations/Istanbul/2.jpg": 1.0,
  "/assets/destinations/Istanbul/3.jpg": 1.221,
  "/assets/destinations/Istanbul/4.jpg": 1.5,
  "/assets/destinations/Istanbul/5.jpg": 1.5,
  "/assets/destinations/Kolkata/1.jpg": 1.0,
  "/assets/destinations/Kolkata/2.jpg": 1.0,
  "/assets/destinations/Kolkata/3.jpg": 1.0,
  "/assets/destinations/Kolkata/4.jpg": 1.0,
  "/assets/destinations/Kolkata/5.jpg": 1.0,
  "/assets/destinations/Mumbai/0Z0A8175.JPG": 1.5,
  "/assets/destinations/Mumbai/0Z0A8549.JPG": 1.5,
  "/assets/destinations/Mumbai/0Z0A8551.JPG": 1.5,
  "/assets/destinations/Mumbai/SPMO9881.JPG": 1.5,
  "/assets/destinations/Venice.webp": 1.5,
  "/assets/destinations/bangalore/1.jpg": 1.501,
  "/assets/destinations/bangalore/2.jpg": 1.459,
  "/assets/destinations/bangalore/3.png": 1.499,
  "/assets/destinations/bangalore/4.png": 1.495,
  "/assets/destinations/bangalore/5.png": 1.494,
  "/assets/hua-hin.jpeg": 1.501,
  "/assets/portfolio/delhi/bindya-shiven/01.jpg": 0.667,
  "/assets/portfolio/delhi/bindya-shiven/02.jpg": 1.501,
  "/assets/portfolio/delhi/bindya-shiven/03.jpg": 1.501,
  "/assets/portfolio/delhi/bindya-shiven/04.jpg": 1.778,
  "/assets/portfolio/delhi/bindya-shiven/05.jpg": 1.501,
  "/assets/portfolio/delhi/bindya-shiven/06.jpg": 1.501,
  "/assets/portfolio/delhi/bindya-shiven/07.jpg": 1.4,
  "/assets/portfolio/delhi/bindya-shiven/08.jpg": 0.666,
  "/assets/portfolio/delhi/bindya-shiven/09.jpg": 0.667,
  "/assets/portfolio/delhi/bindya-shiven/10.jpg": 0.667,
  "/assets/portfolio/delhi/mithali-arjun/01.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/02.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/03.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/04.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/05.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/06.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/07.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/08.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/09.jpg": 1.501,
  "/assets/portfolio/delhi/mithali-arjun/10.jpg": 0.667,
  "/assets/portfolio/delhi/tanvi-uday/01.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/02.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/03.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/04.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/05.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/06.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/07.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/08.jpg": 0.666,
  "/assets/portfolio/delhi/tanvi-uday/09.jpg": 1.501,
  "/assets/portfolio/delhi/tanvi-uday/10.jpg": 0.667,
  "/assets/portfolio/delhi/tanvi-uday/featured.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/01.jpg": 1.5,
  "/assets/portfolio/goa/juhi-jatin/02.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/03.jpg": 0.666,
  "/assets/portfolio/goa/juhi-jatin/04.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/05.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/06.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/07.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/08.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/09.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/10.jpg": 0.667,
  "/assets/portfolio/indore/juhi-jatin/01.jpg": 1.5,
  "/assets/portfolio/indore/juhi-jatin/02.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/03.jpg": 0.666,
  "/assets/portfolio/indore/juhi-jatin/04.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/05.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/06.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/07.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/08.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/09.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/10.jpg": 0.667,
  "/assets/portfolio/jaipur/manat-samrath/01.jpg": 1.501,
  "/assets/portfolio/jaipur/manat-samrath/02.jpg": 1.501,
  "/assets/portfolio/jaipur/manat-samrath/03.jpg": 1.501,
  "/assets/portfolio/jaipur/manat-samrath/04.jpg": 1.5,
  "/assets/portfolio/jaipur/manat-samrath/05.jpg": 1.5,
  "/assets/portfolio/jaipur/manat-samrath/06.jpg": 1.501,
  "/assets/portfolio/jaipur/manat-samrath/07.jpg": 0.666,
  "/assets/portfolio/jaipur/manat-samrath/08.jpg": 1.501,
  "/assets/portfolio/jaipur/manat-samrath/09.jpg": 0.666,
  "/assets/portfolio/jaipur/manat-samrath/10.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/01.jpg": 0.666,
  "/assets/portfolio/jaipur/meher-aman/02.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/03.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/04.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/05.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/06.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/07.jpg": 1.5,
  "/assets/portfolio/jaipur/meher-aman/08.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/09.jpg": 1.501,
  "/assets/portfolio/jaipur/meher-aman/10.jpg": 0.667,
  "/assets/portfolio/maroon-embossed-paw-trail.png": 1.777,
  "/assets/portfolio/udaipur/jigyasa-samar/01.jpg": 0.666,
  "/assets/portfolio/udaipur/jigyasa-samar/02.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/03.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/04.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/05.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/06.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/07.jpg": 1.501,
  "/assets/portfolio/udaipur/jigyasa-samar/08.jpg": 1.5,
  "/assets/portfolio/udaipur/jigyasa-samar/09.jpg": 1.778,
  "/assets/portfolio/udaipur/jigyasa-samar/10.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/01.jpg": 1.501,
  "/assets/portfolio/udaipur/sehaj-harsimar/02.jpg": 0.666,
  "/assets/portfolio/udaipur/sehaj-harsimar/03.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/04.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/05.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/06.jpg": 1.501,
  "/assets/portfolio/udaipur/sehaj-harsimar/07.jpg": 1.4,
  "/assets/portfolio/udaipur/sehaj-harsimar/08.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/09.jpg": 0.667,
  "/assets/portfolio/udaipur/sehaj-harsimar/10.jpg": 1.5,
  "/assets/portfolio/udaipur/sehaj-harsimar/featured.jpg": 0.667,
  "/assets/portfolio/thailand/ritika-manav/01.jpg": 0.665,
  "/assets/portfolio/thailand/ritika-manav/02.jpg": 1.502,
  "/assets/portfolio/thailand/ritika-manav/03.jpg": 0.665,
  "/assets/portfolio/thailand/ritika-manav/04.jpg": 0.665,
  "/assets/portfolio/thailand/ritika-manav/05.jpg": 1.502,
  "/assets/portfolio/thailand/ritika-manav/06.jpg": 1.502,
  "/assets/portfolio/thailand/ritika-manav/07.jpg": 0.666,
  "/assets/portfolio/thailand/ritika-manav/08.jpg": 1.502,
  "/assets/portfolio/thailand/ritika-manav/09.jpg": 0.666,
  "/assets/portfolio/goa/juhi-jatin/featured.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/haldi-stage.jpg": 1.501,
  "/assets/portfolio/goa/juhi-jatin/haldi-tables.jpg": 0.666,
  "/assets/portfolio/goa/juhi-jatin/wedding-pavilion.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/featured.jpg": 1.5,
  "/assets/portfolio/indore/juhi-jatin/floral-stage.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/day-celebration.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/day-games.jpg": 1.501,
  "/assets/portfolio/indore/juhi-jatin/bride-entry.jpg": 1.501
};

Object.assign(IMAGE_RATIOS, window.MWAP_CURATED_RATIOS || {}, window.MWAP_DRIVE_RATIOS || {});

  const root = document.querySelector('#portfolio-app');
  if (!root) return;

  const page = document.body.dataset.page || 'portfolio';
  const destinationSlug = document.body.dataset.destination;
  const eventSlug = document.body.dataset.event;

  const header = `
    <header class="site-header">
      <a class="brand" href="/story.html" aria-label="Man With A Plan home"><img src="/assets/mwp-recognition-logo.png?v=2" alt="Man With A Plan"></a>
      <nav class="header-links" aria-label="Primary navigation">
        <a href="/mwp/">MWP</a>
        <a href="/portfolio/" aria-current="page">Portfolio</a>
        <a href="/story.html#pursuit">Our Process</a>
        <a href="/contact/">Contact Us</a>
      </nav>
    </header>`;

  const footer = `
    <footer class="site-footer">
      <span>Man With A Plan</span>
      <span>Celebrations across the world</span>
    </footer>`;

  const card = (destination) => {
    const tag = destination.comingSoon ? 'article' : 'a';
    const href = destination.comingSoon ? '' : ` href="/portfolio/${destination.slug}/"`;
    const storyCount = destination.comingSoon
      ? 'Coming soon'
      : `${String(destination.events.length).padStart(2, '0')} ${destination.events.length === 1 ? 'story' : 'stories'}`;
    return `
    <${tag} class="destination-card${destination.comingSoon ? ' destination-card-coming-soon' : ''} reveal"${href}>
      <div class="card-image"><img src="${destination.cover}" alt="Celebration in ${destination.name}" loading="lazy"></div>
      <div class="card-meta"><h2>${destination.name}</h2><span>${storyCount}</span></div>
    </${tag}>`;
  };

  const renderPortfolio = () => {
    document.title = 'Our Work — Man With A Plan';
    root.innerHTML = `${header}
      <main>
        <section class="portfolio-hero">
          <div class="portfolio-hero-slideshow" aria-hidden="true">
            <img class="is-visible" alt="">
            <img alt="">
          </div>
          <div class="hero-copy">
            <p class="eyebrow">Man With A Plan presents</p>
            <h1>OUR WORK</h1>
            <p class="hero-intro">Stories of celebration, shaped by place and remembered through feeling.</p>
          </div>
          <span class="scroll-cue">Explore destinations</span>
        </section>
        <section class="portfolio-section">
          <div class="section-heading reveal"><p class="eyebrow">The journey so far</p><h2>DESTINATIONS</h2></div>
          <div class="destination-grid">${orderedDestinations.map(card).join('')}</div>
        </section>
      </main>${footer}`;
  };

  const setupPortfolioHeroSlideshow = () => {
    const slideshow = document.querySelector('.portfolio-hero-slideshow');
    const frames = Array.from(slideshow?.querySelectorAll('img') || []);
    const sources = orderedDestinations.map(destination => destination.cover).filter(Boolean);
    if (!slideshow || frames.length !== 2 || !sources.length) return;

    let currentIndex = 0;
    let visibleFrame = 0;
    frames[0].src = sources[0];

    if (sources.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.setInterval(() => {
      const nextIndex = (currentIndex + 1) % sources.length;
      const incomingIndex = visibleFrame === 0 ? 1 : 0;
      const incoming = frames[incomingIndex];
      const outgoing = frames[visibleFrame];
      let revealed = false;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        incoming.classList.add('is-visible');
        outgoing.classList.remove('is-visible');
        currentIndex = nextIndex;
        visibleFrame = incomingIndex;
      };
      incoming.onload = reveal;
      incoming.src = sources[nextIndex];
      if (incoming.complete) reveal();
    }, 4000);
  };

  const renderDestination = () => {
    const destination = destinations.find(item => item.slug === destinationSlug);
    if (!destination) return renderNotFound();
    document.title = `${destination.name} — Man With A Plan`;
    const events = destination.events.map(event => `
      <a class="event-card event-card-${event.slug} reveal" href="/portfolio/${destination.slug}/${event.slug}/">
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

    const sourceImages = event.images || [];
    // The data source is ordered exactly as the numbered images appear in Drive.
    const images = sourceImages;

    const createButton = (src, index, customRatio, isFeatured = false) => {
      const ratio = customRatio || IMAGE_RATIOS[src] || 1.5;
      const style = isFeatured ? '' : ` style="--image-ratio: ${Number(ratio).toFixed(3)}; aspect-ratio: ${Number(ratio).toFixed(3)};"`;
      return `
        <button class="gallery-button${isFeatured ? ' is-featured' : ''}" type="button" data-image="${src}"${style} aria-label="Open image ${index + 1} of ${images.length}">
          <img src="${src}" alt="${event.title}, photograph ${index + 1}" loading="${index < 2 ? 'eager' : 'lazy'}">
        </button>`;
    };

    let galleryMarkup = '';
    if (images.length === 1) {
      galleryMarkup = `
        <section class="gallery gallery-single" aria-label="Event gallery">
          ${createButton(images[0], 0, 16 / 9, true)}
        </section>`;
    } else {
      const rows = Array.from({ length: Math.ceil(images.length / 2) }, (_, rowIndex) =>
        images.slice(rowIndex * 2, rowIndex * 2 + 2)
      );
      galleryMarkup = `
        <section class="gallery gallery-sequence" aria-label="Event gallery">
          ${rows.map((row, rowIndex) => `
            <div class="gallery-row${row.length === 1 ? ' is-incomplete' : ''}">
              ${row.map((src, index) => createButton(src, rowIndex * 2 + index)).join('')}
            </div>`).join('')}
        </section>`;
    }

    const writeupParagraphs = event.writeup
      ? event.writeup
          .split(/\n\n+|\n/)
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => `<p>${p}</p>`)
          .join('')
      : '';

    root.innerHTML = `${header}
      <main>
        <section class="detail-hero">
          <div class="detail-hero-media"><img src="${event.cover}" alt=""></div>
          <div class="hero-copy"><p class="eyebrow">${event.label}</p><h1>${event.title}</h1></div>
        </section>
        ${galleryMarkup}
        ${event.writeup ? `
        <section class="story-words-section reveal">
          <div class="story-words-inner">
            <p class="story-words-kicker">In their words</p>
            <blockquote class="story-words-quote">
              ${writeupParagraphs}
              ${event.author ? `<cite>— ${event.author}</cite>` : ''}
            </blockquote>
          </div>
        </section>` : ''}
        <div class="story-back-section reveal">
          <a class="back-link" href="/portfolio/${destination.slug}/">← Back to ${destination.name}</a>
        </div>
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
  else {
    renderPortfolio();
    setupPortfolioHeroSlideshow();
  }

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('is-visible'));
  }
})();
