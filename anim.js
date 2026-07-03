/* Letter Connection — animation engine (no HTML changes needed) */
(function(){
  'use strict';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var PRESETS = ['calm','balanced','lively'];
  var preset = 'lively';
  document.documentElement.setAttribute('data-anim', preset);

  var revealEls = [];

  function ready(fn){ if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function(){

    /* ---- header reacts to scroll ---- */
    var head = document.querySelector('.site-head');
    if (head){
      var onScroll = function(){ head.classList.toggle('scrolled', scrollY > 12); };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---- ambient paper plane flight path in hero ---- */
    var hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.flight')){
      var FLIGHT_PATH = 'M-60,470 C300,430 520,300 700,220 S1050,90 1280,30';
      var fl = document.createElement('div');
      fl.className = 'flight';
      fl.setAttribute('aria-hidden','true');
      fl.innerHTML =
        '<svg viewBox="0 0 1200 520" preserveAspectRatio="none">' +
          '<path class="flight-line" d="' + FLIGHT_PATH + '"/>' +
          '<g class="flight-plane"><path d="M0,-10 L26,-1 L5,12 L2,4 Z"/>' +
            '<animateMotion dur="18s" repeatCount="indefinite" rotate="auto" path="' + FLIGHT_PATH + '"/>' +
          '</g>' +
        '</svg>';
      hero.insertBefore(fl, hero.firstChild);
    }

    /* ---- tag elements for reveal, with per-group stagger ---- */
    var GROUPS = [
      '.hero .wrap > div > .eyebrow, .hero h1, .hero .lead, .hero-actions, .hero-badges',
      '.hero-card',
      '.page-head .eyebrow, .page-head h1, .page-head .lead',
      '.stat',
      '.sec-head',
      '.grid .card',
      '.price-card', '.terms',
      '.reserve-info', '.reserve-form',
      '.rband',
      '.tspot',
      '.visit-card', '.hours', '.map-card',
      '.cta-band',
      '.compare-wrap',
      '.faq details'
    ];
    GROUPS.forEach(function(sel){
      var els = document.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++){
        var el = els[i];
        if (el.hasAttribute('data-reveal')) continue;
        el.setAttribute('data-reveal','');
        el.style.setProperty('--d', (Math.min(i,6) * 0.09) + 's');
        revealEls.push(el);
      }
    });

    /* hero / page headline: wrap words for stagger (animated only in lively) */
    var h1 = document.querySelector('.hero h1, .page-head h1');
    if (h1 && !h1.querySelector('.aw')){
      var wi = 0;
      (function split(node){
        var kids = [].slice.call(node.childNodes);
        kids.forEach(function(k){
          if (k.nodeType === 3 && k.nodeValue.trim()){
            var frag = document.createDocumentFragment();
            k.nodeValue.split(/(\s+)/).forEach(function(part){
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement('span');
              s.className = 'aw'; s.textContent = part;
              s.style.setProperty('--d', (0.1 + wi * 0.07) + 's');
              wi++; frag.appendChild(s);
            });
            node.replaceChild(frag, k);
          } else if (k.nodeType === 1) split(k);
        });
      })(h1);
    }

    /* ---- postmark ring around the "Since 1984" stat ---- */
    [].slice.call(document.querySelectorAll('.stat')).forEach(function(st){
      if (/1984/.test(st.textContent)) st.classList.add('postmark');
    });

    /* ---- count-up numbers ---- */
    function countUp(el){
      if (el.__counted) return; el.__counted = true;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n;
      while ((n = walker.nextNode())){
        var m = n.nodeValue.match(/\d[\d,]*/);
        if (!m) continue;
        (function(node, match){
          var target = parseInt(match[0].replace(/,/g,''), 10);
          if (!target) return;
          var pre = node.nodeValue.slice(0, match.index);
          var post = node.nodeValue.slice(match.index + match[0].length);
          var from = target >= 1000 ? target - 44 : (target >= 100 ? Math.round(target * .55) : 0);
          var t0 = null, dur = 1300;
          function frame(t){
            if (!t0) t0 = t;
            var k = Math.min((t - t0) / dur, 1);
            k = 1 - Math.pow(1 - k, 3);
            node.nodeValue = pre + Math.round(from + (target - from) * k) + post;
            if (k < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        })(n, m);
        break;
      }
    }
    var counters = [].slice.call(document.querySelectorAll('.stat b, .price-big')).filter(function(el){
      return el.textContent.indexOf('$') > -1; /* only count dollar amounts — years, 24/7, carrier counts are facts and must not appear to change */
    });

    /* ---- best-value row highlight ---- */
    [].slice.call(document.querySelectorAll('.term-row')).forEach(function(r){
      if (/best value/i.test(r.textContent)) r.classList.add('best');
    });

    /* ---- IntersectionObserver: reveal + counters ---- */
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (counters.indexOf(en.target) > -1) countUp(en.target);
        [].slice.call(en.target.querySelectorAll ? en.target.querySelectorAll('.stat b, .price-big') : []).forEach(countUp);
        if (en.target.classList.contains('best')) en.target.classList.add('in-view');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

    revealEls.forEach(function(el){ io.observe(el); });
    counters.forEach(function(el){ io.observe(el); });
    var best = document.querySelector('.term-row.best'); if (best) io.observe(best);

    /* ---- testimonial spotlight rotation ---- */
    var spot = document.querySelector('[data-tspot]');
    if (spot){
      var slides = [].slice.call(spot.querySelectorAll('.tslide'));
      var btns = [].slice.call(spot.querySelectorAll('.tspot-nav button'));
      var idx = 0, timer = null;
      function go(i){
        idx = (i + slides.length) % slides.length;
        slides.forEach(function(s, j){ s.classList.toggle('is-active', j === idx); });
        btns.forEach(function(b, j){ b.classList.toggle('is-active', j === idx); });
      }
      function tick(){ if (preset !== 'calm' && !spot.matches(':hover')) go(idx + 1); }
      function restart(){ if (timer) clearInterval(timer); timer = setInterval(tick, 6000); }
      btns.forEach(function(b, j){ b.addEventListener('click', function(){ go(j); restart(); }); });
      restart();
    }

    /* ---- envelope fly-off on form success (called from app.js) ---- */
    window.lcFormSuccess = function(form){
      if (!form || form.querySelector('.env-fly')) return;
      var wrapEl = document.createElement('div');
      wrapEl.className = 'env-fly';
      wrapEl.setAttribute('aria-hidden','true');
      wrapEl.innerHTML = '<div class="env"><div class="env-letter"></div><div class="env-body"></div><div class="env-flap"></div></div>';
      form.appendChild(wrapEl);
      setTimeout(function(){ wrapEl.remove(); }, 2600);
    };
  });
})();
