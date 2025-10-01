// Lightweight FAQ behaviors: search, expand/collapse, copy answer, report
document.addEventListener('DOMContentLoaded', function () {
  const faqList = document.getElementById('faqList');
  const search = document.getElementById('faqSearch');
  const expandAll = document.getElementById('expandAll');
  const collapseAll = document.getElementById('collapseAll');

  let items = [];

  function renderFAQs(data) {
    faqList.innerHTML = '';
    data.forEach((entry, idx) => {
      const div = document.createElement('div');
      div.className = 'faq-item';
      div.dataset.keywords = entry.keywords || '';
      div.innerHTML = `
        <div class="faq-question" role="button" aria-expanded="false" tabindex="0">
          <h3>${entry.q}</h3>
          <div class="faq-actions"><span class="faq-meta">+ More</span></div>
        </div>
        <div class="faq-answer" id="answer-${idx}" aria-hidden="true">
          <p>${entry.a}</p>
          <div style="margin-top:0.6rem; display:flex; gap:0.6rem;">
            <button class="small-btn" onclick="copyText(this)">Copy Answer</button>
            <button class="small-btn" onclick="reportQuestion(this)">Report</button>
          </div>
        </div>
      `;
      faqList.appendChild(div);
    });
    items = Array.from(document.querySelectorAll('.faq-item'));
  }

  // Fetch JSON and render
  fetch('/static/faqs.json').then(r => r.json()).then(data => {
    const loading = document.getElementById('faqLoading');
    if (loading) loading.remove();
    renderFAQs(data);

    // Toggle on click or Enter key
    faqList.addEventListener('click', function (e) {
      const q = e.target.closest('.faq-question');
      if (!q) return;
      const item = q.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.toggle('open');
      q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (answer) answer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });
    faqList.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const q = e.target.closest('.faq-question');
        if (!q) return;
        q.click();
      }
    });

    // Expand/Collapse all
    expandAll.addEventListener('click', function () {
      items.forEach(i => {
        i.classList.add('open');
        const q = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'true');
        if (a) a.setAttribute('aria-hidden', 'false');
      });
    });
    collapseAll.addEventListener('click', function () {
      items.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        const a = i.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.setAttribute('aria-hidden', 'true');
      });
    });

    // Search/filter
    search.addEventListener('input', function () {
      const qv = search.value.trim().toLowerCase();
      items.forEach(i => {
        const keywords = (i.dataset.keywords || '') + ' ' + (i.querySelector('h3')?.innerText || '') + ' ' + (i.querySelector('.faq-answer')?.innerText || '');
        if (!qv || keywords.toLowerCase().indexOf(qv) !== -1) {
          i.style.display = '';
        } else {
          i.style.display = 'none';
        }
      });
    });

  }).catch(err => {
    const loading = document.getElementById('faqLoading');
    if (loading) loading.innerText = 'Failed to load FAQs.';
    console.error('Failed to load FAQs:', err);
  });

});

function copyText(btn) {
  const answer = btn.closest('.faq-item').querySelector('.faq-answer');
  if (!answer) return;
  const text = answer.innerText.trim();
  navigator.clipboard?.writeText(text).then(() => {
    btn.innerText = 'Copied';
    setTimeout(() => btn.innerText = 'Copy Answer', 1500);
  }).catch(() => {
    alert('Copy failed — please select and copy manually.');
  });
}

function reportQuestion(btn) {
  const q = btn.closest('.faq-item').querySelector('h3')?.innerText || 'this question';
  const payload = { question: q, page: window.location.pathname };
  fetch('/faq/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(res => res.json()).then(data => {
    if (data && data.status === 'ok') {
      btn.innerText = 'Reported';
      setTimeout(() => btn.innerText = 'Report', 1500);
    } else {
      alert('Report failed — please email support.');
    }
  }).catch(err => {
    console.error('Report error', err);
    alert('Report failed — please email support.');
  });
}
