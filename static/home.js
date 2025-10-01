// Home page interactions: carousel, lazy loading, lightbox, stats counter, inquiry modal
document.addEventListener('DOMContentLoaded', () => {
  // Lazy load images
  const lazyImages = Array.from(document.querySelectorAll('img.lazy'));
  const onIntersection = (entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load', () => img.classList.add('loaded'));
        obs.unobserve(img);
      }
    });
  };
  const io = new IntersectionObserver(onIntersection, { root: null, threshold: 0.1 });
  lazyImages.forEach(img => io.observe(img));

  // Lightbox for images
  const modal = document.getElementById('inquiryModal');
  const lightbox = (e) => {
    const src = e.target.src || e.target.dataset.src;
    if (!src) return;
    // reuse modal for image preview
    const modalContent = modal.querySelector('.modal-content');
    const old = modalContent.querySelector('.lightbox-view');
    if (old) old.remove();
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '100%';
    img.className = 'lightbox-view';
    modalContent.insertBefore(img, modalContent.firstChild);
    modal.setAttribute('aria-hidden', 'false');
  };
  document.querySelectorAll('.lightbox-img').forEach(img => img.addEventListener('click', lightbox));

  // Modal close
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
    const img = modal.querySelector('.lightbox-view'); if (img) img.remove();
  });
  document.getElementById('inquiryCancel').addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));

  // Inquiry form (simple client-side email via mailto fallback)
  const inquiryForm = document.getElementById('inquiryForm');
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(inquiryForm);
    const name = fd.get('name');
    const email = fd.get('email');
    const message = fd.get('message');
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${message}`;
    window.location.href = `mailto:info@shanghaiapexgelatin.com?subject=Quick%20Inquiry&body=${body}`;
  });

  // Carousel basic
  const track = document.querySelector('.carousel-track');
  if (track) {
    let index = 0;
    const items = Array.from(track.children);
    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');
    const show = i => { track.style.transform = `translateX(-${i * (items[0].clientWidth)}px)`; };
    prev.addEventListener('click', () => { index = (index - 1 + items.length) % items.length; show(index); });
    next.addEventListener('click', () => { index = (index + 1) % items.length; show(index); });
    window.addEventListener('resize', () => show(index));
  }

  // Stats counters
  const counters = document.querySelectorAll('.stat-number');
  const runCounters = () => {
    counters.forEach(el => {
      const target = +el.dataset.target;
      const duration = 1400;
      const start = 0;
      const stepTime = Math.max(10, Math.floor(duration / target));
      let current = start;
      const timer = setInterval(() => {
        current += Math.ceil(target / (duration / stepTime));
        if (current >= target) { el.innerText = target; clearInterval(timer); }
        else el.innerText = current;
      }, stepTime);
    });
  };
  // Trigger when visible
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) {
    const statObs = new IntersectionObserver((entries, o) => {
      entries.forEach(en => { if (en.isIntersecting) { runCounters(); o.disconnect(); } });
    }, { threshold: 0.4 });
    statObs.observe(statsSection);
  }

});
