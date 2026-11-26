/* Page d'accueil — cadre Produit : la vidéo passe d'abord, puis les photos, puis on recommence.
   Les points sous le cadre permettent d'aller directement à la vidéo ou à une photo. */
(function () {
  var box = document.getElementById('produitMedia');
  var video = document.getElementById('produitVideo');
  if (!box || !video) return;

  var PHOTO_MS = 2500; // durée d'affichage de chaque photo
  var slides = box.querySelectorAll('.media-slide');
  var cur = 0, timer = null;

  /* points de navigation : un triangle pour la vidéo, un point par photo */
  var dotsWrap = document.createElement('div');
  dotsWrap.className = 'photo-dots';
  var dots = Array.prototype.map.call(slides, function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = i === 0 ? 'is-video on' : '';
    d.setAttribute('aria-label', i === 0 ? 'Voir la vidéo' : 'Voir la photo ' + i);
    d.addEventListener('click', function () { if (i === 0) playVideo(); else playPhotos(i); });
    dotsWrap.appendChild(d);
    return d;
  });
  box.appendChild(dotsWrap);

  function show(i) {
    slides[cur].classList.remove('active'); dots[cur].classList.remove('on');
    cur = i;
    slides[cur].classList.add('active'); dots[cur].classList.add('on');
  }

  /* photos à partir de la n° "from" (1 par défaut), puis retour à la vidéo */
  function playPhotos(from) {
    clearTimeout(timer);
    video.pause();
    if (slides.length < 2) { playVideo(); return; }
    show(from || 1);
    timer = setTimeout(function next() {
      if (cur < slides.length - 1) { show(cur + 1); timer = setTimeout(next, PHOTO_MS); }
      else playVideo();
    }, PHOTO_MS);
  }

  function playVideo() {
    clearTimeout(timer);
    show(0);
    video.currentTime = 0;
    var p = video.play();
    if (p && p.catch) p.catch(function () {}); // lecture auto bloquée : la vidéo reste sur sa 1re image
  }

  video.addEventListener('ended', function () { playPhotos(); });

  /* La vidéo est préchargée dès l'ouverture de la page, mais ne démarre (depuis le début)
     que lorsque le cadre devient visible : le visiteur qui descend la voit en entier. */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); playVideo(); }
    }, { threshold: 0.4 });
    io.observe(box);
  } else {
    playVideo();
  }
})();
