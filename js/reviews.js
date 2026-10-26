(function () {
  var root = document.querySelector('[data-reviews]');
  var data = window.LOOKOUT_REVIEWS;
  if (!root || !data || !data.reviews || !data.reviews.length) return;

  var EXCERPT = 190;
  var track = root.querySelector('.rv-track');
  var prev = root.querySelector('[data-rv-prev]');
  var next = root.querySelector('[data-rv-next]');
  var status = root.querySelector('.rv-status');

  function excerpt(text) {
    if (text.length <= EXCERPT) return null;
    var cut = text.slice(0, EXCERPT);
    var space = cut.lastIndexOf(' ');
    return cut.slice(0, space > 100 ? space : EXCERPT).replace(/[\s.,;:!-]+$/, '') + '…';
  }

  data.reviews.forEach(function (r, i) {
    var short = excerpt(r.text);
    var card = document.createElement('article');
    card.className = 'rv-card';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', (i + 1) + ' of ' + data.reviews.length);

    var topic = document.createElement('p');
    topic.className = 'rv-topic';
    topic.textContent = r.topic;
    card.appendChild(topic);

    if (r.rating) {
      var stars = document.createElement('p');
      stars.className = 'rv-stars';
      stars.setAttribute('aria-label', r.rating + ' out of 5 stars');
      stars.textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      card.appendChild(stars);
    }

    var quote = document.createElement('blockquote');
    quote.className = 'rv-quote';
    var body = document.createElement('p');
    body.id = 'rv-text-' + i;
    body.textContent = short || r.text;
    quote.appendChild(body);
    card.appendChild(quote);

    if (short) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'rv-more';
      more.setAttribute('aria-expanded', 'false');
      more.setAttribute('aria-controls', body.id);
      more.textContent = 'Read full review';
      more.addEventListener('click', function () {
        var open = more.getAttribute('aria-expanded') === 'true';
        body.textContent = open ? short : r.text;
        more.setAttribute('aria-expanded', String(!open));
        more.textContent = open ? 'Read full review' : 'Show less';
      });
      card.appendChild(more);
    }

    var who = document.createElement('footer');
    who.className = 'rv-who';
    var name = document.createElement('cite');
    name.textContent = r.name;
    var src = document.createElement('span');
    src.textContent = 'Google review';
    who.appendChild(name);
    who.appendChild(src);
    card.appendChild(who);

    track.appendChild(card);
  });

  function step() {
    var card = track.querySelector('.rv-card');
    if (!card) return track.clientWidth;
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
    var s = step();
    var first = Math.round(track.scrollLeft / s) + 1;
    var visible = Math.max(1, Math.round(track.clientWidth / s));
    var last = Math.min(data.reviews.length, first + visible - 1);
    status.textContent = 'Showing reviews ' + first + (last > first ? ' to ' + last : '') + ' of ' + data.reviews.length;
  }

  function go(dir) {
    track.scrollBy({ left: dir * step(), behavior: 'smooth' });
  }

  prev.addEventListener('click', function () { go(-1); });
  next.addEventListener('click', function () { go(1); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  var tick;
  track.addEventListener('scroll', function () {
    cancelAnimationFrame(tick);
    tick = requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
  root.classList.add('is-ready');
})();
