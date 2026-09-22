(function () {
  "use strict";

  var SITE_URL = "content/site.json";
  var PROD_URL = "content/products.json";
  var NEWS_URL = "content/news.json";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function get(u) {
    return fetch(u)
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function fillSite(s) {
    if (!s) return;

    if (s.themeColor) {
      document.documentElement.style.setProperty("--blue", s.themeColor);
    }

    var nodes = document.querySelectorAll("[data-site]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var k = el.getAttribute("data-site");
      if (Object.prototype.hasOwnProperty.call(s, k) && typeof s[k] === "string") {
        var v = s[k];
        el.textContent = v;
        var a = el.closest("a");
        if (a) {
          if (k === "email") a.href = "mailto:" + v;
          if (k === "phone") a.href = "tel:" + v.replace(/\s+/g, "");
          if (k === "whatsapp") a.href = "https://wa.me/" + v.replace(/[^\d]/g, "");
        }
      }
    }

    var sg = document.getElementById("stats-grid");
    if (sg && Array.isArray(s.stats)) {
      sg.innerHTML = s.stats.map(function (x) {
        return '<div><div class="num">' + esc(x.num) + '</div><div class="lbl">' + esc(x.label) + "</div></div>";
      }).join("");
    }

    var wg = document.getElementById("why-grid");
    if (wg && Array.isArray(s.why)) {
      wg.innerHTML = s.why.map(function (x) {
        return '<div class="card"><div class="body"><div class="k">' + esc(x.k) + "</div><h3>" + esc(x.title) + "</h3><p>" + esc(x.text) + "</p></div></div>";
      }).join("");
    }

    if (document.getElementById("cta-title")) document.getElementById("cta-title").textContent = s.ctaTitle;
    if (document.getElementById("cta-text")) document.getElementById("cta-text").textContent = s.ctaText;
  }

  function card(p) {
    var specs = (p.specs || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    return (
      '<div class="card">' +
      '<div class="thumb" style="font-size:46px;display:flex;align-items:center;justify-content:center">' + esc(p.icon || "🔌") + "</div>" +
      '<div class="body"><div class="k">' + esc(p.category || "") + "</div><h3>" + esc(p.name || "") + "</h3>" +
      "<p>" + esc(p.description || "") + "</p><ul>" + specs + "</ul></div></div>"
    );
  }

  function fillProducts(arr) {
    var hp = document.getElementById("home-products");
    if (hp && arr) hp.innerHTML = arr.map(card).join("");
    var pc = document.getElementById("product-cards");
    if (pc && arr) pc.innerHTML = arr.map(card).join("");
  }

  function fillNews(arr) {
    var nl = document.getElementById("news-list");
    if (nl && arr) {
      nl.innerHTML = arr.map(function (n) {
        return '<div class="card"><div class="body"><div class="k">' + esc(n.date || "") + "</div><h3>" + esc(n.title || "") + "</h3><p>" + esc(n.body || "") + "</p></div></div>";
      }).join("");
    }
  }

  Promise.all([get(SITE_URL), get(PROD_URL), get(NEWS_URL)]).then(function (res) {
    fillSite(res[0]);
    if (res[1] && res[1].items) fillProducts(res[1].items);
    if (res[2] && res[2].items) fillNews(res[2].items);
  });
})();
