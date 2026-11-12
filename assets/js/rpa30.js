/* ==========================================================================
   Royal Priesthood Assemblies International — RPA30 interactions
   Small, dependency-free helpers for the redesigned site.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };

  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Header: scroll state, mobile panel and the More menu
     ------------------------------------------------------------------------ */

  var header = $('[data-site-header]');
  var navToggle = $('[data-nav-toggle]');
  var navPanel = $('[data-nav-panel]');
  var more = $('[data-more]');
  var moreToggle = $('[data-more-toggle]');
  var moreMenu = $('[data-more-menu]');

  function setScrolled() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  function closePanel() {
    if (!navPanel || !navToggle) return;
    navPanel.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && navPanel) {
    navToggle.addEventListener('click', function () {
      var open = navPanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
      if (open) closeMore();
    });

    $$('a', navPanel).forEach(function (link) {
      link.addEventListener('click', closePanel);
    });
  }

  function closeMore() {
    if (!more || !moreToggle) return;
    more.classList.remove('is-open');
    moreToggle.setAttribute('aria-expanded', 'false');
  }

  if (more && moreToggle && moreMenu) {
    moreToggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = more.classList.toggle('is-open');
      moreToggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', function (event) {
      if (!more.contains(event.target)) closeMore();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeMore();
      closePanel();
    });
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------------ */

  var revealItems = $$('.reveal');

  if (revealItems.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      revealItems.forEach(function (item) { revealObserver.observe(item); });
    }
  }

  /* ------------------------------------------------------------------------
     Horizontal photograph rails
     ------------------------------------------------------------------------ */

  $$('[data-rail]').forEach(function (rail) {
    var section = rail.closest('[data-rail-section]') || rail.parentElement;
    var prev = $('[data-rail-prev]', section);
    var next = $('[data-rail-next]', section);

    function step(direction) {
      rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.82), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    if (!reduceMotion) {
      var auto = window.setInterval(function () {
        if (rail.matches(':hover') || document.activeElement === rail) return;
        if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4) {
          rail.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          step(1);
        }
      }, 4200);
      rail.addEventListener('mouseenter', function () { window.clearInterval(auto); });
    }
  });

  /* ------------------------------------------------------------------------
     Gallery: filtering, search and a keyboard-friendly lightbox
     ------------------------------------------------------------------------ */

  var gallery = $('[data-gallery]');

  if (gallery) {
    var galleryItems = $$('[data-gallery-item]', gallery);
    var gallerySearch = $('[data-gallery-search]');
    var galleryChips = $$('[data-gallery-filter]', gallery);
    var galleryCount = $('[data-gallery-count]');
    var galleryFilter = 'all';

    function applyGalleryFilter() {
      var query = gallerySearch ? gallerySearch.value.trim().toLowerCase() : '';
      var shown = 0;

      galleryItems.forEach(function (item) {
        var category = item.getAttribute('data-category') || '';
        var text = (item.getAttribute('data-caption') || '') + ' ' + item.getAttribute('data-tags', '');
        var matchesCategory = galleryFilter === 'all' || category === galleryFilter;
        var matchesQuery = !query || text.toLowerCase().indexOf(query) !== -1;
        var visible = matchesCategory && matchesQuery;
        item.hidden = !visible;
        if (visible) shown += 1;
      });

      if (galleryCount) {
        galleryCount.textContent = shown + (shown === 1 ? ' photograph' : ' photographs');
      }
    }

    galleryChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        galleryFilter = chip.getAttribute('data-gallery-filter');
        galleryChips.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === chip));
        });
        applyGalleryFilter();
      });
    });

    if (gallerySearch) {
      gallerySearch.addEventListener('input', applyGalleryFilter);
    }

    applyGalleryFilter();

    var lightbox = $('#galleryLightbox');
    var lightboxImage = lightbox ? $('[data-lightbox-image]', lightbox) : null;
    var lightboxCaption = lightbox ? $('[data-lightbox-caption]', lightbox) : null;
    var lightboxCount = lightbox ? $('[data-lightbox-count]', lightbox) : null;
    var lightboxItems = galleryItems.slice();
    var activeIndex = 0;

    function openLightbox(item) {
      if (!lightbox || !lightboxImage) return;
      var visibleItems = galleryItems.filter(function (candidate) { return !candidate.hidden; });
      if (!visibleItems.length) return;
      lightboxItems = visibleItems;
      activeIndex = Math.max(0, lightboxItems.indexOf(item));
      renderLightbox();
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', 'open');
      }
    }

    function renderLightbox() {
      var item = lightboxItems[activeIndex];
      if (!item) return;
      var image = $('img', item);
      lightboxImage.src = item.getAttribute('data-full');
      lightboxImage.alt = image ? image.alt : '';
      if (lightboxCaption) lightboxCaption.textContent = item.getAttribute('data-caption') || '';
      if (lightboxCount) lightboxCount.textContent = (activeIndex + 1) + ' / ' + lightboxItems.length;
    }

    function moveLightbox(direction) {
      if (!lightboxItems.length) return;
      activeIndex = (activeIndex + direction + lightboxItems.length) % lightboxItems.length;
      renderLightbox();
    }

    galleryItems.forEach(function (item) {
      item.addEventListener('click', function () { openLightbox(item); });
    });

    if (lightbox) {
      $('[data-lightbox-close]', lightbox).addEventListener('click', function () {
        lightbox.close ? lightbox.close() : lightbox.removeAttribute('open');
      });
      $('[data-lightbox-prev]', lightbox).addEventListener('click', function () { moveLightbox(-1); });
      $('[data-lightbox-next]', lightbox).addEventListener('click', function () { moveLightbox(1); });
      lightbox.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') moveLightbox(-1);
        if (event.key === 'ArrowRight') moveLightbox(1);
      });
      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
          lightbox.close ? lightbox.close() : lightbox.removeAttribute('open');
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     Testimony filtering
     ------------------------------------------------------------------------ */

  var testimonyWall = $('[data-testimonies]');

  if (testimonyWall) {
    var testimonyItems = $$('[data-testimony]', testimonyWall);
    var testimonySearch = $('[data-testimony-search]');
    var testimonyChips = $$('[data-testimony-filter]', testimonyWall);
    var testimonyCount = $('[data-testimony-count]');
    var testimonyFilter = 'all';

    function applyTestimonyFilter() {
      var query = testimonySearch ? testimonySearch.value.trim().toLowerCase() : '';
      var shown = 0;

      testimonyItems.forEach(function (item) {
        var category = item.getAttribute('data-category') || '';
        var text = item.textContent.toLowerCase();
        var matchesCategory = testimonyFilter === 'all' || category === testimonyFilter;
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var visible = matchesCategory && matchesQuery;
        item.hidden = !visible;
        if (visible) shown += 1;
      });

      if (testimonyCount) {
        testimonyCount.textContent = shown + (shown === 1 ? ' story' : ' stories');
      }
    }

    testimonyChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        testimonyFilter = chip.getAttribute('data-testimony-filter');
        testimonyChips.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === chip));
        });
        applyTestimonyFilter();
      });
    });

    if (testimonySearch) testimonySearch.addEventListener('input', applyTestimonyFilter);
    applyTestimonyFilter();
  }

  /* ------------------------------------------------------------------------
     The "I Am Attending" card maker
     ------------------------------------------------------------------------ */

  var maker = $('[data-card-maker]');

  if (maker) {
    var canvas = $('[data-card-canvas]', maker);
    var nameInput = $('[data-card-name]', maker);
    var photoInput = $('[data-card-photo]', maker);
    var backdropButtons = $$('[data-card-backdrop]', maker);
    var downloadButton = $('[data-card-download]', maker);
    var shareButton = $('[data-card-share]', maker);
    var status = $('[data-card-status]', maker);
    var resetButton = $('[data-card-reset]', maker);

    var state = {
      name: nameInput ? nameInput.value : 'Your Name',
      photo: null,
      backdrop: '1',
      loadingLogo: false
    };

    var logo = new Image();
    logo.decoding = 'async';
    logo.src = 'logo-rpai.png';
    logo.addEventListener('load', function () { drawCard(); });

    var palettes = {
      '1': { from: '#181005', to: '#070707', accent: '#f0a92b' },
      '2': { from: '#061426', to: '#050b14', accent: '#ffd27a' },
      '3': { from: '#230b0b', to: '#0b0606', accent: '#f0a92b' },
      '4': { from: '#071b12', to: '#050d09', accent: '#d9c27a' }
    };

    function roundedRect(ctx, x, y, width, height, radius) {
      var r = Math.min(radius, width / 2, height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + height, r);
      ctx.arcTo(x + width, y + height, x, y + height, r);
      ctx.arcTo(x, y + height, x, y, r);
      ctx.arcTo(x, y, x + width, y, r);
      ctx.closePath();
    }

    function drawCover(ctx, image, x, y, width, height) {
      var imageRatio = image.width / image.height;
      var boxRatio = width / height;
      var drawWidth = width;
      var drawHeight = height;
      var offsetX = 0;
      var offsetY = 0;

      if (imageRatio > boxRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(image, x + offsetX, y + offsetY, drawWidth, drawHeight);
    }

    function drawCard() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var width = canvas.width;
      var height = canvas.height;
      var palette = palettes[state.backdrop] || palettes['1'];
      var name = (state.name || 'Your Name').trim().slice(0, 40) || 'Your Name';
      var initials = name.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();

      var gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, palette.from);
      gradient.addColorStop(0.55, '#0a0a0a');
      gradient.addColorStop(1, palette.to);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      /* Gold glow */
      var glow = ctx.createRadialGradient(width * 0.5, height * 0.88, 0, width * 0.5, height * 0.88, width * 0.8);
      glow.addColorStop(0, 'rgba(240,169,43,.30)');
      glow.addColorStop(0.55, 'rgba(240,169,43,.08)');
      glow.addColorStop(1, 'rgba(240,169,43,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      /* Tick grid */
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.055)';
      ctx.lineWidth = 1;
      for (var gx = 80; gx < width; gx += 90) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, height);
        ctx.stroke();
      }
      for (var gy = 80; gy < height; gy += 90) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }
      ctx.restore();

      /* Border */
      ctx.strokeStyle = 'rgba(240,169,43,.5)';
      ctx.lineWidth = 2;
      roundedRect(ctx, 30, 30, width - 60, height - 60, 28);
      ctx.stroke();

      /* Logo and church name */
      if (logo.complete && logo.naturalWidth) {
        var logoSize = 108;
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 130, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(width / 2 - logoSize / 2, 130 - logoSize / 2, logoSize, logoSize);
        ctx.drawImage(logo, width / 2 - logoSize / 2, 130 - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        ctx.arc(width / 2, 130, 46, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#140c02';
        ctx.font = '600 28px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RPAI', width / 2, 132);
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 19px Inter, Arial, sans-serif';
      ctx.fillText('ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL', width / 2, 222);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.font = '500 14px Inter, Arial, sans-serif';
      ctx.fillText('A PLACE OF LOVE WHERE EVERYONE COUNTS', width / 2, 250);

      /* Heading */
      ctx.fillStyle = palette.accent;
      ctx.font = '650 26px Inter, Arial, sans-serif';
      ctx.fillText('I AM ATTENDING', width / 2, 330);
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 88px Inter, Arial, sans-serif';
      ctx.fillText('Sunday', width / 2, 422);

      /* Photo frame */
      var frameSize = 440;
      var frameX = (width - frameSize) / 2;
      var frameY = 462;

      ctx.save();
      roundedRect(ctx, frameX, frameY, frameSize, frameSize, 28);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(frameX, frameY, frameSize, frameSize);
      if (state.photo) {
        drawCover(ctx, state.photo, frameX, frameY, frameSize, frameSize);
      } else {
        var photoGradient = ctx.createLinearGradient(frameX, frameY, frameX + frameSize, frameY + frameSize);
        photoGradient.addColorStop(0, 'rgba(240,169,43,.16)');
        photoGradient.addColorStop(1, 'rgba(255,255,255,.04)');
        ctx.fillStyle = photoGradient;
        ctx.fillRect(frameX, frameY, frameSize, frameSize);
        ctx.fillStyle = palette.accent;
        ctx.font = '600 130px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials || 'R', width / 2, frameY + frameSize / 2 + 4);
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(240,169,43,.6)';
      ctx.lineWidth = 2;
      roundedRect(ctx, frameX, frameY, frameSize, frameSize, 28);
      ctx.stroke();

      /* Name */
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      var nameSize = name.length > 24 ? 42 : name.length > 16 ? 50 : 58;
      ctx.font = '550 ' + nameSize + 'px Inter, Arial, sans-serif';
      ctx.fillText(name, width / 2, 998);

      /* Service line */
      ctx.fillStyle = 'rgba(255,255,255,.86)';
      ctx.font = '500 24px Inter, Arial, sans-serif';
      ctx.fillText('SUNDAY DIVINE SERVICE  ·  09:00 AM', width / 2, 1052);
      ctx.fillStyle = 'rgba(255,255,255,.58)';
      ctx.font = '400 19px Inter, Arial, sans-serif';
      ctx.fillText('Otwa Events, Long Acres, Ndeke Road, Lusaka', width / 2, 1086);

      /* Divider */
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 120, 1140);
      ctx.lineTo(width / 2 + 120, 1140);
      ctx.stroke();

      /* Footer */
      ctx.fillStyle = palette.accent;
      ctx.font = '600 17px Inter, Arial, sans-serif';
      ctx.fillText('ROYAL PRIESTHOOD ASSEMBLIES INTERNATIONAL', width / 2, 1182);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.font = '400 15px Inter, Arial, sans-serif';
      ctx.fillText('A place of love where everyone counts.', width / 2, 1212);

      /* Small corner marks */
      ctx.fillStyle = palette.accent;
      [[52, 52], [width - 52, 52], [52, height - 52], [width - 52, height - 52]].forEach(function (point) {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function setStatus(message) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle('is-visible', Boolean(message));
    }

    if (nameInput) {
      state.name = nameInput.value || 'Your Name';
      nameInput.addEventListener('input', function () {
        state.name = nameInput.value;
        drawCard();
      });
    }

    backdropButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.backdrop = button.getAttribute('data-card-backdrop') || '1';
        backdropButtons.forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
        drawCard();
      });
    });

    if (photoInput) {
      photoInput.addEventListener('change', function () {
        var file = photoInput.files && photoInput.files[0];
        if (!file) {
          state.photo = null;
          drawCard();
          return;
        }
        if (!/^image\//.test(file.type)) {
          setStatus('Please choose a photo file.');
          return;
        }
        var reader = new FileReader();
        reader.addEventListener('load', function () {
          var image = new Image();
          image.addEventListener('load', function () {
            state.photo = image;
            setStatus('Photo added. Your card is ready to download.');
            drawCard();
          });
          image.addEventListener('error', function () {
            setStatus('That photo could not be read. Please try another.');
          });
          image.src = String(reader.result);
        });
        reader.readAsDataURL(file);
      });
    }

    function fileName() {
      var safe = (state.name || 'friend').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return 'rpai-attending-' + (safe || 'friend') + '.png';
    }

    function getBlob(callback) {
      if (canvas.toBlob) {
        canvas.toBlob(callback, 'image/png');
      } else {
        callback(null);
      }
    }

    if (downloadButton) {
      downloadButton.addEventListener('click', function () {
        drawCard();
        getBlob(function (blob) {
          if (!blob) {
            setStatus('Your browser could not create the image. Please try again.');
            return;
          }
          var url = URL.createObjectURL(blob);
          var link = document.createElement('a');
          link.href = url;
          link.download = fileName();
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          setStatus('Downloaded. Share it and invite a friend.');
        });
      });
    }

    if (shareButton) {
      shareButton.addEventListener('click', function () {
        drawCard();
        getBlob(function (blob) {
          if (!blob) {
            setStatus('Your browser could not create the image.');
            return;
          }
          var file = new File([blob], fileName(), { type: 'image/png' });
          var shareData = {
            title: 'I am attending Royal Priesthood Assemblies International',
            text: 'Come and worship with us this Sunday at 09:00 AM. A place of love where everyone counts.',
            files: [file]
          };
          if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
            navigator.share(shareData).then(function () {
              setStatus('Shared. Thank you for inviting someone.');
            }).catch(function () {
              setStatus('Sharing was cancelled. You can still download the card.');
            });
          } else {
            setStatus('Sharing images is not available here. Use Download card instead.');
          }
        });
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        state.name = 'Your Name';
        state.photo = null;
        state.backdrop = '1';
        if (nameInput) nameInput.value = '';
        if (photoInput) photoInput.value = '';
        backdropButtons.forEach(function (button) {
          button.setAttribute('aria-pressed', String(button.getAttribute('data-card-backdrop') === '1'));
        });
        drawCard();
        setStatus('');
      });
    }

    drawCard();
  }

  /* ------------------------------------------------------------------------
     Share buttons on the closing CTA
     ------------------------------------------------------------------------ */

  $$('[data-share]').forEach(function (button) {
    button.addEventListener('click', function () {
      var network = button.getAttribute('data-share');
      var url = window.location.href;
      var title = document.title;
      var text = 'Royal Priesthood Assemblies International — a place of love where everyone counts.';
      var shareUrl = '';

      if (network === 'whatsapp') shareUrl = 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + url);
      if (network === 'facebook') shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
      if (network === 'x') shareUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
      if (network === 'email') shareUrl = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(text + '\n\n' + url);

      if (network === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            var row = button.closest('.share-row');
            var note = row ? $('[data-share-status]', row) : null;
            if (note) {
              note.textContent = 'Link copied';
              note.classList.add('is-visible');
              window.setTimeout(function () { note.classList.remove('is-visible'); }, 2200);
            }
          });
        }
        return;
      }

      if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer');
    });
  });

  /* ------------------------------------------------------------------------
     Current section in the footer? Keep the year current.
     ------------------------------------------------------------------------ */

  $$('[data-year]').forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();
