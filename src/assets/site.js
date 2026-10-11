// Interaksi situs. Satu file untuk semua halaman; setiap bagian hanya jalan
// jika elemennya ada di halaman tersebut.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var root = $('.kx');

  // menu mobile
  var nav = $('#nav');
  if (nav) {
    $('#burger').onclick = function () {
      var open = nav.classList.toggle('open');
      this.setAttribute('aria-expanded', open);
    };
    $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  // tombol WhatsApp melayang: muncul setelah melewati hero
  var wa = $('.wa'), hero = $('#top') || $('.page-hero');
  if (wa) {
    var onScroll = function () {
      var limit = hero ? hero.offsetTop + hero.offsetHeight - 120 : 300;
      wa.classList.toggle('show', scrollY > limit);
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // hero slider full screen
  var hs = $('#top.hero');
  if (hs) (function () {
    var slides = $$('.hs-slide', hs), bar = $('.hs-progress i', hs), curEl = $('.hs-count .cur', hs),
        now = $('.hs-now', hs), cur = 0, timer, DUR = 6000,
        still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (slides.length < 2) return;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    hs.style.setProperty('--dur', DUR + 'ms');
    $('.hs-count .tot', hs).textContent = pad(slides.length);
    // gambar slide berikutnya dimuat setelah halaman siap (hemat kuota awal)
    addEventListener('load', function () { $$('img[data-src]', hs).forEach(function (i) { i.srcset = i.dataset.srcset; i.src = i.dataset.src; }); });
    now.onclick = function () {
      var t = $('.kx [data-tab="' + slides[cur].dataset.goto + '"]');
      if (t) t.click();
    };
    function setNow() {
      now.classList.add('fade');
      setTimeout(function () {
        now.href = slides[cur].dataset.href || '#portofolio';
        $('.t', now).textContent = slides[cur].dataset.title;
        $('.l', now).textContent = slides[cur].dataset.loc;
        now.classList.remove('fade');
      }, 250);
    }
    function go(i) {
      slides[cur].classList.remove('active');
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('active');
      curEl.textContent = pad(cur + 1);
      setNow(); restart();
    }
    function restart() {
      clearTimeout(timer); bar.classList.remove('run'); void bar.offsetWidth;
      if (still) return;
      bar.classList.add('run'); timer = setTimeout(function () { go(cur + 1); }, DUR);
    }
    function pause() { clearTimeout(timer); bar.classList.remove('run'); }
    $('.hs-prev', hs).onclick = function () { go(cur - 1); };
    $('.hs-next', hs).onclick = function () { go(cur + 1); };
    $$('.hs-ctrl', hs).forEach(function (el) { el.addEventListener('mouseenter', pause); el.addEventListener('mouseleave', restart); });
    var x0 = null;
    hs.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hs.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? pause() : restart(); });
    go(0);
  })();

  // logo klien berjalan: duplikat isi supaya loop mulus
  var tr = $('#track');
  if (tr) { var clone = tr.innerHTML; tr.insertAdjacentHTML('beforeend', clone); $$('img', tr).slice(tr.children.length / 2).forEach(function (i) { i.alt = ''; i.setAttribute('aria-hidden', 'true'); }); }

  // animasi muncul saat scroll
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else $$('.reveal').forEach(function (el) { el.classList.add('in'); });

  // tab portofolio (homepage)
  $$('[data-tab]').forEach(function (b) {
    b.onclick = function () {
      $$('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b); document.getElementById(x.dataset.tab).hidden = x !== b; });
    };
  });

  // filter galeri
  $$('[data-filter]').forEach(function (b) {
    b.onclick = function () {
      $$('[data-filter]').forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      $$('.gallery img').forEach(function (img) { img.style.display = (b.dataset.filter === 'all' || img.dataset.cat === b.dataset.filter) ? '' : 'none'; });
    };
  });

  // slider sebelum/sesudah
  $$('.ba input').forEach(function (r) { r.oninput = function () { r.parentNode.style.setProperty('--pos', r.value + '%'); }; });

  // video YouTube: thumbnail dulu, iframe dimuat saat diklik
  $$('.vid[data-yt]').forEach(function (v) {
    var id = v.dataset.yt;
    v.setAttribute('role', 'button'); v.tabIndex = 0;
    v.setAttribute('aria-label', 'Putar video ' + (v.dataset.title || 'Kalmer'));
    v.innerHTML = '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.src=\'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg\';this.onerror=null"><div class="play"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></div>';
    var play = function () {
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="' + (v.dataset.title || 'Video Kalmer') + '"></iframe>';
      v.onclick = v.onkeydown = null;
    };
    v.onclick = play;
    v.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } };
  });

  // lightbox foto
  var lb = $('#lb');
  if (lb) {
    var lbImg = $('img', lb), cnt = $('.cnt', lb), list = [], idx = 0, last;
    var go = $('.go', cnt);
    var show = function () {
      var el = list[idx];
      lbImg.src = el.dataset.full || el.currentSrc || el.src; lbImg.alt = el.alt;
      $('.num', cnt).textContent = (idx + 1) + ' / ' + list.length;
      $('.cap', cnt).textContent = el.alt;
      // foto bagian dari studi kasus → tampilkan tautannya
      go.hidden = !el.dataset.project;
      if (el.dataset.project) go.href = '/portofolio/' + el.dataset.project + '/';
    };
    $$('[data-group] img').forEach(function (img) {
      img.tabIndex = 0;
      var open = function () {
        last = img;
        list = $$('img', img.closest('[data-group]')).filter(function (i) { return i.style.display !== 'none'; });
        idx = list.indexOf(img); show(); lb.classList.add('open'); $('.c', lb).focus();
      };
      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });
    var close = function () { lb.classList.remove('open'); if (last) last.focus(); };
    $('.c', lb).onclick = close;
    $('.p', lb).onclick = function (e) { e.stopPropagation(); idx = (idx - 1 + list.length) % list.length; show(); };
    $('.n', lb).onclick = function (e) { e.stopPropagation(); idx = (idx + 1) % list.length; show(); };
    lb.onclick = function (e) { if (e.target === lb) close(); };
    addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') $('.p', lb).click();
      if (e.key === 'ArrowRight') $('.n', lb).click();
    });
  }
})();
