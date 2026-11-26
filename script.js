/* Anantharaj S — Portfolio
   Plain JavaScript, no dependencies. Sections:
   1. Header + mobile menu   2. Active section   3. Back to top
   4. Contact form           5. PID bench (hero)                      */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------
     1. Header + mobile menu
  --------------------------------------------------------------- */
  function initHeader() {
    var header = $('.site-header');
    var btn = $('.menu-btn');
    var menu = $('#site-menu');
    if (!header) return;

    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!btn || !menu) return;
    var mq = window.matchMedia('(max-width: 860px)');

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('.menu-label').textContent = open ? 'Close' : 'Menu';
      menu.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      document.body.classList.toggle('menu-open', open);
      // keep links out of the tab order while the panel is hidden on small screens
      menu.toggleAttribute('inert', mq.matches && !open);
    }
    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }

    btn.addEventListener('click', function () { setOpen(!isOpen()); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { if (isOpen()) setOpen(false); }); });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setOpen(false); btn.focus(); return; }
      if (e.key !== 'Tab') return;
      // keep focus inside header + open panel
      var items = [btn].concat($$('a', menu));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var sync = function () { if (!mq.matches) { setOpen(false); menu.removeAttribute('inert'); } else if (!isOpen()) { menu.setAttribute('inert', ''); } };
    if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
    sync();
  }

  /* ---------------------------------------------------------------
     2. Highlight the nav link of the section in view (home page only)
  --------------------------------------------------------------- */
  function initActiveSection() {
    var links = $$('.menu a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        map[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });

    // clear the highlight when back in the hero
    var hero = $('.hero');
    if (hero) new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) links.forEach(function (a) { a.removeAttribute('aria-current'); });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
  }

  /* ---------------------------------------------------------------
     3. Back to top
  --------------------------------------------------------------- */
  function initToTop() {
    var b = $('.to-top');
    if (!b) return;
    var toggle = function () { b.classList.toggle('is-visible', window.scrollY > 900); };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  /* ---------------------------------------------------------------
     4. Contact form (opens the visitor's email app; Gmail + copy fallbacks)
  --------------------------------------------------------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var t = document.createElement('textarea');
      t.value = text; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); } finally { document.body.removeChild(t); }
    });
  }

  function initContact() {
    var form = $('#contact-form');
    var email = form ? form.getAttribute('data-to') : '';
    var status = $('#form-status');

    function say(html, isError) {
      if (!status) return;
      status.innerHTML = html;
      status.classList.toggle('is-error', !!isError);
    }

    // copy buttons anywhere on the page
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy-email]');
      if (!btn) return;
      var addr = btn.getAttribute('data-copy-email');
      var label = btn.querySelector('[data-label]');
      var original = label ? label.textContent : '';
      copyText(addr).then(function () {
        if (label) { label.textContent = 'Copied'; setTimeout(function () { label.textContent = original; }, 1800); }
        if (btn.closest('.form-status')) say('Address copied: ' + addr);
      }, function () {
        if (label) { label.textContent = addr; }
      });
    });

    if (!form) return;
    var fields = {
      name: form.elements.name,
      email: form.elements.email,
      message: form.elements.message
    };

    function setError(el, msg) {
      var err = document.getElementById(el.id + '-error');
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    }
    function validate() {
      var ok = true, firstBad = null;
      var n = fields.name.value.trim();
      var m = fields.message.value.trim();
      var e = fields.email.value.trim();
      setError(fields.name, n ? '' : 'Enter your name so I know who to reply to.');
      if (!n) { ok = false; firstBad = firstBad || fields.name; }
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
      setError(fields.email, emailOk ? '' : (e ? 'This email address looks incomplete. Use the form name@example.com.' : 'Enter your email address so I can reply.'));
      if (!emailOk) { ok = false; firstBad = firstBad || fields.email; }
      setError(fields.message, m ? '' : 'Write a short message before sending.');
      if (!m) { ok = false; firstBad = firstBad || fields.message; }
      if (firstBad) firstBad.focus();
      return ok;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener('input', function () { if (fields[k].getAttribute('aria-invalid') === 'true') setError(fields[k], ''); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { say('Check the highlighted fields and send again.', true); return; }
      var subject = 'Portfolio contact from ' + fields.name.value.trim();
      var body = fields.message.value.trim() + '\n\nReply to: ' + fields.email.value.trim();
      var mailto = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email) +
        '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      say('Opening your email app with the message ready to send. Nothing opened? ' +
        '<a href="' + gmail + '" target="_blank" rel="noopener noreferrer">Write it in Gmail</a> or ' +
        '<button type="button" data-copy-email="' + email + '"><span data-label>copy my address</span></button>.');
      window.location.href = mailto;
    });
  }

  /* ---------------------------------------------------------------
     5. PID bench — a drone chases a marker with a real PID controller.
        Position error e = target - position, per axis:
          u = Kp·e + Ki·∫e dt − Kd·v    (derivative on measurement)
        The drone is a point mass with linear drag, so the sliders
        behave the way they do on a real vehicle.
  --------------------------------------------------------------- */
  function initBench() {
    var fig = $('#bench');
    if (!fig) return;
    var arena = $('#arena', fig), scope = $('#scope', fig);
    if (!arena || !scope || !arena.getContext) return;
    var ctx = arena.getContext('2d'), sctx = scope.getContext('2d');

    var css = getComputedStyle(document.documentElement);
    var C = {
      signal: css.getPropertyValue('--signal').trim() || '#ffc21a',
      led: css.getPropertyValue('--led').trim() || '#ee4630',
      light: '#eef2f7'
    };

    var W = 4.0, H = 2.0;                        // arena size in metres
    var DEFAULTS = { kp: 9, ki: 0.8, kd: 4.4 };
    var gains = { kp: DEFAULTS.kp, ki: DEFAULTS.ki, kd: DEFAULTS.kd };
    var DT = 1 / 240, MAX_U = 16, DRAG = 0.5, I_MAX = 4, I_BAND = 0.6;
    var WAYPOINTS = [[3.0, 0.65], [1.0, 0.7], [1.15, 1.6], [2.9, 1.65], [2.0, 1.1], [3.2, 1.2], [0.9, 1.15]];

    var drone = { x: W + 0.5, y: -0.4, vx: -0.6, vy: 0.5, ix: 0, iy: 0, ax: 0, ay: 0 };
    var target = { x: WAYPOINTS[0][0], y: WAYPOINTS[0][1] };
    var wind = false, auto = !reduceMotion;
    var armed = !reduceMotion;                   // with reduced motion nothing moves until the visitor acts
    var pointerInside = false;
    var wpIndex = 0, nextWp = 0, lastInput = -1e9;
    var trail = [], history = [];
    var simT = 0, acc = 0, last = 0, raf = 0, running = false, onScreen = true, lastDom = 0, dirtyUntil = 0;
    var size = { w: 0, h: 0, s: 1, u: 1 }, sSize = { w: 0, h: 0 };
    var err = 0, speed = 0;

    // The marker encodes the team number: 5963 = 0001 0111 0100 1011 (a 4x4 ArUco-style bit grid)
    var BITS = [0,0,0,1, 0,1,1,1, 0,1,0,0, 1,0,1,1];

    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

    /* ---- sizing ---- */
    function fit(canvas, c, box) {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      box.w = w; box.h = h;
    }
    function resize() {
      fit(arena, ctx, size); size.s = size.w / W; size.u = Math.max(size.s, 135);
      fit(scope, sctx, sSize);
      draw();
    }

    /* ---- physics ---- */
    function windAcc(t) {
      return wind ? { x: 1.9 + 0.5 * Math.sin(t * 1.7), y: 0.35 * Math.sin(t * 1.1 + 1) } : { x: 0, y: 0 };
    }
    function integrate() {
      var w = windAcc(simT);
      var ex = target.x - drone.x, ey = target.y - drone.y;
      // integral separation (anti-windup): only accumulate close to the target, so a big step doesn't wind the integrator up
      if (Math.abs(ex) < I_BAND) drone.ix = clamp(drone.ix + ex * DT, -I_MAX, I_MAX);
      if (Math.abs(ey) < I_BAND) drone.iy = clamp(drone.iy + ey * DT, -I_MAX, I_MAX);
      var ux = clamp(gains.kp * ex + gains.ki * drone.ix - gains.kd * drone.vx, -MAX_U, MAX_U);
      var uy = clamp(gains.kp * ey + gains.ki * drone.iy - gains.kd * drone.vy, -MAX_U, MAX_U);
      drone.ax = ux - DRAG * drone.vx + w.x;
      drone.ay = uy - DRAG * drone.vy + w.y;
      drone.vx += drone.ax * DT; drone.vy += drone.ay * DT;
      drone.x = clamp(drone.x + drone.vx * DT, -0.6, W + 0.6);
      drone.y = clamp(drone.y + drone.vy * DT, -0.6, H + 0.6);
      simT += DT;
    }
    function settled() {
      var e = Math.hypot(target.x - drone.x, target.y - drone.y);
      return e < 0.04 && Math.hypot(drone.vx, drone.vy) < 0.05;
    }

    /* ---- input ---- */
    function setTarget(x, y) {
      target.x = clamp(x, 0.2, W - 0.2); target.y = clamp(y, 0.2, H - 0.2);
      var hint = $('.bench-hint', fig); if (hint) hint.classList.add('is-gone');
      arm();
    }
    function arm() { armed = true; lastInput = performance.now(); start(); }
    function fromPointer(e) {
      var r = arena.getBoundingClientRect();
      setTarget((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);
    }
    arena.addEventListener('pointermove', fromPointer);
    arena.addEventListener('pointerdown', fromPointer);
    arena.addEventListener('pointerenter', function () { pointerInside = true; });
    arena.addEventListener('pointerleave', function () { pointerInside = false; lastInput = performance.now(); });
    arena.addEventListener('keydown', function (e) {
      var step = 0.25, dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step; else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step; else if (e.key === 'ArrowDown') dy = step; else return;
      e.preventDefault(); setTarget(target.x + dx, target.y + dy);
    });

    var sliders = { kp: $('#gain-kp', fig), ki: $('#gain-ki', fig), kd: $('#gain-kd', fig) };
    function paintSlider(k) {
      var s = sliders[k]; if (!s) return;
      var min = +s.min, max = +s.max;
      s.style.setProperty('--fill', ((+s.value - min) / (max - min) * 100) + '%');
      var o = $('#out-' + k, fig); if (o) o.textContent = (+s.value).toFixed(1);
    }
    Object.keys(sliders).forEach(function (k) {
      var s = sliders[k]; if (!s) return;
      s.value = gains[k]; paintSlider(k);
      s.addEventListener('input', function () { gains[k] = +s.value; paintSlider(k); arm(); });
    });

    var windBtn = $('[data-bench="wind"]', fig), resetBtn = $('[data-bench="reset"]', fig);
    if (windBtn) windBtn.addEventListener('click', function () {
      wind = !wind; windBtn.setAttribute('aria-pressed', String(wind)); arm();
    });
    if (resetBtn) resetBtn.addEventListener('click', function () {
      Object.keys(DEFAULTS).forEach(function (k) { gains[k] = DEFAULTS[k]; if (sliders[k]) { sliders[k].value = DEFAULTS[k]; paintSlider(k); } });
      wind = false; if (windBtn) windBtn.setAttribute('aria-pressed', 'false');
      drone.ix = drone.iy = 0; arm();
    });

    /* ---- autopilot: hops between waypoints so every gain change is visible as a step response ---- */
    function autopilot(now) {
      // hands off while the visitor is hovering over the arena or steering with the keyboard
      if (!auto || pointerInside || document.activeElement === arena || now - lastInput < 4000) return;
      if (now >= nextWp) {
        wpIndex = (wpIndex + 1) % WAYPOINTS.length;
        target.x = WAYPOINTS[wpIndex][0]; target.y = WAYPOINTS[wpIndex][1];
        nextWp = now + 3200;
      }
    }

    /* ---- drawing ---- */
    function drawGrid() {
      var s = size.s, w = size.w, h = size.h;
      ctx.lineWidth = 1;
      for (var gx = 0.5; gx < W; gx += 0.5) {
        ctx.strokeStyle = (gx % 1 === 0) ? 'rgba(238,242,247,.10)' : 'rgba(238,242,247,.05)';
        ctx.beginPath(); ctx.moveTo(Math.round(gx * s) + .5, 0); ctx.lineTo(Math.round(gx * s) + .5, h); ctx.stroke();
      }
      for (var gy = 0.5; gy < H; gy += 0.5) {
        ctx.strokeStyle = (gy % 1 === 0) ? 'rgba(238,242,247,.10)' : 'rgba(238,242,247,.05)';
        ctx.beginPath(); ctx.moveTo(0, Math.round(gy * s) + .5); ctx.lineTo(w, Math.round(gy * s) + .5); ctx.stroke();
      }
      // 1 m scale bar
      var bx = w - 14 - s, by = h - 16;
      ctx.strokeStyle = 'rgba(238,242,247,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx, by); ctx.lineTo(bx + s, by); ctx.lineTo(bx + s, by - 4); ctx.stroke();
      ctx.fillStyle = 'rgba(238,242,247,.7)'; ctx.font = '600 11px Archivo, system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('1 m', bx + s / 2, by - 8);
    }

    function drawMarker(px, py, locked) {
      var cell = Math.max(size.s * 0.22, 28) / 7, total = cell * 7, x0 = px - total / 2, y0 = py - total / 2;
      if (locked) {
        ctx.strokeStyle = C.signal; ctx.lineWidth = 2;
        ctx.strokeRect(x0 - 5, y0 - 5, total + 10, total + 10);
      }
      ctx.fillStyle = '#f4f6f9'; ctx.fillRect(x0, y0, total, total);                      // quiet zone
      ctx.fillStyle = '#05080e'; ctx.fillRect(x0 + cell, y0 + cell, cell * 5, cell * 5);  // black border
      for (var i = 0; i < 16; i++) {
        if (!BITS[i]) continue;
        ctx.fillStyle = '#f4f6f9';
        ctx.fillRect(x0 + cell * (2 + i % 4), y0 + cell * (2 + Math.floor(i / 4)), cell, cell);
      }
    }

    function drawDrone(px, py, t) {
      var u = size.u, o = 0.115 * u, r = 0.072 * u;
      ctx.save(); ctx.translate(px, py);
      ctx.fillStyle = 'rgba(0,0,0,.32)';                                    // ground shadow leans with acceleration
      ctx.beginPath(); ctx.ellipse(0.02 * u - drone.ax * 0.004 * u, 0.07 * u - drone.ay * 0.004 * u, 0.17 * u, 0.12 * u, 0, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = '#c9d4e3'; ctx.lineWidth = Math.max(2, 0.03 * u); ctx.lineCap = 'round';
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p[0] * o, p[1] * o); ctx.stroke(); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p, i) {
        var rx = p[0] * o, ry = p[1] * o, a = t * (i % 2 ? -16 : 16);
        ctx.fillStyle = 'rgba(238,242,247,.07)'; ctx.strokeStyle = 'rgba(238,242,247,.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(rx, ry, r, 0, 6.2832); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx + Math.cos(a) * r, ry + Math.sin(a) * r); ctx.lineTo(rx - Math.cos(a) * r, ry - Math.sin(a) * r); ctx.stroke();
        ctx.fillStyle = p[1] < 0 ? C.led : 'rgba(238,242,247,.85)';              // red LEDs on the front rotors
        ctx.beginPath(); ctx.arc(rx, ry, Math.max(2, 0.014 * u), 0, 6.2832); ctx.fill();
      });
      ctx.fillStyle = '#1a2b44'; ctx.strokeStyle = '#c9d4e3'; ctx.lineWidth = 1.5;
      var b = 0.05 * u; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-b, -b * 1.2, b * 2, b * 2.4, b * 0.5); else ctx.rect(-b, -b * 1.2, b * 2, b * 2.4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.signal; ctx.fillRect(-b * 0.45, -b * 0.95, b * 0.9, b * 0.3);   // front marker
      ctx.restore();
    }

    function drawArena() {
      var s = size.s;
      ctx.clearRect(0, 0, size.w, size.h);
      drawGrid();
      var px = drone.x * s, py = drone.y * s, tx = target.x * s, ty = target.y * s;
      // trail
      if (trail.length > 1) {
        for (var i = 1; i < trail.length; i++) {
          ctx.strokeStyle = 'rgba(255,194,26,' + (i / trail.length * 0.55).toFixed(3) + ')';
          ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(trail[i - 1][0] * s, trail[i - 1][1] * s); ctx.lineTo(trail[i][0] * s, trail[i][1] * s); ctx.stroke();
        }
      }
      // error vector
      ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(238,242,247,.35)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
      drawMarker(tx, ty, err < 0.05 && speed < 0.12);
      drawDrone(px, py, simT);
    }

    function drawScope(now) {
      var w = sSize.w, h = sSize.h, span = 6000;
      sctx.clearRect(0, 0, w, h);
      var base = h - 8, top = 8, range = 1.4;
      // 5 cm settle band
      var bandY = base - (0.05 / range) * (base - top);
      sctx.fillStyle = 'rgba(255,194,26,.10)'; sctx.fillRect(0, bandY, w, base - bandY);
      sctx.strokeStyle = 'rgba(238,242,247,.18)'; sctx.lineWidth = 1;
      sctx.beginPath(); sctx.moveTo(0, base + .5); sctx.lineTo(w, base + .5); sctx.stroke();
      if (history.length < 2) return;
      sctx.beginPath();
      for (var i = 0; i < history.length; i++) {
        var x = w - (now - history[i][0]) / span * w;
        var y = base - clamp(history[i][1] / range, 0, 1) * (base - top);
        if (i === 0) sctx.moveTo(x, y); else sctx.lineTo(x, y);
      }
      sctx.strokeStyle = C.signal; sctx.lineWidth = 1.8; sctx.lineJoin = 'round'; sctx.stroke();
    }

    function draw() {
      var now = performance.now();
      drawArena(); drawScope(now);
    }

    function updateDom(now) {
      if (now - lastDom < 120) return;
      lastDom = now;
      var e = $('#r-err', fig), s = $('#r-state', fig);
      if (e) e.textContent = err.toFixed(2);
      if (s) {
        var lk = err < 0.05 && speed < 0.12;
        s.textContent = lk ? 'locked' : 'tracking';
        s.setAttribute('data-state', lk ? 'locked' : 'tracking');
      }
    }

    /* ---- loop ---- */
    function shouldRun(now) {
      return onScreen && !document.hidden && (auto || wind || now < dirtyUntil || !settled());
    }
    function frame(now) {
      raf = 0;
      if (!running) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now; acc += dt;
      autopilot(now);
      while (acc >= DT) { integrate(); acc -= DT; }
      err = Math.hypot(target.x - drone.x, target.y - drone.y);
      speed = Math.hypot(drone.vx, drone.vy);
      trail.push([drone.x, drone.y]); if (trail.length > 60) trail.shift();
      history.push([now, err]); while (history.length && now - history[0][0] > 6000) history.shift();
      draw(); updateDom(now);
      if (shouldRun(now)) raf = requestAnimationFrame(frame); else running = false;
    }
    function start() {
      if (!armed) return;
      var now = performance.now();
      dirtyUntil = now + 1500;
      if (running || !onScreen) return;
      running = true; last = now; raf = requestAnimationFrame(frame);
    }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(fig); else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        onScreen = en[0].isIntersecting;
        if (onScreen) start();
      }, { threshold: 0.05 }).observe(fig);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

    if (reduceMotion) { drone.x = target.x - 0.7; drone.y = target.y + 0.4; drone.vx = drone.vy = 0; }   // a still frame until the visitor interacts
    resize();
    err = Math.hypot(target.x - drone.x, target.y - drone.y);
    draw(); updateDom(performance.now());
    start();
  }

  /* ---------------------------------------------------------------
     Boot
  --------------------------------------------------------------- */
  function boot() {
    initHeader();
    initActiveSection();
    initToTop();
    initContact();
    initBench();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
