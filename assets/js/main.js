/* ==========================================================================
   NETNOAR — Interações
   ========================================================================== */

(function () {
  "use strict";

  var CONFIG = window.NETNOAR_CONFIG || {};

  /* ---------------------------------------------------------------------
     Helpers
     --------------------------------------------------------------------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function buildWhatsAppUrl(message) {
    var number = String(CONFIG.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    var base = "https://wa.me/" + number;
    return message ? base + "?text=" + encodeURIComponent(message) : base;
  }

  function buildPhoneHref(display) {
    if (CONFIG.PHONE_TEL) return "tel:" + CONFIG.PHONE_TEL;
    return "tel:" + String(display || "").replace(/[^\d+]/g, "");
  }

  /* ---------------------------------------------------------------------
     WhatsApp — aplica em todos os [data-wa]
     --------------------------------------------------------------------- */
  function initWhatsAppLinks() {
    $$("[data-wa]").forEach(function (el) {
      var message = el.getAttribute("data-wa-message") || "";
      el.setAttribute("href", buildWhatsAppUrl(message));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  /* ---------------------------------------------------------------------
     Telefone — [data-phone]
     --------------------------------------------------------------------- */
  function initPhoneLinks() {
    $$("[data-phone]").forEach(function (el) {
      el.setAttribute("href", buildPhoneHref(CONFIG.PHONE_DISPLAY));
    });
  }

  /* ---------------------------------------------------------------------
     Área do Cliente — [data-client-area]
     Só recebe link quando CLIENT_AREA_URL estiver preenchido.
     --------------------------------------------------------------------- */
  function initClientAreaLinks() {
    var url = (CONFIG.CLIENT_AREA_URL || "").trim();
    $$("[data-client-area]").forEach(function (el) {
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("rel", "noopener");
        el.classList.remove("is-pending");
        el.removeAttribute("aria-disabled");
      } else {
        el.removeAttribute("href");
        el.classList.add("is-pending");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("tabindex", "0");
        el.setAttribute("title", "Endereço da Área do Cliente será disponibilizado em breve.");
      }
    });
  }

  /* ---------------------------------------------------------------------
     Redes sociais — [data-social]
     --------------------------------------------------------------------- */
  function initSocialLinks() {
    var map = {
      instagram: (CONFIG.INSTAGRAM_URL || "").trim(),
      facebook: (CONFIG.FACEBOOK_URL || "").trim()
    };
    $$("[data-social]").forEach(function (el) {
      var key = el.getAttribute("data-social");
      var url = map[key];
      if (url) {
        el.setAttribute("href", url);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.classList.remove("is-pending");
        el.removeAttribute("aria-disabled");
      } else {
        el.removeAttribute("href");
        el.classList.add("is-pending");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("tabindex", "0");
        el.setAttribute("title", "Perfil oficial será disponibilizado em breve.");
      }
    });
  }

  /* ---------------------------------------------------------------------
     Logo — usa CONFIG.LOGO_URL; sem valor, mantém o placeholder neutro
     --------------------------------------------------------------------- */
  function initLogo() {
    var url = (CONFIG.LOGO_URL || "").trim();
    $$("[data-logo]").forEach(function (slot) {
      var img = $("img", slot);
      if (!img) return;

      if (!url) {
        slot.classList.remove("is-loaded");
        return;
      }

      img.addEventListener("load", function () {
        slot.classList.add("is-loaded");
      });
      img.addEventListener("error", function () {
        slot.classList.remove("is-loaded");
      });
      img.setAttribute("src", url);
    });
  }

  /* ---------------------------------------------------------------------
     Header — estado ao rolar
     --------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = $(".site-header");
    if (!header) return;

    var onScroll = function () {
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Menu mobile
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = $(".nav-toggle");
    var nav = $("#primary-nav");
    if (!toggle || !nav) return;

    var closeMenu = function () {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-active");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    var openMenu = function () {
      nav.classList.add("is-open");
      toggle.classList.add("is-active");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
    };

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    $$("a", nav).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------------
     Ano no copyright
     --------------------------------------------------------------------- */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------------
     Prevenir clique em itens pendentes (sem link real)
     --------------------------------------------------------------------- */
  function initPendingGuard() {
    document.addEventListener("click", function (event) {
      var el = event.target.closest && event.target.closest(".is-pending");
      if (el) event.preventDefault();
    });
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  function boot() {
    initWhatsAppLinks();
    initPhoneLinks();
    initClientAreaLinks();
    initSocialLinks();
    initLogo();
    initHeaderScroll();
    initMobileMenu();
    initReveal();
    initYear();
    initPendingGuard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
