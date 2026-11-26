/* WooDMooD — nouveau site : scripts communs à toutes les pages */
(function () {
  /* ── Menu mobile ── */
  var nav = document.getElementById('headerNav');
  var toggle = document.getElementById('navToggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  /* ── Lien actif dans le menu ── */
  if (nav) {
    var here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    /* sous-rubrique de la page en cours, en orange dans le menu déroulant */
    nav.querySelectorAll('.nav-sub a').forEach(function (a) {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });
    nav.querySelectorAll('.nav-link').forEach(function (a) {
      var href = a.getAttribute('href') || a.getAttribute('data-section');
      if (href === here || (href !== '/' && here.indexOf(href + '/') === 0)) a.setAttribute('aria-current', 'page');
    });
    /* titre en orange aussi quand la page en cours est l’une de ses sous-rubriques (ex. Showrooms sous Contact) */
    nav.querySelectorAll('.nav-sub a[aria-current]').forEach(function (a) {
      var link = a.closest('.nav-item') && a.closest('.nav-item').querySelector('.nav-link');
      if (link) link.setAttribute('aria-current', 'page');
    });
  }

  /* ── "WooDMooD" à la largeur exacte du logo (header + footer) ── */
  function fitBrandName() {
    var logo = document.getElementById('brandLogo');
    var name = document.getElementById('brandName');
    if (!logo || !name || !logo.offsetWidth) return;
    var lo = 6, hi = 80, mid;
    name.style.letterSpacing = '0.06em';
    for (var i = 0; i < 20; i++) {
      mid = (lo + hi) / 2;
      name.style.fontSize = mid + 'px';
      if (name.offsetWidth < logo.offsetWidth) lo = mid; else hi = mid;
    }
    name.style.fontSize = lo + 'px';
    var fb = document.querySelector('.footer-brand');
    if (!fb) return;
    fb.style.letterSpacing = name.style.letterSpacing;
    if (name.offsetWidth && lo < 79) { fb.style.fontSize = name.style.fontSize; return; }
    /* nom masqué ou de taille fixe dans le header (mobile) : on cale le nom du pied de page sur son propre logo */
    var fl = document.querySelector('.footer-logo');
    if (!fl || !fl.offsetWidth) { fb.style.fontSize = ''; return; }
    lo = 6; hi = 80;
    var disp = fb.style.display;
    fb.style.display = 'inline-block';           /* mesure la largeur du texte, pas celle du bloc */
    for (var j = 0; j < 20; j++) {
      mid = (lo + hi) / 2;
      fb.style.fontSize = mid + 'px';
      if (fb.offsetWidth < fl.offsetWidth) lo = mid; else hi = mid;
    }
    fb.style.display = disp;
    fb.style.fontSize = lo + 'px';
  }
  window.addEventListener('load', fitBrandName);
  window.addEventListener('resize', fitBrandName);

  /* ── Diaporamas : tout conteneur [data-slideshow] fait défiler ses .slide / .alt-slide ── */
  document.querySelectorAll('[data-slideshow]').forEach(function (box) {
    var slides = box.querySelectorAll(':scope > .slide, :scope > .alt-slide');
    if (slides.length < 2) return;
    var delay = parseInt(box.getAttribute('data-slideshow'), 10) || 2000;
    var cur = 0, dots = [];
    if (box.hasAttribute('data-dots')) {
      var wrap = document.createElement('div');
      wrap.className = 'photo-dots';
      slides.forEach(function (_, i) { var d = document.createElement('span'); if (!i) d.className = 'on'; wrap.appendChild(d); dots.push(d); });
      box.appendChild(wrap);
    }
    setInterval(function () {
      slides[cur].classList.remove('active');
      if (dots.length) dots[cur].classList.remove('on');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('active');
      if (dots.length) dots[cur].classList.add('on');
    }, delay);
  });

  /* ── Bandeaux défilants : on duplique le contenu une fois pour une boucle sans saut ── */
  document.querySelectorAll('[data-marquee]').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (el) {
      var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
    });
  });

  /* ── Bandeau cookies ── */
  var banner = document.getElementById('cookieBanner');
  if (banner) {
    var KEY = 'wm_cookie_consent', stored;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
    if (!stored) banner.classList.remove('hidden');
    var setConsent = function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} banner.classList.add('hidden'); };
    document.getElementById('cookieAccept').addEventListener('click', function () { setConsent('accepted'); });
    document.getElementById('cookieRefuse').addEventListener('click', function () { setConsent('refused'); });
  }
})();

/* ── Fenêtre photo (lightbox) : tout [data-gallery] contenant des boutons [data-full] ── */
(function () {
  var groups = document.querySelectorAll('[data-gallery]');
  if (!groups.length) return;
  var box = document.createElement('div');
  box.className = 'lightbox'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
  box.innerHTML = '<img class="lightbox-img" alt="">' +
    '<button type="button" class="lightbox-btn lightbox-close" aria-label="Fermer">×</button>' +
    '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Photo précédente">‹</button>' +
    '<button type="button" class="lightbox-btn lightbox-next" aria-label="Photo suivante">›</button>' +
    '<p class="lightbox-count"></p>';
  document.body.appendChild(box);
  var img = box.querySelector('.lightbox-img'), count = box.querySelector('.lightbox-count');
  var prev = box.querySelector('.lightbox-prev'), next = box.querySelector('.lightbox-next');
  var items = [], cur = 0, opener = null;
  function show(i) {
    cur = (i + items.length) % items.length;
    img.src = items[cur].getAttribute('data-full');
    img.alt = (items[cur].querySelector('img') || {}).alt || '';
    count.textContent = items.length > 1 ? (cur + 1) + ' / ' + items.length : '';
    prev.hidden = next.hidden = items.length < 2;
  }
  function close() { box.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); }
  groups.forEach(function (g) {
    var btns = Array.prototype.slice.call(g.querySelectorAll('[data-full]'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        items = btns; opener = b; box.setAttribute('aria-label', g.getAttribute('data-gallery') || 'Photos');
        show(i); box.hidden = false; document.body.style.overflow = 'hidden';
        box.querySelector('.lightbox-close').focus();
      });
    });
  });
  box.querySelector('.lightbox-close').addEventListener('click', close);
  prev.addEventListener('click', function () { show(cur - 1); });
  next.addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && items.length > 1) show(cur - 1);
    else if (e.key === 'ArrowRight' && items.length > 1) show(cur + 1);
  });
})();

/* ── Lecteur vidéo à plusieurs vidéos (boutons Vidéo 1 / Vidéo 2) ── */
document.querySelectorAll('[data-video-duo]').forEach(function (box) {
  var video = box.querySelector('video');
  var btns = box.querySelectorAll('.video-tabs button');
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('is-active')) return;
      btns.forEach(function (x) { x.classList.remove('is-active'); });
      b.classList.add('is-active');
      video.pause();
      video.poster = b.getAttribute('data-poster');
      video.src = b.getAttribute('data-src');
      video.load();
    });
  });
});
