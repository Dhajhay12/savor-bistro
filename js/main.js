/* ============================================================================
   Savor Bistro — js/main.js
   Shared behavior for every page: nav, mobile panel, menu filters, form
   validation with success state, gallery lightbox, order-portal feedback.
   Loaded with `defer` after lucide. No frameworks, no build step.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- Sticky header: charcoal-on-scroll -------------------------- */
  var header = document.querySelector("[data-header]");
  function syncHeader() {
    if (header) header.classList.toggle("is-stuck", window.scrollY > 24);
  }
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- Mobile slide-in panel -------------------------------------- */
  var panel = document.querySelector("[data-panel]");
  var scrim = document.querySelector("[data-scrim]");
  var openBtn = document.querySelector("[data-panel-open]");
  var closeBtn = document.querySelector("[data-panel-close]");

  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle("is-open", open);
    if (scrim) scrim.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (openBtn) openBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      closeBtn && closeBtn.focus();
    } else {
      openBtn && openBtn.focus();
    }
  }
  openBtn && openBtn.addEventListener("click", function () { setPanel(true); });
  closeBtn && closeBtn.addEventListener("click", function () { setPanel(false); });
  scrim && scrim.addEventListener("click", function () { setPanel(false); });
  panel && panel.querySelectorAll("a, button").forEach(function (el) {
    el.addEventListener("click", function () { setPanel(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setPanel(false);
  });

  /* ---------- Menu page: category + dietary filter pills -----------------
     Every menu row carries data-tags; pills toggle an active filter set.
     Revealed rows get .price-flash for the quick subtle fade. */
  var pills = document.querySelectorAll("[data-filter]");
  if (pills.length) {
    var active = new Set();
    var rows = document.querySelectorAll("[data-tags]");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var tag = pill.getAttribute("data-filter");
        if (tag === "all") {
          active.clear();
          pills.forEach(function (p) { p.setAttribute("aria-pressed", p.getAttribute("data-filter") === "all" ? "true" : "false"); });
        } else {
          pill.setAttribute("aria-pressed", pill.getAttribute("aria-pressed") === "true" ? "false" : "true");
          if (pill.getAttribute("aria-pressed") === "true") active.add(tag); else active.delete(tag);
          var allPill = document.querySelector('[data-filter="all"]');
          if (allPill) allPill.setAttribute("aria-pressed", active.size === 0 ? "true" : "false");
        }
        rows.forEach(function (row) {
          var tags = (row.getAttribute("data-tags") || "").split(/\s+/);
          var show = active.size === 0 || Array.from(active).every(function (t) { return tags.indexOf(t) !== -1; });
          row.style.display = show ? "" : "none";
          if (show) {
            row.classList.remove("price-flash");
            void row.offsetWidth; /* restart the fade */
            row.classList.add("price-flash");
          }
        });
      });
    });
  }

  /* ---------- Menu page: "show seasonal items" deferred reveal ------------ */
  var revealBtn = document.querySelector("[data-reveal]");
  if (revealBtn) {
    revealBtn.addEventListener("click", function () {
      document.querySelectorAll("[data-deferred]").forEach(function (el) {
        el.removeAttribute("data-deferred");
        el.classList.remove("price-flash");
        void el.offsetWidth;
        el.classList.add("price-flash");
      });
      revealBtn.closest("[data-reveal-wrap]") && revealBtn.closest("[data-reveal-wrap]").remove();
    });
  }

  /* ---------- Forms: client-side validation + success confirmation --------
     Any <form data-validate> works. On success we hide the fields and show a
     styled confirmation card whose SVG checkmark draws itself in. */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll("[required]").forEach(function (field) {
        var wrap = field.closest("[data-field]") || field.parentElement;
        var err = wrap ? wrap.querySelector(".field-error") : null;
        var bad = !field.value.trim() ||
          (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) ||
          (field.type === "tel" && field.value.trim() && !/^[\d\s()+.-]{7,}$/.test(field.value)) ||
          (field.type === "date" && field.value && field.min && field.value < field.min);
        field.setAttribute("aria-invalid", bad ? "true" : "false");
        if (err) {
          var msg = err.querySelector("span");
          if (msg) msg.textContent = bad
            ? (field.getAttribute("data-error") || "Please complete this field.")
            : "";
        }
        if (bad && !firstBad) firstBad = field;
      });
      if (firstBad) { firstBad.focus(); return; }

      var success = form.querySelector(".form-status");
      var fields = form.querySelector(".form-fields");
      if (fields) fields.classList.add("is-hidden");
      if (success) {
        success.classList.add("is-visible");
        var heading = success.querySelector("[data-success-heading]");
        if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus(); }
      }
    });
    /* clear a field's error as soon as the user edits it again */
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t.matches && t.matches("[required]") && t.getAttribute("aria-invalid") === "true") {
        t.setAttribute("aria-invalid", "false");
      }
    });
  });

  /* ---------- Order portal: "added to order" tick feedback ---------------- */
  document.querySelectorAll("[data-order]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-added")) return;
      var original = btn.innerHTML;
      btn.classList.add("is-added");
      btn.innerHTML =
        '<svg class="tick-pop" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg> Added';
      setTimeout(function () { btn.classList.remove("is-added"); btn.innerHTML = original; }, 1600);
    });
  });

  /* ---------- Gallery lightbox: click, Escape, arrows ---------------------- */
  var lightbox = document.querySelector("[data-lightbox]");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("[data-lb-caption]");
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox-src]"));
    var current = 0;

    function show(i) {
      current = (i + items.length) % items.length;
      var item = items[current];
      lbImg.src = item.getAttribute("data-lightbox-src");
      lbImg.alt = item.getAttribute("data-lightbox-alt") || "";
      if (lbCap) lbCap.textContent = item.getAttribute("data-lightbox-caption") || "";
      lightbox.classList.add("is-open");
      document.body.classList.add("nav-open");
      lightbox.querySelector(".lb-close").focus();
    }
    function hide() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    }
    items.forEach(function (item, i) {
      item.addEventListener("click", function () { show(i); });
    });
    lightbox.querySelector(".lb-close").addEventListener("click", hide);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------- Footer year ------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Lucide icons (deferred scripts keep order guaranteed) ------- */
  if (window.lucide) window.lucide.createIcons();
})();
